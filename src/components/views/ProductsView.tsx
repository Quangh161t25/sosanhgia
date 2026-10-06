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
} from 'lucide-react';
import { Product } from '../../types/product';
import { ProductCard } from '../ProductCard';
import { calculateFinancials, formatVND } from '../../utils/pricing';
import { ColumnConfig } from './ColumnSettingsModal';
import { ColumnOptionsPopover, TableDensity } from './ColumnOptionsPopover';
import { GoogleSheetsSyncModal } from '../GoogleSheetsSyncModal';
import { ExcelImportModal } from '../ExcelImportModal';
import { BatchCategoryModal } from '../modals/BatchCategoryModal';
import { BatchSpecsModal } from '../modals/BatchSpecsModal';

const COLUMN_STORAGE_KEY = 'procompare_table_columns_v6';
const DENSITY_STORAGE_KEY = 'procompare_table_density';
const PAGE_SIZE_STORAGE_KEY = 'procompare_page_size';

export const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'checkbox', label: 'Hộp kiểm', visible: true, pinned: true, align: 'center', wrap: false, width: 48 },
  { id: 'thumbnail', label: 'Hình ảnh', visible: true, pinned: false, align: 'center', wrap: false, width: 68 },
  { id: 'sku', label: 'Mã SKU / Modul', visible: true, pinned: false, align: 'left', wrap: false, width: 120 },
  { id: 'name', label: 'Tên sản phẩm', visible: true, pinned: false, align: 'left', wrap: true, width: 250 },
  { id: 'brand', label: 'Thương hiệu', visible: true, pinned: false, align: 'left', wrap: false, width: 120 },
  { id: 'categoryGroup', label: 'Nhóm danh mục', visible: true, pinned: false, align: 'left', wrap: false, width: 130 },
  { id: 'categoryType', label: 'Loại sản phẩm', visible: true, pinned: false, align: 'left', wrap: false, width: 130 },
  { id: 'warrantyMonths', label: 'Bảo hành', visible: true, pinned: false, align: 'center', wrap: false, width: 100 },
  { id: 'costPrice', label: '1. Giá nhập', visible: true, pinned: false, align: 'right', wrap: false, width: 110 },
  { id: 'distributorPrice', label: '2. Giá NPP', visible: true, pinned: false, align: 'right', wrap: false, width: 110 },
  { id: 'floorPrice', label: '3. Giá sàn', visible: true, pinned: false, align: 'right', wrap: false, width: 100 },
  { id: 'retailPrice', label: '4. Giá bán lẻ', visible: true, pinned: false, align: 'right', wrap: false, width: 110 },
  { id: 'margin', label: 'Biên LN NPP', visible: true, pinned: false, align: 'right', wrap: false, width: 100 },
  { id: 'description', label: 'Mô tả sản phẩm', visible: true, pinned: false, align: 'left', wrap: true, width: 300 },
  { id: 'specs', label: 'Thông số kỹ thuật', visible: true, pinned: false, align: 'left', wrap: true, width: 240 },
  { id: 'tags', label: 'Nhãn Tags', visible: true, pinned: false, align: 'left', wrap: true, width: 130 },
  { id: 'notes', label: 'Ghi chú', visible: true, pinned: false, align: 'left', wrap: true, width: 160 },
  { id: 'status', label: 'Trạng thái', visible: true, pinned: false, align: 'center', wrap: false, width: 110 },
  { id: 'updatedAt', label: 'Ngày cập nhật', visible: true, pinned: false, align: 'center', wrap: false, width: 110 },
  { id: 'actions', label: 'Thao tác', visible: true, pinned: false, align: 'center', wrap: false, width: 120 },
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
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedType, setSelectedType] = useState('');

  // 1. CHỌN HÀNG LOẠT & ĐỒNG BỘ VỚI DANH SÁCH SO SÁNH
  const [selectedIds, setSelectedIds] = useState<string[]>(() => compareIds);
  const [isBatchCategoryModalOpen, setIsBatchCategoryModalOpen] = useState(false);
  const [isBatchSpecsModalOpen, setIsBatchSpecsModalOpen] = useState(false);

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

  // Danh sách Thương hiệu, Nhóm và Loại duy nhất
  const brands = useMemo(() => {
    const list = products
      .map(p => p.brand?.trim())
      .filter((b): b is string => Boolean(b && b.length > 0));
    return Array.from(new Set(list)).sort((a, b) => a.localeCompare(b, 'vi'));
  }, [products]);

  const categoryGroups = useMemo(() => {
    return Array.from(new Set(products.map(p => p.categoryGroup))).filter(Boolean);
  }, [products]);

  const categoryTypes = useMemo(() => {
    return Array.from(new Set(products.map(p => p.categoryType))).filter(Boolean);
  }, [products]);

  // Bộ lọc sản phẩm
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchSku = p.sku.toLowerCase().includes(q);
        const matchName = p.name.toLowerCase().includes(q);
        const matchBrand = p.brand ? p.brand.toLowerCase().includes(q) : false;
        const matchNotes = p.notes ? p.notes.toLowerCase().includes(q) : false;
        const matchSpecs = p.specifications.some(sg =>
          sg.items.some(
            i => i.key.toLowerCase().includes(q) || i.value.toLowerCase().includes(q)
          )
        );
        if (!matchSku && !matchName && !matchBrand && !matchNotes && !matchSpecs) {
          return false;
        }
      }

      if (selectedBrand && (!p.brand || p.brand.trim().toLowerCase() !== selectedBrand.trim().toLowerCase())) return false;
      if (selectedGroup && p.categoryGroup !== selectedGroup) return false;
      if (selectedType && p.categoryType !== selectedType) return false;

      return true;
    });
  }, [products, searchQuery, selectedBrand, selectedGroup, selectedType]);

  // Tự động quay về trang 1 khi thay đổi điều kiện tìm kiếm hoặc lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedBrand, selectedGroup, selectedType]);

  // Tổng số trang
  const totalPages = useMemo(() => {
    if (pageSize === -1) return 1;
    return Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  }, [filteredProducts.length, pageSize]);

  // Đảm bảo currentPage không vượt quá totalPages
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Cắt danh sách sản phẩm theo trang hiện tại (Pagination slicing)
  const paginatedProducts = useMemo(() => {
    if (pageSize === -1) return filteredProducts;
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  // Thống kê hiển thị
  const totalFilteredCount = filteredProducts.length;
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

  return (
    <div className="w-full h-full flex flex-col min-h-0 px-3 sm:px-6 py-2.5 space-y-2.5 overflow-hidden">
      
      {/* KHUNG TRÊN: TIÊU ĐỀ + BỘ LỌC (CỐ ĐỊNH TRÊN CÙNG KHI LĂN CHUỘT) */}
      <div className="shrink-0 bg-white rounded-2xl border border-slate-200 shadow-xs relative z-20">
        
        {/* Hàng 1: Tabs nhỏ + Bộ điều khiển so sánh (Đủ 5 sản phẩm mới so sánh) */}
        <div className="px-4 py-2.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 rounded-t-2xl">
          
          {/* Tiêu đề & Đếm số lượng sản phẩm */}
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-bold text-slate-800">
              Sản phẩm
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {totalFilteredCount} sản phẩm
            </span>
          </div>

          {/* VÙNG ĐIỀU KHIỂN SO SÁNH: ĐỦ 5 SP MỚI MỞ NÚT SO SÁNH */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {selectedIds.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 bg-slate-100/90 px-2.5 py-1 rounded-xl border border-slate-300 shadow-2xs">
                <span className="text-[11px] text-slate-700 font-medium">
                  Đã chọn: <strong className="text-blue-700">{selectedIds.length}</strong> SP
                </span>

                {/* Nút 1: Chuẩn hóa Nhóm & Loại bằng AI */}
                <button
                  type="button"
                  onClick={() => setIsBatchCategoryModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition-all cursor-pointer active:scale-95"
                  title="Dùng AI phân tích Tên & Mô tả để tự động sửa Nhóm danh mục và Loại sản phẩm cho các sản phẩm đã chọn"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>AI Phân loại danh mục ({selectedIds.length})</span>
                </button>

                {/* Nút 2: Bóc tách thông số kỹ thuật bằng AI */}
                <button
                  type="button"
                  onClick={() => setIsBatchSpecsModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-2xs transition-all cursor-pointer active:scale-95"
                  title="Dùng AI trích xuất bảng thông số kỹ thuật cho các sản phẩm đã chọn"
                >
                  <Zap className="w-3.5 h-3.5 fill-white" />
                  <span>AI Bóc tách thông số ({selectedIds.length})</span>
                </button>

                {selectedIds.length > 5 && (
                  <button
                    type="button"
                    onClick={() => {
                      onSetCompareProducts(selectedIds.slice(0, 5));
                    }}
                    className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
                    title="Đưa 5 sản phẩm đầu tiên được chọn vào so sánh"
                  >
                    Đưa 5 SP đầu vào so sánh
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setSelectedIds([]);
                    onSetCompareProducts([]);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 hover:underline font-medium cursor-pointer"
                >
                  Bỏ chọn
                </button>

                <button
                  type="button"
                  onClick={handleDeleteSelected}
                  className="text-xs text-red-600 hover:underline font-medium cursor-pointer"
                >
                  Xóa ({selectedIds.length})
                </button>
              </div>
            )}

            {/* NÚT SO SÁNH: ĐỦ 5 SP MỚI BẬT SÁNG, DƯỚI HOẶC TRÊN 5 THÌ MỜ */}
            {canCompare ? (
              <button
                type="button"
                onClick={onOpenCompare}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/25 animate-pulse transition-all cursor-pointer"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>So Sánh Ngay 5 Sản Phẩm &rarr;</span>
              </button>
            ) : (
              <button
                type="button"
                disabled
                title="Cần chọn đủ đúng 5 sản phẩm để so sánh"
                className="px-3 py-1.5 bg-slate-100 text-slate-400 border border-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 cursor-not-allowed select-none opacity-70"
              >
                <Scale className="w-3.5 h-3.5 text-slate-300" />
                {compareIds.length === 0 ? (
                  <span>Chọn đủ 5 sản phẩm để so sánh (0/5)</span>
                ) : compareIds.length < 5 ? (
                  <span>Đã đưa vào so sánh: {compareIds.length}/5 (Cần đủ 5 SP)</span>
                ) : (
                  <span>Đang chọn {compareIds.length} SP (Chỉ so sánh đúng 5 SP)</span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Hàng 2: Thanh công cụ lọc & Tác vụ */}
        <div className="p-3.5 flex flex-wrap items-center justify-between gap-3 rounded-b-2xl">
          
          {/* Vùng lọc bên trái */}
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
            {/* Nút quay lại */}
            <button
              type="button"
              onClick={onBackToHome}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại</span>
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

            {/* Bộ lọc Thương hiệu */}
            <select
              value={selectedBrand}
              onChange={e => setSelectedBrand(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:bg-white focus:outline-none"
            >
              <option value="">Tất cả Thương hiệu</option>
              {brands.map((b, i) => (
                <option key={i} value={b}>
                  {b}
                </option>
              ))}
            </select>

            {/* Bộ lọc Nhóm */}
            <select
              value={selectedGroup}
              onChange={e => setSelectedGroup(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:bg-white focus:outline-none"
            >
              <option value="">Tất cả Nhóm</option>
              {categoryGroups.map((g, i) => (
                <option key={i} value={g}>
                  {g}
                </option>
              ))}
            </select>

            {/* Bộ lọc Loại */}
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:bg-white focus:outline-none"
            >
              <option value="">Tất cả Loại</option>
              {categoryTypes.map((t, i) => (
                <option key={i} value={t}>
                  {t}
                </option>
              ))}
            </select>

            {/* Nút reset lọc */}
            {(searchQuery || selectedBrand || selectedGroup || selectedType) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedBrand('');
                  setSelectedGroup('');
                  setSelectedType('');
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

      </div>

      {/* KHUNG DƯỚI: DANH SÁCH SẢN PHẨM (BẢNG DỮ LIỆU FULL WIDTH + CỐ ĐỊNH TIÊU ĐỀ CỘT KHI LĂN) */}
      {viewMode === 'table' ? (
        <div className="w-full flex-1 min-h-0 flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="w-full flex-1 min-h-0 overflow-auto custom-scrollbar">
            <table
              style={{ width: `${totalTableWidth}px`, minWidth: '100%' }}
              className="table-fixed text-left text-xs border-collapse"
            >
              
              {/* Header bảng dữ liệu cố định trên cùng khi lăn chuột */}
              <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold select-none shadow-[0_1px_2px_0_rgba(0,0,0,0.06)]">
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
                            top: 0,
                            ...(isPinned ? { left: `${leftOffset}px` } : {}),
                          }}
                          className={`${cellPaddingClass} w-12 text-center relative group select-none sticky top-0 z-30 bg-slate-100/95 backdrop-blur-xs border-r border-slate-200 last:border-r-0`}
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

                    return (
                      <th
                        key={col.id}
                        style={{
                          width: `${col.width}px`,
                          minWidth: `${col.width}px`,
                          maxWidth: `${col.width}px`,
                          top: 0,
                          ...(isPinned ? { left: `${leftOffset}px` } : {}),
                        }}
                        className={`${cellPaddingClass} relative group select-none ${alignClass} sticky top-0 ${
                          isPinned
                            ? `z-30 bg-slate-100/95 backdrop-blur-xs ${
                                isLastPinned ? 'border-r border-slate-300 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.12)]' : ''
                              }`
                            : 'z-20 bg-slate-50/95'
                        } border-r border-slate-200 last:border-r-0`}
                      >
                        <span className="truncate block pr-1.5 font-semibold text-slate-700">{col.label}</span>

                        {/* TAY CẦM KÉO CHỈNH KÍCH THƯỚC CỘT TRỰC TIẾP TRÊN WEB */}
                        <div
                          onMouseDown={e => handleStartResize(col.id, e)}
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

                          // 2. Thumbnail
                          if (col.id === 'thumbnail') {
                            return (
                              <td key={col.id} style={cellStyle} className={cellBaseClass}>
                                <div className="flex items-center justify-center">
                                  {prod.thumbnail ? (
                                    <img
                                      src={prod.thumbnail}
                                      alt={prod.name}
                                      loading="lazy"
                                      decoding="async"
                                      className="w-8 h-8 object-cover rounded-lg border border-slate-200 shadow-2xs hover:scale-125 transition-transform cursor-pointer bg-white"
                                      onClick={() => onViewDetail(prod)}
                                      onError={e => {
                                        const imgEl = e.currentTarget as HTMLImageElement;
                                        imgEl.onerror = null;
                                        imgEl.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Crect width="18" height="18" x="3" y="3" rx="2"/%3E%3Cpath d="M3 9h18"/%3E%3Cpath d="M9 21V9"/%3E%3C/svg%3E';
                                      }}
                                    />
                                  ) : (
                                    <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-[9px]">
                                      N/A
                                    </div>
                                  )}
                                </div>
                              </td>
                            );
                          }

                          // 3. Name
                          if (col.id === 'name') {
                            return (
                              <td key={col.id} style={cellStyle} className={cellBaseClass}>
                                <div className="flex items-start gap-2">
                                  <div
                                    className={`w-6 h-6 rounded-full ${colorBg} text-white flex items-center justify-center font-bold text-[9px] shrink-0 shadow-2xs mt-0.5`}
                                  >
                                    {getInitials(prod.name)}
                                  </div>
                                  <div className="min-w-0 flex-1">
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
                                  </div>
                                </div>
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

                          // 6. Category Group
                          if (col.id === 'categoryGroup') {
                            return (
                              <td key={col.id} style={cellStyle} className={`${cellBaseClass} text-xs text-slate-700`}>
                                <div
                                  className={
                                    col.wrap ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap block max-w-full'
                                  }
                                >
                                  {prod.categoryGroup || '—'}
                                </div>
                              </td>
                            );
                          }

                          // 7. Category Type
                          if (col.id === 'categoryType') {
                            return (
                              <td key={col.id} style={cellStyle} className={`${cellBaseClass} text-xs text-slate-600`}>
                                <div
                                  className={
                                    col.wrap ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap block max-w-full'
                                  }
                                >
                                  {prod.categoryType || '—'}
                                </div>
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
        <div className="w-full flex-1 min-h-0 flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
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

    </div>
  );
};
