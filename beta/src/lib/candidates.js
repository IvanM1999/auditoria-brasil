import { base44 } from "@/api/base44Client";

// Carrega candidatos do pleito para a localidade do eleitor.
export async function loadCandidates(location) {
  if (!location) return [];
  const { estado, cidade } = location;
  const filter = {
    $or: [
      { cargo: "prefeito", estado, cidade },
      { cargo: "vereador", estado, cidade },
      { cargo: "governador", estado },
      { cargo: "deputado_estadual", estado },
      { cargo: "deputado_federal", estado },
      { cargo: "senador", estado },
      { cargo: "presidente" },
    ],
  };
  try {
    return await base44.entities.Candidate.filter(filter, "cargo", 500);
  } catch (e) {
    return [];
  }
}

export function groupByCargo(candidates) {
  const groups = {};
  for (const c of candidates) {
    groups[c.cargo] = groups[c.cargo] || [];
    groups[c.cargo].push(c);
  }
  return groups;
}