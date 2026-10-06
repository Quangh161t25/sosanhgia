import { Product } from '../types/product';
import { calculateFinancials, formatVND } from './pricing';
import { getSavedGeminiKey } from './aiSpecParser';

export interface CriteriaMatchDetail {
  nameMatch: {
    score: number; // 0 - 100%
    commonWords: string[];
    label: string;
  };
  groupMatch: {
    targetGroup: string;
    candidateGroup: string;
    isSame: boolean;
  };
  typeMatch: {
    targetType: string;
    candidateType: string;
    isSame: boolean;
  };
}

export interface SimilarProductResult {
  product: Product;
  similarityScore: number; // 0 - 100%
  matchReasons: string[];
  criteriaMatch: CriteriaMatchDetail;
}

export interface ProductComparisonInsight {
  productId: string;
  badge: {
    label: string;
    color: 'emerald' | 'blue' | 'amber' | 'purple';
    icon: 'crown' | 'gem' | 'target' | 'sparkles';
  };
  pros: string[];
  cons: string[];
  targetAudience: string;
}

export interface ComparisonAnalysisResult {
  specsWinnerId: string;
  marginWinnerId: string;
  valueWinnerId: string;
  overallSummary: string;
  insights: Record<string, ProductComparisonInsight>;
  usedAI: boolean;
}

/**
 * Tách từ khóa để so khớp ngữ nghĩa cơ bản
 */
function tokenize(text: string): Set<string> {
  return new Set(
    (text || '')
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter(w => w.length >= 2)
  );
}

/**
 * 1. TÌM SẢN PHẨM TƯƠNG TỰ BẰNG AI & THUẬT TOÁN KẾT HỢP
 */
export async function findSimilarProducts(
  target: Partial<Product>,
  catalog: Product[],
  customApiKey?: string
): Promise<SimilarProductResult[]> {
  if (!catalog || catalog.length === 0) return [];

  const targetSku = String(target.sku || '').trim().toUpperCase();
  const candidates = catalog.filter(p => {
    if (!p) return false;
    if (target.id && p.id === target.id) return false;
    const pSku = String(p.sku || p.id || '').trim().toUpperCase();
    if (targetSku && pSku && targetSku === pSku) return false;
    return true;
  });

  if (candidates.length === 0) return [];

  const targetName = (target.name || '').trim();
  const targetNameTokens = tokenize(targetName);
  const targetCategoryType = (target.categoryType || '').trim().toLowerCase();
  const targetCategoryGroup = (target.categoryGroup || '').trim().toLowerCase();
  const targetBrand = (target.brand || '').trim().toLowerCase();

  const scored: SimilarProductResult[] = candidates.map(p => {
    let score = 0;
    const reasons: string[] = [];

    // ==========================================
    // TIÊU CHÍ 1: SO SÁNH THEO LOẠI SẢN PHẨM (categoryType) - 40 điểm
    // ==========================================
    const pType = (p.categoryType || '').trim().toLowerCase();
    const isSameType = Boolean(targetCategoryType && pType && targetCategoryType === pType);
    if (isSameType) {
      score += 40;
      reasons.push(`Cùng Loại sản phẩm: ${p.categoryType}`);
    } else if (
      targetCategoryType &&
      pType &&
      (targetCategoryType.includes(pType) || pType.includes(targetCategoryType))
    ) {
      score += 25;
      reasons.push(`Gần cùng Loại sản phẩm: ${p.categoryType}`);
    }

    // ==========================================
    // TIÊU CHÍ 2: SO SÁNH THEO NHÓM DANH MỤC (categoryGroup) - 30 điểm
    // ==========================================
    const pGroup = (p.categoryGroup || '').trim().toLowerCase();
    const isSameGroup = Boolean(targetCategoryGroup && pGroup && targetCategoryGroup === pGroup);
    if (isSameGroup) {
      score += 30;
      reasons.push(`Cùng Nhóm danh mục: ${p.categoryGroup}`);
    }

    // ==========================================
    // TIÊU CHÍ 3: SO SÁNH THEO TÊN SẢN PHẨM (name) - 30 điểm
    // ==========================================
    const pNameTokens = tokenize(p.name || '');
    const commonWords: string[] = [];
    targetNameTokens.forEach(token => {
      if (pNameTokens.has(token)) {
        commonWords.push(token);
      }
    });

    const minTokenLen = Math.min(targetNameTokens.size, pNameTokens.size);
    const tokenOverlapRatio = minTokenLen > 0 ? commonWords.length / minTokenLen : 0;
    const nameMatchPercent = Math.min(100, Math.round(tokenOverlapRatio * 100));

    let nameScore = 0;
    if (tokenOverlapRatio >= 0.5 || commonWords.length >= 3) {
      nameScore = 30;
      reasons.push(`Tên trùng ${commonWords.length} từ khóa chính`);
    } else if (tokenOverlapRatio >= 0.25 || commonWords.length >= 2) {
      nameScore = 20;
      reasons.push(`Tên trùng ${commonWords.length} từ khóa`);
    } else if (commonWords.length >= 1) {
      nameScore = 10;
      reasons.push(`Tên có từ khóa chung: "${commonWords[0]}"`);
    }
    score += nameScore;

    // Điểm cộng nhỏ nếu cùng thương hiệu (+5 điểm)
    const pBrand = (p.brand || '').trim().toLowerCase();
    if (targetBrand && pBrand && targetBrand === pBrand) {
      score += 5;
    }

    const finalScore = Math.min(Math.max(Math.round(score), 10), 100);

    return {
      product: p,
      similarityScore: finalScore,
      matchReasons: reasons,
      criteriaMatch: {
        nameMatch: {
          score: nameMatchPercent,
          commonWords,
          label:
            commonWords.length > 0
              ? `Trùng ${commonWords.length} từ (${commonWords.slice(0, 3).join(', ')})`
              : 'Khác biệt từ khóa',
        },
        groupMatch: {
          targetGroup: target.categoryGroup || '',
          candidateGroup: p.categoryGroup || '',
          isSame: isSameGroup,
        },
        typeMatch: {
          targetType: target.categoryType || '',
          candidateType: p.categoryType || '',
          isSame: isSameType,
        },
      },
    };
  });

  // Sắp xếp điểm tương đồng giảm dần và lấy top 4
  scored.sort((a, b) => b.similarityScore - a.similarityScore);
  const topSimilar = scored.slice(0, 4);

  // Nâng cao bằng Gemini AI nếu có API Key
  const apiKey = (customApiKey || getSavedGeminiKey()).trim();
  if (apiKey && topSimilar.length > 0 && target.name) {
    try {
      const candidatesPrompt = topSimilar
        .map(
          (s, idx) =>
            `ID_${idx}: Tên: "${s.product.name}", Nhóm: "${s.product.categoryGroup || ''}", Loại: "${s.product.categoryType || ''}"`
        )
        .join('\n');

      const prompt = `Bạn là chuyên gia phân tích dữ liệu sản phẩm.
Sản phẩm đang sửa:
- Tên sản phẩm: "${target.name}"
- Nhóm danh mục: "${target.categoryGroup || 'Chưa rõ'}"
- Loại sản phẩm: "${target.categoryType || 'Chưa rõ'}"

Các sản phẩm ứng viên tương tự:
${candidatesPrompt}

Yêu cầu: So sánh từng ứng viên với sản phẩm đang sửa dựa trên 3 tiêu chí (Tên, Nhóm danh mục, Loại sản phẩm).
Với mỗi ID_x, hãy đưa ra 1 câu nhận xét ngắn (dưới 15 từ) giải thích mức độ khớp của 3 tiêu chí này.
Trả về JSON duy nhất:
{
  "matches": [
    { "id": "ID_0", "reason": "Nhận xét ngắn về độ khớp 3 tiêu chí" }
  ]
}`;

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const jsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (jsonText) {
          const parsed = JSON.parse(jsonText);
          if (Array.isArray(parsed?.matches)) {
            parsed.matches.forEach((m: any, i: number) => {
              if (topSimilar[i] && m.reason) {
                topSimilar[i].matchReasons.unshift(m.reason);
              }
            });
          }
        }
      }
    } catch {
      // Giữ nguyên kết quả heuristic
    }
  }

  return topSimilar;
}

/**
 * 2. ĐÁNH GIÁ SẢN PHẨM VƯỢT TRỘI TRONG MODULE SO SÁNH
 */
export async function analyzeComparisonMatrix(
  products: Product[],
  customApiKey?: string
): Promise<ComparisonAnalysisResult> {
  if (!products || products.length === 0) {
    return {
      specsWinnerId: '',
      marginWinnerId: '',
      valueWinnerId: '',
      overallSummary: '',
      insights: {},
      usedAI: false,
    };
  }

  // Phân tích số liệu tài chính từng sản phẩm
  const financialMap = new Map<string, ReturnType<typeof calculateFinancials>>();
  products.forEach(p => {
    financialMap.set(p.id, calculateFinancials(p.pricing));
  });

  // 1. Tìm Quán quân Lợi nhuận NPP
  let maxMargin = -Infinity;
  let marginWinner = products[0];
  products.forEach(p => {
    const f = financialMap.get(p.id)!;
    if (f.grossMarginPercent > maxMargin) {
      maxMargin = f.grossMarginPercent;
      marginWinner = p;
    }
  });

  // 2. Tìm Quán quân Giá tốt nhất / Dễ bán
  let minRetail = Infinity;
  let valueWinner = products[0];
  products.forEach(p => {
    if (p.pricing.retailPrice > 0 && p.pricing.retailPrice < minRetail) {
      minRetail = p.pricing.retailPrice;
      valueWinner = p;
    }
  });

  // 3. Tìm Quán quân Cấu hình / Thông số
  let maxSpecsCount = -1;
  let specsWinner = products[0];
  products.forEach(p => {
    let specCount = 0;
    if (Array.isArray(p.specifications)) {
      p.specifications.forEach(g => {
        if (Array.isArray(g?.items)) {
          specCount += g.items.length;
        }
      });
    }
    // Cộng điểm cho thời hạn bảo hành dài hơn
    specCount += (p.warrantyMonths || 12) >= 24 ? 3 : 0;
    if (specCount > maxSpecsCount) {
      maxSpecsCount = specCount;
      specsWinner = p;
    }
  });

  // Tạo Insight mặc định cho từng sản phẩm
  const insights: Record<string, ProductComparisonInsight> = {};

  products.forEach(p => {
    const f = financialMap.get(p.id)!;
    const isMargin = p.id === marginWinner.id;
    const isSpecs = p.id === specsWinner.id;
    const isValue = p.id === valueWinner.id;

    const pros: string[] = [];
    const cons: string[] = [];
    let targetAudience = 'Khách hàng phổ thông & đại lý tiêu chuẩn';

    if (isMargin) {
      pros.push(`Tỷ suất lợi nhuận gộp dẫn đầu: +${f.grossMarginPercent}% (Lãi ${formatVND(f.grossProfit)}/cái)`);
      targetAudience = 'Tối ưu cho đại lý muốn tối đa hóa biên lợi nhuận kinh doanh';
    }
    if (isSpecs) {
      pros.push(`Cấu hình phong phú, đầy đủ tiêu chuẩn kỹ thuật nhất (${maxSpecsCount} thông số)`);
      pros.push(`Bảo hành chính hãng ${p.warrantyMonths || 12} tháng`);
      targetAudience = 'Khách hàng chú trọng chất lượng, độ bền và tính năng cao cấp';
    }
    if (isValue) {
      pros.push(`Mức giá bán lẻ dễ tiếp cận nhất: ${formatVND(p.pricing.retailPrice)}`);
      targetAudience = 'Khách hàng nhạy cảm về giá, phân khúc gia đình bình dân';
    }

    if (!isMargin && f.grossMarginPercent < 25) {
      cons.push(`Biên lợi nhuận khiêm tốn (+${f.grossMarginPercent}%)`);
    }
    if (!isValue && p.pricing.retailPrice > minRetail * 1.3) {
      cons.push(`Giá bán lẻ cao hơn đối thủ cùng phân khúc`);
    }

    if (pros.length === 0) {
      pros.push(`Giá NPP hợp lý: ${formatVND(p.pricing.distributorPrice)}`);
      pros.push(`Chính sách bảo hành tiêu chuẩn ${p.warrantyMonths || 12} tháng`);
    }
    if (cons.length === 0) {
      cons.push(`Độ cạnh tranh ngang ngửa các sản phẩm cùng tầm giá`);
    }

    let badge: ProductComparisonInsight['badge'] = {
      label: 'Cân bằng P/P',
      color: 'blue',
      icon: 'sparkles',
    };

    if (isMargin && isSpecs) {
      badge = { label: 'Toàn diện nhất', color: 'purple', icon: 'crown' };
    } else if (isMargin) {
      badge = { label: `LN NPP cao nhất (+${f.grossMarginPercent}%)`, color: 'emerald', icon: 'gem' };
    } else if (isSpecs) {
      badge = { label: 'Cấu hình vượt trội', color: 'purple', icon: 'crown' };
    } else if (isValue) {
      badge = { label: 'Giá tốt nhất', color: 'amber', icon: 'target' };
    }

    insights[p.id] = {
      productId: p.id,
      badge,
      pros,
      cons,
      targetAudience,
    };
  });

  // Tóm tắt tổng quan tự động
  let overallSummary = `Đối đầu ${products.length} sản phẩm: ${specsWinner.sku} dẫn đầu về trang bị kỹ thuật; ${marginWinner.sku} mang lại lợi nhuận hấp dẫn nhất cho đối tác đại lý (+${financialMap.get(marginWinner.id)?.grossMarginPercent}%); và ${valueWinner.sku} có lợi thế giá bán lẻ dễ chốt đơn nhất.`;

  // Nâng cao qua Gemini AI nếu có key
  const apiKey = (customApiKey || getSavedGeminiKey()).trim();
  let usedAI = false;

  if (apiKey && products.length >= 2) {
    try {
      const promptProducts = products.map(p => {
        const f = financialMap.get(p.id)!;
        const specsText = p.specifications.flatMap(g => g.items.map(i => `${i.key}: ${i.value}`)).slice(0, 8).join(', ');
        return `[SKU: ${p.sku} - ${p.name}]: Giá NPP: ${p.pricing.distributorPrice}đ, Giá lẻ: ${p.pricing.retailPrice}đ, LN gộp: ${f.grossMarginPercent}%, BH: ${p.warrantyMonths || 12}T. Thông số: ${specsText}`;
      }).join('\n\n');

      const prompt = `Bạn là chuyên gia tư vấn chiến lược kinh doanh và đánh giá sản phẩm.
Dưới đây là các sản phẩm đang được so sánh:
${promptProducts}

Hãy phân tích khách quan và trả về định dạng JSON DUY NHẤT:
{
  "overallSummary": "Đoạn nhận định sắc bén tổng quan trong 2 câu so sánh con nào hơn con nào về kỹ thuật và thương mại",
  "specsWinnerSku": "Mã SKU có cấu hình/tính năng vượt trội nhất",
  "marginWinnerSku": "Mã SKU có tỷ suất lợi nhuận và tiềm năng kinh doanh cho đại lý tốt nhất",
  "valueWinnerSku": "Mã SKU có mức giá trên hiệu năng (P/P) tốt nhất",
  "insights": {
    "MA_SKU": {
      "badgeLabel": "Huy hiệu 2-4 từ (vd: Cấu hình mạnh nhất, Lợi nhuận khủng, Giá hời)",
      "pros": ["Điểm mạnh 1", "Điểm mạnh 2"],
      "cons": ["Điểm yếu 1"],
      "targetAudience": "Đối tượng khách hàng nên tư vấn"
    }
  }
}`;

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const jsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (jsonText) {
          const parsed = JSON.parse(jsonText);
          if (parsed.overallSummary) {
            overallSummary = parsed.overallSummary;
            usedAI = true;
          }
          if (parsed.insights) {
            products.forEach(p => {
              const aiItem = parsed.insights[p.sku] || parsed.insights[p.id];
              if (aiItem && insights[p.id]) {
                if (aiItem.badgeLabel) insights[p.id].badge.label = aiItem.badgeLabel;
                if (Array.isArray(aiItem.pros) && aiItem.pros.length > 0) insights[p.id].pros = aiItem.pros;
                if (Array.isArray(aiItem.cons) && aiItem.cons.length > 0) insights[p.id].cons = aiItem.cons;
                if (aiItem.targetAudience) insights[p.id].targetAudience = aiItem.targetAudience;
              }
            });
          }
        }
      }
    } catch {
      // Giữ nguyên kết quả phân tích heuristic
    }
  }

  return {
    specsWinnerId: specsWinner.id,
    marginWinnerId: marginWinner.id,
    valueWinnerId: valueWinner.id,
    overallSummary,
    insights,
    usedAI,
  };
}
