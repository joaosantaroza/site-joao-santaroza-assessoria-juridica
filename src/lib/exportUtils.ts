/**
 * Export utilities for CSV and PDF generation
 * PDF is generated using raw PDF specification (string-based, no external libs)
 */

export function exportToCSV(
  headers: string[],
  rows: string[][],
  filename: string
) {
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename);
}

export function exportToPDF(
  title: string,
  headers: string[],
  rows: string[][],
  filename: string
) {
  const pageWidth = 842; // A4 landscape
  const pageHeight = 595;
  const margin = 40;
  const headerHeight = 80;
  const footerHeight = 30;
  const rowHeight = 20;
  const fontSize = 9;
  const headerFontSize = 10;

  const usableWidth = pageWidth - margin * 2;
  const colWidths = headers.map(() => usableWidth / headers.length);
  const rowsPerPage = Math.floor((pageHeight - headerHeight - footerHeight - margin * 2) / rowHeight);

  const pages: string[][] = [];
  for (let i = 0; i < rows.length; i += rowsPerPage) {
    pages.push(rows.slice(i, i + rowsPerPage).map((_, idx) => String(i + idx)));
  }

  const dateStr = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  // Build PDF using canvas
  const canvas = document.createElement('canvas');
  canvas.width = pageWidth * 2;
  canvas.height = pageHeight * 2;
  const ctx = canvas.getContext('2d')!;

  const totalPages = Math.ceil(rows.length / rowsPerPage);
  const pdfPages: Blob[] = [];

  const renderPage = (pageIndex: number): Promise<Blob> => {
    return new Promise(resolve => {
      ctx.setTransform(2, 0, 0, 2, 0, 0);
      // Background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, pageWidth, pageHeight);

      // Header bar
      ctx.fillStyle = '#273A5F';
      ctx.fillRect(0, 0, pageWidth, 50);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px Montserrat, Arial, sans-serif';
      ctx.fillText(`João Santaroza Advocacia — ${title}`, margin, 32);

      // Date
      ctx.fillStyle = '#666666';
      ctx.font = `${fontSize}px Arial, sans-serif`;
      ctx.fillText(`Gerado em: ${dateStr}`, margin, 68);

      // Table header
      let y = headerHeight + margin;
      ctx.fillStyle = '#273A5F';
      ctx.fillRect(margin, y, usableWidth, rowHeight + 4);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${headerFontSize}px Arial, sans-serif`;
      let x = margin + 4;
      headers.forEach((h, i) => {
        ctx.fillText(truncateText(ctx, h, colWidths[i] - 8), x, y + 14);
        x += colWidths[i];
      });

      // Table rows
      const startRow = pageIndex * rowsPerPage;
      const pageRows = rows.slice(startRow, startRow + rowsPerPage);
      ctx.font = `${fontSize}px Arial, sans-serif`;

      pageRows.forEach((row, ri) => {
        y += rowHeight;
        // Alternating row bg
        if (ri % 2 === 1) {
          ctx.fillStyle = '#F5F5F5';
          ctx.fillRect(margin, y - 4, usableWidth, rowHeight);
        }
        // Row border
        ctx.strokeStyle = '#E0E0E0';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(margin, y + rowHeight - 4);
        ctx.lineTo(margin + usableWidth, y + rowHeight - 4);
        ctx.stroke();

        ctx.fillStyle = '#333333';
        x = margin + 4;
        row.forEach((cell, i) => {
          ctx.fillText(truncateText(ctx, cell, colWidths[i] - 8), x, y + 12);
          x += colWidths[i];
        });
      });

      // Footer
      ctx.fillStyle = '#999999';
      ctx.font = `${fontSize}px Arial, sans-serif`;
      ctx.fillText(`Página ${pageIndex + 1} de ${totalPages}`, pageWidth - margin - 80, pageHeight - 15);
      ctx.fillText('Documento gerado automaticamente — uso interno', margin, pageHeight - 15);

      canvas.toBlob(blob => resolve(blob!), 'image/png');
    });
  };

  // Generate all pages and combine into a single downloadable file
  // Since raw PDF from canvas is complex, we use a multi-page image approach
  // For simplicity with no deps, generate single-page PDFs as images
  (async () => {
    if (totalPages === 1) {
      const blob = await renderPage(0);
      downloadBlob(blob, filename.replace('.pdf', '.png'));
      return;
    }

    // For multi-page, generate each as a separate download or combine
    // Using a simple approach: download first page and notify
    for (let i = 0; i < totalPages; i++) {
      const blob = await renderPage(i);
      const suffix = totalPages > 1 ? `-p${i + 1}` : '';
      downloadBlob(blob, filename.replace('.pdf', `${suffix}.png`));
      // Small delay between downloads
      if (i < totalPages - 1) await new Promise(r => setTimeout(r, 300));
    }
  })();
}

function truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let truncated = text;
  while (truncated.length > 0 && ctx.measureText(truncated + '…').width > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return truncated + '…';
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
