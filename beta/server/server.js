import "dotenv/config";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 3000);
const databasePath = process.env.DATABASE_PATH || path.join(root, "..", "data", "app.sqlite");
const jwtSecret = process.env.JWT_SECRET || (process.env.NODE_ENV === "production" ? "" : "local-development-only-secret");
const blogSourceUrl = process.env.BLOG_SOURCE_URL || "https://base44.app/api/apps/6a8515dbf1889a329b49695f/entities/BlogPost?sort=-created_date&limit=50";
const aiProviders = [
  { name: "primary", url: process.env.AI_PROVIDER_PRIMARY_URL, model: process.env.AI_MODEL_PRIMARY || "llama3.2:3b" },
  { name: "secondary", url: process.env.AI_PROVIDER_SECONDARY_URL, model: process.env.AI_MODEL_SECONDARY || "qwen2.5:3b" },
].filter((provider) => provider.url);
const aiTimeoutMs = Math.min(Math.max(Number(process.env.AI_REQUEST_TIMEOUT_MS) || 12000, 3000), 30000);
const aiMaxInputChars = Math.min(Math.max(Number(process.env.AI_MAX_INPUT_CHARS) || 4000, 500), 12000);
const aiMaxOutputChars = Math.min(Math.max(Number(process.env.AI_MAX_OUTPUT_CHARS) || 4000, 500), 10000);
const urgentRiskPattern = /(matar|suicid|me machucar|autoagress|não estou seguro|nao estou seguro|violên|violênc|abuso|intoxica|não consigo me manter seguro|nao consigo me manter seguro)/i;

if (!jwtSecret) throw new Error("JWT_SECRET is required");
fs.mkdirSync(path.dirname(databasePath), { recursive: true });
const db = new Database(databasePath);
db.pragma("journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'user', created_at TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS scores (id TEXT PRIMARY KEY, player_name TEXT NOT NULL, total_points REAL DEFAULT 0, emotional_score REAL DEFAULT 0, intellectual_score REAL DEFAULT 0, quizzes_completed REAL DEFAULT 0, level REAL DEFAULT 1, created_date TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS blog_posts (id TEXT PRIMARY KEY, title TEXT NOT NULL, excerpt TEXT, content TEXT NOT NULL, category TEXT DEFAULT 'autismo', author TEXT, read_time TEXT, status TEXT NOT NULL DEFAULT 'published', created_date TEXT NOT NULL, updated_date TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS emotions (id TEXT PRIMARY KEY, name TEXT NOT NULL, emoji TEXT, color TEXT, description TEXT, examples TEXT, body_signal TEXT, category TEXT DEFAULT 'basica');
  CREATE TABLE IF NOT EXISTS combinations (id TEXT PRIMARY KEY, name TEXT NOT NULL, emotion_names TEXT NOT NULL, description TEXT, why_it_happens TEXT, body_signal TEXT, examples TEXT);
`);
const blogColumns = db.prepare("PRAGMA table_info(blog_posts)").all().map((column) => column.name);
if (!blogColumns.includes("status")) db.exec("ALTER TABLE blog_posts ADD COLUMN status TEXT NOT NULL DEFAULT 'published'");
if (!blogColumns.includes("updated_date")) db.exec("ALTER TABLE blog_posts ADD COLUMN updated_date TEXT NOT NULL DEFAULT ''");
db.prepare("UPDATE blog_posts SET updated_date = created_date WHERE updated_date = ''").run();

const json = (response, status, data) => {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(data));
};
const body = async (request) => {
  let raw = "";
  for await (const chunk of request) raw += chunk;
  return raw ? JSON.parse(raw) : {};
};
const id = () => crypto.randomUUID();
const now = () => new Date().toISOString();
const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/manifest+json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".woff2": "font/woff2",
};
const contentTypeFor = (filePath) => mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream";
const tokenFor = (user) => jwt.sign({ sub: user.id, email: user.email, role: user.role }, jwtSecret, { expiresIn: "7d" });
const userResponse = (user) => ({ id: user.id, email: user.email, role: user.role });
const authUser = (request) => {
  const value = request.headers.authorization?.replace("Bearer ", "");
  if (!value) return null;
  try { return jwt.verify(value, jwtSecret); } catch { return null; }
};
const requireAuth = (request, response, admin = false) => {
  const user = authUser(request);
  if (!user || (admin && user.role !== "admin")) { json(response, 401, { error: "Não autorizado" }); return null; }
  return user;
};
const safeAiFallback = (supportNeed) => ({
  message: supportNeed === "crisis"
    ? "Se você corre perigo agora, procure o SAMU 192, uma emergência ou uma pessoa de confiança. No Brasil, o CVV atende pelo 188."
    : "Posso ajudar a organizar um próximo passo, mas esta resposta automática não substitui avaliação profissional. Reduza uma demanda possível e procure uma pessoa de confiança.",
  risk: supportNeed === "crisis" ? "urgent" : "unclear",
  next_questions: ["Você está em segurança agora?"],
  actions: ["Procure apoio humano local se isso for seguro."],
  sources: ["https://cvv.org.br/"],
  disclaimer: "Não substitui atendimento profissional.",
});
const parseAiResponse = (value) => {
  const parsed = typeof value === "string" ? JSON.parse(value) : value;
  const result = {
    message: String(parsed.message || "").trim().slice(0, aiMaxOutputChars),
    risk: ["none", "unclear", "urgent"].includes(parsed.risk) ? parsed.risk : "unclear",
    next_questions: Array.isArray(parsed.next_questions) ? parsed.next_questions.map(String).slice(0, 3) : [],
    actions: Array.isArray(parsed.actions) ? parsed.actions.map(String).slice(0, 5) : [],
    sources: Array.isArray(parsed.sources) ? parsed.sources.filter((source) => typeof source === "string" && /^https:\/\//.test(source)).slice(0, 5) : [],
    disclaimer: "Não substitui atendimento profissional.",
  };
  if (!result.message || !result.actions.length) throw new Error("Resposta de IA incompleta");
  if (urgentRiskPattern.test(result.message) && result.risk !== "urgent") result.risk = "urgent";
  return result;
};
const callAiProvider = async (provider, input) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), aiTimeoutMs);
  try {
    const response = await fetch(`${provider.url.replace(/\/$/, "")}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({ model: provider.model, stream: false, format: "json", messages: [
        { role: "system", content: "Responda somente JSON com message, risk, next_questions, actions e sources. Não diagnostique, prescreva ou simule profissional. Em risco urgente, indique SAMU 192 e CVV 188." },
        { role: "user", content: JSON.stringify(input) },
      ] }),
    });
    if (!response.ok) throw new Error(`AI ${provider.name}: HTTP ${response.status}`);
    const payload = await response.json();
    return parseAiResponse(payload.message?.content || payload.response);
  } finally { clearTimeout(timeout); }
};
const generateSupportResponse = async (input) => {
  if (!aiProviders.length) return safeAiFallback(input.support_need);
  for (const provider of aiProviders) {
    try { return await callAiProvider(provider, input); } catch (error) { console.error(`${provider.name} indisponível: ${error.message}`); }
  }
  return safeAiFallback(input.support_need);
};
const entityTables = { BlogPost: "blog_posts", Emotion: "emotions", EmotionCombination: "combinations", ScoreRecord: "scores" };
const blogCategories = new Set(["autismo", "emocoes", "dicas", "diagnostico", "vida_adulta", "trabalho"]);
const blogStatuses = new Set(["draft", "published", "archived"]);
const blogInput = (data, existing = {}) => {
  const title = String(data.title ?? existing.title ?? "").trim();
  const content = String(data.content ?? existing.content ?? "").trim();
  const category = String(data.category ?? existing.category ?? "autismo");
  const status = String(data.status ?? existing.status ?? "draft");
  if (!title || title.length > 180) throw new Error("O título é obrigatório e deve ter até 180 caracteres");
  if (!content || content.length > 200000) throw new Error("O conteúdo é obrigatório e deve ter até 200.000 caracteres");
  if (!blogCategories.has(category) || !blogStatuses.has(status)) throw new Error("Categoria ou status inválido");
  return {
    title,
    excerpt: String(data.excerpt ?? existing.excerpt ?? content.slice(0, 160)).trim().slice(0, 500),
    content,
    category,
    author: String(data.author ?? existing.author ?? "Equipe Emocionário Amigo").trim().slice(0, 120),
    read_time: String(data.read_time ?? existing.read_time ?? "3 min").trim().slice(0, 40),
    status,
  };
};
const seedLocalCatalog = () => {
  const emotions = JSON.parse(fs.readFileSync(path.join(root, "..", "base", "seed", "emotions.json"), "utf8"));
  const combinations = JSON.parse(fs.readFileSync(path.join(root, "..", "base", "seed", "combinations.json"), "utf8"));
  const insertEmotion = db.prepare("INSERT INTO emotions (id, name, emoji, color, description, examples, body_signal, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
  const insertCombination = db.prepare("INSERT INTO combinations (id, name, emotion_names, description, why_it_happens, body_signal, examples) VALUES (?, ?, ?, ?, ?, ?, ?)");
  const seed = db.transaction(() => {
    if (db.prepare("SELECT COUNT(*) AS count FROM emotions").get().count === 0) {
      for (const emotion of emotions) insertEmotion.run(emotion.id, emotion.name, emotion.emoji, emotion.color, emotion.description, emotion.examples, emotion.body_signal, emotion.category);
    }
    if (db.prepare("SELECT COUNT(*) AS count FROM combinations").get().count === 0) {
      for (const combination of combinations) insertCombination.run(combination.id, combination.name, JSON.stringify(combination.emotion_names), combination.description, combination.why_it_happens, combination.body_signal, combination.examples);
    }
  });
  seed();
  console.log(`Catálogo local carregado: ${emotions.length} emoções e ${combinations.length} combinações`);
};
const seedBlogPosts = async () => {
  if (db.prepare("SELECT COUNT(*) AS count FROM blog_posts").get().count > 0) return;
  const response = await fetch(blogSourceUrl, { headers: { "X-App-Id": "6a8515dbf1889a329b49695f" } });
  if (!response.ok) throw new Error(`Não foi possível carregar os artigos iniciais: HTTP ${response.status}`);
  const posts = await response.json();
  const insert = db.prepare("INSERT INTO blog_posts (id, title, excerpt, content, category, author, read_time, status, created_date, updated_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
  const insertMany = db.transaction((records) => {
    for (const post of records) {
      if (!post.title || !post.content) continue;
      insert.run(post.id || crypto.randomUUID(), post.title, post.excerpt || "", post.content, post.category || "autismo", post.author || "Equipe Emocionário Amigo", post.read_time || "", "published", post.created_date || now(), post.created_date || now());
    }
  });
  insertMany(posts);
  console.log(`Artigos iniciais importados: ${posts.length}`);
};
const listEntity = (table, sort, limit, publicOnly = false) => {
  const descending = sort?.startsWith("-");
  const field = (descending ? sort.slice(1) : sort) || "created_date";
  const allowed = ["name", "created_date", "total_points"];
  const column = allowed.includes(field) ? field : "created_date";
  const where = publicOnly && table === "blog_posts" ? "WHERE status = 'published'" : "";
  const rows = db.prepare(`SELECT * FROM ${table} ${where} ORDER BY ${column} ${descending ? "DESC" : "ASC"} LIMIT ?`).all(Math.min(Number(limit) || 50, 100));
  return rows.map((row) => row.emotion_names ? { ...row, emotion_names: JSON.parse(row.emotion_names) } : row);
};

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  try {
    if (url.pathname === "/api/health") return json(response, 200, { ok: true });
        if (url.pathname === "/api/beta/burnout-sources" && request.method === "GET") {
          const sourcePath = path.join(root, "..", "base", "seed", "burnoutSources.json");
          return json(response, 200, JSON.parse(fs.readFileSync(sourcePath, "utf8")));
        }
    if (url.pathname === "/api/beta/support" && request.method === "POST") {
      const input = await body(request);
      const message = String(input.message || "").trim();
      const supportNeed = ["listen", "organize", "sensory", "burnout", "crisis", "unknown"].includes(input.support_need) ? input.support_need : "unknown";
      if (!input.consent || !message || message.length > aiMaxInputChars) return json(response, 400, { error: "Consentimento e mensagem válida são obrigatórios" });
      if (supportNeed === "crisis" || urgentRiskPattern.test(message)) return json(response, 200, safeAiFallback("crisis"));
      const result = await generateSupportResponse({ message, age_group: input.age_group || "unknown", support_need: supportNeed, locale: "pt-BR", consent: true });
      return json(response, 200, result);
    }
    if (url.pathname === "/api/auth/me" && request.method === "GET") {
      const user = requireAuth(request, response);
      return user ? json(response, 200, userResponse(db.prepare("SELECT * FROM users WHERE id = ?").get(user.sub))) : undefined;
    }
    if (url.pathname === "/api/auth/login" && request.method === "POST") {
      const { email, password } = await body(request);
      const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
      if (!user || !(await bcrypt.compare(password, user.password_hash))) return json(response, 401, { error: "E-mail ou senha inválidos" });
      return json(response, 200, { user: userResponse(user), access_token: tokenFor(user) });
    }
    if (url.pathname === "/api/auth/register" && request.method === "POST") {
      const { email, password } = await body(request);
      if (!email || !password || password.length < 8) return json(response, 400, { error: "Dados de cadastro inválidos" });
      const user = { id: id(), email, role: "user", password_hash: await bcrypt.hash(password, 12), created_at: now() };
      try { db.prepare("INSERT INTO users VALUES (@id, @email, @password_hash, @role, @created_at)").run(user); } catch { return json(response, 409, { error: "Este e-mail já está cadastrado" }); }
      return json(response, 201, { email });
    }
    if (url.pathname === "/api/auth/verify" && request.method === "POST") {
      const { email, password } = await body(request);
      const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
      if (!user || !(await bcrypt.compare(password, user.password_hash))) return json(response, 401, { error: "Cadastro não encontrado" });
      return json(response, 200, { user: userResponse(user), access_token: tokenFor(user) });
    }
    if (url.pathname === "/api/auth/reset" && request.method === "POST") return json(response, 204, null);
    if (url.pathname === "/api/admin/login" && request.method === "POST") {
      const { email, password } = await body(request);
      if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) return json(response, 401, { error: "Credenciais administrativas inválidas" });
      let user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
      if (!user) { user = { id: id(), email, role: "admin", password_hash: await bcrypt.hash(password, 12), created_at: now() }; db.prepare("INSERT INTO users VALUES (@id, @email, @password_hash, @role, @created_at)").run(user); }
      return json(response, 200, { user: userResponse(user), access_token: tokenFor({ ...user, role: "admin" }) });
    }
    if (url.pathname === "/api/admin/blog" && request.method === "GET") {
      if (!requireAuth(request, response, true)) return;
      return json(response, 200, listEntity("blog_posts", "-updated_date", url.searchParams.get("limit")));
    }
    const adminBlogMatch = url.pathname.match(/^\/api\/admin\/blog\/([^/]+)$/);
    if (url.pathname === "/api/admin/blog" && request.method === "POST") {
      const user = requireAuth(request, response, true); if (!user) return;
      const data = blogInput(await body(request)); const timestamp = now();
      const record = { id: id(), ...data, created_date: timestamp, updated_date: timestamp };
      db.prepare("INSERT INTO blog_posts (id, title, excerpt, content, category, author, read_time, status, created_date, updated_date) VALUES (@id, @title, @excerpt, @content, @category, @author, @read_time, @status, @created_date, @updated_date)").run({ ...record, author: data.author || user.email });
      return json(response, 201, record);
    }
    if (adminBlogMatch && ["PATCH", "DELETE"].includes(request.method)) {
      const user = requireAuth(request, response, true); if (!user) return;
      const existing = db.prepare("SELECT * FROM blog_posts WHERE id = ?").get(adminBlogMatch[1]);
      if (!existing) return json(response, 404, { error: "Artigo não encontrado" });
      if (request.method === "DELETE") {
        db.prepare("DELETE FROM blog_posts WHERE id = ?").run(existing.id);
        return json(response, 204, null);
      }
      const data = blogInput(await body(request), existing); const updated = { ...data, updated_date: now(), id: existing.id, created_date: existing.created_date };
      db.prepare("UPDATE blog_posts SET title=@title, excerpt=@excerpt, content=@content, category=@category, author=@author, read_time=@read_time, status=@status, updated_date=@updated_date WHERE id=@id").run(updated);
      return json(response, 200, updated);
    }
    const entityMatch = url.pathname.match(/^\/api\/entities\/(BlogPost|Emotion|EmotionCombination|ScoreRecord)$/);
    if (entityMatch && request.method === "GET") return json(response, 200, listEntity(entityTables[entityMatch[1]], url.searchParams.get("sort"), url.searchParams.get("limit"), entityMatch[1] === "BlogPost"));
    if (entityMatch && request.method === "POST") {
      if (entityMatch[1] === "BlogPost") {
        if (!requireAuth(request, response, true)) return;
        const data = blogInput(await body(request)); const timestamp = now();
        const record = { id: id(), ...data, created_date: timestamp, updated_date: timestamp };
        db.prepare("INSERT INTO blog_posts (id, title, excerpt, content, category, author, read_time, status, created_date, updated_date) VALUES (@id, @title, @excerpt, @content, @category, @author, @read_time, @status, @created_date, @updated_date)").run(record);
        return json(response, 201, record);
      }
      if (!requireAuth(request, response)) return;
      const data = await body(request); const table = entityTables[entityMatch[1]]; const record = { ...data, id: id(), created_date: now() };
      if (record.emotion_names) record.emotion_names = JSON.stringify(record.emotion_names);
      const columns = Object.keys(record); db.prepare(`INSERT INTO ${table} (${columns.join(",")}) VALUES (${columns.map((column) => `@${column}`).join(",")})`).run(record);
      return json(response, 201, { ...record, emotion_names: data.emotion_names });
    }
    if (url.pathname.startsWith("/api/")) return json(response, 404, { error: "Rota não encontrada" });
    const filePath = url.pathname === "/" ? path.join(root, "..", "dist", "index.html") : path.join(root, "..", "dist", url.pathname);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) { response.writeHead(200, { "Content-Type": contentTypeFor(filePath) }); return fs.createReadStream(filePath).pipe(response); }
    const indexPath = path.join(root, "..", "dist", "index.html");
    response.writeHead(200, { "Content-Type": contentTypeFor(indexPath) });
    return fs.createReadStream(indexPath).pipe(response);
  } catch (error) { console.error(error); json(response, 500, { error: "Erro interno do servidor" }); }
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`A porta ${port} já está em uso. Defina PORT para outra porta.`);
    process.exit(1);
  }
  throw error;
});
seedLocalCatalog();
seedBlogPosts()
  .catch((error) => console.error(error.message))
  .finally(() => server.listen(port, "0.0.0.0", () => console.log(`Servidor ativo na porta ${port}`)));