// Add this constant near the top of the component
const API_BASE_URL = 'http://localhost:8080/api';

// Helper to generate a simple invoice text (fallback)
const generateInvoiceText = (bill: any) => {
  const lines: string[] = [];
  lines.push(`Bill #${bill.id}`);
  lines.push(`Date: ${bill.issuedAt ? formatDate(bill.issuedAt) : 'N/A'}`);
  lines.push(`Patient: ${bill.patient?.fullName ?? 'N/A'}`);
  lines.push(`Amount: ₹${Number(bill.amount ?? 0).toFixed(2)}`);
  lines.push(`Status: ${bill.status}`);
  if (bill.paymentMethod) lines.push(`Payment Method: ${bill.paymentMethod}`);
  if (bill.paymentDate) lines.push(`Payment Date: ${bill.paymentDate ? formatDate(bill.paymentDate) : 'N/A'}`);
  if (bill.items && bill.items.length) {
    lines.push('\nItems:');
    bill.items.forEach((it: any, i: number) =>
      lines.push(`${i + 1}. ${it.description} — ₹${Number(it.cost ?? 0).toFixed(2)}`)
    );
  }
  return lines.join('\n');
};

// Download handler: tries server PDF endpoint first, falls back to text
const handleDownloadBill = async (bill: any) => {
  try {
    // try server-side download (if your backend implements it)
    const res = await fetch(`${API_BASE_URL}/billing/${bill.id}/download`);
    if (res.ok) {
      const blob = await res.blob();
      const ext = blob.type === 'application/pdf' ? 'pdf' : 'bin';
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bill-${bill.id}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      return;
    }
  } catch (e) {
    // ignore, fallback below
    console.warn('Server download failed, falling back to text download', e);
  }

  // Fallback: download invoice as plain text
  const invoiceText = generateInvoiceText(bill);
  const blob = new Blob([invoiceText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bill-${bill.id}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
