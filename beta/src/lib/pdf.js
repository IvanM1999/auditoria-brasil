import { jsPDF } from 'jspdf';
import { CARGOS } from '@/lib/audit';

export function generateVotingDossierPDF(location, selections) {
  const document = new jsPDF();
  const pageWidth = document.internal.pageSize.getWidth();
  const pageHeight = document.internal.pageSize.getHeight();
  const margin = 18;
  const lineHeight = 6;
  let y = 22;

  const writeParagraph = (text, { bold = false, size = 10, gap = 3 } = {}) => {
    document.setFont('helvetica', bold ? 'bold' : 'normal');
    document.setFontSize(size);
    const lines = document.splitTextToSize(String(text || ''), pageWidth - margin * 2);
    for (const line of lines) {
      if (y + lineHeight > pageHeight - margin) {
        document.addPage();
        y = margin;
      }
      document.text(line, margin, y);
      y += lineHeight;
    }
    y += gap;
  };

  writeParagraph('Dossiê de voto', { bold: true, size: 20, gap: 1 });
  writeParagraph(`${location.cidade} · ${location.estado} · ${new Date().toLocaleDateString('pt-BR')}`, {
    size: 10,
    gap: 8,
  });
  writeParagraph('Seleções baseadas nos registros e avaliações disponíveis no portal.', { size: 9, gap: 8 });

  for (const selection of selections) {
    const cargo = CARGOS[selection.cargo];
    const candidate = selection.candidate;
    writeParagraph(cargo?.label || selection.cargo, { bold: true, size: 13, gap: 1 });
    writeParagraph(candidate?.nome, { bold: true, size: 11, gap: 1 });
    writeParagraph(`Partido: ${candidate?.partido || 'não informado'} · Número: ${candidate?.numero || 'não informado'}`);
    writeParagraph(`Média das avaliações: ${selection.media?.media == null ? 'sem avaliações' : `${selection.media.media.toFixed(1)} / 100`}`);
    if (candidate?.alertas?.length) writeParagraph(`Alertas registrados: ${candidate.alertas.join(', ')}`);
    if (candidate?.fonte_url) writeParagraph(`Fonte: ${candidate.fonte_url}`, { size: 8, gap: 7 });
  }

  writeParagraph('Consulte as fontes oficiais antes de tomar qualquer decisão. As avaliações comunitárias não substituem a verificação dos registros públicos.', {
    size: 8,
    gap: 0,
  });

  document.save('dossie-de-voto.pdf');
}
