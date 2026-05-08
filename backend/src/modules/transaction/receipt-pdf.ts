import type { Transaction } from './transaction.model';

export function receiptPdf(txn: Transaction & { _id: unknown; createdAt?: Date; updatedAt?: Date }) {
  const lines = [
    'Wigope Pay Receipt',
    `Receipt ID: ${String(txn._id)}`,
    `Status: ${txn.status}`,
    `Type: ${txn.type}`,
    `Service: ${txn.service ?? '-'}`,
    `Amount: INR ${txn.amount}`,
    `Cashback: INR ${txn.cashbackAmount ?? 0}`,
    `Payment Mode: ${txn.paymentMode}`,
    `Gateway Order: ${txn.gatewayOrderId ?? '-'}`,
    `Date: ${(txn.createdAt ?? new Date()).toISOString()}`,
    '',
    'Wigope Technologies Pvt Ltd',
    'CIN U63999UP2025PTC238367',
  ];
  return makeSimplePdf(lines);
}

function makeSimplePdf(lines: string[]) {
  const escaped = lines.map(escapePdfText);
  const content = [
    'BT',
    '/F1 18 Tf',
    '50 790 Td',
    `(${escaped[0]}) Tj`,
    '/F1 11 Tf',
    ...escaped.slice(1).flatMap((line) => ['0 -24 Td', `(${line}) Tj`]),
    'ET',
  ].join('\n');

  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
    `5 0 obj\n<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream\nendobj\n`,
  ];

  let offset = '%PDF-1.4\n'.length;
  const xref = ['0000000000 65535 f '];
  for (const obj of objects) {
    xref.push(`${String(offset).padStart(10, '0')} 00000 n `);
    offset += Buffer.byteLength(obj);
  }
  const body = objects.join('');
  const xrefOffset = Buffer.byteLength('%PDF-1.4\n' + body);
  const trailer = [
    `xref\n0 ${objects.length + 1}`,
    ...xref,
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>`,
    'startxref',
    String(xrefOffset),
    '%%EOF',
  ].join('\n');
  return Buffer.from(`%PDF-1.4\n${body}${trailer}\n`);
}

function escapePdfText(text: string) {
  return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}
