import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Search,
  Plus,
  Printer,
  FileSpreadsheet,
  LayoutGrid,
  List,
  RotateCcw,
  Scale,
  Edit2,
  Trash2,
  Eye,
  SlidersHorizontal,
  X,
  AlertCircle,
  Upload,
  Sparkles,
  Zap,
  ChevronDown,
  ZoomIn,
  FolderEdit,
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
  Package,
  Layers,
  DollarSign,
  FileText,
  Settings,
} from 'lucide-react';
import { Product } from '../../types/product';
import { ProductCard } from '../ProductCard';
import { calculateFinancials, formatVND, removeVietnameseTones } from '../../utils/pricing';
import {
  ColumnConfig,
  ColumnGroupId,
  COLUMN_GROUPS,
  getColumnGroup,
} from './ColumnSettingsModal';
import { ColumnOptionsPopover, TableDensity } from './ColumnOptionsPopover';
import { SearchableFilterSelect } from './SearchableFilterSelect';
import { GoogleSheetsSyncModal } from '../GoogleSheetsSyncModal';
import { ExcelImportModal } from '../ExcelImportModal';
import { BatchCategoryModal } from '../modals/BatchCategoryModal';
import { BatchManualCategoryModal } from '../modals/BatchManualCategoryModal';
import { BatchSpecsModal } from '../modals/BatchSpecsModal';
import { ProductImageLightboxModal } from '../ProductImageLightboxModal';

const COLUMN_STORAGE_KEY = 'procompare_table_columns_v6';
const DENSITY_STORAGE_KEY = 'procompare_table_density';
const PAGE_SIZE_STORAGE_KEY = 'procompare_page_size';
const TABLE_GROUPING_STORAGE_KEY = 'procompare_table_grouping_v1';

const GROUP_HEADER_STYLES: Record<
  ColumnGroupId,
  { bg: string; text: string; border: string; badgeBg: string; badgeText: string; icon: React.FC<{ className?: string }> }
> = {
  system: {
    bg: 'bg-slate-100/95',
    text: 'text-slate-700',
    border: 'border-slate-300',
    badgeBg: 'bg-slate-200',
    badgeText: 'text-slate-700',
    icon: Settings,
  },
  general: {
    bg: 'bg-blue-50/95',
    text: 'text-blue-900',
    border: 'border-blue-200',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-700',
    icon: Package,
  },
  category: {
    bg: 'bg-emerald-50/95',
    text: 'text-emerald-900',
    border: 'border-emerald-200',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-700',
    icon: Layers,
  },
  pricing: {
    bg: 'bg-amber-50/95',
    text: 'text-amber-900',
    border: 'border-amber-200',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
    icon: DollarSign,
  },
  details: {
    bg: 'bg-purple-50/95',
    text: 'text-purple-900',
    border: 'border-purple-200',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-800',
    icon: FileText,
  },
};

export const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'checkbox', label: 'Hộp kiểm', visible: true, pinned: true, align: 'center', wrap: false, width: 48, group: 'system' },
  { id: 'thumbnail', label: 'Hình ảnh', visible: true, pinned: false, align: 'center', wrap: false, width: 68, group: 'general' },
  { id: 'sku', label: 'Mã SKU / Modul', visible: true, pinned: false, align: 'left', wrap: false, width: 120, group: 'general' },
  { id: 'name', label: 'Tên sản phẩm', visible: true, pinned: false, align: 'left', wrap: true, width: 250, group: 'general' },
  { id: 'brand', label: 'Thương hiệu', visible: true, pinned: false, align: 'left', wrap: false, width: 120, group: 'general' },
  { id: 'categoryGroup', label: 'Nhóm danh mục', visible: true, pinned: false, align: 'left', wrap: false, width: 130, group: 'category' },
  { id: 'categoryType', label: 'Loại sản phẩm', visible: true, pinned: false, align: 'left', wrap: false, width: 130, group: 'category' },
  { id: 'costPrice', label: '1. Giá nhập', visible: true, pinned: false, align: 'right', wrap: false, width: 110, group: 'pricing' },
  { id: 'distributorPrice', label: '2. Giá NPP', visible: true, pinned: false, align: 'right', wrap: false, width: 110, group: 'pricing' },
  { id: 'floorPrice', label: '3. Giá sàn', visible: true, pinned: false, align: 'right', wrap: false, width: 100, group: 'pricing' },
  { id: 'retailPrice', label: '4. Giá bán lẻ', visible: true, pinned: false, align: 'right', wrap: false, width: 110, group: 'pricing' },
  { id: 'margin', label: 'Biên LN NPP', visible: true, pinned: false, align: 'right', wrap: false, width: 100, group: 'pricing' },
  { id: 'warrantyMonths', label: 'Bảo hành', visible: true, pinned: false, align: 'center', wrap: false, width: 100, group: 'details' },
  { id: 'description', label: 'Mô tả sản phẩm', visible: true, pinned: false, align: 'left', wrap: true, width: 300, group: 'details' },
  { id: 'specs', label: 'Thông số kỹ thuật', visible: true, pinned: false, align: 'left', wrap: true, width: 240, group: 'details' },
  { id: 'tags', label: 'Nhãn Tags', visible: true, pinned: false, align: 'left', wrap: true, width: 130, group: 'details' },
  { id: 'notes', label: 'Ghi chú', visible: true, pinned: false, align: 'left', wrap: true, width: 160, group: 'details' },
  { id: 'status', label: 'Trạng thái', visible: true, pinned: false, align: 'center', wrap: false, width: 110, group: 'details' },
  { id: 'updatedAt', label: 'Ngày cập nhật', visible: true, pinned: false, align: 'center', wrap: false, width: 110, group: 'details' },
  { id: 'actions', label: 'Thao tác', visible: true, pinned: false, align: 'center', wrap: false, width: 120, group: 'system' },
];

interface ProductsViewProps {
  products: Product[];
  onBackToHome: () => void;
  onOpenAddModal: () => void;
  onEditProduct: (product: Product) => void;
  onViewDetail: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  compareIds: string[];
  onSetCompareProducts: (productIds: string[]) => void;
  onOpenCompare: () => void;
  onExportCatalog: () => void;
  showCostPrice: boolean;
  onUpdateProducts?: (newProducts: Product[]) => void;
  onOpenExcelImport?: () => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  onBackToHome,
  onOpenAddModal,
  onEditProduct,
  onViewDetail,
  onDeleteProduct,
  compareIds,
  onSetCompareProducts,
  onOpenCompare,
  onExportCatalog,
  showCostPrice,
  onUpdateProducts,
  onOpenExcelImport,
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);
  const [isExcelImportOpen, setIsExcelImportOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [zoomProduct, setZoomProduct] = useState<Product | null>(null);

  // 1. CHỌN HÀNG LOẠT & ĐỒNG BỘ VỚI DANH SÁCH SO SÁNH
  const [selectedIds, setSelectedIds] = useState<string[]>(() => compareIds);
  const [isBatchCategoryModalOpen, setIsBatchCategoryModalOpen] = useState(false);
  const [isManualCategoryModalOpen, setIsManualCategoryModalOpen] = useState(false);
  const [isBatchSpecsModalOpen, setIsBatchSpecsModalOpen] = useState(false);
  const [inlineEditingCell, setInlineEditingCell] = useState<{
    productId: string;
    field: 'categoryGroup' | 'categoryType';
  } | null>(null);

  // 2. SẮP XẾP A-Z & Z-A THEO TIÊU ĐỀ CỘT
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  const handleSort = (columnId: string) => {
    if (['checkbox', 'thumbnail', 'actions'].includes(columnId)) return;
    setSortConfig(prev => {
      if (prev?.key === columnId) {
        if (prev.direction === 'asc') {
          return { key: columnId, direction: 'desc' };
        }
        return null; // Nhấn lần 3: Khôi phục thứ tự mặc định
      }
      return { key: columnId, direction: 'asc' };
    });
  };

  // Cập nhật nhanh 1 trường dữ liệu (Nhóm / Loại) trực tiếp từ bảng
  const handleUpdateSingleField = (productId: string, field: 'categoryGroup' | 'categoryType', value: string) => {
    if (!onUpdateProducts) return;
    const nextProducts = products.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          [field]: value.trim(),
          updatedAt: new Date().toISOString().split('T')[0],
        };
      }
      return p;
    });
    onUpdateProducts(nextProducts);
  };

  // Danh sách các đối tượng sản phẩm đang được tick chọn
  const selectedProducts = useMemo(() => {
    return products.filter(p => selectedIds.includes(p.id));
  }, [products, selectedIds]);

  // PHÂN TRANG (PAGINATION)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(PAGE_SIZE_STORAGE_KEY);
      if (saved) {
        const parsed = Number(saved);
        if (!isNaN(parsed)) return parsed;
      }
    } catch (e) {
      // Ignore
    }
    return 100;
  });

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
    try {
      localStorage.setItem(PAGE_SIZE_STORAGE_KEY, String(newSize));
    } catch (e) {
      // Ignore
    }
  };

  // Tự động đồng bộ selectedIds khi compareIds thay đổi từ Dock hoặc Matrix
  useEffect(() => {
    setSelectedIds(prev => Array.from(new Set([...prev, ...compareIds])));
  }, [compareIds]);

  // 2. CẤU HÌNH CỘT (Sắp xếp, Ghim, Ẩn/Hiện, Căn lề, Độ rộng)
  const [columns, setColumns] = useState<ColumnConfig[]>(() => {
    try {
      const saved = localStorage.getItem(COLUMN_STORAGE_KEY);
      if (saved) {
        const parsed: ColumnConfig[] = JSON.parse(saved);
        // Tự động bổ sung các cột mới nếu trước đó chưa có trong cấu hình đã lưu
        const existingIds = new Set(parsed.map(c => c.id));
        const missing = DEFAULT_COLUMNS.filter(c => !existingIds.has(c.id));
        if (missing.length === 0) return parsed;
        return [...parsed, ...missing];
      }
    } catch (e) {
      console.error('Lỗi đọc cấu hình cột:', e);
    }
    return DEFAULT_COLUMNS;
  });

  const [density, setDensity] = useState<TableDensity>(() => {
    try {
      const saved = localStorage.getItem(DENSITY_STORAGE_KEY);
      if (saved === 'compact' || saved === 'normal' || saved === 'spacious') return saved;
    } catch (e) {
      // Ignore
    }
    return 'normal';
  });

  const handleUpdateDensity = (newDensity: TableDensity) => {
    setDensity(newDensity);
    try {
      localStorage.setItem(DENSITY_STORAGE_KEY, newDensity);
    } catch (e) {
      // Ignore
    }
  };

  const [isColumnSettingsOpen, setIsColumnSettingsOpen] = useState(false);

  // Chế độ gộp nhóm tiêu đề 2 tầng trên bảng dữ liệu
  const [isTableGroupingEnabled, setIsTableGroupingEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem(TABLE_GROUPING_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleTableGrouping = (enabled: boolean) => {
    setIsTableGroupingEnabled(enabled);
    try {
      localStorage.setItem(TABLE_GROUPING_STORAGE_KEY, String(enabled));
    } catch (e) {
      // Ignore
    }
  };

  // Lưu cấu hình cột vào localStorage
  const handleUpdateColumns = (newCols: ColumnConfig[]) => {
    setColumns(newCols);
    try {
      localStorage.setItem(COLUMN_STORAGE_KEY, JSON.stringify(newCols));
    } catch (e) {
      // Ignore
    }
  };

  const handleResetColumns = () => {
    setColumns(DEFAULT_COLUMNS);
    setDensity('normal');
    try {
      localStorage.removeItem(COLUMN_STORAGE_KEY);
      localStorage.removeItem(DENSITY_STORAGE_KEY);
    } catch (e) {
      // Ignore
    }
  };

  // 3. THAY ĐỔI KÍCH THƯỚC CỘT BẰNG KÉO CHUỘT TRỰC TIẾP TRÊN WEB
  const resizingColRef = useRef<{ colId: string; startX: number; startWidth: number } | null>(null);

  const handleStartResize = (colId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const col = columns.find(c => c.id === colId);
    if (!col) return;

    resizingColRef.current = {
      colId,
      startX: e.clientX,
      startWidth: col.width,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!resizingColRef.current) return;
      const diff = moveEvent.clientX - resizingColRef.current.startX;
      const newWidth = Math.max(50, resizingColRef.current.startWidth + diff);

      setColumns(prev =>
        prev.map(c => (c.id === resizingColRef.current!.colId ? { ...c, width: newWidth } : c))
      );
    };

    const handleMouseUp = () => {
      if (resizingColRef.current) {
        // Lưu sau khi kéo xong
        setColumns(currentCols => {
          try {
            localStorage.setItem(COLUMN_STORAGE_KEY, JSON.stringify(currentCols));
          } catch (e) {
            // Ignore
          }
          return currentCols;
        });
      }
      resizingColRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Danh sách Thương hiệu, Nhóm và Loại duy nhất - SẮP XẾP A-Z
  const brands = useMemo(() => {
    const list = products
      .map(p => p.brand?.trim())
      .filter((b): b is string => Boolean(b && b.length > 0));
    return Array.from(new Set(list)).sort((a, b) => a.localeCompare(b, 'vi', { sensitivity: 'base' }));
  }, [products]);

  const categoryGroups = useMemo(() => {
    const list = products
      .map(p => p.categoryGroup?.trim())
      .filter((g): g is string => Boolean(g && g.length > 0));
    return Array.from(new Set(list)).sort((a, b) => a.localeCompare(b, 'vi', { sensitivity: 'base' }));
  }, [products]);

  const categoryTypes = useMemo(() => {
    const list = products
      .map(p => p.categoryType?.trim())
      .filter((t): t is string => Boolean(t && t.length > 0));
    return Array.from(new Set(list)).sort((a, b) => a.localeCompare(b, 'vi', { sensitivity: 'base' }));
  }, [products]);

  // Đếm số lượng sản phẩm theo từng tiêu chí
  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach(p => {
      const b = p.brand?.trim();
      if (b) counts[b] = (counts[b] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Dữ liệu chip lọc Thương hiệu: Liệt kê HẾT TẤT CẢ các thương hiệu có trong kho
  const brandChipsData = useMemo(() => {
    const totalCount = products.length;
    const brandMap = new Map<string, { displayName: string; count: number }>();
    let noBrandCount = 0;

    products.forEach(p => {
      const rawBrand = p.brand?.trim();
      if (!rawBrand) {
        noBrandCount++;
        return;
      }
      const lower = rawBrand.toLowerCase();
      const existing = brandMap.get(lower);
      if (existing) {
        existing.count++;
      } else {
        brandMap.set(lower, { displayName: rawBrand, count: 1 });
      }
    });

    // Sắp xếp các brand theo số lượng sản phẩm giảm dần
    const allBrands = Array.from(brandMap.values()).sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.displayName.localeCompare(b.displayName, 'vi', { sensitivity: 'base' });
    });

    return {
      totalCount,
      allBrands,
      noBrandCount,
    };
  }, [products]);

  const groupCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach(p => {
      const g = p.categoryGroup?.trim();
      if (g) counts[g] = (counts[g] || 0) + 1;
    });
    return counts;
  }, [products]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach(p => {
      const t = p.categoryType?.trim();
      if (t) counts[t] = (counts[t] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Bộ lọc sản phẩm (hỗ trợ tìm kiếm tiếng Việt không dấu)
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (searchQuery.trim()) {
        const rawQ = searchQuery.toLowerCase().trim();
        const cleanQ = removeVietnameseTones(searchQuery);

        const checkMatch = (val?: string) => {
          if (!val) return false;
          return val.toLowerCase().includes(rawQ) || removeVietnameseTones(val).includes(cleanQ);
        };

        const matchSku = checkMatch(p.sku);
        const matchName = checkMatch(p.name);
        const matchBrand = checkMatch(p.brand);
        const matchNotes = checkMatch(p.notes);
        const matchSpecs = p.specifications.some(sg =>
          sg.items.some(
            i => checkMatch(i.key) || checkMatch(i.value)
          )
        );
        if (!matchSku && !matchName && !matchBrand && !matchNotes && !matchSpecs) {
          return false;
        }
      }

      if (selectedBrand === '__nobrand__') {
        if (p.brand?.trim()) return false;
      } else if (selectedBrand && (!p.brand || p.brand.trim().toLowerCase() !== selectedBrand.trim().toLowerCase())) {
        return false;
      }

      if (selectedGroups.length > 0) {
        const g = p.categoryGroup?.trim().toLowerCase();
        if (!g || !selectedGroups.some(sel => sel.trim().toLowerCase() === g)) return false;
      }
      if (selectedTypes.length > 0) {
        const t = p.categoryType?.trim().toLowerCase();
        if (!t || !selectedTypes.some(sel => sel.trim().toLowerCase() === t)) return false;
      }

      return true;
    });
  }, [products, searchQuery, selectedBrand, selectedGroups, selectedTypes]);

  // Danh sách sản phẩm sau khi sắp xếp A-Z hoặc Z-A theo tiêu đề cột
  const sortedProducts = useMemo(() => {
    if (!sortConfig) return filteredProducts;

    const { key, direction } = sortConfig;
    const factor = direction === 'asc' ? 1 : -1;

    return [...filteredProducts].sort((a, b) => {
      // 1. Cột đơn giá & tài chính
      if (key === 'costPrice') {
        return ((a.pricing?.costPrice || 0) - (b.pricing?.costPrice || 0)) * factor;
      }
      if (key === 'distributorPrice') {
        return ((a.pricing?.distributorPrice || 0) - (b.pricing?.distributorPrice || 0)) * factor;
      }
      if (key === 'floorPrice') {
        return ((a.pricing?.floorPrice || 0) - (b.pricing?.floorPrice || 0)) * factor;
      }
      if (key === 'retailPrice') {
        return ((a.pricing?.retailPrice || 0) - (b.pricing?.retailPrice || 0)) * factor;
      }
      if (key === 'margin') {
        const marginA = calculateFinancials(a.pricing).grossMarginPercent;
        const marginB = calculateFinancials(b.pricing).grossMarginPercent;
        return (marginA - marginB) * factor;
      }

      // 2. Cột thông số & bảo hành
      if (key === 'specs') {
        const countA = a.specifications.reduce((sum, g) => sum + g.items.length, 0);
        const countB = b.specifications.reduce((sum, g) => sum + g.items.length, 0);
        return (countA - countB) * factor;
      }
      if (key === 'warranty') {
        return ((a.warrantyMonths || 0) - (b.warrantyMonths || 0)) * factor;
      }

      // 3. Cột chuỗi ký tự (hỗ trợ tiếng Việt A-Z chuẩn và số tự nhiên)
      let valA = '';
      let valB = '';

      if (key === 'sku') {
        valA = a.sku || '';
        valB = b.sku || '';
      } else if (key === 'name') {
        valA = a.name || '';
        valB = b.name || '';
      } else if (key === 'brand') {
        valA = a.brand || '';
        valB = b.brand || '';
      } else if (key === 'categoryGroup') {
        valA = a.categoryGroup || '';
        valB = b.categoryGroup || '';
      } else if (key === 'categoryType') {
        valA = a.categoryType || '';
        valB = b.categoryType || '';
      } else if (key === 'description') {
        valA = a.description || '';
        valB = b.description || '';
      } else if (key === 'notes') {
        valA = a.notes || '';
        valB = b.notes || '';
      } else if (key === 'status') {
        valA = a.status || '';
        valB = b.status || '';
      } else if (key === 'updatedAt') {
        valA = a.updatedAt || '';
        valB = b.updatedAt || '';
      } else if (key === 'tags') {
        valA = (a.tags || []).join(' ');
        valB = (b.tags || []).join(' ');
      }

      return valA.localeCompare(valB, 'vi', { sensitivity: 'base', numeric: true }) * factor;
    });
  }, [filteredProducts, sortConfig]);

  // Tự động quay về trang 1 khi thay đổi điều kiện tìm kiếm hoặc lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedBrand, selectedGroups, selectedTypes, sortConfig]);

  // Tổng số trang
  const totalPages = useMemo(() => {
    if (pageSize === -1) return 1;
    return Math.max(1, Math.ceil(sortedProducts.length / pageSize));
  }, [sortedProducts.length, pageSize]);

  // Đảm bảo currentPage không vượt quá totalPages
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Cắt danh sách sản phẩm theo trang hiện tại (Pagination slicing)
  const paginatedProducts = useMemo(() => {
    if (pageSize === -1) return sortedProducts;
    const start = (currentPage - 1) * pageSize;
    return sortedProducts.slice(start, start + pageSize);
  }, [sortedProducts, currentPage, pageSize]);

  // Thống kê hiển thị
  const totalFilteredCount = sortedProducts.length;
  const startIndex = totalFilteredCount === 0 ? 0 : (currentPage - 1) * (pageSize === -1 ? totalFilteredCount : pageSize) + 1;
  const endIndex = pageSize === -1 ? totalFilteredCount : Math.min(currentPage * pageSize, totalFilteredCount);

  // Sinh dãy số trang hiển thị thông minh (tối đa 5 số như trong ảnh)
  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + 4);
    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }
    const list: number[] = [];
    for (let i = start; i <= end; i++) {
      list.push(i);
    }
    return list;
  }, [currentPage, totalPages]);

  // TÍCH CHỌN HÀNG LOẠT (HỘP KIỂM CHO PHÉP CHỌN HẾT TRANG HIỆN TẠI)
  const isAllSelected =
    paginatedProducts.length > 0 &&
    paginatedProducts.every(p => selectedIds.includes(p.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      const pageIds = new Set(paginatedProducts.map(p => p.id));
      setSelectedIds(prev => prev.filter(id => !pageIds.has(id)));
      onSetCompareProducts(compareIds.filter(id => !pageIds.has(id)));
    } else {
      const pageIds = paginatedProducts.map(p => p.id);
      const combined = Array.from(new Set([...selectedIds, ...pageIds]));
      setSelectedIds(combined);
      if (compareIds.length === 0) {
        onSetCompareProducts(combined.slice(0, 5));
      }
    }
  };

  const toggleSelectRow = (id: string) => {
    const isCurrentlyIn = selectedIds.includes(id) || compareIds.includes(id);

    let nextSelected: string[];
    let nextCompare: string[];

    if (isCurrentlyIn) {
      nextSelected = selectedIds.filter(i => i !== id);
      nextCompare = compareIds.filter(i => i !== id);
    } else {
      nextSelected = [...selectedIds, id];
      // Tự động đưa vào danh sách so sánh nếu chưa đủ 5 sản phẩm
      if (compareIds.length < 5) {
        nextCompare = [...compareIds, id];
      } else {
        nextCompare = compareIds;
      }
    }

    setSelectedIds(nextSelected);
    onSetCompareProducts(nextCompare);
  };

  // MỞ NÚT SO SÁNH: ĐỦ ĐÚNG 5 SẢN PHẨM MỚI SO SÁNH
  const canCompare = compareIds.length === 5;

  const handleOpenCompareWithSelected = () => {
    if (compareIds.length !== 5) {
      alert('Vui lòng chọn đúng 5 sản phẩm để so sánh!');
      return;
    }
    onOpenCompare();
  };

  // Xóa các sản phẩm đã tích chọn
  const handleDeleteSelected = () => {
    if (
      confirm(
        `Bạn có chắc chắn muốn xóa ${selectedIds.length} sản phẩm đã chọn khỏi hệ thống không?`
      )
    ) {
      selectedIds.forEach(id => onDeleteProduct(id));
      setSelectedIds([]);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper avatar initials
  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const avatarColors = [
    'bg-blue-600',
    'bg-emerald-600',
    'bg-indigo-600',
    'bg-violet-600',
    'bg-amber-600',
    'bg-rose-600',
    'bg-teal-600',
    'bg-slate-700',
  ];

  // Lấy các cột đang hiển thị (ẩn cột giá nhập nếu showCostPrice tắt)
  const visibleColumns = useMemo(() => {
    return columns.filter(col => {
      if (!col.visible) return false;
      if (col.id === 'costPrice' && !showCostPrice) return false;
      return true;
    });
  }, [columns, showCostPrice]);

  // Vị trí left dính cho các cột được ghim
  const pinnedLeftOffsets = useMemo(() => {
    let currentLeft = 0;
    const offsets: Record<string, number> = {};
    visibleColumns.forEach(col => {
      if (col.pinned) {
        offsets[col.id] = currentLeft;
        currentLeft += col.width;
      }
    });
    return offsets;
  }, [visibleColumns]);

  // Cột ghim cuối cùng để vẽ viền/bóng đổ phân cách
  const lastPinnedColId = useMemo(() => {
    const pinned = visibleColumns.filter(c => c.pinned);
    return pinned.length > 0 ? pinned[pinned.length - 1].id : null;
  }, [visibleColumns]);

  // Tổng độ rộng của bảng dữ liệu theo cấu hình cột hiển thị
  const totalTableWidth = useMemo(() => {
    return visibleColumns.reduce((sum, col) => sum + (col.width || 120), 0);
  }, [visibleColumns]);

  // Padding & font size tương ứng với mức giãn dòng
  const cellPaddingClass = useMemo(() => {
    if (density === 'compact') return 'py-1.5 px-2.5 text-[11px]';
    if (density === 'spacious') return 'py-3.5 px-3.5 text-xs';
    return 'py-2.5 px-3 text-xs';
  }, [density]);

  // Nhóm các cột liên tiếp cho hàng tiêu đề tầng 1 (Multi-tier Grouped Header)
  interface ColumnGroupSpan {
    groupKey: ColumnGroupId;
    label: string;
    span: number;
    totalWidth: number;
    isPinned: boolean;
    leftOffset?: number;
    isLastPinned: boolean;
    columns: ColumnConfig[];
  }

  const columnGroupSpans = useMemo(() => {
    if (!isTableGroupingEnabled) return [];

    const spans: ColumnGroupSpan[] = [];
    let currentSpan: ColumnGroupSpan | null = null;

    visibleColumns.forEach(col => {
      const groupKey = col.group || getColumnGroup(col.id);
      const isPinned = Boolean(col.pinned);
      const leftOffset = isPinned ? (pinnedLeftOffsets[col.id] ?? 0) : undefined;

      if (currentSpan && currentSpan.groupKey === groupKey && currentSpan.isPinned === isPinned) {
        currentSpan.span += 1;
        currentSpan.totalWidth += col.width;
        currentSpan.columns.push(col);
        if (col.id === lastPinnedColId) {
          currentSpan.isLastPinned = true;
        }
      } else {
        currentSpan = {
          groupKey,
          label: COLUMN_GROUPS[groupKey]?.name || groupKey,
          span: 1,
          totalWidth: col.width,
          isPinned,
          leftOffset,
          isLastPinned: col.id === lastPinnedColId,
          columns: [col],
        };
        spans.push(currentSpan);
      }
    });

    return spans;
  }, [visibleColumns, isTableGroupingEnabled, pinnedLeftOffsets, lastPinnedColId]);

  return (
    <div className="w-full h-full flex flex-col min-h-0 px-3 sm:px-6 py-2.5 space-y-2.5 overflow-hidden">
      
      {/* KHUNG TRÊN: TIÊU ĐỀ + BỘ LỌC (CỐ ĐỊNH TRÊN CÙNG KHI LĂN CHUỘT) */}
      <div className="shrink-0 bg-white rounded-2xl border border-slate-200 shadow-xs relative z-30">
        
        {/* Hàng 1: Thanh công cụ lọc & Tác vụ */}
        <div className="p-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 rounded-t-2xl">
          
          {/* Vùng lọc bên trái */}
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
            {/* Nút quay lại Tổng quan / Dashboard */}
            <button
              type="button"
              onClick={onBackToHome}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-2xs cursor-pointer"
              title="Về màn hình Dashboard Tổng quan"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Tổng quan (Dashboard)</span>
            </button>

            {/* Ô tìm kiếm */}
            <div className="relative min-w-[220px] flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm theo mã SKU, tên, hãng, thông số..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Bộ lọc Nhóm: Sắp xếp A-Z + Gõ gợi ý + Checkbox chọn nhiều */}
            <SearchableFilterSelect
              label="Nhóm"
              placeholder="Tất cả Nhóm"
              multiple
              selectedValues={selectedGroups}
              onMultiChange={setSelectedGroups}
              options={categoryGroups}
              counts={groupCounts}
            />

            {/* Bộ lọc Loại: Sắp xếp A-Z + Gõ gợi ý + Checkbox chọn nhiều */}
            <SearchableFilterSelect
              label="Loại"
              placeholder="Tất cả Loại"
              multiple
              selectedValues={selectedTypes}
              onMultiChange={setSelectedTypes}
              options={categoryTypes}
              counts={typeCounts}
            />

            {/* Nút reset lọc */}
            {(searchQuery || selectedBrand || selectedGroups.length > 0 || selectedTypes.length > 0) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedBrand('');
                  setSelectedGroups([]);
                  setSelectedTypes([]);
                }}
                title="Xóa bộ lọc"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Vùng tác vụ bên phải */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* ICON NHỎ ĐIỀU CHỈNH CỘT (Cạnh nút in) + POPOVER THẢ XUỐNG CHUẨN ERP */}
            <div className="relative inline-block z-50">
              <button
                type="button"
                onClick={() => setIsColumnSettingsOpen(prev => !prev)}
                title="Tùy chọn cột & Định dạng (Sắp xếp, Ghim, Ẩn/Hiện, Căn lề, Xuống dòng, Kích thước)"
                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                  isColumnSettingsOpen
                    ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>

              {isColumnSettingsOpen && (
                <ColumnOptionsPopover
                  columns={columns}
                  onChangeColumns={handleUpdateColumns}
                  onResetDefaults={handleResetColumns}
                  density={density}
                  onDensityChange={handleUpdateDensity}
                  onClose={() => setIsColumnSettingsOpen(false)}
                  isTableGroupingEnabled={isTableGroupingEnabled}
                  onToggleTableGrouping={handleToggleTableGrouping}
                />
              )}
            </div>

            {/* In */}
            <button
              type="button"
              onClick={handlePrint}
              title="In bảng danh sách"
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Nút Nhập Excel (.xlsx, .xls, .csv) */}
            <button
              type="button"
              onClick={onOpenExcelImport ? onOpenExcelImport : () => setIsExcelImportOpen(true)}
              title="Tải lên dữ liệu sản phẩm từ file Excel (.xlsx, .xls, .csv)"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-blue-500/40 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 transition-all font-semibold text-xs cursor-pointer shadow-2xs"
            >
              <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="hidden md:inline font-medium">Nhập Excel</span>
            </button>

            {/* Xuất CSV / Excel */}
            <button
              type="button"
              onClick={onExportCatalog}
              title="Xuất bảng dữ liệu ra file Excel / CSV"
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-slate-500" />
            </button>

            {/* Chuyển đổi Bảng / Thẻ */}
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
              title={viewMode === 'table' ? 'Chuyển sang dạng Thẻ' : 'Chuyển sang dạng Bảng'}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              {viewMode === 'table' ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
            </button>

            {/* Nút + Thêm sản phẩm */}
            <button
              type="button"
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Thêm</span>
            </button>
          </div>

        </div>

        {/* Hàng 2: Thanh lọc nhanh theo Thương hiệu (Toàn bộ chiều ngang thoải mái cuộn hoặc trải rộng) */}
        <div className={`px-4 py-2 flex items-center bg-slate-50/60 ${selectedIds.length > 0 ? 'border-b border-slate-200/70' : 'rounded-b-2xl'}`}>
          {/* Danh sách chip lọc thương hiệu */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-0.5 w-full">
            {/* Nút Tất cả */}
            <button
              type="button"
              onClick={() => setSelectedBrand('')}
              className={`px-3.5 py-1.5 rounded-xl text-xs whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                !selectedBrand
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs font-medium'
              }`}
            >
              Tất cả ({brandChipsData.totalCount})
            </button>

            {/* Hết tất cả các thương hiệu trong kho */}
            {brandChipsData.allBrands.map(b => {
              const isActive = selectedBrand.toLowerCase() === b.displayName.toLowerCase();
              return (
                <button
                  key={b.displayName}
                  type="button"
                  onClick={() => setSelectedBrand(isActive ? '' : b.displayName)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs font-medium'
                  }`}
                >
                  {b.displayName} ({b.count})
                </button>
              );
            })}

            {/* Chưa có hãng (nếu có sản phẩm không điền hãng) */}
            {brandChipsData.noBrandCount > 0 && (
              <button
                type="button"
                onClick={() => setSelectedBrand(selectedBrand === '__nobrand__' ? '' : '__nobrand__')}
                className={`px-3.5 py-1.5 rounded-xl text-xs whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  selectedBrand === '__nobrand__'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs font-medium'
                }`}
              >
                Chưa có hãng ({brandChipsData.noBrandCount})
              </button>
            )}
          </div>
        </div>

        {/* Hàng 3 (DÒNG MỚI RIÊNG BIỆT): Thanh thao tác hàng loạt khi có sản phẩm được tích chọn */}
        {selectedIds.length > 0 && (
          <div className="px-4 py-2 bg-blue-50/60 flex flex-wrap items-center justify-between gap-2.5 rounded-b-2xl animate-in fade-in duration-150">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>
                Đã chọn: <strong className="text-blue-700 font-mono text-sm">{selectedIds.length}</strong> SP
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {/* Nút: Tự sửa Nhóm & Loại thủ công */}
              <button
                type="button"
                onClick={() => setIsManualCategoryModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs transition-all cursor-pointer active:scale-95"
                title="Tự sửa hoặc gán nhanh Nhóm danh mục và Loại sản phẩm cho các sản phẩm đã chọn"
              >
                <FolderEdit className="w-3.5 h-3.5 text-white" />
                <span>Sửa Nhóm & Loại ({selectedIds.length})</span>
              </button>

              {/* Nút 1: Chuẩn hóa Nhóm & Loại bằng AI */}
              <button
                type="button"
                onClick={() => setIsBatchCategoryModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition-all cursor-pointer active:scale-95"
                title="Dùng AI phân tích Tên & Mô tả để tự động sửa Nhóm danh mục và Loại sản phẩm cho các sản phẩm đã chọn"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>AI Phân loại ({selectedIds.length})</span>
              </button>

              {/* Nút 2: Bóc tách thông số kỹ thuật bằng AI */}
              <button
                type="button"
                onClick={() => setIsBatchSpecsModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-2xs transition-all cursor-pointer active:scale-95"
                title="Dùng AI trích xuất bảng thông số kỹ thuật cho các sản phẩm đã chọn"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>AI Bóc tách ({selectedIds.length})</span>
              </button>

              {selectedIds.length > 5 && (
                <button
                  type="button"
                  onClick={() => {
                    onSetCompareProducts(selectedIds.slice(0, 5));
                  }}
                  className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer px-1 py-0.5"
                  title="Đưa 5 sản phẩm đầu tiên được chọn vào so sánh"
                >
                  Đưa 5 SP đầu vào so sánh
                </button>
              )}

              {canCompare && (
                <button
                  type="button"
                  onClick={onOpenCompare}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>So sánh 5 SP</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setSelectedIds([]);
                  onSetCompareProducts([]);
                }}
                className="text-xs text-slate-500 hover:text-slate-800 hover:underline font-medium cursor-pointer px-1 py-0.5"
              >
                Bỏ chọn
              </button>

              <button
                type="button"
                onClick={handleDeleteSelected}
                className="text-xs text-red-600 hover:underline font-medium cursor-pointer px-1 py-0.5"
              >
                Xóa ({selectedIds.length})
              </button>
            </div>
          </div>
        )}

      </div>

      {/* KHUNG DƯỚI: DANH SÁCH SẢN PHẨM (BẢNG DỮ LIỆU FULL WIDTH + CỐ ĐỊNH TIÊU ĐỀ CỘT KHI LĂN) */}
      {viewMode === 'table' ? (
        <div className="w-full flex-1 min-h-0 flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs relative z-10">
          <div className="w-full flex-1 min-h-0 overflow-auto custom-scrollbar">
            <table
              style={{ width: `${totalTableWidth}px`, minWidth: '100%' }}
              className="table-fixed text-left text-xs border-collapse"
            >
              
              {/* Header bảng dữ liệu cố định trên cùng khi lăn chuột */}
              <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold select-none shadow-[0_1px_2px_0_rgba(0,0,0,0.06)]">
                {/* TẦNG 1: TIÊU ĐỀ GỘP NHÓM CỘT (KHI BẬT CHẾ ĐỘ NHÓM BẢNG) */}
                {isTableGroupingEnabled && (
                  <tr className="border-b border-slate-200/90 h-[34px]">
                    {columnGroupSpans.map((gSpan, idx) => {
                      const style = GROUP_HEADER_STYLES[gSpan.groupKey] || GROUP_HEADER_STYLES.details;
                      const Icon = style.icon;

                      return (
                        <th
                          key={`group-${gSpan.groupKey}-${idx}`}
                          colSpan={gSpan.span}
                          style={{
                            top: 0,
                            ...(gSpan.isPinned ? { left: `${gSpan.leftOffset}px` } : {}),
                          }}
                          className={`h-[34px] py-1 px-2.5 text-[11px] font-bold select-none text-center sticky top-0 border-r ${
                            gSpan.isPinned
                              ? `z-35 ${style.bg} backdrop-blur-xs ${
                                  gSpan.isLastPinned
                                    ? 'border-r-2 border-r-slate-400 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.15)]'
                                    : style.border
                                }`
                              : `z-25 ${style.bg} ${style.border}`
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1.5 truncate">
                            <Icon className="w-3.5 h-3.5 shrink-0 opacity-80" />
                            <span className={`uppercase tracking-wider font-bold truncate ${style.text}`}>
                              {gSpan.label}
                            </span>
                            {gSpan.span > 1 && (
                              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${style.badgeBg} ${style.badgeText}`}>
                                {gSpan.span}
                              </span>
                            )}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                )}

                {/* TẦNG 2: TIÊU ĐỀ CHI TIẾT TỪNG CỘT (SẮP XẾP A-Z, KÉO RỘNG, GHIM) */}
                <tr>
                  {visibleColumns.map(col => {
                    const isPinned = col.pinned;
                    const isLastPinned = col.id === lastPinnedColId;
                    const leftOffset = isPinned ? (pinnedLeftOffsets[col.id] ?? 0) : undefined;
                    const alignClass =
                      col.align === 'center'
                        ? 'text-center'
                        : col.align === 'right'
                        ? 'text-right'
                        : 'text-left';

                    if (col.id === 'checkbox') {
                      return (
                        <th
                          key={col.id}
                          style={{
                            width: `${col.width}px`,
                            minWidth: `${col.width}px`,
                            maxWidth: `${col.width}px`,
                            top: isTableGroupingEnabled ? '34px' : 0,
                            ...(isPinned ? { left: `${leftOffset}px` } : {}),
                          }}
                          className={`${cellPaddingClass} w-12 text-center relative group select-none sticky z-30 bg-slate-100/95 backdrop-blur-xs border-r border-slate-200 last:border-r-0`}
                        >
                          <input
                            type="checkbox"
                            checked={isAllSelected}
                            onChange={toggleSelectAll}
                            title="Chọn tất cả trên trang này / Bỏ chọn"
                            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                          />
                          {/* Tay cầm kéo độ rộng cột */}
                          <div
                            onMouseDown={e => handleStartResize(col.id, e)}
                            title="Kéo sang trái/phải để chỉnh độ rộng cột"
                            className="absolute right-0 top-0 bottom-0 w-2.5 cursor-col-resize hover:bg-blue-500/60 group-hover:bg-slate-300 transition-colors z-30"
                          />
                        </th>
                      );
                    }

                    const isSortable = !['checkbox', 'thumbnail', 'actions'].includes(col.id);
                    const isCurrentSorted = sortConfig?.key === col.id;
                    const sortDirection = isCurrentSorted ? sortConfig.direction : null;

                    return (
                      <th
                        key={col.id}
                        style={{
                          width: `${col.width}px`,
                          minWidth: `${col.width}px`,
                          maxWidth: `${col.width}px`,
                          top: isTableGroupingEnabled ? '34px' : 0,
                          ...(isPinned ? { left: `${leftOffset}px` } : {}),
                        }}
                        className={`${cellPaddingClass} relative group select-none ${alignClass} sticky ${
                          isPinned
                            ? `z-30 bg-slate-100/95 backdrop-blur-xs ${
                                isLastPinned ? 'border-r border-slate-300 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.12)]' : ''
                              }`
                            : 'z-20 bg-slate-50/95'
                        } border-r border-slate-200 last:border-r-0 ${isSortable ? 'cursor-pointer hover:bg-slate-100/90 transition-colors' : ''}`}
                        onClick={isSortable ? () => handleSort(col.id) : undefined}
                        title={
                          isSortable
                            ? isCurrentSorted
                              ? sortDirection === 'asc'
                                ? `Đang sắp xếp A-Z (click để đổi sang Z-A)`
                                : `Đang sắp xếp Z-A (click để bỏ sắp xếp)`
                              : `Click vào tiêu đề để sắp xếp A-Z`
                            : undefined
                        }
                      >
                        <div className={`flex items-center gap-1.5 ${col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'}`}>
                          <span className={`truncate font-semibold ${isCurrentSorted ? 'text-blue-600 font-bold' : 'text-slate-700'}`}>
                            {col.label}
                          </span>

                          {/* Biểu tượng sắp xếp A-Z / Z-A */}
                          {isSortable && (
                            <span className="shrink-0 transition-all">
                              {isCurrentSorted ? (
                                sortDirection === 'asc' ? (
                                  <ArrowUp className="w-3.5 h-3.5 text-blue-600 stroke-[2.5]" />
                                ) : (
                                  <ArrowDown className="w-3.5 h-3.5 text-blue-600 stroke-[2.5]" />
                                )
                              ) : (
                                <ChevronsUpDown className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                              )}
                            </span>
                          )}
                        </div>

                        {/* TAY CẦM KÉO CHỈNH KÍCH THƯỚC CỘT TRỰC TIẾP TRÊN WEB */}
                        <div
                          onMouseDown={e => {
                            e.stopPropagation();
                            handleStartResize(col.id, e);
                          }}
                          title="Kéo sang trái/phải để chỉnh độ rộng cột trực tiếp"
                          className="absolute right-0 top-0 bottom-0 w-2.5 cursor-col-resize hover:bg-blue-500/60 group-hover:bg-slate-300 transition-colors z-30"
                        />
                      </th>
                    );
                  })}
                </tr>
              </thead>

              {/* Dòng dữ liệu sản phẩm có đường kẻ dọc và ngang rõ ràng */}
              <tbody className="divide-y divide-slate-200">
                {paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={visibleColumns.length} className="py-12 text-center text-slate-400">
                      Không tìm thấy sản phẩm nào khớp với tiêu chí tìm kiếm
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((prod, idx) => {
                    const financials = calculateFinancials(prod.pricing);
                    const isSelected = selectedIds.includes(prod.id);
                    const globalIdx = (currentPage - 1) * (pageSize === -1 ? 0 : pageSize) + idx;
                    const colorBg = avatarColors[globalIdx % avatarColors.length];
                    const totalSpecsCount = prod.specifications.reduce((a, b) => a + b.items.length, 0);

                    return (
                      <tr
                        key={prod.id}
                        className={`transition-colors ${
                          isSelected ? 'bg-blue-50/40 hover:bg-blue-50/70 font-medium' : 'hover:bg-slate-50/80'
                        }`}
                      >
                        {visibleColumns.map(col => {
                          const isPinned = col.pinned;
                          const isLastPinned = col.id === lastPinnedColId;
                          const leftOffset = isPinned ? (pinnedLeftOffsets[col.id] ?? 0) : undefined;
                          const alignClass =
                            col.align === 'center'
                              ? 'text-center'
                              : col.align === 'right'
                              ? 'text-right'
                              : 'text-left';
                          const wrapClass = col.wrap ? 'whitespace-normal break-words leading-relaxed' : 'truncate whitespace-nowrap block max-w-full';

                          const stickyClass = isPinned
                            ? `sticky z-10 ${isSelected ? 'bg-blue-50/95' : 'bg-white'} ${
                                isLastPinned ? 'border-r border-slate-300 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.12)]' : ''
                              }`
                            : '';

                          const cellBaseClass = `${cellPaddingClass} ${alignClass} ${stickyClass} border-r border-slate-200/80 last:border-r-0 align-top`;
                          const cellStyle: React.CSSProperties = {
                            width: `${col.width}px`,
                            minWidth: `${col.width}px`,
                            maxWidth: `${col.width}px`,
                            ...(isPinned ? { left: `${leftOffset}px` } : {}),
                          };

                          // 1. Checkbox
                          if (col.id === 'checkbox') {
                            const isCompared = compareIds.includes(prod.id);
                            const isChecked = selectedIds.includes(prod.id) || isCompared;
                            return (
                              <td key={col.id} style={cellStyle} className={cellBaseClass}>
                                <div className="flex items-center justify-center">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => toggleSelectRow(prod.id)}
                                    title="Tích chọn để đưa vào so sánh & thao tác"
                                    className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                                  />
                                </div>
                              </td>
                            );
                          }

                          // 2. Thumbnail: Click vào ảnh xem ảnh mở rộng (Lightbox Zoom)
                          if (col.id === 'thumbnail') {
                            return (
                              <td key={col.id} style={cellStyle} className={cellBaseClass}>
                                <div className="flex items-center justify-center">
                                  {prod.thumbnail ? (
                                    <div
                                      className="relative group/thumb cursor-zoom-in"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setZoomProduct(prod);
                                      }}
                                      title="Click để xem ảnh mở rộng"
                                    >
                                      <img
                                        src={prod.thumbnail}
                                        alt={prod.name}
                                        loading="lazy"
                                        decoding="async"
                                        className="w-8 h-8 object-cover rounded-lg border border-slate-200 shadow-2xs group-hover/thumb:scale-110 transition-transform bg-white"
                                        onError={e => {
                                          const imgEl = e.currentTarget as HTMLImageElement;
                                          imgEl.onerror = null;
                                          imgEl.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Crect width="18" height="18" x="3" y="3" rx="2"/%3E%3Cpath d="M3 9h18"/%3E%3Cpath d="M9 21V9"/%3E%3C/svg%3E';
                                        }}
                                      />
                                      <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                                        <ZoomIn className="w-3.5 h-3.5 text-white" />
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-[9px]">
                                      N/A
                                    </div>
                                  )}
                                </div>
                              </td>
                            );
                          }

                          // 3. Name (Đã xóa avatar chữ cái đầu theo yêu cầu)
                          if (col.id === 'name') {
                            return (
                              <td key={col.id} style={cellStyle} className={cellBaseClass}>
                                <span
                                  onClick={() => onViewDetail(prod)}
                                  className={`font-bold text-slate-900 hover:text-blue-600 cursor-pointer ${
                                    col.wrap
                                      ? 'whitespace-normal break-words leading-snug block'
                                      : 'truncate whitespace-nowrap block'
                                  }`}
                                >
                                  {prod.name}
                                </span>
                              </td>
                            );
                          }

                          // 4. SKU
                          if (col.id === 'sku') {
                            return (
                              <td key={col.id} style={cellStyle} className={cellBaseClass}>
                                <span
                                  className={`font-mono font-bold text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 inline-block max-w-full ${
                                    col.wrap ? 'whitespace-normal break-all' : 'truncate whitespace-nowrap'
                                  }`}
                                >
                                  {prod.sku}
                                </span>
                              </td>
                            );
                          }

                          // 5. Brand
                          if (col.id === 'brand') {
                            return (
                              <td key={col.id} style={cellStyle} className={cellBaseClass}>
                                <div
                                  className={`font-semibold text-slate-800 text-xs ${
                                    col.wrap ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap block max-w-full'
                                  }`}
                                >
                                  {prod.brand || '—'}
                                </div>
                              </td>
                            );
                          }

                          // 6. Category Group (Hỗ trợ nhấp đúp để tự sửa trực tiếp trên bảng)
                          if (col.id === 'categoryGroup') {
                            const isEditing = inlineEditingCell?.productId === prod.id && inlineEditingCell.field === 'categoryGroup';
                            return (
                              <td key={col.id} style={cellStyle} className={`${cellBaseClass} text-xs text-slate-700`}>
                                {isEditing ? (
                                  <input
                                    autoFocus
                                    defaultValue={prod.categoryGroup || ''}
                                    list="table-category-groups"
                                    onKeyDown={e => {
                                      if (e.key === 'Enter') {
                                        handleUpdateSingleField(prod.id, 'categoryGroup', e.currentTarget.value);
                                        setInlineEditingCell(null);
                                      } else if (e.key === 'Escape') {
                                        setInlineEditingCell(null);
                                      }
                                    }}
                                    onBlur={e => {
                                      handleUpdateSingleField(prod.id, 'categoryGroup', e.currentTarget.value);
                                      setInlineEditingCell(null);
                                    }}
                                    className="w-full px-1.5 py-0.5 text-xs rounded border border-blue-500 bg-white shadow-xs focus:outline-none"
                                  />
                                ) : (
                                  <div
                                    onDoubleClick={() => setInlineEditingCell({ productId: prod.id, field: 'categoryGroup' })}
                                    title="Nhấp đúp để sửa nhanh Nhóm danh mục"
                                    className={`group/cat flex items-center justify-between cursor-pointer hover:text-blue-600 ${
                                      col.wrap ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap block max-w-full'
                                    }`}
                                  >
                                    <span>{prod.categoryGroup || '—'}</span>
                                    <Edit2 className="w-3 h-3 text-slate-300 opacity-0 group-hover/cat:opacity-100 ml-1 shrink-0" />
                                  </div>
                                )}
                              </td>
                            );
                          }

                          // 7. Category Type (Hỗ trợ nhấp đúp để tự sửa trực tiếp trên bảng)
                          if (col.id === 'categoryType') {
                            const isEditing = inlineEditingCell?.productId === prod.id && inlineEditingCell.field === 'categoryType';
                            return (
                              <td key={col.id} style={cellStyle} className={`${cellBaseClass} text-xs text-slate-600`}>
                                {isEditing ? (
                                  <input
                                    autoFocus
                                    defaultValue={prod.categoryType || ''}
                                    list="table-category-types"
                                    onKeyDown={e => {
                                      if (e.key === 'Enter') {
                                        handleUpdateSingleField(prod.id, 'categoryType', e.currentTarget.value);
                                        setInlineEditingCell(null);
                                      } else if (e.key === 'Escape') {
                                        setInlineEditingCell(null);
                                      }
                                    }}
                                    onBlur={e => {
                                      handleUpdateSingleField(prod.id, 'categoryType', e.currentTarget.value);
                                      setInlineEditingCell(null);
                                    }}
                                    className="w-full px-1.5 py-0.5 text-xs rounded border border-blue-500 bg-white shadow-xs focus:outline-none"
                                  />
                                ) : (
                                  <div
                                    onDoubleClick={() => setInlineEditingCell({ productId: prod.id, field: 'categoryType' })}
                                    title="Nhấp đúp để sửa nhanh Loại sản phẩm"
                                    className={`group/cat flex items-center justify-between cursor-pointer hover:text-blue-600 ${
                                      col.wrap ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap block max-w-full'
                                    }`}
                                  >
                                    <span>{prod.categoryType || '—'}</span>
                                    <Edit2 className="w-3 h-3 text-slate-300 opacity-0 group-hover/cat:opacity-100 ml-1 shrink-0" />
                                  </div>
                                )}
                              </td>
                            );
                          }

                          // Fallback Legacy Category
                          if (col.id === 'category') {
                            return (
                              <td key={col.id} style={cellStyle} className={`${cellBaseClass} text-[11px] text-slate-600`}>
                                <div className={`font-medium text-slate-800 ${wrapClass}`}>{prod.categoryGroup}</div>
                                <div className={`text-[10px] text-slate-400 ${wrapClass}`}>{prod.categoryType}</div>
                              </td>
                            );
                          }

                          // 8. Warranty Months
                          if (col.id === 'warrantyMonths') {
                            return (
                              <td key={col.id} style={cellStyle} className={cellBaseClass}>
                                <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                  {prod.warrantyMonths ? `${prod.warrantyMonths} th` : '12 th'}
                                </span>
                              </td>
                            );
                          }

                          // 9. Cost price
                          if (col.id === 'costPrice') {
                            return (
                              <td key={col.id} style={cellStyle} className={`${cellBaseClass} font-mono font-semibold text-emerald-700`}>
                                {formatVND(prod.pricing.costPrice)}
                              </td>
                            );
                          }

                          // 10. Distributor price
                          if (col.id === 'distributorPrice') {
                            return (
                              <td key={col.id} style={cellStyle} className={`${cellBaseClass} font-mono font-bold text-blue-900`}>
                                {formatVND(prod.pricing.distributorPrice)}
                              </td>
                            );
                          }

                          // 11. Floor price
                          if (col.id === 'floorPrice') {
                            return (
                              <td key={col.id} style={cellStyle} className={`${cellBaseClass} font-mono text-amber-800`}>
                                {formatVND(prod.pricing.floorPrice)}
                              </td>
                            );
                          }

                          // 12. Retail price
                          if (col.id === 'retailPrice') {
                            return (
                              <td key={col.id} style={cellStyle} className={`${cellBaseClass} font-mono font-bold text-slate-900`}>
                                {formatVND(prod.pricing.retailPrice)}
                              </td>
                            );
                          }

                          // 13. Margin
                          if (col.id === 'margin') {
                            return (
                              <td key={col.id} style={cellStyle} className={`${cellBaseClass} font-mono`}>
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold inline-block ${
                                    financials.nppMarginPercent >= 20
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  +{financials.nppMarginPercent}%
                                </span>
                              </td>
                            );
                          }

                          // 14. Description (Mô tả sản phẩm)
                          if (col.id === 'description') {
                            return (
                              <td key={col.id} style={cellStyle} className={cellBaseClass}>
                                <div
                                  className={`text-xs text-slate-600 cursor-pointer ${
                                    col.wrap
                                      ? 'whitespace-normal break-words leading-relaxed'
                                      : 'truncate whitespace-nowrap block max-w-full'
                                  }`}
                                  title={prod.description || 'Chưa có mô tả'}
                                  onClick={() => onViewDetail(prod)}
                                >
                                  {prod.description || <span className="text-slate-300 italic">Chưa có mô tả</span>}
                                </div>
                              </td>
                            );
                          }

                          // 15. Specs (Thông số kỹ thuật)
                          if (col.id === 'specs') {
                            const specsSummary = prod.specifications
                              .map(g => `${g.groupName}: ${g.items.map(i => `${i.key} ${i.value}`).join(', ')}`)
                              .join(' | ');

                            return (
                              <td key={col.id} style={cellStyle} className={cellBaseClass}>
                                <div
                                  className="text-xs text-slate-700 cursor-pointer"
                                  onClick={() => onViewDetail(prod)}
                                  title={specsSummary || 'Xem chi tiết thông số'}
                                >
                                  {prod.specifications.length > 0 ? (
                                    col.wrap ? (
                                      <div className="space-y-1">
                                        <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 inline-block mr-1">
                                          {prod.specifications.length} nhóm ({totalSpecsCount} mục)
                                        </span>
                                        <div className="text-[11px] text-slate-600 whitespace-normal break-words leading-relaxed space-y-0.5">
                                          {prod.specifications.slice(0, 3).map((group, gIdx) => (
                                            <div key={gIdx} className="text-[11px]">
                                              <span className="font-semibold text-slate-700">{group.groupName}: </span>
                                              <span>{group.items.slice(0, 3).map(it => `${it.key}: ${it.value}`).join(', ')}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-1.5 truncate max-w-full">
                                        <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 shrink-0">
                                          {prod.specifications.length} nhóm
                                        </span>
                                        <span className="text-[11px] text-slate-600 truncate whitespace-nowrap block">
                                          {prod.specifications[0]?.items.slice(0, 2).map(it => `${it.key}: ${it.value}`).join(' • ')}
                                        </span>
                                      </div>
                                    )
                                  ) : (
                                    <span className="text-slate-300 italic text-[11px]">Chưa bóc tách</span>
                                  )}
                                </div>
                              </td>
                            );
                          }

                          // 16. Tags
                          if (col.id === 'tags') {
                            return (
                              <td key={col.id} style={cellStyle} className={cellBaseClass}>
                                <div
                                  className={`gap-1 ${
                                    col.wrap
                                      ? 'flex flex-wrap leading-normal'
                                      : 'flex flex-nowrap overflow-hidden max-w-full'
                                  }`}
                                >
                                  {prod.tags && prod.tags.length > 0 ? (
                                    prod.tags.map((t, tidx) => (
                                      <span
                                        key={tidx}
                                        className={`text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200/80 px-1.5 py-0.5 rounded ${
                                          !col.wrap ? 'truncate shrink-0' : ''
                                        }`}
                                      >
                                        {t}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-slate-300">—</span>
                                  )}
                                </div>
                              </td>
                            );
                          }

                          // 17. Notes
                          if (col.id === 'notes') {
                            return (
                              <td key={col.id} style={cellStyle} className={cellBaseClass}>
                                <div
                                  className={`text-xs text-slate-500 italic ${
                                    col.wrap
                                      ? 'whitespace-normal break-words leading-relaxed'
                                      : 'truncate whitespace-nowrap block max-w-full'
                                  }`}
                                  title={prod.notes}
                                >
                                  {prod.notes || '—'}
                                </div>
                              </td>
                            );
                          }

                          // 18. Status
                          if (col.id === 'status') {
                            const isAvailable = prod.status === 'active' || !prod.status;
                            return (
                              <td key={col.id} style={cellStyle} className={cellBaseClass}>
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                    isAvailable
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                                  }`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                  {isAvailable ? 'Kinh doanh' : 'Hết hàng'}
                                </span>
                              </td>
                            );
                          }

                          // 19. Updated At
                          if (col.id === 'updatedAt') {
                            return (
                              <td key={col.id} style={cellStyle} className={cellBaseClass}>
                                <span className="text-slate-500 text-xs font-mono">
                                  {prod.updatedAt || '—'}
                                </span>
                              </td>
                            );
                          }

                          // 20. Actions
                          if (col.id === 'actions') {
                            const isCompared = compareIds.includes(prod.id);
                            return (
                              <td key={col.id} style={cellStyle} className={cellBaseClass}>
                                <div className="flex items-center justify-center gap-1">
                                  {/* Nút thêm/bỏ so sánh trực tiếp */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (isCompared) {
                                        onSetCompareProducts(compareIds.filter(id => id !== prod.id));
                                        setSelectedIds(prev => prev.filter(id => id !== prod.id));
                                      } else {
                                        if (compareIds.length >= 5) {
                                          alert('Đã chọn tối đa 5 sản phẩm để so sánh!');
                                          return;
                                        }
                                        const next = [...compareIds, prod.id];
                                        onSetCompareProducts(next);
                                        setSelectedIds(prev => [...new Set([...prev, prod.id])]);
                                      }
                                    }}
                                    title={isCompared ? 'Bỏ khỏi danh sách so sánh' : 'Thêm vào so sánh (Tối đa 5)'}
                                    className={`p-1 rounded-md transition-all cursor-pointer ${
                                      isCompared
                                        ? 'bg-blue-600 text-white shadow-2xs ring-1 ring-blue-500'
                                        : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'
                                    }`}
                                  >
                                    <Scale className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Chi tiết */}
                                  <button
                                    type="button"
                                    onClick={() => onViewDetail(prod)}
                                    title="Xem chi tiết sản phẩm"
                                    className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Chỉnh sửa */}
                                  <button
                                    type="button"
                                    onClick={() => onEditProduct(prod)}
                                    title="Chỉnh sửa sản phẩm"
                                    className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Xóa */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm(`Bạn có chắc chắn muốn xóa sản phẩm ${prod.name}?`)) {
                                        onDeleteProduct(prod.id);
                                      }
                                    }}
                                    title="Xóa sản phẩm"
                                    className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            );
                          }

                          return null;
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>

            </table>
          </div>

          {/* Phân trang chân bảng chuẩn theo thiết kế */}
          <div className="shrink-0 px-4 py-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 bg-slate-50/95 select-none">
            {/* Bên trái: Hiển thị 1 - 100 / 3.721 dòng | Cỡ trang: [ 100 dòng  v ] */}
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
              <div className="flex items-center gap-1 text-slate-600">
                <span>Hiển thị</span>
                <strong className="text-slate-900 font-bold">
                  {totalFilteredCount === 0 ? '0 - 0' : `${startIndex} - ${endIndex}`}
                </strong>
                <span>/</span>
                <strong className="text-slate-900 font-bold">
                  {totalFilteredCount.toLocaleString('vi-VN')}
                </strong>
                <span>dòng</span>
              </div>

              <span className="text-slate-300">|</span>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-600">Cỡ trang:</span>
                <div className="relative inline-block">
                  <select
                    value={pageSize}
                    onChange={e => handlePageSizeChange(Number(e.target.value))}
                    className="appearance-none bg-white border border-slate-200 hover:border-slate-300 rounded-lg pl-2.5 pr-7 py-1 text-xs font-semibold text-slate-800 shadow-2xs focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value={20}>20 dòng</option>
                    <option value={50}>50 dòng</option>
                    <option value={100}>100 dòng</option>
                    <option value={200}>200 dòng</option>
                    <option value={500}>500 dòng</option>
                    <option value={-1}>Tất cả</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Bên phải: [ Trang  <<  <  1  2  3  4  5  >  >> ] */}
            <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white shadow-2xs overflow-hidden text-xs">
              <span className="px-2.5 py-1 text-slate-600 font-medium bg-slate-50/70 border-r border-slate-200">
                Trang
              </span>

              {/* Nút << */}
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage <= 1}
                title="Trang đầu tiên"
                className="px-2 py-1 text-slate-500 hover:text-slate-900 hover:bg-slate-50 border-r border-slate-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer font-bold"
              >
                &laquo;
              </button>

              {/* Nút < */}
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage <= 1}
                title="Trang trước"
                className="px-2 py-1 text-slate-500 hover:text-slate-900 hover:bg-slate-50 border-r border-slate-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer font-bold"
              >
                &lsaquo;
              </button>

              {/* Danh sách các số trang */}
              {pageNumbers.map(page => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 font-semibold border-r border-slate-200 transition-colors cursor-pointer ${
                    currentPage === page
                      ? 'bg-blue-50 text-blue-600 font-bold'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600'
                  }`}
                >
                  {page}
                </button>
              ))}

              {/* Nút > */}
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage >= totalPages}
                title="Trang sau"
                className="px-2 py-1 text-slate-500 hover:text-slate-900 hover:bg-slate-50 border-r border-slate-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer font-bold"
              >
                &rsaquo;
              </button>

              {/* Nút >> */}
              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage >= totalPages}
                title="Trang cuối cùng"
                className="px-2 py-1 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer font-bold"
              >
                &raquo;
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Dạng thẻ Cards */
        <div className="w-full flex-1 min-h-0 flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs relative z-10">
          <div className="flex-1 min-h-0 overflow-y-auto p-4 custom-scrollbar">
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {paginatedProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isSelectedForCompare={compareIds.includes(product.id)}
                  onToggleCompare={() => toggleSelectRow(product.id)}
                  onViewDetail={onViewDetail}
                  onEditProduct={onEditProduct}
                  showCostPrice={showCostPrice}
                  onZoomImage={setZoomProduct}
                />
              ))}
            </div>
          </div>

          {/* Phân trang chân bảng cho dạng thẻ */}
          <div className="shrink-0 px-4 py-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 bg-slate-50/95 select-none">
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
              <div className="flex items-center gap-1 text-slate-600">
                <span>Hiển thị</span>
                <strong className="text-slate-900 font-bold">
                  {totalFilteredCount === 0 ? '0 - 0' : `${startIndex} - ${endIndex}`}
                </strong>
                <span>/</span>
                <strong className="text-slate-900 font-bold">
                  {totalFilteredCount.toLocaleString('vi-VN')}
                </strong>
                <span>dòng</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-600">Cỡ trang:</span>
                <div className="relative inline-block">
                  <select
                    value={pageSize}
                    onChange={e => handlePageSizeChange(Number(e.target.value))}
                    className="appearance-none bg-white border border-slate-200 hover:border-slate-300 rounded-lg pl-2.5 pr-7 py-1 text-xs font-semibold text-slate-800 shadow-2xs focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value={20}>20 dòng</option>
                    <option value={50}>50 dòng</option>
                    <option value={100}>100 dòng</option>
                    <option value={200}>200 dòng</option>
                    <option value={500}>500 dòng</option>
                    <option value={-1}>Tất cả</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white shadow-2xs overflow-hidden text-xs">
              <span className="px-2.5 py-1 text-slate-600 font-medium bg-slate-50/70 border-r border-slate-200">
                Trang
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage <= 1}
                title="Trang đầu tiên"
                className="px-2 py-1 text-slate-500 hover:text-slate-900 hover:bg-slate-50 border-r border-slate-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer font-bold"
              >
                &laquo;
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage <= 1}
                title="Trang trước"
                className="px-2 py-1 text-slate-500 hover:text-slate-900 hover:bg-slate-50 border-r border-slate-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer font-bold"
              >
                &lsaquo;
              </button>
              {pageNumbers.map(page => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 font-semibold border-r border-slate-200 transition-colors cursor-pointer ${
                    currentPage === page
                      ? 'bg-blue-50 text-blue-600 font-bold'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage >= totalPages}
                title="Trang sau"
                className="px-2 py-1 text-slate-500 hover:text-slate-900 hover:bg-slate-50 border-r border-slate-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer font-bold"
              >
                &rsaquo;
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage >= totalPages}
                title="Trang cuối cùng"
                className="px-2 py-1 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer font-bold"
              >
                &raquo;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* THANH TÁC VỤ HÀNG LOẠT NỔI Ở ĐÁY MÀN HÌNH (FLOATING BULK BAR CHUẨN ERP) */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 text-white backdrop-blur-md shadow-2xl rounded-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 border border-slate-700/80 animate-in slide-in-from-bottom duration-200 max-w-[95vw]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-semibold">
              Đã chọn <strong className="text-blue-400 font-mono text-sm">{selectedIds.length}</strong> sản phẩm
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsManualCategoryModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
              title="Tự sửa hoặc gán nhanh Nhóm danh mục & Loại sản phẩm"
            >
              <FolderEdit className="w-3.5 h-3.5 text-white" />
              <span>Sửa Nhóm & Loại</span>
            </button>

            <button
              type="button"
              onClick={() => setIsBatchCategoryModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
              title="Dùng AI chuẩn hóa Nhóm danh mục & Loại sản phẩm"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>AI Phân loại danh mục</span>
            </button>

            <button
              type="button"
              onClick={() => setIsBatchSpecsModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
              title="Dùng AI trích xuất bảng thông số kỹ thuật hàng loạt"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>AI Bóc tách thông số</span>
            </button>

            {canCompare && (
              <button
                type="button"
                onClick={onOpenCompare}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>So sánh ngay</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setSelectedIds([]);
                onSetCompareProducts([]);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
            >
              Bỏ chọn
            </button>
          </div>
        </div>
      )}

      {/* MODAL LIÊN KẾT & ĐỒNG BỘ GOOGLE SHEET */}
      <GoogleSheetsSyncModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
        products={products}
        onUpdateProducts={onUpdateProducts || (() => {})}
      />

      {/* MODAL PHÂN LOẠI DANH MỤC HÀNG LOẠT BẰNG AI */}
      <BatchCategoryModal
        isOpen={isBatchCategoryModalOpen}
        onClose={() => setIsBatchCategoryModalOpen(false)}
        selectedProducts={selectedProducts}
        allProducts={products}
        onUpdateProducts={onUpdateProducts || (() => {})}
      />

      {/* MODAL TỰ SỬA THỦ CÔNG NHÓM & LOẠI SẢN PHẨM HÀNG LOẠT */}
      <BatchManualCategoryModal
        isOpen={isManualCategoryModalOpen}
        onClose={() => setIsManualCategoryModalOpen(false)}
        selectedProducts={selectedProducts}
        allProducts={products}
        onUpdateProducts={onUpdateProducts || (() => {})}
      />

      {/* Datalist gợi ý cho việc sửa nhanh trực tiếp tại bảng */}
      <datalist id="table-category-groups">
        {categoryGroups.map(g => (
          <option key={g} value={g} />
        ))}
      </datalist>
      <datalist id="table-category-types">
        {categoryTypes.map(t => (
          <option key={t} value={t} />
        ))}
      </datalist>

      {/* MODAL BÓC TÁCH THÔNG SỐ HÀNG LOẠT BẰNG AI */}
      <BatchSpecsModal
        isOpen={isBatchSpecsModalOpen}
        onClose={() => setIsBatchSpecsModalOpen(false)}
        selectedProducts={selectedProducts}
        allProducts={products}
        onUpdateProducts={onUpdateProducts || (() => {})}
      />

      {/* MODAL NHẬP DỮ LIỆU SẢN PHẨM TỪ EXCEL (.XLSX, .XLS, .CSV) */}
      {!onOpenExcelImport && (
        <ExcelImportModal
          isOpen={isExcelImportOpen}
          onClose={() => setIsExcelImportOpen(false)}
          currentProducts={products}
          onImportProducts={newProducts => {
            if (onUpdateProducts) {
              onUpdateProducts(newProducts);
            }
          }}
          showCostPrice={showCostPrice}
        />
      )}

      {/* LIGHTBOX MODAL: XEM ẢNH LỚN MỞ RỘNG KHI CLICK VÀO ẢNH */}
      <ProductImageLightboxModal
        product={zoomProduct}
        onClose={() => setZoomProduct(null)}
        onViewDetail={onViewDetail}
        showCostPrice={showCostPrice}
      />

    </div>
  );
};
