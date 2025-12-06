import jsPDF from 'jspdf';
import type { Quote } from '../types';

export const exportQuoteToPDF = (
  quote: Quote,
  studioName: string = 'Studio Dentistico'
) => {
  const doc = new jsPDF();

  // Configurazione
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = 20;

  // Header - Studio
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(studioName, margin, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Via Roma 123, Milano - Tel: 02 1234567', margin, yPosition);
  doc.text('Email: info@studiodentistico.it', margin, yPosition + 5);
  yPosition += 20;

  // Linea separatrice
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 15;

  // Titolo
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('PREVENTIVO', margin, yPosition);
  yPosition += 15;

  // Info Preventivo
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  const infoLines = [
    `Paziente: ${quote.patientName}`,
    `Data emissione: ${new Date(quote.createdAt).toLocaleDateString('it-IT')}`,
    `Valido fino al: ${new Date(quote.validUntil).toLocaleDateString('it-IT')}`,
    `Stato: ${getStatusLabel(quote.status)}`,
  ];

  infoLines.forEach((line) => {
    doc.text(line, margin, yPosition);
    yPosition += 7;
  });

  yPosition += 10;

  // Tabella trattamenti
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Trattamenti:', margin, yPosition);
  yPosition += 10;

  // Header tabella
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 10, 'F');

  doc.setFontSize(10);
  doc.text('Descrizione', margin + 2, yPosition);
  doc.text('Qtà', pageWidth - margin - 75, yPosition);
  doc.text('Prezzo Unit.', pageWidth - margin - 50, yPosition);
  doc.text('Totale', pageWidth - margin, yPosition, {
    align: 'right',
  });
  yPosition += 10;

  // Items
  doc.setFont('helvetica', 'normal');
  quote.items.forEach((item, index) => {
    // Alterniamo lo sfondo
    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 8, 'F');
    }

    doc.text(item.treatmentName, margin + 2, yPosition);
    doc.text(item.quantity.toString(), pageWidth - margin - 75, yPosition);
    doc.text(
      formatCurrency(item.unitPrice),
      pageWidth - margin - 50,
      yPosition
    );
    doc.text(formatCurrency(item.total), pageWidth - margin, yPosition, {
      align: 'right',
    });

    yPosition += 8;

    // Se c'è una descrizione, la aggiungiamo
    if (item.description) {
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      const descLines = doc.splitTextToSize(
        item.description,
        pageWidth - 2 * margin - 10
      );
      doc.text(descLines, margin + 5, yPosition);
      yPosition += 4 * descLines.length;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
    }

    yPosition += 2;
  });

  // Linea separatrice finale
  yPosition += 5;
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Totale
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTALE:', pageWidth - margin - 60, yPosition);
  doc.text(formatCurrency(quote.totalAmount), pageWidth - margin, yPosition, {
    align: 'right',
  });
  yPosition += 15;

  // Note finali
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);

  const notes = [
    'Questo preventivo ha validità fino alla data indicata.',
    'I prezzi si intendono IVA inclusa dove applicabile.',
    'Per accettare il preventivo, contattare lo studio.',
  ];

  notes.forEach((note) => {
    doc.text(note, margin, yPosition);
    yPosition += 5;
  });

  // Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Preventivo generato il ${new Date().toLocaleString('it-IT')}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );

  // Salva il PDF
  const fileName = `Preventivo_${quote.patientName.replace(/\s+/g, '_')}_${
    new Date().toISOString().split('T')[0]
  }.pdf`;
  doc.save(fileName);
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    draft: 'Bozza',
    sent: 'Inviato',
    accepted: 'Accettato',
    rejected: 'Rifiutato',
  };
  return labels[status] || status;
};
