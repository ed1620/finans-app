import * as XLSX from 'xlsx';
import type { AppState, Expense, Income } from '../types';
import { generateId } from './helpers';

export function exportToExcel(state: AppState): void {
  const wb = XLSX.utils.book_new();

  const expenseRows = state.expenses.map((e) => {
    const card = state.cards.find((c) => c.id === e.cardId);
    const category = state.categories.find((c) => c.id === e.categoryId);
    const subcat = category?.subcategories.find((s) => s.id === e.subcategoryId);
    return {
      Tarih: new Date(e.date).toLocaleDateString('tr-TR'),
      Kart: card?.name ?? '',
      Kategori: category?.name ?? '',
      'Alt Kategori': subcat?.name ?? '',
      'Harcama Yeri': e.location,
      'Tutar (₺)': e.amount,
      Açıklama: e.description ?? '',
      Pişmanlık: e.regret ? 'Evet' : 'Hayır',
    };
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(expenseRows), 'Harcamalar');

  const incomeRows = state.incomes.map((i) => {
    const account = state.cards.find((c) => c.id === i.accountId);
    const category = state.incomeCategories.find((c) => c.id === i.categoryId);
    return {
      Tarih: new Date(i.date).toLocaleDateString('tr-TR'),
      Hesap: account?.name ?? '',
      Kategori: category?.name ?? '',
      Gönderen: i.sender,
      'Tutar (₺)': i.amount,
      Açıklama: i.description ?? '',
    };
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(incomeRows), 'Gelirler');

  const cardRows = state.cards.map((c) => ({
    'Kart Adı': c.name,
    Banka: c.bank,
    Tür: c.type,
    'Son 4 Hane': c.lastFour,
    'Bakiye (₺)': c.balance,
    Durum: c.isActive ? 'Aktif' : 'Pasif',
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(cardRows), 'Kartlar');

  XLSX.writeFile(wb, `kfu_veriler_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// ─── Blank template for offline entry ──────────────────────────────────────

export function downloadExcelTemplate(state: AppState): void {
  const wb = XLSX.utils.book_new();

  // Expenses template sheet
  const expHeaders = [
    { Tarih: 'GG.AA.YYYY', Kart: state.cards.map(c => c.name).join(' / '),
      Kategori: state.categories.map(c => c.name).join(' / '),
      'Alt Kategori': '(isteğe bağlı)', 'Harcama Yeri': 'örn. Migros',
      'Tutar (₺)': 0, Açıklama: '(isteğe bağlı)', Pişmanlık: 'Evet / Hayır' },
  ];
  // Add 20 blank rows
  for (let i = 0; i < 20; i++) {
    expHeaders.push({ Tarih: '', Kart: '', Kategori: '', 'Alt Kategori': '',
      'Harcama Yeri': '', 'Tutar (₺)': 0, Açıklama: '', Pişmanlık: 'Hayır' });
  }
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(expHeaders), 'Harcamalar');

  // Income template sheet
  const incHeaders = [
    { Tarih: 'GG.AA.YYYY', Hesap: state.cards.map(c => c.name).join(' / '),
      Kategori: state.incomeCategories.map(c => c.name).join(' / '),
      Gönderen: 'örn. İşveren', 'Tutar (₺)': 0, Açıklama: '(isteğe bağlı)' },
  ];
  for (let i = 0; i < 10; i++) {
    incHeaders.push({ Tarih: '', Hesap: '', Kategori: '', Gönderen: '', 'Tutar (₺)': 0, Açıklama: '' });
  }
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(incHeaders), 'Gelirler');

  // Reference sheet for valid values
  const maxLen = Math.max(state.cards.length, state.categories.length, state.incomeCategories.length);
  const refRows = Array.from({ length: maxLen }, (_, i) => ({
    'Kart İsimleri': state.cards[i]?.name ?? '',
    'Harcama Kategorileri': state.categories[i]?.name ?? '',
    'Gelir Kategorileri': state.incomeCategories[i]?.name ?? '',
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(refRows), 'Referans (Silme)');

  XLSX.writeFile(wb, `kfu_sablon_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// ─── Import from filled template ───────────────────────────────────────────

interface ImportedRow {
  Tarih?: string | number;
  Kart?: string;
  Hesap?: string;
  Kategori?: string;
  'Alt Kategori'?: string;
  Gönderen?: string;
  'Harcama Yeri'?: string;
  'Tutar (₺)'?: number | string;
  Açıklama?: string;
  Pişmanlık?: string;
}

export function importFromExcelTemplate(
  file: File,
  state: AppState
): Promise<{ expenses: Expense[]; incomes: Income[]; count: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });

        const parseDate = (val?: string | number): string => {
          if (val == null || val === '') return new Date().toISOString();

          // Excel serial number (e.g., 44927 for 2023-01-01)
          if (typeof val === 'number') {
            const d = new Date((val - 25569) * 86400 * 1000);
            return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
          }

          const s = String(val).trim();

          // DD.MM.YYYY
          if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(s)) {
            const [d, m, y] = s.split('.');
            return new Date(`${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}T00:00:00`).toISOString();
          }
          // DD/MM/YYYY
          if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
            const [d, m, y] = s.split('/');
            return new Date(`${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}T00:00:00`).toISOString();
          }
          // YYYY-MM-DD (ISO)
          if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
            return new Date(s).toISOString();
          }

          const d = new Date(s);
          return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
        };

        const expSheet = wb.Sheets['Harcamalar'];
        const incSheet = wb.Sheets['Gelirler'];

        const expenses: Expense[] = [];
        const incomes: Income[] = [];

        if (expSheet) {
          const rows = XLSX.utils.sheet_to_json<ImportedRow>(expSheet);
          rows.forEach(row => {
            const location = row['Harcama Yeri'];
            const amount = parseFloat(String(row['Tutar (₺)'] ?? 0));
            if (!location || !amount || amount <= 0) return;
            // Skip the hint row
            if (location === 'örn. Migros') return;

            const card = state.cards.find(c => c.name === row.Kart);
            const category = state.categories.find(c => c.name === row.Kategori);
            const subcat = category?.subcategories.find(s => s.name === row['Alt Kategori']);

            expenses.push({
              id: generateId(),
              cardId: card?.id ?? state.cards[0]?.id ?? '',
              categoryId: category?.id ?? state.categories[0]?.id ?? '',
              subcategoryId: subcat?.id,
              location: String(location),
              amount,
              description: row.Açıklama ? String(row.Açıklama) : undefined,
              regret: String(row.Pişmanlık ?? '').toLowerCase() === 'evet',
              date: parseDate(row.Tarih ? String(row.Tarih) : undefined),
            });
          });
        }

        if (incSheet) {
          const rows = XLSX.utils.sheet_to_json<ImportedRow>(incSheet);
          rows.forEach(row => {
            const sender = row.Gönderen;
            const amount = parseFloat(String(row['Tutar (₺)'] ?? 0));
            if (!sender || !amount || amount <= 0) return;
            if (sender === 'örn. İşveren') return;

            const account = state.cards.find(c => c.name === (row.Hesap ?? row.Kart));
            const category = state.incomeCategories.find(c => c.name === row.Kategori);

            incomes.push({
              id: generateId(),
              accountId: account?.id ?? state.cards[0]?.id ?? '',
              amount,
              categoryId: category?.id ?? state.incomeCategories[0]?.id ?? '',
              sender: String(sender),
              description: row.Açıklama ? String(row.Açıklama) : undefined,
              date: parseDate(row.Tarih ? String(row.Tarih) : undefined),
            });
          });
        }

        resolve({ expenses, incomes, count: expenses.length + incomes.length });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Excel dosyası okunamadı'));
    reader.readAsArrayBuffer(file);
  });
}
