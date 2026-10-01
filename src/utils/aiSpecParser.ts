import { SpecGroup, SpecItem, Product } from '../types/product';

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
    if (key.trim()) {
      localStorage.setItem(GEMINI_API_KEY_STORAGE, key.trim());
    } else {
      localStorage.removeItem(GEMINI_API_KEY_STORAGE);
    }
  } catch (e) {
    console.error('Không thể lưu Gemini API key:', e);
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
    'công suất', 'điện áp', 'tần số', 'dung tích', 'tốc độ', 'vòng/phút', 'lực hút',
    'áp suất', 'nhiệt độ', 'độ ồn', 'pin', 'thời gian sạc', 'thời gian sử dụng',
    'tiêu thụ điện', 'dung lượng', 'motor', 'động cơ', 'lưu lượng'
  ],
  'Kích thước & Thiết kế': [
    'kích thước', 'trọng lượng', 'khối lượng', 'chất liệu', 'màu sắc', 'chiều dài',
    'chiều rộng', 'chiều cao', 'đường kính', 'vỏ', 'lòng nồi', 'thiết kế', 'kiểu dáng'
  ],
  'Công nghệ & Tính năng': [
    'công nghệ', 'điều khiển', 'màn hình', 'chế độ', 'chương trình', 'kết nối',
    'wifi', 'bluetooth', 'app', 'cảm biến', 'tính năng', 'tiện ích', 'hẹn giờ',
    'bộ lọc', 'tự động', 'chức năng'
  ],
  'Tiêu chuẩn & Bảo hành': [
    'bảo hành', 'xuất xứ', 'thương hiệu', 'phụ kiện', 'chứng nhận', 'tiêu chuẩn',
    'chống nước', 'an toàn'
  ],
};

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
 * Phân tích văn bản thô cục bộ (Regex & Heuristic) thành SpecGroup[]
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

    // Kiểm tra dòng có phải phân tách key : value không
    const colonIndex = cleanLine.indexOf(':');
    const dashIndex = cleanLine.indexOf(' - ');
    const tabIndex = cleanLine.indexOf('\t');

    let delimiterIndex = -1;
    let delimiterLength = 1;

    if (colonIndex !== -1) {
      delimiterIndex = colonIndex;
      delimiterLength = 1;
    } else if (dashIndex !== -1) {
      delimiterIndex = dashIndex;
      delimiterLength = 3;
    } else if (tabIndex !== -1) {
      delimiterIndex = tabIndex;
      delimiterLength = 1;
    }

    // Nếu không có dấu phân tách, có thể đây là Tên Nhóm (Group Header)
    if (delimiterIndex === -1) {
      const isHeader = isHeaderRegex.test(cleanLine) || cleanLine.toUpperCase() === cleanLine || cleanLine.endsWith(':');
      if (isHeader && cleanLine.length < 60) {
        const groupName = cleanLine
          .replace(/^[I|V|X\d]+[\.\:\-]\s*/i, '')
          .replace(/[\[\]\【\】\#\:]/g, '')
          .trim();
        if (groupName) {
          currentGroup = { groupName, items: [] };
          groups.push(currentGroup);
          continue;
        }
      }
      continue;
    }

    const key = cleanLine.substring(0, delimiterIndex).trim();
    const value = cleanLine.substring(delimiterIndex + delimiterLength).trim();

    if (!key || !value) continue;

    const isHighlight = /công suất|dung tích|lực hút|pin|bảo hành/i.test(key);
    const item: SpecItem = { key, value, isHighlight };

    if (currentGroup) {
      currentGroup.items.push(item);
    } else {
      ungroupedItems.push(item);
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

  // Tách đoạn text thành các block sản phẩm
  // Nhận diện theo "Sản phẩm X:", "Model:", "---", "###", v.v.
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

  // Nếu không nhận diện được nhiều block, coi cả đoạn là 1 sản phẩm
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

      // Check product name / title
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

    // Auto align prices if not completely specified
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
// GEMINI AI INTEGRATION (HYBRID CALL)
// ==========================================

export async function parseSpecsWithAI(rawText: string, customApiKey?: string): Promise<{ groups: SpecGroup[]; usedGemini: boolean }> {
  const apiKey = (customApiKey || getSavedGeminiKey()).trim();

  if (!apiKey) {
    return {
      groups: parseSpecsLocally(rawText),
      usedGemini: false,
    };
  }

  const prompt = `Bạn là chuyên gia phân tích dữ liệu kỹ thuật sản phẩm và so sánh thông số B2B.
Nhiệm vụ: Hãy phân tích đoạn văn bản kỹ thuật sau đây và trích xuất thành danh sách các nhóm thông số kỹ thuật (SpecGroup).
Mỗi nhóm gồm 'groupName' (ví dụ: 'Thông số vận hành', 'Kích thước & Thiết kế', 'Công nghệ & Tiện ích', 'Nguồn điện & Tiêu thụ', 'Tiện ích & Bảo hành'...) và danh sách 'items' (mỗi item có 'key', 'value', và 'isHighlight': boolean nếu là thông số nổi bật quan trọng).

Văn bản kỹ thuật đầu vào:
"""
${rawText}
"""

YÊU CẦU ĐẦU RA:
Trả về DUY NHẤT một mảng JSON (không bọc trong markdown code block, hoặc trả về JSON hợp lệ) theo cấu trúc:
[
  {
    "groupName": "Tên nhóm",
    "items": [
      { "key": "Tên thông số", "value": "Giá trị kèm đơn vị nếu có", "isHighlight": false }
    ]
  }
]`;

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!res.ok) {
      console.warn('Gemini API trả về lỗi HTTP:', res.status, 'Chuyển sang bộ phân tích cục bộ.');
      return {
        groups: parseSpecsLocally(rawText),
        usedGemini: false,
      };
    }

    const data = await res.json();
    const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) {
      throw new Error('Gemini không trả về nội dung');
    }

    const cleanJson = responseText.replace(/```json\s*|\s*```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return {
        groups: parsed,
        usedGemini: true,
      };
    }
    throw new Error('Dữ liệu trả về không đúng định dạng mảng');
  } catch (err) {
    console.warn('Gọi Gemini API thất bại, sử dụng bộ phân tích thông minh cục bộ:', err);
    return {
      groups: parseSpecsLocally(rawText),
      usedGemini: false,
    };
  }
}

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
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!res.ok) {
      console.warn('Gemini API trả về lỗi HTTP:', res.status, 'Chuyển sang bộ phân tích cục bộ.');
      return {
        products: parseMultiProductsLocally(rawText),
        usedGemini: false,
      };
    }

    const data = await res.json();
    const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    const cleanJson = responseText?.replace(/```json\s*|\s*```/g, '').trim();
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
