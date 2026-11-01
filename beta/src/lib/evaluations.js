import { base44 } from "@/api/base44Client";

// Busca todas as avaliações e devolve mapa candidato_id -> { media, count, porCriterio, alertas }
export async function fetchMediaIndex() {
  try {
    const all = await base44.entities.Evaluation.list("-created_date", 500);
    const index = {};
    for (const ev of all || []) {
      const id = ev.candidato_id;
      if (!index[id]) index[id] = { soma: 0, count: 0, criterios: {}, alertas: new Set() };
      const m = index[id];
      m.soma += ev.nota_sintetica || 0;
      m.count += 1;
      if (ev.notas) {
        for (const [k, v] of Object.entries(ev.notas)) {
          if (v == null) continue;
          m.criterios[k] = m.criterios[k] || { soma: 0, count: 0 };
          m.criterios[k].soma += Number(v);
          m.criterios[k].count += 1;
        }
      }
      if (ev.alertas) ev.alertas.forEach((a) => m.alertas.add(a));
    }
    const result = {};
    for (const [id, m] of Object.entries(index)) {
      result[id] = {
        media: m.count ? m.soma / m.count : null,
        count: m.count,
        porCriterio: Object.fromEntries(
          Object.entries(m.criterios).map(([k, v]) => [k, v.count ? v.soma / v.count : null])
        ),
        alertas: [...m.alertas],
      };
    }
    return result;
  } catch (e) {
    return {};
  }
}

export async function fetchEvaluationsFor(candidato_id) {
  try {
    return await base44.entities.Evaluation.filter({ candidato_id }, "-created_date", 100);
  } catch (e) {
    return [];
  }
}