import { Product } from '../types/product';

export interface SheetInfoResponse {
  success: boolean;
  title: string;
  spreadsheetId: string;
  url: string;
  serviceAccountEmail: string;
  sheets: Array<{
    sheetId: number;
    title: string;
    index: number;
    rowCount?: number;
    columnCount?: number;
  }>;
  error?: string;
}

export interface SyncPushResponse {
  success: boolean;
  updatedRows: number;
  sheetTitle: string;
  error?: string;
}

export interface SyncPullResponse {
  success: boolean;
  count: number;
  products: Product[];
  error?: string;
}

export const STORAGE_KEY_SHEETS_CONFIG = 'procompare_sheets_config_v1';

export interface SheetsConfig {
  sheetTitle: string;
  autoSyncOnSave: boolean;
  lastSyncedAt?: string;
  lastSyncedCount?: number;
}

export function getLocalSheetsConfig(): SheetsConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SHEETS_CONFIG);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Lỗi đọc SheetsConfig:', e);
  }
  return {
    sheetTitle: 'Sản phẩm',
    autoSyncOnSave: true,
  };
}

export function saveLocalSheetsConfig(config: Partial<SheetsConfig>) {
  try {
    const current = getLocalSheetsConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(STORAGE_KEY_SHEETS_CONFIG, JSON.stringify(updated));
  } catch (e) {
    console.error('Lỗi lưu SheetsConfig:', e);
  }
}

/**
 * Lấy thông tin trạng thái bảng tính Google Sheet
 */
export async function fetchSpreadsheetInfo(): Promise<SheetInfoResponse> {
  const res = await fetch('/api/sheets/info');
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}: Lỗi kết nối Google Sheet`);
  }
  return res.json();
}

/**
 * Đẩy toàn bộ danh sách sản phẩm lên Google Sheet
 */
export async function pushProductsToGoogleSheet(
  products: Product[],
  sheetTitle: string = 'Sản phẩm'
): Promise<SyncPushResponse> {
  const res = await fetch('/api/sheets/push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ products, sheetTitle }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}: Lỗi đẩy dữ liệu lên Google Sheet`);
  }
  const data: SyncPushResponse = await res.json();
  saveLocalSheetsConfig({
    sheetTitle,
    lastSyncedAt: new Date().toISOString(),
    lastSyncedCount: data.updatedRows,
  });
  return data;
}

/**
 * Tải danh sách sản phẩm từ Google Sheet về
 */
export async function pullProductsFromGoogleSheet(
  sheetTitle: string = 'Sản phẩm'
): Promise<Product[]> {
  const res = await fetch(`/api/sheets/products?sheetTitle=${encodeURIComponent(sheetTitle)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}: Lỗi tải dữ liệu từ Google Sheet`);
  }
  const data: SyncPullResponse = await res.json();
  saveLocalSheetsConfig({
    sheetTitle,
    lastSyncedAt: new Date().toISOString(),
    lastSyncedCount: data.count,
  });
  return data.products || [];
}

export interface AiAnalyzeResponse {
  success: boolean;
  analyzedCount: number;
  sheetTitle: string;
  products: Product[];
  error?: string;
}

/**
 * Gọi AI phân tích cột "Mô tả sản phẩm" trên Google Sheet và tự động điền vào cột "Thông số kỹ thuật"
 */
export async function aiAnalyzeSheetSpecsApi(
  sheetTitle: string = 'Sản phẩm',
  apiKey?: string
): Promise<AiAnalyzeResponse> {
  const res = await fetch('/api/sheets/ai-parse-specs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sheetTitle, apiKey }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}: Lỗi phân tích thông số AI từ Google Sheet`);
  }
  const data: AiAnalyzeResponse = await res.json();
  saveLocalSheetsConfig({
    sheetTitle,
    lastSyncedAt: new Date().toISOString(),
    lastSyncedCount: data.analyzedCount,
  });
  return data;
}

