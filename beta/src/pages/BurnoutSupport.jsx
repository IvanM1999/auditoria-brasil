import React, { useEffect, useState } from "react";
import { AlertTriangle, BookOpen, HeartHandshake, MessageCircle, ShieldCheck } from "lucide-react";

const needs = [
  ["listen", "Só preciso ser ouvido"],
  ["organize", "Organizar o que está acontecendo"],
  ["sensory", "Lidar com sobrecarga sensorial"],
  ["burnout", "Entender o burnout"],
  ["crisis", "Estou em risco ou não estou seguro"],
];

const guidance = {
  listen: "Você não precisa explicar tudo perfeitamente. Podemos começar pelo que está mais pesado agora, em uma frase ou até com poucas palavras.",
  organize: "Vamos reduzir o problema ao próximo passo possível: o que aconteceu, o que seu corpo está sinalizando e quem pode ajudar hoje.",
  sensory: "Se for possível, reduza luz, ruído, conversas e decisões. Água, alimento, descanso e um espaço previsível podem ser prioridades básicas.",
  burnout: "Burnout autista pode envolver exaustão, perda de habilidades, maior sensibilidade e necessidade de recuperação. Não é falha moral. Uma avaliação profissional ajuda a investigar outras causas e apoios.",
  crisis: "Se você corre perigo agora, pensa em se machucar, não consegue se manter seguro ou alguém está ameaçando você, procure o SAMU 192, uma emergência ou uma pessoa de confiança imediatamente. No Brasil, o CVV atende pelo 188.",
};

export default function BurnoutSupport() {
  const [sources, setSources] = useState([]);
  const [ageGroup, setAgeGroup] = useState("adult");
  const [need, setNeed] = useState("");
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState([]);
  const [consent, setConsent] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetch("/api/beta/burnout-sources")
      .then((response) => response.json())
      .then(setSources)
      .catch(() => setSources([]));
  }, []);

  const startConversation = async (event) => {
    event.preventDefault();
    if (!need || !consent) return;
    const ageNote = ageGroup === "child" || ageGroup === "teen"
      ? "Para crianças e adolescentes, envolva um adulto seguro de confiança."
      : "Escolha uma pessoa de confiança para saber como você está, se isso for seguro.";
    const userMessage = message.trim() || "Quero começar sem conseguir explicar muito.";
    setAiLoading(true);
    try {
      const response = await fetch("/api/beta/support", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: userMessage, age_group: ageGroup, support_need: need, consent }) });
      const result = response.ok ? await response.json() : null;
      setConversation((items) => [...items, { user: userMessage, assistant: result?.message ? `${result.message} ${ageNote}` : `${guidance[need]} ${ageNote}` }]);
    } catch {
      setConversation((items) => [...items, { user: userMessage, assistant: `${guidance[need]} ${ageNote}` }]);
    } finally { setAiLoading(false); }
    setMessage("");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header className="rounded-3xl bg-slate-900 p-6 sm:p-9 text-white shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">Beta de apoio</p>
        <h1 className="font-heading text-2xl sm:text-4xl font-bold mt-3">Apoio para burnout autista</h1>
        <p className="text-slate-300 mt-3 leading-relaxed max-w-2xl">
          Um espaço público para organizar o próximo passo, encontrar fontes confiáveis e buscar apoio humano. Não é terapia, diagnóstico nem emergência.
        </p>
      </header>

      <section className="rounded-2xl border border-red-200 bg-red-50 p-5" aria-labelledby="crisis-title">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h2 id="crisis-title" className="font-semibold text-red-900">Se houver risco agora</h2>
            <p className="text-sm text-red-800 mt-1 leading-relaxed">Procure o SAMU 192, uma emergência ou uma pessoa de confiança. No Brasil, o CVV atende pelo 188. Não fique sozinho com um risco imediato.</p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-6 h-6 text-sky-600" />
          <div>
            <h2 className="font-heading text-xl font-bold text-slate-800">Conversa guiada local</h2>
            <p className="text-sm text-slate-500">Esta versão não usa IA nem envia sua mensagem para outro serviço.</p>
          </div>
        </div>
        <form onSubmit={startConversation} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Faixa etária
            <select value={ageGroup} onChange={(event) => setAgeGroup(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 bg-white">
              <option value="child">Criança</option>
              <option value="teen">Adolescente</option>
              <option value="adult">Adulto</option>
              <option value="older_adult">Pessoa idosa</option>
              <option value="unknown">Prefiro não dizer</option>
            </select>
          </label>
          <fieldset>
            <legend className="text-sm font-medium text-slate-700">O que você precisa agora?</legend>
            <div className="grid sm:grid-cols-2 gap-2 mt-2">
              {needs.map(([value, label]) => (
                <label key={value} className={`rounded-xl border px-3 py-2.5 text-sm cursor-pointer ${need === value ? "border-sky-500 bg-sky-50 text-sky-800" : "border-slate-200 text-slate-600"}`}>
                  <input type="radio" name="need" value={value} checked={need === value} onChange={(event) => setNeed(event.target.value)} className="mr-2" />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="block text-sm font-medium text-slate-700">
            O que está acontecendo? (opcional)
            <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5" placeholder="Você pode escrever pouco, muito ou nada." />
          </label>
          <label className="flex items-start gap-2 text-sm text-slate-600"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1" />Aceito enviar esta mensagem ao serviço de apoio configurado pelo projeto. O histórico continua somente neste dispositivo.</label>
          <button type="submit" disabled={!need || !consent || aiLoading} className="rounded-xl bg-slate-900 text-white px-4 py-3 font-semibold disabled:opacity-40">{aiLoading ? "Organizando..." : "Começar com um próximo passo"}</button>
        </form>
        {conversation.length > 0 && (
          <div className="mt-6 space-y-3" aria-live="polite">
            {conversation.map((item, index) => (
              <div key={index} className="space-y-2 text-sm">
                <p className="bg-slate-100 rounded-2xl p-3 text-slate-700">{item.user}</p>
                <p className="bg-sky-50 rounded-2xl p-3 text-slate-700">{item.assistant}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="grid sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-slate-100 p-4"><ShieldCheck className="w-5 h-5 text-emerald-600" /><h2 className="font-semibold mt-2">Sem diagnóstico</h2><p className="text-xs text-slate-500 mt-1">A experiência merece cuidado sem transformar o beta em consulta.</p></div>
        <div className="bg-white rounded-2xl border border-slate-100 p-4"><HeartHandshake className="w-5 h-5 text-rose-600" /><h2 className="font-semibold mt-2">Apoio humano</h2><p className="text-xs text-slate-500 mt-1">Pessoas de confiança e serviços locais continuam centrais.</p></div>
        <div className="bg-white rounded-2xl border border-slate-100 p-4"><BookOpen className="w-5 h-5 text-amber-600" /><h2 className="font-semibold mt-2">Fontes abertas</h2><p className="text-xs text-slate-500 mt-1">Leia o contexto e a data de cada referência antes de decidir.</p></div>
      </section>

      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
        <h2 className="font-heading text-xl font-bold text-slate-800">Fontes verificadas</h2>
        <p className="text-sm text-slate-500 mt-2">Links oficiais e busca bibliográfica. A lista não substitui orientação profissional local.</p>
        <div className="mt-5 space-y-3">
          {sources.map((source) => (
            <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="block rounded-2xl border border-slate-100 p-4 hover:border-sky-200">
              <div className="flex items-start justify-between gap-3"><h3 className="font-semibold text-slate-700">{source.title}</h3><span className="text-xs text-slate-400">{source.kind}</span></div>
              <p className="text-xs text-slate-400 mt-1">{source.publisher}</p><p className="text-sm text-slate-600 mt-2 leading-relaxed">{source.summary}</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
