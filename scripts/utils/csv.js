// Tạo và tải file CSV (có BOM để Excel đọc đúng tiếng Việt)
export function toCsv(header, rows) {
  const cell = (v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : v);
  return '﻿' + [header, ...rows].map((r) => r.map(cell).join(',')).join('\n');
}

export function downloadFile(content, filename, type = 'text/csv') {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type }));
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export const today = () => new Date().toISOString().slice(0, 10);
