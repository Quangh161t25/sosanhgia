import { Product, SpecItem } from '../types/product';

/**
 * Định dạng tiền tệ VND (vd: 1.500.000 ₫)
 */
export function formatVND(amount: number): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Định dạng số gọn (vd: 1.5M, 850K)
 */
export function formatCompactVND(amount: number): string {
  if (!amount) return '0 ₫';
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1).replace('.0', '')}M ₫`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(0)}K ₫`;
  }
  return `${amount} ₫`;
}

/**
 * Tính toán các chỉ số tài chính và biên lợi nhuận
 */
export function calculateFinancials(pricing?: Partial<Product['pricing']> | null) {
  const safePricing = pricing || {};
  const costPrice = Number(safePricing.costPrice) || 0;
  const distributorPrice = Number(safePricing.distributorPrice) || 0;
  const floorPrice = Number(safePricing.floorPrice) || 0;
  const retailPrice = Number(safePricing.retailPrice) || 0;

  // Lợi nhuận gộp = (Giá bán lẻ thương mại - Giá NPP) / Giá bán lẻ x 100%
  // Ví dụ: (830.000 - 455.000) / 830.000 * 100% = 45.2%
  const grossProfit = retailPrice - distributorPrice;
  const grossMarginPercent = retailPrice > 0 ? (grossProfit / retailPrice) * 100 : 0;
  const roundedGrossMargin = Math.round(grossMarginPercent * 10) / 10;

  // Lợi nhuận bán lẻ thương mại (tính từ giá nhập gốc nếu có)
  const retailGross = retailPrice - costPrice;
  const retailMarginPercent = retailPrice > 0 ? (retailGross / retailPrice) * 100 : 0;

  // Chênh lệch giữa giá thương mại và giá sàn
  const discountBuffer = retailPrice - floorPrice;
  const discountBufferPercent = retailPrice > 0 ? (discountBuffer / retailPrice) * 100 : 0;

  // Chênh lệch giữa Giá sàn và Giá NPP
  const floorOverNpp = floorPrice - distributorPrice;
  const floorOverNppPercent = distributorPrice > 0 ? (floorOverNpp / distributorPrice) * 100 : 0;

  return {
    grossProfit,
    grossMarginPercent: roundedGrossMargin,
    nppGross: grossProfit, // Tương thích ngược: Lợi nhuận gộp theo giá NPP
    nppMarginPercent: roundedGrossMargin,
    retailGross,
    retailMarginPercent: Math.round(retailMarginPercent * 10) / 10,
    discountBuffer,
    discountBufferPercent: Math.round(discountBufferPercent * 10) / 10,
    floorOverNpp,
    floorOverNppPercent: Math.round(floorOverNppPercent * 10) / 10,
  };
}

/**
 * So sánh giá trị của 1 thuộc tính giữa các sản phẩm để xem có điểm khác biệt không
 */
export function isAttributeDifferent(values: (string | number | undefined)[]): boolean {
  if (values.length <= 1) return false;
  const first = values[0];
  return values.some(v => String(v).trim().toLowerCase() !== String(first).trim().toLowerCase());
}

/**
 * Tính chênh lệch so với sản phẩm mốc (Benchmark)
 */
export function getDiffWithBenchmark(
  currentVal: number,
  benchmarkVal: number
): { diffValue: number; diffPercent: number; isHigher: boolean; isEqual: boolean } {
  const diffValue = currentVal - benchmarkVal;
  const isEqual = diffValue === 0;
  const diffPercent = benchmarkVal > 0 ? (diffValue / benchmarkVal) * 100 : 0;
  return {
    diffValue,
    diffPercent: Math.round(diffPercent * 10) / 10,
    isHigher: diffValue > 0,
    isEqual,
  };
}

/**
 * Gom tất cả các key thông số kỹ thuật có trong danh sách sản phẩm được chọn
 */
export function getAllSpecKeysByGroup(products: Product[]): { groupName: string; keys: string[] }[] {
  const groupMap = new Map<string, Set<string>>();

  products.forEach(p => {
    p.specifications.forEach(sg => {
      if (!groupMap.has(sg.groupName)) {
        groupMap.set(sg.groupName, new Set<string>());
      }
      const set = groupMap.get(sg.groupName)!;
      sg.items.forEach(item => set.add(item.key));
    });
  });

  return Array.from(groupMap.entries()).map(([groupName, keySet]) => ({
    groupName,
    keys: Array.from(keySet),
  }));
}

/**
 * Tìm giá trị của 1 thông số cụ thể trong sản phẩm
 */
export function findSpecValue(product: Product, groupName: string, specKey: string): SpecItem | undefined {
  const group = product.specifications.find(g => g.groupName === groupName);
  if (!group) return undefined;
  return group.items.find(i => i.key.toLowerCase() === specKey.toLowerCase());
}

/**
 * Chuẩn hóa chuỗi tiếng Việt thành không dấu để tìm kiếm thông minh
 */
export function removeVietnameseTones(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

