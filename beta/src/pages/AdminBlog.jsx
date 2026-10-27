import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { FilePlus2, Pencil, Trash2, Save, X } from "lucide-react";
import { api } from "@/api/localApi";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const emptyPost = { title: "", excerpt: "", content: "", category: "autismo", author: "Equipe Emocionário Amigo", read_time: "3 min", status: "draft" };

export default function AdminBlog() {
  const { user, isLoadingAuth } = useAuth();
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(emptyPost);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadPosts = async () => {
    setLoading(true);
    try { setPosts(await api.adminBlog.list()); } catch (error) { setMessage(error.message); } finally { setLoading(false); }
  };

  useEffect(() => { if (user?.role === "admin") loadPosts(); }, [user]);

  if (isLoadingAuth) return <p className="text-slate-500">Carregando...</p>;
  if (user?.role !== "admin") return <Navigate to="/adm" replace />;

  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const startEdit = (post) => { setEditingId(post.id); setForm({ ...emptyPost, ...post }); setMessage(""); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const reset = () => { setEditingId(null); setForm(emptyPost); };
  const save = async (event) => {
    event.preventDefault(); setSaving(true); setMessage("");
    try {
      if (editingId) await api.adminBlog.update(editingId, form); else await api.adminBlog.create(form);
      reset(); await loadPosts(); setMessage("Artigo salvo com sucesso.");
    } catch (error) { setMessage(error.message); } finally { setSaving(false); }
  };
  const remove = async (post) => {
    if (!window.confirm(`Excluir o artigo "${post.title}"?`)) return;
    try { await api.adminBlog.remove(post.id); await loadPosts(); setMessage("Artigo excluído."); } catch (error) { setMessage(error.message); }
  };

  return (
    <div className="space-y-8">
      <header><p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Administração</p><h1 className="mt-2 text-3xl font-bold text-slate-800">Gestão do blog</h1><p className="mt-2 text-slate-500">Crie, revise e publique conteúdo persistido no banco do serviço.</p></header>
      {message && <div className="rounded-lg border border-sky-100 bg-sky-50 p-3 text-sm text-sky-800">{message}</div>}
      <form onSubmit={save} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4"><h2 className="text-xl font-semibold text-slate-800">{editingId ? "Editar artigo" : "Novo artigo"}</h2>{editingId && <Button type="button" variant="ghost" onClick={reset}><X className="mr-2 h-4 w-4" />Cancelar</Button>}</div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2"><Label htmlFor="title">Título</Label><Input id="title" name="title" value={form.title} onChange={change} required maxLength={180} /></div>
          <div className="space-y-2"><Label htmlFor="category">Categoria</Label><select id="category" name="category" value={form.category} onChange={change} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="autismo">Autismo</option><option value="emocoes">Emoções</option><option value="dicas">Dicas</option><option value="diagnostico">Diagnóstico</option><option value="vida_adulta">Vida adulta</option><option value="trabalho">Trabalho</option></select></div>
          <div className="space-y-2"><Label htmlFor="status">Status</Label><select id="status" name="status" value={form.status} onChange={change} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="draft">Rascunho</option><option value="published">Publicado</option><option value="archived">Arquivado</option></select></div>
          <div className="space-y-2 md:col-span-2"><Label htmlFor="excerpt">Resumo</Label><Textarea id="excerpt" name="excerpt" value={form.excerpt} onChange={change} maxLength={500} rows={2} /></div>
          <div className="space-y-2 md:col-span-2"><Label htmlFor="content">Conteúdo</Label><Textarea id="content" name="content" value={form.content} onChange={change} required rows={14} /></div>
        </div>
        <Button type="submit" disabled={saving}><Save className="mr-2 h-4 w-4" />{saving ? "Salvando..." : "Salvar artigo"}</Button>
      </form>
      <section className="space-y-3"><div className="flex items-center justify-between"><h2 className="text-xl font-semibold text-slate-800">Artigos salvos</h2><FilePlus2 className="h-5 w-5 text-slate-400" /></div>
        {loading ? <p className="text-slate-500">Carregando artigos...</p> : posts.length === 0 ? <p className="text-slate-500">Nenhum artigo encontrado.</p> : posts.map((post) => <article key={post.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-semibold text-slate-800">{post.title}</h3><p className="text-sm text-slate-500">{post.category} · {post.status} · {new Date(post.updated_date).toLocaleDateString("pt-BR")}</p></div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => startEdit(post)}><Pencil className="mr-2 h-4 w-4" />Editar</Button><Button variant="destructive" size="sm" onClick={() => remove(post)}><Trash2 className="mr-2 h-4 w-4" />Excluir</Button></div></article>)}
      </section>
    </div>
  );
}