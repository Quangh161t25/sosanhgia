import { SpecGroup, SpecItem, Product } from '../types/product';
import { fetchSheetSettings, saveSheetSettings } from './googleSheetsApi';

const GEMINI_API_KEY_STORAGE = 'procompare_gemini_api_key';

export function getSavedGeminiKey(): string {
  try {
    const saved = localStorage.getItem(GEMINI_API_KEY_STORAGE);
    if (saved) return saved.trim();
  } catch (e) {
    // Ignore in restricted environments
  }
  // Check Vite env
  const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.GEMINI_API_KEY;
  if (envKey && typeof envKey === 'string' && envKey !== 'MY_GEMINI_API_KEY') {
    return envKey.trim();
  }
  return '';
}

export function saveGeminiKey(key: string): void {
  try {
    const cleaned = cleanApiKey(key);
    if (cleaned) {
      localStorage.setItem(GEMINI_API_KEY_STORAGE, cleaned);
    } else {
      localStorage.removeItem(GEMINI_API_KEY_STORAGE);
    }
  } catch (e) {
    console.error('Không thể lưu Gemini API key:', e);
  }
}

/**
 * Tải Gemini API Key từ sheet CAI_DAT trên Google Sheet về máy
 */
export async function syncGeminiKeyFromSheet(): Promise<string> {
  try {
    const settings = await fetchSheetSettings();
    if (settings && settings.GEMINI_API_KEY && settings.GEMINI_API_KEY.trim()) {
      const key = cleanApiKey(settings.GEMINI_API_KEY);
      saveGeminiKey(key);
      return key;
    }
  } catch (e) {
    console.warn('Lỗi đọc API Key từ sheet CAI_DAT:', e);
  }
  return getSavedGeminiKey();
}

/**
 * Lưu Gemini API Key vào cả trình duyệt và trực tiếp lên Google Sheet (sheet CAI_DAT)
 */
export async function saveGeminiKeyToSheet(key: string): Promise<boolean> {
  const cleanKey = cleanApiKey(key);
  saveGeminiKey(cleanKey);
  try {
    await saveSheetSettings({ GEMINI_API_KEY: cleanKey });
    return true;
  } catch (e) {
    console.error('Lỗi lưu API Key lên sheet CAI_DAT:', e);
    throw e;
  }
}

// ==========================================
// CÁC MẪU TEXT VÍ DỤ SẴN ĐỂ TEST NHANH
// ==========================================
export const SAMPLE_SPEC_TEXT_SINGLE = `THÔNG SỐ VẬN HÀNH & HIỆU SUẤT
Công suất định mức: 1800 W
Điện áp hoạt động: 220V - 50Hz
Dải nhiệt độ điều chỉnh: 80°C - 200°C
Hẹn giờ: Tối đa 60 phút
Độ ồn khi hoạt động: < 55 dB

KÍCH THƯỚC & THIẾT KẾ
Dung tích tổng thể: 6.5 Lít
Kích thước sản phẩm: 360 x 300 x 325 mm
Trọng lượng: 5.4 kg
Chất liệu vỏ: Nhựa ABS nguyên sinh chống bám vân tay
Chất liệu lòng nồi: Hợp kim nhôm phủ men gốm Ceramic chống dính

CÔNG NGHỆ & TIỆN ÍCH
Công nghệ làm nóng: Rapid Air nhiệt 360 độ đối lưu
Màn hình điều khiển: Cảm ứng LED kỹ thuật số
Chương trình cài đặt sẵn: 8 chế độ tự động
Tính năng an toàn: Tự động ngắt khi tháo khay, bảo vệ quá nhiệt`;

export const SAMPLE_SPEC_TEXT_MULTI = `Sản phẩm 1: Nồi Chiên Không Dầu QuickSteam Pro
Mã SKU: NC-QS65P
Giá nhập: 1.250.000đ
Giá NPP: 1.650.000đ
Giá sàn: 1.950.000đ
Giá bán lẻ: 2.490.000đ
Nhóm sản phẩm: Điện gia dụng
Loại sản phẩm: Nồi chiên không dầu
Thương hiệu: AeroChef
Bảo hành: 24 tháng
- Công suất: 1800W
- Dung tích: 6.5 Lít
- Công nghệ: Rapid Air + Hơi nước đối lưu SteamPro
- Bảng điều khiển: Cảm ứng LED
- Lòng nồi: Hợp kim nhôm tráng men Ceramic
- Trọng lượng: 5.6 kg
- Kích thước: 360 x 305 x 325 mm

Sản phẩm 2: Nồi Chiên Không Dầu MasterFry Digital
Mã SKU: NC-MF72D
Giá nhập: 1.500.000đ
Giá NPP: 1.980.000đ
Giá sàn: 2.350.000đ
Giá bán lẻ: 2.990.000đ
Nhóm sản phẩm: Điện gia dụng
Loại sản phẩm: Nồi chiên không dầu
Thương hiệu: MasterCook
Bảo hành: 12 tháng
- Công suất: 2100W
- Dung tích: 7.2 Lít (Cỡ đại gia đình)
- Công nghệ: Luồng khí lốc xoáy Twin-Turbo
- Bảng điều khiển: Màn hình cảm ứng kép
- Lòng nồi: Inox 304 kết hợp chống dính Whitford
- Trọng lượng: 6.8 kg
- Kích thước: 385 x 320 x 340 mm

Sản phẩm 3: Nồi Chiên Không Dầu Compact Air Mini
Mã SKU: NC-CA45M
Giá nhập: 720.000đ
Giá NPP: 980.000đ
Giá sàn: 1.150.000đ
Giá bán lẻ: 1.450.000đ
Nhóm sản phẩm: Điện gia dụng
Loại sản phẩm: Nồi chiên không dầu
Thương hiệu: AeroChef
Bảo hành: 12 tháng
- Công suất: 1400W
- Dung tích: 4.5 Lít
- Công nghệ: Chiên đối lưu truyền thống 360 độ
- Bảng điều khiển: Núm xoay cơ bền bỉ
- Lòng nồi: Chống dính Teflon tiêu chuẩn
- Trọng lượng: 3.9 kg
- Kích thước: 310 x 270 x 290 mm`;

// ==========================================
// HEURISTIC / REGEX LOCAL SMART PARSER
// ==========================================

const KNOWN_GROUP_KEYWORDS: Record<string, string[]> = {
  'Thông số vận hành & Động cơ': [
    'công suất', 'điện áp', 'tần số', 'tần suất', 'dung tích', 'tốc độ', 'vòng/phút', 'lực hút',
    'áp suất', 'nhiệt độ', 'độ ồn', 'pin', 'thời gian sạc', 'thời gian sử dụng',
    'tiêu thụ điện', 'dung lượng', 'motor', 'động cơ', 'lưu lượng', 'áp lực', 'bơm'
  ],
  'Kích thước & Thiết kế': [
    'kích thước', 'trọng lượng', 'khối lượng', 'chất liệu', 'màu sắc', 'chiều dài',
    'chiều rộng', 'chiều cao', 'đường kính', 'vỏ', 'lòng nồi', 'thiết kế', 'kiểu dáng',
    'model', 'sku', 'tay cầm', 'quai', 'vung', 'nắp', 'size', 'cỡ'
  ],
  'Công nghệ & Tính năng': [
    'công nghệ', 'điều khiển', 'màn hình', 'chế độ', 'chương trình', 'kết nối',
    'wifi', 'bluetooth', 'app', 'cảm biến', 'tính năng', 'tiện ích', 'hẹn giờ',
    'bộ lọc', 'tự động', 'chức năng', 'sử dụng', 'bếp', 'kháng khuẩn', 'chống dính'
  ],
  'Tiêu chuẩn & Bảo hành': [
    'bảo hành', 'xuất xứ', 'thương hiệu', 'hãng', 'phụ kiện', 'chứng nhận', 'tiêu chuẩn',
    'chống nước', 'an toàn'
  ],
};

const ALL_KNOWN_KEYS = Object.values(KNOWN_GROUP_KEYWORDS).flat();

function categorizeKeyIntoGroup(key: string): string {
  const lower = key.toLowerCase();
  for (const [groupName, keywords] of Object.entries(KNOWN_GROUP_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      return groupName;
    }
  }
  return 'Thông số kỹ thuật chung';
}

/**
 * Trích xuất các cặp Key: Value nằm liên tiếp trên cùng 1 dòng
 * Ví dụ: "Model: LK-1068 Chất liệu: inox 304 Điện áp: 220 -240V Dung tích: 1,7L"
 */
function parseInlineSpecs(str: string): SpecItem[] {
  const parts = str.split(':');
  if (parts.length <= 1) return [];

  const items: SpecItem[] = [];

  function extractKeyAndValue(partText: string): { val: string; nextKey: string } {
    const words = partText.trim().split(/\s+/);
    if (words.length <= 1) {
      return { val: '', nextKey: words[0] || '' };
    }
    // Ưu tiên khớp chính xác từ 1 đến 3 từ cuối cùng với từ khóa thông số đã biết
    for (let len = 1; len <= Math.min(3, words.length - 1); len++) {
      const candidate = words.slice(words.length - len).join(' ').toLowerCase();
      if (ALL_KNOWN_KEYS.includes(candidate)) {
        return {
          val: words.slice(0, words.length - len).join(' '),
          nextKey: words.slice(words.length - len).join(' '),
        };
      }
    }
    // Mặc định: lấy 2 từ cuối nếu câu dài, 1 từ nếu câu ngắn
    const fallbackLen = words.length >= 3 ? 2 : 1;
    return {
      val: words.slice(0, words.length - fallbackLen).join(' '),
      nextKey: words.slice(words.length - fallbackLen).join(' '),
    };
  }

  // Khởi tạo key đầu tiên từ phần trước dấu : đầu tiên
  const words0 = parts[0].trim().split(/\s+/);
  let currentKey = words0[words0.length - 1];
  for (let len = 1; len <= Math.min(3, words0.length); len++) {
    const candidate = words0.slice(words0.length - len).join(' ').toLowerCase();
    if (ALL_KNOWN_KEYS.includes(candidate)) {
      currentKey = words0.slice(words0.length - len).join(' ');
      break;
    }
  }

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    if (i === parts.length - 1) {
      const val = part.trim();
      if (val) {
        items.push({
          key: currentKey,
          value: val,
          isHighlight: /công suất|dung tích|lực hút|lực siết|pin|bảo hành|kích thước|khối lượng/i.test(currentKey),
        });
      }
    } else {
      const { val, nextKey } = extractKeyAndValue(part);
      if (val.trim()) {
        items.push({
          key: currentKey,
          value: val.trim(),
          isHighlight: /công suất|dung tích|lực hút|lực siết|pin|bảo hành|kích thước|khối lượng/i.test(currentKey),
        });
      }
      currentKey = nextKey.trim();
    }
  }
  return items;
}

/**
 * Phân tích văn bản thô cục bộ (Regex & Heuristic) thành SpecGroup[]
 * Hỗ trợ cả định dạng nhiều dòng và định dạng 1 dòng liên tục
 */
export function parseSpecsLocally(rawText: string): SpecGroup[] {
  if (!rawText || !rawText.trim()) return [];

  const lines = rawText
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);

  const groups: SpecGroup[] = [];
  let currentGroup: SpecGroup | null = null;
  const ungroupedItems: SpecItem[] = [];

  // Regex nhận diện tiêu đề nhóm (vd: I. THÔNG SỐ VẬN HÀNH, [Kích thước], PHẦN 1: ..., hoặc viết hoa toàn bộ)
  const isHeaderRegex = /^([I|V|X\d]+[\.\:\-]\s*|\[|\【|\#+).+/i;

  for (let line of lines) {
    // Loại bỏ gạch đầu dòng Markdown hoặc ký tự bullet
    const cleanLine = line.replace(/^[\*\-\•\–\—\+]\s*/, '').trim();
    const colonCount = (cleanLine.match(/:/g) || []).length;

    // Trường hợp 1: Dòng chứa nhiều cặp Key: Value liên tiếp (vd: Model: LK-1068 Chất liệu: Inox...)
    if (colonCount > 1) {
      const inlineItems = parseInlineSpecs(cleanLine);
      for (const it of inlineItems) {
        if (currentGroup) {
          currentGroup.items.push(it);
        } else {
          ungroupedItems.push(it);
        }
      }
      continue;
    }

    // Trường hợp 2: Dòng chứa đúng 1 dấu hai chấm
    if (colonCount === 1) {
      const idx = cleanLine.indexOf(':');
      const key = cleanLine.substring(0, idx).trim();
      const value = cleanLine.substring(idx + 1).trim();

      if (key && value) {
        const isHighlight = /công suất|dung tích|lực hút|lực siết|pin|bảo hành|kích thước|khối lượng/i.test(key);
        const item: SpecItem = { key, value, isHighlight };
        if (currentGroup) {
          currentGroup.items.push(item);
        } else {
          ungroupedItems.push(item);
        }
      }
      continue;
    }

    // Trường hợp 3: Dòng không có dấu hai chấm -> Kiểm tra xem có phải tiêu đề nhóm không
    if (colonCount === 0) {
      const isHeader = isHeaderRegex.test(cleanLine) || cleanLine.toUpperCase() === cleanLine;
      if (isHeader && cleanLine.length < 60) {
        const groupName = cleanLine
          .replace(/^[I|V|X\d]+[\.\:\-]\s*/i, '')
          .replace(/[\[\]\【\】\#\:]/g, '')
          .trim();
        if (groupName) {
          currentGroup = { groupName, items: [] };
          groups.push(currentGroup);
        }
      }
    }
  }

  // Tự động phân loại các item chưa thuộc nhóm nào vào các nhóm chuẩn
  if (ungroupedItems.length > 0) {
    const autoGroupedMap: Record<string, SpecItem[]> = {};

    for (const item of ungroupedItems) {
      const gName = categorizeKeyIntoGroup(item.key);
      if (!autoGroupedMap[gName]) {
        autoGroupedMap[gName] = [];
      }
      autoGroupedMap[gName].push(item);
    }

    for (const [gName, items] of Object.entries(autoGroupedMap)) {
      const existing = groups.find(g => g.groupName.toLowerCase() === gName.toLowerCase());
      if (existing) {
        existing.items.push(...items);
      } else {
        groups.push({ groupName: gName, items });
      }
    }
  }

  return groups.filter(g => g.items.length > 0);
}

/**
 * Phân tích văn bản thô chứa NHIỀU sản phẩm thành danh sách sản phẩm cục bộ
 */
export function parseMultiProductsLocally(rawText: string): Partial<Product>[] {
  if (!rawText || !rawText.trim()) return [];

  const productBlocks: string[] = [];
  const lines = rawText.split(/\r?\n/);
  let currentBlock: string[] = [];

  const isProductStart = (line: string) => {
    const l = line.trim();
    return (
      /^sản phẩm\s*\d+[\:\.]/i.test(l) ||
      /^model\s*[\d\w\-]+[\:\.]/i.test(l) ||
      /^(\#\#|\#\#\#)\s+/i.test(l) ||
      /^\={3,}$/.test(l) ||
      /^\-{3,}$/.test(l)
    );
  };

  for (const line of lines) {
    if (isProductStart(line) && currentBlock.length > 0) {
      productBlocks.push(currentBlock.join('\n'));
      currentBlock = [];
    }
    currentBlock.push(line);
  }
  if (currentBlock.length > 0) {
    productBlocks.push(currentBlock.join('\n'));
  }

  const targetBlocks = productBlocks.length > 1 ? productBlocks : [rawText];
  const results: Partial<Product>[] = [];

  for (let i = 0; i < targetBlocks.length; i++) {
    const block = targetBlocks[i];
    const blockLines = block.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (blockLines.length === 0) continue;

    let name = '';
    let sku = '';
    let categoryGroup = 'Điện gia dụng';
    let categoryType = 'Thiết bị';
    let brand = '';
    let warrantyMonths = 12;
    let costPrice = 1000000;
    let distributorPrice = 1350000;
    let floorPrice = 1650000;
    let retailPrice = 2100000;
    const specLines: string[] = [];

    for (const l of blockLines) {
      const clean = l.replace(/^[\*\-\•\–\—\+]\s*/, '').trim();

      if (/^sản phẩm\s*\d*\s*[\:\.]/i.test(clean)) {
        name = clean.replace(/^sản phẩm\s*\d*\s*[\:\.]\s*/i, '').trim();
        continue;
      }

      const lower = clean.toLowerCase();
      if (lower.startsWith('mã sku:') || lower.startsWith('sku:') || lower.startsWith('mã model:') || lower.startsWith('model:')) {
        sku = clean.split(':')[1]?.trim().toUpperCase() || '';
      } else if (lower.startsWith('tên sản phẩm:') || lower.startsWith('tên:')) {
        name = clean.split(':')[1]?.trim() || '';
      } else if (lower.startsWith('thương hiệu:') || lower.startsWith('hãng:')) {
        brand = clean.split(':')[1]?.trim() || '';
      } else if (lower.startsWith('nhóm sản phẩm:') || lower.startsWith('nhóm:')) {
        categoryGroup = clean.split(':')[1]?.trim() || '';
      } else if (lower.startsWith('loại sản phẩm:') || lower.startsWith('loại:')) {
        categoryType = clean.split(':')[1]?.trim() || '';
      } else if (lower.startsWith('bảo hành:')) {
        const num = clean.match(/\d+/);
        if (num) warrantyMonths = parseInt(num[0], 10);
      } else if (lower.includes('giá nhập')) {
        const num = clean.replace(/[^\d]/g, '');
        if (num) costPrice = parseInt(num, 10);
      } else if (lower.includes('giá npp') || lower.includes('giá đại lý')) {
        const num = clean.replace(/[^\d]/g, '');
        if (num) distributorPrice = parseInt(num, 10);
      } else if (lower.includes('giá sàn')) {
        const num = clean.replace(/[^\d]/g, '');
        if (num) floorPrice = parseInt(num, 10);
      } else if (lower.includes('giá bán lẻ') || lower.includes('giá thương mại') || lower.includes('giá niêm yết') || lower.includes('giá:')) {
        const num = clean.replace(/[^\d]/g, '');
        if (num) retailPrice = parseInt(num, 10);
      } else {
        specLines.push(l);
      }
    }

    if (!name && blockLines[0]) {
      name = blockLines[0].replace(/^[\#\*\-\s\d\.\:]+/, '').trim();
    }
    if (!sku) {
      sku = `MD-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    if (retailPrice > 0 && distributorPrice === 1350000 && costPrice === 1000000) {
      distributorPrice = Math.round(retailPrice * 0.7);
      floorPrice = Math.round(retailPrice * 0.85);
      costPrice = Math.round(retailPrice * 0.55);
    }

    const specifications = parseSpecsLocally(specLines.join('\n'));

    results.push({
      id: `prod-ai-${Date.now()}-${i}`,
      sku,
      name: name || `Sản phẩm ${i + 1}`,
      categoryGroup,
      categoryType,
      brand,
      warrantyMonths,
      pricing: {
        costPrice,
        distributorPrice,
        floorPrice,
        retailPrice,
        currency: 'VND',
      },
      specifications,
      tags: ['Nhập từ AI', categoryType].filter(Boolean),
      notes: 'Bóc tách tự động từ văn bản đặc tính kỹ thuật',
      status: 'active',
      thumbnail: 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?auto=format&fit=crop&w=600&q=80',
      updatedAt: new Date().toISOString().split('T')[0],
    });
  }

  return results;
}

// ==========================================
// GEMINI AI INTEGRATION (ROBUST MULTI-MODEL)
// ==========================================

// Danh sách các model chính thức của Google Gemini API
const GEMINI_MODELS = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];

/**
 * Làm sạch và chuẩn hóa mã Gemini API Key (bỏ ngoặc kép, nháy đơn, tiền tố gán biến)
 */
export function cleanApiKey(raw: string): string {
  if (!raw) return '';
  let cleaned = raw.trim();

  // Tự động nhận diện chuỗi Google AI Studio key (bắt đầu bằng AIzaSy và có 39 ký tự)
  const keyMatch = cleaned.match(/AIzaSy[A-Za-z0-9_-]{33}/);
  if (keyMatch) {
    return keyMatch[0];
  }

  // Bỏ dấu ngoặc kép hoặc nháy đơn bao quanh
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  // Bỏ tiền tố gán biến nếu người dùng copy từ code / .env
  cleaned = cleaned.replace(/^(VITE_)?(GEMINI_)?API_KEY\s*[:=]\s*/i, '');
  cleaned = cleaned.replace(/^key\s*[:=]\s*/i, '');
  cleaned = cleaned.replace(/^Bearer\s+/i, '');

  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  return cleaned.trim();
}

/**
 * Kiểm tra kết nối và tính hợp lệ của API Key với chẩn đoán lỗi chi tiết
 */
export async function testGeminiApiKey(key: string): Promise<{ success: boolean; message: string; cleanedKey?: string }> {
  const raw = (key || '').trim();
  if (!raw) {
    return { success: false, message: 'Vui lòng nhập mã Gemini API Key' };
  }

  // 1. Nhận diện trường hợp người dùng nhầm lẫn với Google Service Account của Google Sheets
  if (raw.includes('gserviceaccount.com') || (raw.includes('{') && raw.includes('private_key'))) {
    return {
      success: false,
      message: '⚠️ Đây là thông tin Service Account của Google Sheets! Khóa Google Sheets đã được hệ thống cấu hình tự động kết nối với file SO_SANH_GIA rồi (không cần điền vào đây). Ô này chỉ dành cho Gemini AI API Key (khóa từ Google AI Studio, bắt đầu bằng AIzaSy...) để dùng tính năng AI bóc tách thông số kỹ thuật.',
    };
  }

  const cleanKey = cleanApiKey(raw);

  if (!cleanKey) {
    return { success: false, message: 'Mã API Key không hợp lệ hoặc để trống' };
  }

  if (cleanKey.length < 20) {
    return {
      success: false,
      message: 'Mã API Key không đúng định dạng. Khóa Google Gemini AI thường bắt đầu bằng "AIzaSy..." gồm 39 ký tự.',
    };
  }

  // 2. Thử gọi trực tiếp Google Generative Language API (GET /models)
  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(cleanKey)}`;
    const res = await fetch(endpoint, { method: 'GET' });

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      const modelsCount = Array.isArray(data?.models) ? data.models.length : 0;
      return {
        success: true,
        cleanedKey: cleanKey,
        message: `Kết nối thành công tới Google Gemini AI (${modelsCount > 0 ? `${modelsCount} mô hình khả dụng` : 'Khóa hợp lệ'})!`,
      };
    } else {
      const errData = await res.json().catch(() => ({}));
      const googleMsg = errData?.error?.message || `HTTP ${res.status}`;
      const status = errData?.error?.status || '';

      if (googleMsg.toLowerCase().includes('api key not valid') || status === 'INVALID_ARGUMENT') {
        return {
          success: false,
          cleanedKey: cleanKey,
          message: 'Mã API Key không chính xác. Hãy kiểm tra lại khóa đã copy từ Google AI Studio (bắt đầu bằng AIzaSy...).',
        };
      }
      if (googleMsg.toLowerCase().includes('has not been used in project') || googleMsg.toLowerCase().includes('disabled')) {
        return {
          success: false,
          cleanedKey: cleanKey,
          message: 'API Key hợp lệ nhưng dịch vụ Generative Language API chưa được bật trên Google Cloud Console cho project này.',
        };
      }
      if (googleMsg.toLowerCase().includes('quota') || status === 'RESOURCE_EXHAUSTED') {
        return {
          success: false,
          cleanedKey: cleanKey,
          message: 'API Key hợp lệ nhưng đã tạm thời hết hạn mức (Quota) miễn phí hôm nay.',
        };
      }
      if (googleMsg.toLowerCase().includes('referer') || status === 'PERMISSION_DENIED') {
        return {
          success: false,
          cleanedKey: cleanKey,
          message: `API Key bị giới hạn domain/IP: ${googleMsg}`,
        };
      }

      return {
        success: false,
        cleanedKey: cleanKey,
        message: `Google phản hồi: ${googleMsg}`,
      };
    }
  } catch (directErr: any) {
    console.warn('Gọi trực tiếp Google API từ trình duyệt thất bại, chuyển qua backend proxy:', directErr?.message);
  }

  // 3. Fallback: Nếu trình duyệt bị chặn CORS / Adblock, gọi qua backend Serverless proxy
  try {
    const proxyRes = await fetch('/api/sheets/test-gemini-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: cleanKey }),
    });
    if (proxyRes.ok) {
      const proxyData = await proxyRes.json();
      return {
        success: !!proxyData.success,
        cleanedKey: proxyData.cleanedKey || cleanKey,
        message: proxyData.message || (proxyData.success ? 'Kết nối thành công!' : 'API Key không hợp lệ'),
      };
    }
  } catch (proxyErr: any) {
    console.warn('Gọi qua backend proxy thất bại:', proxyErr?.message);
  }

  return {
    success: false,
    cleanedKey: cleanKey,
    message: 'Không thể kết nối đến Google Gemini API (có thể do mạng hoặc phần mềm chặn quảng cáo AdBlock/Brave chặn domain googleapis.com). Vui lòng thử lại.',
  };
}

/**
 * Gọi Google Gemini API với cơ chế tự động chuyển đổi sang model dự phòng nếu model chính bận/lỗi
 */
async function callGeminiGenerateContent(apiKey: string, prompt: string): Promise<string> {
  let lastError: any = null;

  for (const model of GEMINI_MODELS) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (responseText) {
          return responseText;
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        const errMsg = errData?.error?.message || `HTTP ${res.status}`;
        console.warn(`Gemini API (${model}) trả về lỗi:`, errMsg);
        lastError = new Error(`Gemini (${model}): ${errMsg}`);
      }
    } catch (e: any) {
      console.warn(`Lỗi gọi Gemini API (${model}):`, e?.message);
      lastError = e;
    }
  }

  throw lastError || new Error('Không thể kết nối đến Google Gemini API');
}

/**
 * Bóc tách thông số kỹ thuật sản phẩm đơn lẻ bằng Gemini AI
 */
export async function parseSpecsWithAI(
  rawText: string,
  customApiKey?: string
): Promise<{ groups: SpecGroup[]; usedGemini: boolean; error?: string }> {
  const apiKey = (customApiKey || getSavedGeminiKey()).trim();

  if (!apiKey) {
    return {
      groups: parseSpecsLocally(rawText),
      usedGemini: false,
    };
  }

  const prompt = `Bạn là chuyên gia phân tích dữ liệu kỹ thuật sản phẩm và so sánh thông số B2B.
Nhiệm vụ: Hãy phân tích đoạn văn bản kỹ thuật sau đây và trích xuất thành danh sách các nhóm thông số kỹ thuật (SpecGroup).
Mỗi nhóm gồm 'groupName' (ví dụ: 'Thông số vận hành', 'Kích thước & Thiết kế', 'Công nghệ & Tiện ích', 'Nguồn điện & Tiêu thụ', 'Tiêu chuẩn & Bảo hành'...) và danh sách 'items' (mỗi item có 'key', 'value', và 'isHighlight': boolean nếu là thông số nổi bật quan trọng như công suất, dung tích, pin, lực hút...).

Văn bản kỹ thuật đầu vào:
"""
${rawText}
"""

YÊU CẦU ĐẦU RA:
Trả về DUY NHẤT một mảng JSON theo cấu trúc:
[
  {
    "groupName": "Tên nhóm",
    "items": [
      { "key": "Tên thông số", "value": "Giá trị kèm đơn vị nếu có", "isHighlight": false }
    ]
  }
]`;

  try {
    const responseText = await callGeminiGenerateContent(apiKey, prompt);
    const cleanJson = responseText.replace(/```json\s*|\s*```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return {
        groups: parsed,
        usedGemini: true,
      };
    }
    throw new Error('Dữ liệu trả về không đúng định dạng mảng SpecGroup[]');
  } catch (err: any) {
    console.warn('Gọi Gemini API thất bại, chuyển sang bộ phân tích Heuristic thông minh cục bộ:', err);
    return {
      groups: parseSpecsLocally(rawText),
      usedGemini: false,
      error: err?.message,
    };
  }
}

/**
 * Bóc tách nhiều sản phẩm cùng lúc bằng Gemini AI
 */
export async function parseMultiProductsWithAI(
  rawText: string,
  customApiKey?: string
): Promise<{ products: Partial<Product>[]; usedGemini: boolean }> {
  const apiKey = (customApiKey || getSavedGeminiKey()).trim();

  if (!apiKey) {
    return {
      products: parseMultiProductsLocally(rawText),
      usedGemini: false,
    };
  }

  const prompt = `Bạn là chuyên gia phân tích danh mục hàng hóa và lập bảng so sánh thông số B2B.
Nhiệm vụ: Phân tích đoạn văn bản sau chứa thông tin của một hoặc nhiều sản phẩm kỹ thuật.
Hãy bóc tách thành danh sách các sản phẩm riêng biệt với thông số kỹ thuật được gom theo nhóm chuẩn hóa.

Văn bản đầu vào:
"""
${rawText}
"""

YÊU CẦU:
Trả về DUY NHẤT một mảng JSON theo mẫu:
[
  {
    "sku": "Mã model / SKU (in hoa)",
    "name": "Tên đầy đủ của sản phẩm",
    "categoryGroup": "Nhóm sản phẩm",
    "categoryType": "Loại sản phẩm cụ thể",
    "brand": "Thương hiệu",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 1000000,
      "distributorPrice": 1350000,
      "floorPrice": 1650000,
      "retailPrice": 2100000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Tên nhóm thông số",
        "items": [
          { "key": "Tên thông số", "value": "Giá trị", "isHighlight": false }
        ]
      }
    ],
    "tags": ["Bán chạy", "Công nghệ mới"],
    "notes": "Ghi chú nếu có"
  }
]
Lưu ý: Nếu giá nào thiếu, hãy ước lượng tỷ lệ hợp lý dựa trên giá bán lẻ hoặc giá đã cho (costPrice ~ 50-60% retailPrice, distributorPrice ~ 70% retailPrice, floorPrice ~ 85% retailPrice).`;

  try {
    const responseText = await callGeminiGenerateContent(apiKey, prompt);
    const cleanJson = responseText.replace(/```json\s*|\s*```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const finalProducts: Partial<Product>[] = parsed.map((p, idx) => ({
        id: `prod-ai-${Date.now()}-${idx}`,
        sku: p.sku || `MD-${Math.floor(1000 + Math.random() * 9000)}`,
        name: p.name || `Sản phẩm ${idx + 1}`,
        categoryGroup: p.categoryGroup || 'Thiết bị thông minh',
        categoryType: p.categoryType || 'Sản phẩm',
        brand: p.brand || '',
        thumbnail: 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?auto=format&fit=crop&w=600&q=80',
        warrantyMonths: p.warrantyMonths || 12,
        pricing: {
          costPrice: p.pricing?.costPrice || 1000000,
          distributorPrice: p.pricing?.distributorPrice || 1350000,
          floorPrice: p.pricing?.floorPrice || 1650000,
          retailPrice: p.pricing?.retailPrice || 2100000,
          currency: 'VND',
        },
        specifications: p.specifications || [],
        tags: p.tags || ['Nhập từ AI'],
        notes: p.notes || 'Bóc tách tự động từ Gemini AI',
        status: 'active',
        updatedAt: new Date().toISOString().split('T')[0],
      }));

      return {
        products: finalProducts,
        usedGemini: true,
      };
    }
    throw new Error('Dữ liệu không đúng định dạng');
  } catch (err) {
    console.warn('Lỗi gọi Gemini AI đa sản phẩm, chuyển sang cục bộ:', err);
    return {
      products: parseMultiProductsLocally(rawText),
      usedGemini: false,
    };
  }
}
