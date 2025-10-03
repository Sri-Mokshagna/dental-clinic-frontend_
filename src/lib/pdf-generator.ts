import jsPDF from 'jspdf';

// Clinic Details
const CLINIC_NAME = 'The Dental Experts';
const CLINIC_ADDRESS_LINES = [
    '#201, 2nd floor, Aparna Green Apts, Above ICICI Bank',
    'Nanakramguda, Hyderabad, 500032',
    'Ph: 8125439878'
];

// Document Styling


export const generatePrescriptionPdf = (prescription: Prescription, patient: Patient, doctor: Doctor) => {
    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 25;

    // --- Header ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text(CLINIC_NAME, margin, yPos);
    
    yPos += 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(CLINIC_ADDRESS_LINES, margin, yPos);
    const leftYPos = yPos + (CLINIC_ADDRESS_LINES.length * 5);


    let rightYPos = 25;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Dr. ${doctor?.firstName || ''} ${doctor?.lastName || ''}`, pageWidth - margin, rightYPos, { align: 'right' });
    rightYPos += 5;
    doc.text(doctor?.specialty || '', pageWidth - margin, rightYPos, { align: 'right' });

    yPos = Math.max(leftYPos, rightYPos);

    // --- Divider ---
    yPos += 5;
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, yPos, pageWidth - margin, yPos);

    // --- Patient Info ---
    yPos += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Patient Information', margin, yPos);
    
    yPos += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const patientLabelWidth = 30;
    doc.text('Patient Name:', margin, yPos);
    doc.text(patient?.name || 'N/A', margin + patientLabelWidth, yPos);
    
    doc.text('Prescription Date:', pageWidth / 2 + 10, yPos);
    doc.text(prescription?.date ? new Date(prescription.date).toLocaleDateString('en-GB') : 'N/A', pageWidth / 2 + 45, yPos);

    yPos += 7;
    doc.text('Age:', margin, yPos);
    doc.text(patient?.age ? `${patient.age} years` : 'N/A', margin + patientLabelWidth, yPos);
    
    doc.text('Prescription ID:', pageWidth / 2 + 10, yPos);
    doc.text(prescription?.id || 'N/A', pageWidth / 2 + 45, yPos);

    // --- Prescription Body ---
    yPos += 15;
    doc.setFont('times', 'normal');
    doc.setFontSize(28);
    doc.text('℞', margin, yPos + 5);

    const tableX = margin + 15;
    const tableWidth = pageWidth - tableX - margin;
    const cellPadding = 3;

    const headers = ['Medication', 'Dosage', 'Frequency', 'Duration'];
    const colWidths = [tableWidth * 0.35, tableWidth * 0.2, tableWidth * 0.25, tableWidth * 0.2];
    
    // Draw table header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setFillColor(240, 240, 240);
    doc.rect(tableX, yPos, tableWidth, 8, 'F');
    let currentX = tableX + cellPadding;
    headers.forEach((header, i) => {
        doc.text(header, currentX, yPos + 6);
        currentX += colWidths[i];
    });

    yPos += 8;

    // Draw table rows for each medication
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setDrawColor(200);

    (prescription?.medications || []).forEach((med: { name: string, dosage: string, frequency: string, duration: string }) => {
        const rowData = [
            med.name || 'N/A',
            med.dosage || 'N/A',
            med.frequency || 'N/A',
            med.duration || 'N/A'
        ];
        
        // Calculate row height based on wrapped text
        let maxHeight = 10;
        const textLines = rowData.map((data, i) => {
            const lines = doc.splitTextToSize(data, colWidths[i] - (cellPadding * 2));
            maxHeight = Math.max(maxHeight, lines.length * 5 + 4);
            return lines;
        });

        doc.rect(tableX, yPos, tableWidth, maxHeight);
        
        let startX = tableX + cellPadding;
        textLines.forEach((lines, i) => {
            doc.text(lines, startX, yPos + 6);
            startX += colWidths[i];
        });

        // Draw column lines for the row
        startX = tableX;
        colWidths.forEach((width, i) => {
            if (i < headers.length - 1) {
                startX += width;
                doc.line(startX, yPos, startX, yPos + maxHeight);
            }
        });

        yPos += maxHeight;
    });

    if (prescription?.notes) {
        yPos += 8;
        doc.setFont('helvetica', 'bold');
        doc.text('Notes:', margin, yPos);
        doc.setFont('helvetica', 'normal');
        const notes = doc.splitTextToSize(prescription.notes, pageWidth - margin * 2);
        doc.text(notes, margin, yPos + 5);
        yPos += (notes.length * 5);
    }

    // --- Signature Line ---
    const signatureY = doc.internal.pageSize.getHeight() - 50;
    doc.line(pageWidth - margin - 60, signatureY, pageWidth - margin, signatureY);
    doc.text('Doctor\'s Signature', pageWidth - margin - 60, signatureY + 5);


    // --- Footer ---
    const footerY = doc.internal.pageSize.getHeight() - 20;
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, footerY, pageWidth - margin, footerY);
    doc.setFontSize(8);
    doc.text(`This is a system-generated prescription and requires a signature to be valid.`, pageWidth / 2, footerY + 8, { align: 'center' });

    return doc;
}


export const generateInvoicePdf = (bill: Bill, patient: Patient) => {
    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 25;

    // --- Header ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text(CLINIC_NAME, margin, yPos);
    
    yPos += 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(CLINIC_ADDRESS_LINES, margin, yPos);
    const leftYPos = yPos + (CLINIC_ADDRESS_LINES.length * 5);

    let rightYPos = 25;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', pageWidth - margin, rightYPos, { align: 'right' });
    rightYPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice ID: ${bill?.id || 'N/A'}`, pageWidth - margin, rightYPos, { align: 'right' });
    rightYPos += 5;
    doc.text(`Date: ${bill?.issuedAt ? new Date(bill.issuedAt).toLocaleDateString('en-GB') : 'N/A'}`, pageWidth - margin, rightYPos, { align: 'right' });

    yPos = Math.max(leftYPos, rightYPos);

    // --- Divider ---
    yPos += 5;
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, yPos, pageWidth - margin, yPos);

    // Patient Info
    yPos += 15;
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    yPos += 6;
    doc.text(patient?.name || 'N/A', margin, yPos);
    yPos += 5;
    doc.text(patient?.contact?.phone || '', margin, yPos);

    // Invoice Body
    yPos += 20;
    const tableX = margin;
    const tableWidth = pageWidth - margin * 2;
    const cellPadding = 3;

    // Table Header
    doc.setFillColor(240, 240, 240);
    doc.rect(tableX, yPos, tableWidth, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Service Description', tableX + cellPadding, yPos + 6);
    doc.text('Amount (₹)', tableWidth + margin - cellPadding, yPos + 6, { align: 'right' });
    yPos += 8;

    // Table Rows
    doc.setFont('helvetica', 'normal');
    (bill?.items || []).forEach((item: { description: string, cost: number }) => {
        doc.text(item.description || 'N/A', tableX + cellPadding, yPos + 6);
        doc.text(item.cost?.toFixed(2) || '0.00', tableWidth + margin - cellPadding, yPos + 6, { align: 'right' });
        yPos += 10;
    });

    // Summary
    const summaryX = pageWidth / 2;
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Total:', summaryX, yPos);
    doc.text(`₹${bill?.amount?.toFixed(2) || '0.00'}`, tableWidth + margin, yPos, { align: 'right' });
    yPos += 7;

    const paid = bill?.status === 'paid' ? bill.amount : 0;
    const due = (bill?.amount || 0) - paid;
    doc.text('Amount Paid:', summaryX, yPos);
    doc.text(`₹${paid.toFixed(2)}`, tableWidth + margin, yPos, { align: 'right' });
    yPos += 7;

    doc.text('Balance Due:', summaryX, yPos);
    doc.text(`₹${due.toFixed(2)}`, tableWidth + margin, yPos, { align: 'right' });

    // --- Footer ---
    const footerY = doc.internal.pageSize.getHeight() - 20;
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, footerY, pageWidth - margin, footerY);
    doc.setFontSize(8);
    doc.text(`Thank you for choosing ${CLINIC_NAME}.`, pageWidth / 2, footerY + 8, { align: 'center' });

    return doc;
}
