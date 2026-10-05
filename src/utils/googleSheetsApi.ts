import { Product } from '../types/product';
import { UserEmployee } from '../types/auth';
import { DEFAULT_EMPLOYEES_SNAPSHOT } from '../data/employeesSnapshot';

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

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 15000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err: any) {
    clearTimeout(id);
    if (err.name === 'AbortError') {
      throw new Error(`Quá thời gian chờ phản hồi (${timeoutMs / 1000}s). Vui lòng kiểm tra lại mạng.`);
    }
    throw err;
  }
}

/**
 * Lấy thông tin trạng thái bảng tính Google Sheet
 */
export async function fetchSpreadsheetInfo(): Promise<SheetInfoResponse> {
  const res = await fetchWithTimeout('/api/sheets/info', {}, 10000);
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
  const res = await fetchWithTimeout('/api/sheets/push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ products, sheetTitle }),
  }, 25000);

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    console.error('API /api/sheets/push returned non-JSON:', text.slice(0, 200));
    throw new Error(`Máy chủ Google Sheet phản hồi lỗi định dạng (HTTP ${res.status}). Vui lòng thử lại.`);
  }

  const data: SyncPushResponse = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || `HTTP ${res.status}: Lỗi đẩy dữ liệu lên Google Sheet`);
  }

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
  const res = await fetchWithTimeout(`/api/sheets/products?sheetTitle=${encodeURIComponent(sheetTitle)}`, {}, 15000);
  
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    console.error('API /api/sheets/products returned non-JSON:', text.slice(0, 200));
    throw new Error(`Máy chủ Google Sheet phản hồi lỗi định dạng (HTTP ${res.status}). Vui lòng thử lại.`);
  }

  const data: SyncPullResponse = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || `HTTP ${res.status}: Lỗi tải dữ liệu từ Google Sheet`);
  }

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

/**
 * Tải danh sách nhân viên từ Google Sheet (sheet NHAN_VIEN)
 */
export async function pullEmployeesFromGoogleSheet(): Promise<UserEmployee[]> {
  try {
    const res = await fetchWithTimeout('/api/sheets/employees', {}, 10000);
    if (!res.ok) {
      return DEFAULT_EMPLOYEES_SNAPSHOT;
    }
    const data = await res.json();
    if (data.success && Array.isArray(data.employees) && data.employees.length > 0) {
      return data.employees;
    }
  } catch (err) {
    console.warn('Không thể kết nối API /api/sheets/employees, dùng bản snapshot dự phòng:', err);
  }
  return DEFAULT_EMPLOYEES_SNAPSHOT;
}

/**
 * Tải cài đặt hệ thống (bao gồm Gemini API Key) từ sheet CAI_DAT
 */
export async function fetchSheetSettings(
  sheetTitle: string = 'CAI_DAT'
): Promise<Record<string, string>> {
  try {
    const res = await fetchWithTimeout(
      `/api/sheets/settings?sheetTitle=${encodeURIComponent(sheetTitle)}`,
      {},
      10000
    );
    if (!res.ok) return {};
    const data = await res.json();
    return data.settings || {};
  } catch (err) {
    console.warn('Không thể tải cấu hình từ sheet CAI_DAT:', err);
    return {};
  }
}

/**
 * Lưu cài đặt hệ thống (bao gồm Gemini API Key) vào sheet CAI_DAT
 */
export async function saveSheetSettings(
  settings: Record<string, string>,
  sheetTitle: string = 'CAI_DAT'
): Promise<{ success: boolean; updatedRows?: number }> {
  const res = await fetchWithTimeout(
    '/api/sheets/settings',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings, sheetTitle }),
    },
    15000
  );

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(`Máy chủ Google Sheet phản hồi không hợp lệ (HTTP ${res.status}).`);
  }

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Lỗi lưu cấu hình vào sheet CAI_DAT');
  }
  return data;
}
