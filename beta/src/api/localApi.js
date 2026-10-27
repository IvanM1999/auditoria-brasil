const apiBase = import.meta.env.VITE_API_URL || "";
const TOKEN_KEY = "amigo_autista_token";

const request = async (url, options = {}) => {
  const token = localStorage.getItem(TOKEN_KEY);
  const response = await fetch(`${apiBase}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(data?.error || "Não foi possível concluir a operação");
  return data;
};

const auth = {
  me: async () => localStorage.getItem(TOKEN_KEY) ? request("/api/auth/me") : null,
  loginViaEmailPassword: async (email, password) => {
    const data = await request("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    auth.setToken(data.access_token);
    return data.user;
  },
  loginAdmin: async (email, password) => {
    const data = await request("/api/admin/login", { method: "POST", body: JSON.stringify({ email, password }) });
    auth.setToken(data.access_token);
    return data.user;
  },
  register: async ({ email, password }) => {
    sessionStorage.setItem("amigo_autista_pending_password", password);
    return request("/api/auth/register", { method: "POST", body: JSON.stringify({ email, password }) });
  },
  verifyOtp: async ({ email }) => {
    const password = sessionStorage.getItem("amigo_autista_pending_password");
    const data = await request("/api/auth/verify", { method: "POST", body: JSON.stringify({ email, password }) });
    sessionStorage.removeItem("amigo_autista_pending_password");
    auth.setToken(data.access_token);
    return data;
  },
  resendOtp: async () => undefined,
  resetPasswordRequest: async (email) => request("/api/auth/reset", { method: "POST", body: JSON.stringify({ email }) }),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  loginWithProvider: () => { throw new Error("Login social indisponível no modo local"); },
};

const entity = (name) => ({
  list: async (sort, limit = 50) => request(`/api/entities/${name}?sort=${encodeURIComponent(sort || "")}&limit=${limit}`),
  create: async (value) => request(`/api/entities/${name}`, { method: "POST", body: JSON.stringify(value) }),
});

const adminBlog = {
  list: async () => request("/api/admin/blog"),
  create: async (value) => request("/api/admin/blog", { method: "POST", body: JSON.stringify(value) }),
  update: async (id, value) => request(`/api/admin/blog/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(value) }),
  remove: async (id) => request(`/api/admin/blog/${encodeURIComponent(id)}`, { method: "DELETE" }),
};

export const api = {
  auth,
  adminBlog,
  entities: {
    Emotion: entity("Emotion"),
    EmotionCombination: entity("EmotionCombination"),
    BlogPost: entity("BlogPost"),
    ScoreRecord: entity("ScoreRecord"),
  },
};