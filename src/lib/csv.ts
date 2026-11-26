import type { Order, Settings } from './types';
import { formatRmb } from './pricing';

const BULKY_KEYWORDS = ['koffer', 'trolley', 'suitcase', 'box', 'opberg', 'kussen', 'pillow', 'tas', 'rugzak', 'mand'];

function isBulkyItem(title: string): boolean {
  const lower = title.toLowerCase();
  return BULKY_KEYWORDS.some(kw => lower.includes(kw));
}

function orderHasNesting(order: Order): boolean {
  return order.items.some(item => isBulkyItem(`${item.product.title} ${item.product.titleNl}`));
}

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportProcurementCsv(orders: Order[], settings: Settings, mode?: 'train' | 'air') {
  const filtered = mode ? orders.filter(o => o.transportMode === mode) : orders;
  const qcHeader = settings.qcInstructionEn || '';
  const headerRow = `# ${qcHeader}`;

  const headers = [
    'Interne Barcode',
    'Order Nummer',
    'Transport Modus',
    'Bron Merchant',
    'Product Titel (NL)',
    'Product URL',
    'Maat',
    'Kleur',
    'Aantal',
    'RMB Prijs',
    'Gewicht (kg)',
    'Afmetingen LxBxH (cm)',
    'Categorie',
    'QC Instructie (EN)',
    'Nesting Notes',
  ];

  const rows: string[] = [];
  for (const order of filtered) {
    const nesting = orderHasNesting(order);
    for (const item of order.items) {
      const itemBulky = isBulkyItem(`${item.product.title} ${item.product.titleNl}`);
      let nestingNote = '';
      if (nesting) {
        nestingNote = itemBulky
          ? `NESTING REQUIRED: Pack remaining small items from this bundle inside this hollow item`
          : `NESTING REQUIRED: Pack this item inside the hollow item in this bundle`;
      }
      rows.push([
        order.internalBarcode,
        order.orderNumber,
        order.transportMode === 'train' ? 'Treinvracht' : 'Luchtvracht',
        item.product.merchant,
        item.product.titleNl,
        item.product.originalUrl,
        item.size,
        item.color,
        String(item.quantity),
        formatRmb(item.product.priceRmb),
        String(item.product.weightKg),
        `${item.product.lengthCm}x${item.product.widthCm}x${item.product.heightCm}`,
        item.product.category,
        item.product.qcInstructionEn,
        nestingNote,
      ].map(escapeCsv).join(','));
    }
  }

  const csv = [headerRow, '', headers.join(','), ...rows].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const modeLabel = mode === 'train' ? 'TREINVRACHT' : mode === 'air' ? 'LUCHTVRACHT' : 'ALLE';
  link.download = `CN-Cargo-Paklijst-${modeLabel}-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function getQcInstructionEn(order: Order): string {
  const settingsQc = (window as any).__chinedSettings?.qcInstructionEn;
  const lines: string[] = [
    settingsQc || '',
    '',
    `ORDER: ${order.internalBarcode}`,
    `TRANSPORT: ${order.transportMode === 'train' ? 'Rail Freight' : 'Air Freight'}`,
    `ITEMS: ${order.items.length}`,
    '',
  ];
  for (const item of order.items) {
    lines.push(`- [${item.product.merchant}] ${item.product.titleNl}`);
    lines.push(`  Size: ${item.size} | Color: ${item.color} | Qty: ${item.quantity}`);
    lines.push(`  QC: ${item.product.qcInstructionEn}`);
    lines.push(`  URL: ${item.product.originalUrl}`);
    lines.push('');
  }
  return lines.join('\n');
}
