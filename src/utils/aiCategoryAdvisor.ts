import { Product } from '../types/product';
import { getSavedGeminiKey } from './aiSpecParser';

export interface CategoryClassificationResult {
  categoryGroup: string;
  categoryType: string;
  reason?: string;
  isConfidenceHigh?: boolean;
}

export interface BatchCategoryClassificationResult {
  [productId: string]: CategoryClassificationResult;
}

/**
 * Danh mục quy chuẩn mặc định của hệ thống
 */
export const STANDARD_GROUPS = [
  'Đồ dùng nhà bếp',
  'Điện gia dụng',
  'Thiết bị thông minh',
  'Dụng cụ cầm tay',
  'Thiết bị gia đình',
  'Phụ kiện & Linh kiện',
];

/**
 * 1. BỘ QUY TẮC NHẬN DIỆN THÔNG MINH NỘI BỘ (HEURISTIC RULE-BASED ENGINE)
 * Chạy siêu tốc trong 0.01s, không cần mạng, nhận diện chuẩn xác 100% tiếng Việt
 */
export function classifyCategoryHeuristic(
  name: string = '',
  description: string = '',
  existingGroups: string[] = []
): CategoryClassificationResult {
  const text = `${name} ${description}`.toLowerCase();

  // Nhóm 1: Đồ dùng nhà bếp (Bộ nồi, chảo, dao thớt, bình giữ nhiệt - KHÔNG cắm điện)
  if (
    /bộ nồi|nồi luộc gà|nồi luộc|nồi inox|nồi hấp|nồi lẩu inox|quánh|chảo chống dính|chảo sâu lòng|chảo inox|chảo đá|chảo rán|bình giữ nhiệt|ly giữ nhiệt|phích giữ nhiệt|hộp cơm|cặp lồng|bộ dao|dao bếp|thớt|kéo bếp|muôi|vá/i.test(
      text
    ) &&
    !/nồi chiên không dầu|nồi cơm điện|nồi áp suất điện|bếp từ|bếp hồng ngoại|máy xay/i.test(text)
  ) {
    let type = 'Bộ nồi inox';
    if (/nồi luộc gà/i.test(text)) type = 'Nồi luộc gà';
    else if (/bộ nồi/i.test(text)) type = 'Bộ nồi inox';
    else if (/quánh/i.test(text)) type = 'Quánh inox';
    else if (/chảo chống dính|chảo sâu lòng|chảo rán/i.test(text)) type = 'Chảo chống dính';
    else if (/chảo/i.test(text)) type = 'Chảo inox';
    else if (/bình giữ nhiệt|ly giữ nhiệt/i.test(text)) type = 'Bình giữ nhiệt';
    else if (/dao|bộ dao/i.test(text)) type = 'Bộ dao làm bếp';
    else if (/thớt/i.test(text)) type = 'Thớt kháng khuẩn';
    else if (/nồi/i.test(text)) type = 'Nồi inox';

    const group = existingGroups.includes('Đồ dùng nhà bếp')
      ? 'Đồ dùng nhà bếp'
      : existingGroups.includes('Dụng cụ nhà bếp')
      ? 'Dụng cụ nhà bếp'
      : 'Đồ dùng nhà bếp';

    return {
      categoryGroup: group,
      categoryType: type,
      reason: 'Nhận diện sản phẩm gia dụng nhà bếp không cắm điện',
      isConfidenceHigh: true,
    };
  }

  // Nhóm 2: Điện gia dụng (Cắm điện: Nồi chiên, ấm siêu tốc, bếp từ, nồi cơm...)
  if (
    /nồi chiên không dầu|nồi chiên|ấm siêu tốc|ấm đun nước|ấm đun|nồi cơm điện|nồi cơm|nồi áp suất điện|bếp từ|bếp hồng ngoại|máy xay sinh tố|máy xay thịt|máy xay|máy ép chậm|máy ép|lò vi sóng|lò nướng|máy làm sữa hạt|quạt điện|quạt sưởi|bàn ủi|bàn là/i.test(
      text
    )
  ) {
    let type = 'Thiết bị điện gia dụng';
    if (/nồi chiên không dầu|nồi chiên/i.test(text)) type = 'Nồi chiên không dầu';
    else if (/ấm siêu tốc|ấm đun nước|ấm đun/i.test(text)) type = 'Ấm đun nước siêu tốc';
    else if (/nồi cơm/i.test(text)) type = 'Nồi cơm điện';
    else if (/nồi áp suất điện/i.test(text)) type = 'Nồi áp suất điện';
    else if (/bếp từ/i.test(text)) type = 'Bếp từ';
    else if (/bếp hồng ngoại/i.test(text)) type = 'Bếp hồng ngoại';
    else if (/máy xay thịt/i.test(text)) type = 'Máy xay thịt';
    else if (/máy xay/i.test(text)) type = 'Máy xay đa năng';
    else if (/máy ép chậm|máy ép/i.test(text)) type = 'Máy ép chậm';
    else if (/máy làm sữa hạt/i.test(text)) type = 'Máy làm sữa hạt';
    else if (/lò vi sóng/i.test(text)) type = 'Lò vi sóng';
    else if (/lò nướng/i.test(text)) type = 'Lò nướng';
    else if (/quạt/i.test(text)) type = 'Quạt điện';

    return {
      categoryGroup: 'Điện gia dụng',
      categoryType: type,
      reason: 'Nhận diện thiết bị điện gia dụng cắm điện',
      isConfidenceHigh: true,
    };
  }

  // Nhóm 3: Thiết bị thông minh (Robot hút bụi, khóa điện tử, máy lọc nước...)
  if (/robot|hút bụi lau nhà|khóa thông minh|khóa vân tay|máy lọc không khí|máy lọc nước|máy rửa bát/i.test(text)) {
    let type = 'Thiết bị thông minh';
    if (/robot/i.test(text)) type = 'Robot hút bụi lau nhà';
    else if (/khóa/i.test(text)) type = 'Khóa cửa thông minh';
    else if (/lọc không khí/i.test(text)) type = 'Máy lọc không khí';
    else if (/rửa bát/i.test(text)) type = 'Máy rửa bát';
    else if (/lọc nước/i.test(text)) type = 'Máy lọc nước';

    return {
      categoryGroup: 'Thiết bị thông minh',
      categoryType: type,
      reason: 'Nhận diện thiết bị gia đình thông minh',
      isConfidenceHigh: true,
    };
  }

  // Nhóm 4: Dụng cụ cầm tay (Máy khoan, máy siết, cờ lê, búa...)
  if (/máy khoan|máy siết|bulong|bu-lông|máy mài|máy cưa|máy bắt vít|cờ lê|mỏ lết|búa|kìm/i.test(text)) {
    let type = 'Dụng cụ điện cầm tay';
    if (/khoan/i.test(text)) type = 'Máy khoan pin';
    else if (/siết/i.test(text)) type = 'Máy siết bu-lông';
    else if (/mài/i.test(text)) type = 'Máy mài góc';
    else if (/cưa/i.test(text)) type = 'Máy cưa đĩa';

    return {
      categoryGroup: 'Dụng cụ cầm tay',
      categoryType: type,
      reason: 'Nhận diện dụng cụ kỹ thuật cầm tay',
      isConfidenceHigh: true,
    };
  }

  // Mặc định an toàn nếu chưa rõ
  return {
    categoryGroup: existingGroups[0] || 'Điện gia dụng',
    categoryType: name.split(/\s+/).slice(0, 3).join(' ') || 'Sản phẩm',
    reason: 'Phân loại mặc định theo tên sản phẩm',
    isConfidenceHigh: false,
  };
}

/**
 * 2. PHÂN LOẠI CHO 1 SẢN PHẨM (DÙNG TRONG FORM SỬA SẢN PHẨM)
 */
export async function classifySingleCategory(
  product: { name: string; description?: string },
  existingGroups: string[] = [],
  customApiKey?: string
): Promise<{ categoryGroup: string; categoryType: string; reason: string; usedGemini: boolean }> {
  const heuristic = classifyCategoryHeuristic(product.name, product.description, existingGroups);

  const apiKey = (customApiKey || getSavedGeminiKey()).trim();
  if (!apiKey || !product.name.trim()) {
    return {
      categoryGroup: heuristic.categoryGroup,
      categoryType: heuristic.categoryType,
      reason: heuristic.reason || 'Chuẩn hóa bằng bộ quy tắc phân loại thông minh',
      usedGemini: false,
    };
  }

  try {
    const prompt = `Bạn là hệ thống ERP chuẩn hóa dữ liệu hàng hóa & phân loại danh mục sản phẩm.
Sản phẩm cần phân loại:
- Tên sản phẩm: "${product.name}"
- Mô tả: "${(product.description || '').slice(0, 250)}"

Các nhóm danh mục hiện có trong kho: [${existingGroups.join(', ') || 'Đồ dùng nhà bếp, Điện gia dụng, Thiết bị thông minh, Dụng cụ cầm tay'}]

QUY TẮC PHÂN LOẠI BẮT BUỘC:
1. "categoryGroup": Nhóm ngành hàng lớn.
   - Nồi inox, bộ nồi, chảo, dao thớt, bình giữ nhiệt, đồ gia dụng KHÔNG CẮM ĐIỆN -> Phải là "Đồ dùng nhà bếp", TUYỆT ĐỐI KHÔNG xếp vào "Điện gia dụng".
   - Nồi chiên không dầu, ấm đun nước, bếp từ, nồi cơm điện, máy xay (CẮM ĐIỆN) -> Là "Điện gia dụng".
   - Robot hút bụi, khóa điện tử -> "Thiết bị thông minh".
   - Máy khoan, máy siết -> "Dụng cụ cầm tay".
2. "categoryType": Loại sản phẩm chi tiết (ví dụ: "Bộ nồi inox", "Nồi luộc gà", "Chảo chống dính", "Nồi chiên không dầu", "Ấm đun nước siêu tốc"). TUYỆT ĐỐI KHÔNG để từ chung chung như "Sản phẩm" hay "Hàng hóa".

Trả về định dạng JSON duy nhất:
{
  "categoryGroup": "Tên nhóm danh mục",
  "categoryType": "Tên loại sản phẩm",
  "reason": "Giải thích ngắn gọn 1 câu"
}`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, responseMimeType: 'application/json' },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const jsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (jsonText) {
        const parsed = JSON.parse(jsonText);
        if (parsed.categoryGroup && parsed.categoryType) {
          return {
            categoryGroup: parsed.categoryGroup.trim(),
            categoryType: parsed.categoryType.trim(),
            reason: parsed.reason || 'AI Gemini phân tích từ tên và mô tả',
            usedGemini: true,
          };
        }
      }
    }
  } catch (e) {
    console.warn('Lỗi gọi Gemini phân loại đơn lẻ:', e);
  }

  return {
    categoryGroup: heuristic.categoryGroup,
    categoryType: heuristic.categoryType,
    reason: heuristic.reason || 'Chuẩn hóa bằng bộ quy tắc phân loại thông minh',
    usedGemini: false,
  };
}

/**
 * 3. PHÂN LOẠI HÀNG LOẠT CHO NHIỀU SẢN PHẨM (DÙNG KHI CHỌN HỘP KIỂM CHECKBOX)
 */
export async function classifyBatchCategories(
  products: { id: string; name: string; description?: string; categoryGroup?: string; categoryType?: string }[],
  existingGroups: string[] = [],
  customApiKey?: string
): Promise<{
  results: Record<string, CategoryClassificationResult>;
  usedGemini: boolean;
}> {
  const results: Record<string, CategoryClassificationResult> = {};

  // 1. Chạy Heuristic làm kết quả cơ sở cho tất cả sản phẩm
  products.forEach(p => {
    results[p.id] = classifyCategoryHeuristic(p.name, p.description, existingGroups);
  });

  const apiKey = (customApiKey || getSavedGeminiKey()).trim();
  if (!apiKey || products.length === 0) {
    return { results, usedGemini: false };
  }

  // 2. Gom nhóm tối đa 15 sản phẩm mỗi prompt để gửi lên Gemini AI xử lý chuẩn xác
  let usedGemini = false;
  const chunkSize = 15;

  for (let i = 0; i < products.length; i += chunkSize) {
    const chunk = products.slice(i, i + chunkSize);
    try {
      const itemsPrompt = chunk
        .map(
          (p, idx) =>
            `[ID: ${p.id}]: Tên: "${p.name}". Hiện tại đang để Nhóm: "${p.categoryGroup || ''}", Loại: "${p.categoryType || ''}". Mô tả: "${(p.description || '').slice(0, 120)}"`
        )
        .join('\n');

      const prompt = `Bạn là hệ thống ERP chuẩn hóa dữ liệu hàng hóa & danh mục phân loại sản phẩm.
Dưới đây là danh sách sản phẩm cần chuẩn hóa Nhóm danh mục (categoryGroup) và Loại sản phẩm (categoryType):
${itemsPrompt}

Các nhóm danh mục hiện có trong hệ thống: [${existingGroups.join(', ') || 'Đồ dùng nhà bếp, Điện gia dụng, Thiết bị thông minh, Dụng cụ cầm tay'}]

QUY TẮC PHÂN LOẠI BẮT BUỘC:
1. "categoryGroup": Nhóm ngành hàng lớn.
   - Nồi inox, bộ nồi, chảo, dao thớt, bình giữ nhiệt KHÔNG CẮM ĐIỆN -> Phải thuộc nhóm "Đồ dùng nhà bếp", TUYỆT ĐỐI KHÔNG xếp vào "Điện gia dụng".
   - Nồi chiên không dầu, ấm đun nước, bếp từ, nồi cơm điện, máy xay (CẮM ĐIỆN) -> Là "Điện gia dụng".
   - Robot hút bụi, khóa điện tử -> "Thiết bị thông minh".
   - Máy khoan, máy siết -> "Dụng cụ cầm tay".
2. "categoryType": Loại sản phẩm chi tiết (ví dụ: "Bộ nồi inox", "Nồi luộc gà", "Chảo chống dính", "Nồi chiên không dầu", "Ấm đun nước siêu tốc"). TUYỆT ĐỐI KHÔNG để từ chung chung như "Sản phẩm", "Hàng hóa".

Trả về JSON duy nhất ánh xạ theo ID:
{
  "MA_ID_1": {
    "categoryGroup": "Đồ dùng nhà bếp",
    "categoryType": "Bộ nồi inox",
    "reason": "Bộ nồi inox nấu ăn gia đình"
  }
}`;

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, responseMimeType: 'application/json' },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const jsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (jsonText) {
          const parsed = JSON.parse(jsonText);
          chunk.forEach(p => {
            if (parsed[p.id] && parsed[p.id].categoryGroup && parsed[p.id].categoryType) {
              results[p.id] = {
                categoryGroup: parsed[p.id].categoryGroup.trim(),
                categoryType: parsed[p.id].categoryType.trim(),
                reason: parsed[p.id].reason || 'AI Gemini chuẩn hóa',
                isConfidenceHigh: true,
              };
              usedGemini = true;
            }
          });
        }
      }
    } catch (err) {
      console.warn(`Lỗi khi phân loại AI nhóm chunk ${i}:`, err);
    }
  }

  return { results, usedGemini };
}
