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
 * 1. BỘ QUY TẮC NHẬN DIỆN THÔNG MINH NỘI BỘ (HEURISTIC ENGINE)
 * ƯU TIÊN TUYỆT ĐỐI TÊN SẢN PHẨM (Product Name Priority)
 * Tránh bẫy từ khóa: Nồi chảo có ghi "dùng cho bếp từ" không bao giờ bị xếp nhầm thành Bếp từ!
 */
export function classifyCategoryHeuristic(
  name: string = '',
  description: string = '',
  existingGroups: string[] = []
): CategoryClassificationResult {
  const nameClean = (name || '').trim().toLowerCase();

  // Nhóm danh mục chuẩn hóa cho Đồ dùng nhà bếp
  const kitchenGroup = existingGroups.includes('Đồ dùng nhà bếp')
    ? 'Đồ dùng nhà bếp'
    : existingGroups.includes('Dụng cụ nhà bếp')
    ? 'Dụng cụ nhà bếp'
    : 'Đồ dùng nhà bếp';

  // =========================================================================
  // BƯỚC 1: XÉT TRỰC TIẾP TÊN SẢN PHẨM (QUYẾT ĐỊNH 99% BẢN CHẤT SẢN PHẨM)
  // =========================================================================

  // 1.1: Tên là BỘ NỒI, NỒI INOX, CHẢO, DAO THỚT, BÌNH GIỮ NHIỆT (ĐỒ GIA DỤNG KHÔNG DÙNG ĐIỆN)
  // Chú ý: Bất kể mô tả có nhắc tới "bếp từ", tên là Bộ nồi thì 100% là Đồ dùng nhà bếp!
  const isKitchenName =
    /bộ nồi|nồi luộc gà|nồi luộc|nồi lẩu inox|nồi lẩu|nồi inox|nồi hấp|nồi quánh|quánh|chảo chống dính|chảo sâu lòng|chảo inox|chảo đá|chảo rán|chảo xào|chảo|bình giữ nhiệt|ly giữ nhiệt|phích giữ nhiệt|hộp cơm|cặp lồng|bộ dao|dao bếp|dao chặt|dao gọt|thớt|kéo bếp|muôi|vá|đũa|thìa|muỗng/i.test(
      nameClean
    );

  const isElectricApplianceName =
    /nồi chiên không dầu|nồi chiên|nồi cơm điện|nồi cơm|nồi áp suất điện|nồi lẩu điện|ấm siêu tốc|ấm đun/i.test(
      nameClean
    );

  if (isKitchenName && !isElectricApplianceName) {
    let type = 'Bộ nồi inox';
    if (/bộ nồi/i.test(nameClean)) {
      if (/bộ nồi 3/i.test(nameClean)) type = 'Bộ nồi inox 3 món';
      else if (/bộ nồi 4/i.test(nameClean)) type = 'Bộ nồi inox 4 món';
      else if (/bộ nồi 5/i.test(nameClean)) type = 'Bộ nồi inox 5 món';
      else if (/bộ nồi 6/i.test(nameClean)) type = 'Bộ nồi inox 6 món';
      else type = 'Bộ nồi inox';
    } else if (/nồi luộc gà|nồi luộc/i.test(nameClean)) {
      type = 'Nồi luộc gà';
    } else if (/quánh/i.test(nameClean)) {
      type = 'Quánh inox';
    } else if (/chảo chống dính|chảo sâu lòng|chảo rán|chảo xào|chảo đá/i.test(nameClean)) {
      type = 'Chảo chống dính';
    } else if (/chảo inox/i.test(nameClean)) {
      type = 'Chảo inox';
    } else if (/chảo/i.test(nameClean)) {
      type = 'Chảo chống dính';
    } else if (/bình giữ nhiệt|ly giữ nhiệt|phích giữ nhiệt/i.test(nameClean)) {
      type = 'Bình giữ nhiệt';
    } else if (/hộp cơm/i.test(nameClean)) {
      type = 'Hộp cơm giữ nhiệt';
    } else if (/dao|bộ dao/i.test(nameClean)) {
      type = 'Bộ dao làm bếp';
    } else if (/thớt/i.test(nameClean)) {
      type = 'Thớt kháng khuẩn';
    } else if (/nồi hấp/i.test(nameClean)) {
      type = 'Nồi hấp inox';
    } else if (/nồi lẩu/i.test(nameClean)) {
      type = 'Nồi lẩu inox';
    } else if (/nồi/i.test(nameClean)) {
      type = 'Nồi inox';
    }

    return {
      categoryGroup: kitchenGroup,
      categoryType: type,
      reason: 'Nhận diện sản phẩm gia dụng nhà bếp không cắm điện theo tên',
      isConfidenceHigh: true,
    };
  }

  // 1.2: Tên là THIẾT BỊ ĐIỆN GIA DỤNG (CẮM ĐIỆN)
  // Chỉ khi TÊN có chữ Bếp từ/Bếp đôi/Nồi chiên... VÀ KHÔNG PHẢI là nồi chảo
  if (
    /bếp từ|bếp đôi|bếp hồng ngoại|bếp điện|bếp ga|bếp gas|nồi chiên không dầu|nồi chiên|ấm siêu tốc|ấm đun nước|ấm đun|nồi cơm điện|nồi cơm|nồi áp suất điện|nồi áp suất|máy xay sinh tố|máy xay thịt|máy xay|máy ép chậm|máy ép|lò vi sóng|lò nướng|máy làm sữa hạt|quạt điện|quạt sưởi|quạt tháp|quạt đứng|quạt|bàn ủi|bàn là|nồi lẩu điện/i.test(
      nameClean
    )
  ) {
    let type = 'Thiết bị điện gia dụng';
    if (/bếp từ|bếp đôi|bếp điện/i.test(nameClean)) type = 'Bếp từ';
    else if (/bếp hồng ngoại/i.test(nameClean)) type = 'Bếp hồng ngoại';
    else if (/bếp ga|bếp gas/i.test(nameClean)) type = 'Bếp ga';
    else if (/nồi chiên không dầu|nồi chiên/i.test(nameClean)) type = 'Nồi chiên không dầu';
    else if (/ấm siêu tốc|ấm đun nước|ấm đun/i.test(nameClean)) type = 'Ấm đun nước siêu tốc';
    else if (/nồi cơm/i.test(nameClean)) type = 'Nồi cơm điện';
    else if (/nồi áp suất/i.test(nameClean)) type = 'Nồi áp suất điện';
    else if (/máy xay thịt/i.test(nameClean)) type = 'Máy xay thịt';
    else if (/máy xay/i.test(nameClean)) type = 'Máy xay đa năng';
    else if (/máy ép chậm|máy ép/i.test(nameClean)) type = 'Máy ép chậm';
    else if (/máy làm sữa hạt|sữa hạt/i.test(nameClean)) type = 'Máy làm sữa hạt';
    else if (/lò vi sóng/i.test(nameClean)) type = 'Lò vi sóng';
    else if (/lò nướng/i.test(nameClean)) type = 'Lò nướng';
    else if (/quạt/i.test(nameClean)) type = 'Quạt điện';
    else if (/bàn ủi|bàn là/i.test(nameClean)) type = 'Bàn ủi hơi nước';

    return {
      categoryGroup: 'Điện gia dụng',
      categoryType: type,
      reason: 'Nhận diện thiết bị điện gia dụng cắm điện theo tên',
      isConfidenceHigh: true,
    };
  }

  // 1.3: Tên là THIẾT BỊ THÔNG MINH
  if (
    /robot|hút bụi lau nhà|hút bụi cầm tay|máy hút bụi|khóa thông minh|khóa vân tay|khóa cửa|máy lọc không khí|máy lọc nước|máy rửa bát/i.test(
      nameClean
    )
  ) {
    let type = 'Thiết bị thông minh';
    if (/robot/i.test(nameClean)) type = 'Robot hút bụi lau nhà';
    else if (/khóa/i.test(nameClean)) type = 'Khóa cửa thông minh';
    else if (/lọc không khí/i.test(nameClean)) type = 'Máy lọc không khí';
    else if (/rửa bát/i.test(nameClean)) type = 'Máy rửa bát';
    else if (/lọc nước/i.test(nameClean)) type = 'Máy lọc nước';
    else if (/hút bụi/i.test(nameClean)) type = 'Máy hút bụi';

    return {
      categoryGroup: 'Thiết bị thông minh',
      categoryType: type,
      reason: 'Nhận diện thiết bị gia đình thông minh theo tên',
      isConfidenceHigh: true,
    };
  }

  // 1.4: Tên là DỤNG CỤ CẦM TAY
  if (
    /máy khoan|máy siết|bulong|bu-lông|máy mài|máy cưa|máy bắt vít|cờ lê|mỏ lết|búa|kìm/i.test(
      nameClean
    )
  ) {
    let type = 'Dụng cụ điện cầm tay';
    if (/khoan/i.test(nameClean)) type = 'Máy khoan pin';
    else if (/siết/i.test(nameClean)) type = 'Máy siết bu-lông';
    else if (/mài/i.test(nameClean)) type = 'Máy mài góc';
    else if (/cưa/i.test(nameClean)) type = 'Máy cưa đĩa';

    return {
      categoryGroup: 'Dụng cụ cầm tay',
      categoryType: type,
      reason: 'Nhận diện dụng cụ kỹ thuật cầm tay theo tên',
      isConfidenceHigh: true,
    };
  }

  // =========================================================================
  // BƯỚC 2: NẾU TÊN CHƯA ĐỦ THÔNG TIN, XÉT TIẾP MÔ TẢ (ĐÃ LÀM SẠCH BẪY TỪ KHÓA)
  // =========================================================================
  // Loại bỏ các cụm từ nói về tương thích bếp như: "sử dụng: bếp từ", "dùng được trên bếp từ", "đáy từ"...
  const sanitizedDesc = (description || '')
    .toLowerCase()
    .replace(/(sử dụng|thích hợp|tương thích|dùng|nấu)?\s*(trên|cho|với|được)?\s*(bếp từ|bếp halogen|bếp hồng ngoại|bếp ga|bếp điện|mọi loại bếp)/gi, ' ')
    .replace(/đáy từ|bắt từ|bắt nhiệt/gi, ' ');

  const fullCleanText = `${nameClean} ${sanitizedDesc}`;

  // Kiểm tra lại nhóm Đồ dùng nhà bếp trong mô tả đã làm sạch
  if (
    /bộ nồi|nồi luộc|nồi inox|chảo chống dính|chảo inox|chảo rán|bình giữ nhiệt|bộ dao|dao thớt/i.test(
      fullCleanText
    ) &&
    !/nồi chiên không dầu|nồi cơm điện|ấm siêu tốc/i.test(fullCleanText)
  ) {
    return {
      categoryGroup: kitchenGroup,
      categoryType: 'Đồ dùng nhà bếp',
      reason: 'Nhận diện sản phẩm gia dụng nhà bếp không cắm điện',
      isConfidenceHigh: true,
    };
  }

  // Mặc định an toàn
  const fallbackType = name.split(/\s+/).slice(0, 3).join(' ') || 'Sản phẩm';
  return {
    categoryGroup: existingGroups[0] || 'Đồ dùng nhà bếp',
    categoryType: fallbackType,
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
  // Chạy Heuristic Engine trước
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
- Mô tả: "${(product.description || '').slice(0, 200)}"

Các nhóm danh mục hiện có trong kho: [${existingGroups.join(', ') || 'Đồ dùng nhà bếp, Điện gia dụng, Thiết bị thông minh, Dụng cụ cầm tay'}]

QUY TẮC BẮT BUỘC (QUAN TRỌNG NHẤT):
1. DỰA CHỦ YẾU VÀO TÊN SẢN PHẨM:
   - Tên là "Bộ nồi...", "Nồi...", "Chảo...", "Dao...", "Thớt...", "Bình giữ nhiệt..." -> 100% là Nhóm "Đồ dùng nhà bếp", Loại là "Bộ nồi inox", "Chảo chống dính", "Nồi luộc gà"...
   - LƯU Ý BẪY TỪ KHÓA: Trong mô tả nếu có câu "Sử dụng được cho bếp từ", "Đáy từ" thì đó là TÍNH NĂNG NẤU CỦA NỒI CHẢO, TUYỆT ĐỐI KHÔNG ĐƯỢC XẾP VÀO "Bếp từ" hay "Điện gia dụng"!
   - Chỉ khi tên là "Bếp từ...", "Nồi chiên không dầu...", "Ấm siêu tốc..." mới xếp vào "Điện gia dụng".
2. "categoryType": Loại sản phẩm chi tiết (ví dụ: "Bộ nồi inox", "Nồi luộc gà", "Chảo chống dính", "Nồi chiên không dầu", "Ấm đun nước siêu tốc"). TUYỆT ĐỐI KHÔNG để từ chung chung như "Sản phẩm", "Bếp từ" (nếu là nồi).

Trả về JSON duy nhất:
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
          // Bảo vệ an toàn chống false positive: Nếu tên là Bộ nồi mà AI trả về Bếp từ thì ép về heuristic
          const isPotName = /bộ nồi|nồi inox|chảo/i.test(product.name);
          const isAiMistake = /bếp từ/i.test(parsed.categoryType);
          if (isPotName && isAiMistake) {
            return {
              categoryGroup: heuristic.categoryGroup,
              categoryType: heuristic.categoryType,
              reason: 'Tự động sửa lỗi: Tên là Bộ nồi/Chảo không thể là Bếp từ',
              usedGemini: false,
            };
          }

          return {
            categoryGroup: parsed.categoryGroup.trim(),
            categoryType: parsed.categoryType.trim(),
            reason: parsed.reason || 'AI Gemini phân tích từ tên sản phẩm',
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
            `[ID: ${p.id}]: Tên: "${p.name}". Hiện tại đang để Nhóm: "${p.categoryGroup || ''}", Loại: "${p.categoryType || ''}". Mô tả: "${(p.description || '').slice(0, 100)}"`
        )
        .join('\n');

      const prompt = `Bạn là hệ thống ERP chuẩn hóa dữ liệu hàng hóa & danh mục phân loại sản phẩm.
Dưới đây là danh sách sản phẩm cần chuẩn hóa Nhóm danh mục (categoryGroup) và Loại sản phẩm (categoryType):
${itemsPrompt}

Các nhóm danh mục hiện có trong hệ thống: [${existingGroups.join(', ') || 'Đồ dùng nhà bếp, Điện gia dụng, Thiết bị thông minh, Dụng cụ cầm tay'}]

QUY TẮC BẮT BUỘC:
1. DỰA CHỦ YẾU VÀO TÊN SẢN PHẨM:
   - Tên là "Bộ nồi...", "Nồi luộc...", "Chảo..." -> 100% thuộc nhóm "Đồ dùng nhà bếp", Loại là "Bộ nồi inox", "Nồi luộc gà", "Chảo chống dính"...
   - LƯU Ý BẪY TỪ KHÓA: Nếu mô tả có câu "Dùng cho bếp từ" thì đó là TÍNH NĂNG NẤU CỦA NỒI, TUYỆT ĐỐI KHÔNG xếp bộ nồi vào "Bếp từ" hay "Điện gia dụng"!
   - Chỉ khi tên là "Bếp từ...", "Nồi chiên...", "Ấm đun..." mới là "Điện gia dụng".
2. "categoryType": Loại sản phẩm chi tiết. TUYỆT ĐỐI KHÔNG để từ chung chung như "Sản phẩm", "Hàng hóa".

Trả về JSON duy nhất ánh xạ theo ID:
{
  "MA_ID_1": {
    "categoryGroup": "Đồ dùng nhà bếp",
    "categoryType": "Bộ nồi inox",
    "reason": "Bộ nồi nấu ăn inox gia đình"
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
              const potName = /bộ nồi|nồi inox|chảo/i.test(p.name);
              const aiMistake = /bếp từ/i.test(parsed[p.id].categoryType);

              // Tự động bảo vệ chống lỗi
              if (potName && aiMistake) {
                // Giữ kết quả heuristic đúng
                return;
              }

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
