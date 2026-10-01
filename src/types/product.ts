export interface ProductPricing {
  costPrice: number;        // Giá nhập (VND)
  distributorPrice: number; // Giá NPP (VND)
  floorPrice: number;       // Giá sàn (VND)
  retailPrice: number;      // Giá thương mại (VND)
  currency: string;         // '₫' hoặc 'VND'
}

export interface SpecItem {
  key: string;            // Ví dụ: 'Công suất', 'Dung tích', 'Chất liệu'
  value: string;          // Ví dụ: '1800W', '6.5 Lít', 'Inox 304'
  unit?: string;
  isHighlight?: boolean;
}

export interface SpecGroup {
  groupName: string;      // Ví dụ: 'Thông số vận hành', 'Kích thước & Thiết kế', 'Tiện ích & Bảo hành'
  items: SpecItem[];
}

export interface Product {
  id: string;
  sku: string;             // Mã modul / Model (vd: 'NL-AF65D', 'RB-X100MAX')
  name: string;            // Tên sản phẩm
  categoryGroup: string;   // Nhóm sản phẩm (vd: 'Điện gia dụng', 'Thiết bị thông minh', 'Dụng cụ điện cầm tay')
  categoryType: string;    // Loại sản phẩm (vd: 'Nồi chiên không dầu', 'Robot hút bụi lau nhà', 'Máy khoan pin')
  thumbnail: string;       // Link ảnh
  pricing: ProductPricing; // 4 tầng giá
  specifications: SpecGroup[];
  tags: string[];          // vd: ['Bán chạy', 'Biên lợi nhuận cao', 'Chống ồn', 'Công nghệ Đức']
  notes: string;           // Ghi chú nội bộ / chính sách bán buôn / cảnh báo
  description?: string;   // Mô tả sản phẩm (dùng để AI bóc tách thông số kỹ thuật)
  status: 'active' | 'low_stock' | 'out_of_stock';
  brand?: string;
  warrantyMonths?: number;
  updatedAt: string;
}

export interface FilterState {
  searchQuery: string;
  selectedGroup: string;
  selectedType: string;
  priceType: 'costPrice' | 'distributorPrice' | 'floorPrice' | 'retailPrice';
  priceRange: [number, number];
  minMarginNpp: number; // Tối thiểu % lợi nhuận NPP
  selectedTags: string[];
  specFilters: Record<string, string>; // key: specKey, value: specValue
  sortBy: 'price_asc' | 'price_desc' | 'margin_desc' | 'name_asc' | 'sku_asc';
}

export type ViewMode = 'all' | 'differences_only' | 'pricing_margin';
