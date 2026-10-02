import React, { useState, useMemo } from 'react';
import { Product, ViewMode } from '../types/product';
import {
  formatVND,
  calculateFinancials,
  isAttributeDifferent,
  getDiffWithBenchmark,
  getAllSpecKeysByGroup,
  findSpecValue,
} from '../utils/pricing';
import {
  X,
  Printer,
  FileSpreadsheet,
  Plus,
  ArrowLeft,
  ArrowRight,
  Target,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Layers,
  Scale,
  ZoomIn,
  Eye,
  EyeOff,
  AlignJustify,
  FileText,
  Tag,
  Maximize2,
  CheckCircle2,
  HelpCircle,
  Edit3,
} from 'lucide-react';

interface ComparisonMatrixProps {
  products: Product[];
  allCatalogProducts: Product[];
  onClose: () => void;
  onRemoveProduct: (productId: string) => void;
  onAddProduct: (product: Product) => void;
  onReorderProducts: (newProducts: Product[]) => void;
  showCostPrice: boolean;
  isEmbedded?: boolean;
  onSelectQuickCategory?: (categoryType: string) => void;
  onEditProduct?: (product: Product, openAiSpec?: boolean) => void;
}

export const ComparisonMatrix: React.FC<ComparisonMatrixProps> = ({
  products,
  allCatalogProducts,
  onClose,
  onRemoveProduct,
  onAddProduct,
  onReorderProducts,
  showCostPrice,
  isEmbedded = false,
  onSelectQuickCategory,
  onEditProduct,
}) => {
  // 1. Chế độ xem & Bộ lọc
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [benchmarkId, setBenchmarkId] = useState<string>('');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [showAddSelector, setShowAddSelector] = useState(false);

  // 2. Tùy chọn hiển thị không gian & ảnh
  const [showImages, setShowImages] = useState(true);
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [zoomProduct, setZoomProduct] = useState<Product | null>(null);

  // 3. Thu gọn từng khối chính
  const [collapsePricing, setCollapsePricing] = useState(false);
  const [collapseDescription, setCollapseDescription] = useState(false);
  const [collapseWarranty, setCollapseWarranty] = useState(false);

  // Sản phẩm chuẩn mốc đối chiếu
  const benchmarkProduct = useMemo(
    () => products.find(p => p.id === benchmarkId) || null,
    [products, benchmarkId]
  );

  // Danh sách các nhóm và thuộc tính specs có trong các sản phẩm đang so sánh
  const specGroupsWithKeys = useMemo(() => {
    return getAllSpecKeysByGroup(products);
  }, [products]);

  // Các sản phẩm còn lại trong catalog chưa được đưa vào so sánh
  const availableToAdd = useMemo(() => {
    const currentIds = new Set(products.map(p => p.id));
    return allCatalogProducts.filter(p => !currentIds.has(p.id));
  }, [products, allCatalogProducts]);

  // Hoán đổi vị trí 2 cột sản phẩm
  const handleMoveColumn = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= products.length) return;
    const reordered = [...products];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;
    onReorderProducts(reordered);
  };

  // Toggle thu gọn group spec
  const toggleGroupCollapse = (groupName: string) => {
    setCollapsedGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  // Mở rộng / Thu gọn tất cả nhóm thông số
  const handleToggleAllGroups = () => {
    const allCollapsed = specGroupsWithKeys.every(g => collapsedGroups[g.groupName]);
    const newState: Record<string, boolean> = {};
    specGroupsWithKeys.forEach(g => {
      newState[g.groupName] = !allCollapsed;
    });
    setCollapsedGroups(newState);
  };

  // In / Xuất PDF
  const handlePrint = () => {
    window.print();
  };

  // Xuất file CSV bảng so sánh
  const handleExportCSV = () => {
    const headers = ['Thuộc tính / Thông số', ...products.map(p => `${p.sku} - ${p.name}`)];
    const rows: string[][] = [];

    // Tầng giá
    if (showCostPrice) {
      rows.push(['1. Giá nhập (VND)', ...products.map(p => p.pricing.costPrice.toString())]);
    }
    rows.push(['2. Giá NPP (VND)', ...products.map(p => p.pricing.distributorPrice.toString())]);
    rows.push(['3. Giá sàn (VND)', ...products.map(p => p.pricing.floorPrice.toString())]);
    rows.push(['4. Giá thương mại (VND)', ...products.map(p => p.pricing.retailPrice.toString())]);
    rows.push([
      '% Lợi nhuận NPP',
      ...products.map(p => `${calculateFinancials(p.pricing).nppMarginPercent}%`),
    ]);

    // Mô tả sản phẩm
    rows.push(['Mô tả sản phẩm', ...products.map(p => `"${p.description || ''}"`)]);

    // Specs
    specGroupsWithKeys.forEach(group => {
      rows.push([`--- ${group.groupName.toUpperCase()} ---`, ...products.map(() => '')]);
      group.keys.forEach(key => {
        rows.push([
          key,
          ...products.map(p => findSpecValue(p, group.groupName, key)?.value || '-'),
        ]);
      });
    });

    // Bảo hành & Ghi chú
    rows.push(['Thời hạn bảo hành', ...products.map(p => `${p.warrantyMonths || 12} Tháng`)]);
    rows.push(['Ghi chú chính sách', ...products.map(p => `"${p.notes || ''}"`)]);

    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map(e => e.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `bang-so-sanh-san-pham-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Mật độ hiển thị
  const isCompact = density === 'compact';
  const rowPadding = isCompact ? 'py-2 px-3' : 'py-3.5 px-4';
  const fontSizeKey = isCompact ? 'text-xs' : 'text-sm';
  const fontSizeVal = isCompact ? 'text-xs' : 'text-sm';

  if (products.length === 0) {
    if (isEmbedded) {
      return (
        <div className="p-8 max-w-2xl mx-auto text-center my-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs border border-blue-100">
            <Scale className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Chưa có sản phẩm nào được chọn để so sánh</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Vui lòng chọn từ 2 đến 5 sản phẩm trong danh mục để tiến hành đối chiếu 4 tầng giá và phân tích các thông số kỹ thuật khác biệt.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            {onSelectQuickCategory && (
              <>
                <button
                  type="button"
                  onClick={() => onSelectQuickCategory('Nồi chiên không dầu')}
                  className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs border border-blue-200 transition-colors"
                >
                  So sánh 3 Nồi chiên mẫu
                </button>
                <button
                  type="button"
                  onClick={() => onSelectQuickCategory('Robot hút bụi lau nhà')}
                  className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs border border-indigo-200 transition-colors"
                >
                  So sánh 3 Robot hút bụi
                </button>
                <button
                  type="button"
                  onClick={() => onSelectQuickCategory('Bộ nồi inox')}
                  className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold text-xs border border-amber-200 transition-colors"
                >
                  So sánh Bộ nồi mẫu
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              Chọn từ danh mục sản phẩm &rarr;
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 text-center max-w-md w-full">
          <Scale className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">Chưa có sản phẩm so sánh</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Vui lòng chọn ít nhất 2 sản phẩm từ danh sách để bắt đầu so sánh đối chiếu.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
          >
            Quay lại danh mục
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={
        isEmbedded
          ? 'w-full h-full flex flex-col overflow-hidden bg-white'
          : 'fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex flex-col justify-center items-center p-1 sm:p-3 lg:p-4 overflow-hidden'
      }
    >
      {/* Container Workspace */}
      <div
        className={
          isEmbedded
            ? 'w-full h-full flex flex-col overflow-hidden'
            : 'bg-white w-full h-[96vh] max-w-[98vw] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200'
        }
      >
        {/* ========================================================= */}
        {/* 1. TOP CONTROL BAR (Thanh công cụ gọn gàng, đa tính năng) */}
        {/* ========================================================= */}
        <div className="px-4 py-2.5 sm:py-3 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-2.5 shrink-0 z-30 shadow-2xs">
          {/* Tiêu đề & Đếm số sản phẩm */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-none">
                  Bảng So Sánh Sản Phẩm Chuyên Sâu
                </h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {products.length}/5 sản phẩm
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 hidden md:block">
                Đối chiếu 4 tầng giá, tỷ suất lợi nhuận và từng chỉ tiêu kỹ thuật chi tiết
              </p>
            </div>
          </div>

          {/* Nhóm nút chế độ xem & Mốc đối chiếu */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Tabs */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  viewMode === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tất cả thông số
              </button>
              <button
                type="button"
                onClick={() => setViewMode('differences_only')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                  viewMode === 'differences_only'
                    ? 'bg-amber-500 text-white shadow-2xs font-bold'
                    : 'text-amber-700 hover:text-amber-900 hover:bg-amber-50/50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Chỉ xem khác biệt
              </button>
              <button
                type="button"
                onClick={() => setViewMode('pricing_margin')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                  viewMode === 'pricing_margin'
                    ? 'bg-blue-600 text-white shadow-2xs font-bold'
                    : 'text-blue-700 hover:text-blue-900 hover:bg-blue-50/50'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Giá & Lợi nhuận
              </button>
            </div>

            {/* Mốc đối chiếu chuẩn */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
              <Target className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="text-slate-500 text-[11px] font-medium hidden lg:inline">Mốc đối chiếu:</span>
              <select
                value={benchmarkId}
                onChange={e => setBenchmarkId(e.target.value)}
                className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer max-w-[150px] truncate text-xs"
              >
                <option value="">-- Chọn SP mốc --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.sku} ({p.name.slice(0, 16)}...)
                  </option>
                ))}
              </select>
              {benchmarkId && (
                <button
                  type="button"
                  onClick={() => setBenchmarkId('')}
                  className="text-slate-400 hover:text-red-600 ml-0.5 p-0.5"
                  title="Hủy chọn mốc"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Nút Ẩn/Hiện ảnh sản phẩm để ưu tiên bảng thông tin */}
            <button
              type="button"
              onClick={() => setShowImages(prev => !prev)}
              title={showImages ? 'Ẩn ảnh sản phẩm để bảng thông tin rộng hơn' : 'Hiện ảnh sản phẩm'}
              className={`p-1.5 rounded-xl border text-xs font-medium flex items-center gap-1 transition-all ${
                showImages
                  ? 'border-slate-200 text-slate-600 hover:bg-slate-100'
                  : 'border-blue-500 bg-blue-50 text-blue-700 font-semibold shadow-2xs'
              }`}
            >
              {showImages ? <Eye className="w-3.5 h-3.5 text-slate-500" /> : <EyeOff className="w-3.5 h-3.5 text-blue-600" />}
              <span className="hidden sm:inline">{showImages ? 'Ẩn ảnh' : 'Hiện ảnh'}</span>
            </button>

            {/* Chuyển đổi mật độ dòng (Thoáng / Gọn) */}
            <button
              type="button"
              onClick={() => setDensity(d => (d === 'comfortable' ? 'compact' : 'comfortable'))}
              title={`Đang ở chế độ ${isCompact ? 'Gọn' : 'Thoáng'}. Nhấn để đổi.`}
              className={`p-1.5 rounded-xl border text-xs font-medium flex items-center gap-1 transition-all ${
                isCompact
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-semibold'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <AlignJustify className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">{isCompact ? 'Dòng gọn' : 'Dòng thoáng'}</span>
            </button>

            {/* Nút Thu gọn / Mở rộng tất cả nhóm thông số */}
            <button
              type="button"
              onClick={handleToggleAllGroups}
              title="Mở rộng hoặc thu gọn tất cả các nhóm thông số"
              className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-medium hidden md:flex items-center gap-1 transition-all"
            >
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              <span>Thu/Mở nhóm</span>
            </button>

            {/* Thêm sản phẩm vào so sánh */}
            {products.length < 5 && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAddSelector(!showAddSelector)}
                  className="px-2.5 py-1 rounded-xl border border-blue-500 bg-blue-50 hover:bg-blue-100 text-xs font-bold text-blue-700 flex items-center gap-1 transition-colors shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-600" />
                  <span>+ Thêm SP</span>
                </button>

                {showAddSelector && (
                  <div className="absolute right-0 top-full mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 max-h-64 overflow-y-auto">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                      Chọn sản phẩm để thêm vào bảng:
                    </div>
                    {availableToAdd.length === 0 ? (
                      <p className="text-xs text-slate-500 p-2">Đã thêm hết sản phẩm trong danh mục.</p>
                    ) : (
                      availableToAdd.map(item => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            onAddProduct(item);
                            setShowAddSelector(false);
                          }}
                          className="w-full text-left p-2 rounded-lg hover:bg-blue-50 flex items-center gap-2 text-xs transition-colors"
                        >
                          <img
                            src={item.thumbnail}
                            alt=""
                            className="w-8 h-8 rounded-md object-contain bg-slate-100 shrink-0"
                          />
                          <div className="truncate">
                            <span className="font-mono font-bold text-slate-900 block leading-tight">
                              {item.sku}
                            </span>
                            <span className="text-[11px] text-slate-500 truncate block">
                              {item.name}
                            </span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* In / Xuất PDF */}
            <button
              type="button"
              onClick={handlePrint}
              title="In hoặc Lưu PDF bảng so sánh"
              className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>

            {/* Xuất CSV Excel */}
            <button
              type="button"
              onClick={handleExportCSV}
              title="Tải bảng so sánh định dạng Excel CSV"
              className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-emerald-700 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
            </button>

            {/* Đóng Modal */}
            <button
              type="button"
              onClick={onClose}
              title="Đóng bảng so sánh"
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors ml-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. MA TRẬN SO SÁNH (BẢNG THÔNG TIN RÕ RÀNG, ẢNH GỌN GÀNG) */}
        {/* ========================================================= */}
        <div className="flex-1 overflow-auto bg-slate-50/50">
          <table className="border-collapse text-left min-w-full">
            {/* Cột 0: Chỉ mục thuộc tính cố định chiều rộng; Các cột sản phẩm cố định ~280px-320px, không bị dãn bung màn hình */}
            <colgroup>
              <col className="w-[230px] min-w-[210px] max-w-[250px]" />
              {products.map(p => (
                <col key={p.id} className="w-[300px] min-w-[270px] max-w-[340px]" />
              ))}
            </colgroup>

            {/* ----------------------------------------------------- */}
            {/* STICKY HEADER: THẺ SẢN PHẨM GỌN GÀNG (CHIỀU CAO HỢP LÝ) */}
            {/* ----------------------------------------------------- */}
            <thead className="sticky top-0 z-20 bg-white shadow-xs">
              <tr className="border-b border-slate-200">
                {/* Cột 0: Tiêu đề góc trái */}
                <th className="sticky left-0 z-20 bg-white p-3.5 border-r border-slate-200 align-top">
                  <div className="flex flex-col justify-between h-full space-y-2">
                    <div>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 block">
                        CHỈ MỤC SO SÁNH
                      </span>
                      <p className="text-xs font-semibold text-slate-700 mt-1 leading-snug">
                        Đối chiếu chi tiết 4 tầng giá & từng thông số
                      </p>
                    </div>

                    {benchmarkProduct ? (
                      <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-blue-900 leading-tight">
                        <div className="flex items-center justify-between">
                          <span className="font-bold flex items-center gap-1">
                            <Target className="w-3 h-3 text-blue-600" /> Mốc: {benchmarkProduct.sku}
                          </span>
                          <button
                            type="button"
                            onClick={() => setBenchmarkId('')}
                            className="text-blue-600 hover:text-red-600 font-bold"
                            title="Xóa mốc đối chiếu"
                          >
                            ×
                          </button>
                        </div>
                        <span className="text-[10px] text-blue-700 mt-0.5 block">
                          Các cột bên cạnh hiển thị mức chênh lệch (+ / -)
                        </span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 italic">
                        Chọn nút "Làm mốc" ở sản phẩm để tính chênh lệch giá & cấu hình.
                      </div>
                    )}
                  </div>
                </th>

                {/* Các cột sản phẩm */}
                {products.map((product, idx) => {
                  const isBenchmark = product.id === benchmarkId;
                  const financials = calculateFinancials(product.pricing);

                  return (
                    <th
                      key={product.id}
                      className={`p-3 border-r border-slate-200 align-top transition-colors ${
                        isBenchmark
                          ? 'bg-blue-50/40 ring-2 ring-blue-500/20'
                          : 'bg-white'
                      }`}
                    >
                      <div className="flex flex-col gap-2">
                        {/* Hàng nút tác vụ: Chuyển vị trí cột, Làm mốc, Xóa */}
                        <div className="flex items-center justify-between text-slate-400 text-xs">
                          <div className="flex items-center gap-0.5">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveColumn(idx, 'left')}
                              className="p-1 hover:text-slate-800 disabled:opacity-20 disabled:hover:text-slate-400 rounded hover:bg-slate-100 transition-colors"
                              title="Chuyển cột sang trái"
                            >
                              <ArrowLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === products.length - 1}
                              onClick={() => handleMoveColumn(idx, 'right')}
                              className="p-1 hover:text-slate-800 disabled:opacity-20 disabled:hover:text-slate-400 rounded hover:bg-slate-100 transition-colors"
                              title="Chuyển cột sang phải"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setBenchmarkId(isBenchmark ? '' : product.id)}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                isBenchmark
                                  ? 'bg-blue-600 text-white shadow-2xs'
                                  : 'hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200'
                              }`}
                              title={isBenchmark ? 'Hủy chọn mốc đối chiếu' : 'Chọn làm mốc chuẩn để đối chiếu'}
                            >
                              <Target className="w-3 h-3" />
                              {isBenchmark ? 'Đang làm mốc' : 'Làm mốc'}
                            </button>

                            {products.length > 2 && (
                              <button
                                type="button"
                                onClick={() => onRemoveProduct(product.id)}
                                className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors cursor-pointer"
                                title="Bỏ sản phẩm này khỏi bảng"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Ảnh sản phẩm: GỌN GÀNG (h-24/28, max-w-[200px], object-contain), KHÔNG BỊ TRÀN CHIẾM HẾT MÀN HÌNH */}
                        {showImages && (
                          <div className="relative h-24 sm:h-28 w-full max-w-[200px] mx-auto rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden p-1.5 group shadow-2xs">
                            <img
                              src={product.thumbnail}
                              alt={product.name}
                              className="max-h-full max-w-full object-contain transition-transform duration-200 group-hover:scale-105"
                              onError={e => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                            {/* Nút phóng to ảnh xem chi tiết khi người dùng muốn */}
                            <button
                              type="button"
                              onClick={() => setZoomProduct(product)}
                              className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 text-white text-xs font-bold transition-opacity cursor-pointer backdrop-blur-2xs"
                              title="Nhấn để xem ảnh lớn chi tiết"
                            >
                              <ZoomIn className="w-4 h-4" />
                              <span>Xem ảnh lớn</span>
                            </button>

                            {/* Badge mã SKU góc ảnh */}
                            <div className="absolute top-1.5 left-1.5 pointer-events-none">
                              <span className="font-mono font-bold text-[10px] bg-slate-900/85 text-white px-1.5 py-0.5 rounded shadow-2xs">
                                {product.sku}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Tiêu đề & Thương hiệu */}
                        <div className="space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                              {product.brand || product.categoryType}
                            </span>
                            {!showImages && (
                              <span className="font-mono font-bold text-[11px] text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded">
                                {product.sku}
                              </span>
                            )}
                          </div>
                          <h4
                            className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug hover:text-blue-600 transition-colors cursor-pointer"
                            title={product.name}
                            onClick={() => setZoomProduct(product)}
                          >
                            {product.name}
                          </h4>
                        </div>

                        {/* Thẻ tóm tắt giá nhanh ở đầu cột */}
                        <div className="pt-1.5 border-t border-slate-100 flex items-baseline justify-between">
                          <div>
                            <span className="text-[10px] text-slate-500 font-medium block">Giá NPP (Đại lý):</span>
                            <span className="text-sm font-extrabold font-mono text-blue-700">
                              {formatVND(product.pricing.distributorPrice)}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 font-medium block">Giá bán lẻ:</span>
                            <span className="text-xs font-bold font-mono text-slate-700">
                              {formatVND(product.pricing.retailPrice)}
                            </span>
                          </div>
                        </div>

                        {onEditProduct && (
                          <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => onEditProduct(product, true)}
                              className="flex-1 py-1 px-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-2xs"
                              title="Bóc tách thông số kỹ thuật AI"
                            >
                              <Sparkles className="w-3 h-3 text-blue-600" />
                              <span>Bóc tách AI</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onEditProduct(product, false)}
                              className="py-1 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-2xs"
                              title="Mở form chỉnh sửa sản phẩm"
                            >
                              <Edit3 className="w-3 h-3 text-slate-600" />
                              <span>Sửa</span>
                            </button>
                          </div>
                        )}

                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* ----------------------------------------------------- */}
            {/* THÂN BẢNG: CÁC KHỐI THÔNG TIN SO SÁNH RÕ RÀNG, DỄ ĐỌC */}
            {/* ----------------------------------------------------- */}
            <tbody className="divide-y divide-slate-200">
              
              {/* =================================================== */}
              {/* KHỐI 1: BẢNG ĐỐI CHIẾU 4 TẦNG GIÁ & LỢI NHUẬN        */}
              {/* =================================================== */}
              <tr className="bg-slate-800 text-white font-bold">
                <td
                  colSpan={products.length + 1}
                  onClick={() => setCollapsePricing(prev => !prev)}
                  className="sticky left-0 z-10 px-4 py-2 text-xs uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-white cursor-pointer select-none transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-400" />
                      <span>BẢNG ĐỐI CHIẾU 4 TẦNG GIÁ & BIÊN ĐỘ LỢI NHUẬN (VND)</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-normal lowercase text-slate-300">
                        {collapsePricing ? 'Nhấn để mở rộng' : 'Nhấn để thu gọn'}
                      </span>
                      {collapsePricing ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </div>
                  </div>
                </td>
              </tr>

              {!collapsePricing && (
                <>
                  {/* 1. Giá Nhập Gốc (Chỉ hiện với quản lý khi showCostPrice = true) */}
                  {showCostPrice && (
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className={`sticky left-0 z-10 bg-white ${rowPadding} font-semibold text-slate-800 border-r border-slate-200`}>
                        <div className="flex items-center justify-between">
                          <span className={`${fontSizeKey} font-bold text-emerald-800`}>1. Giá nhập (Gốc)</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                            Nội bộ
                          </span>
                        </div>
                      </td>
                      {products.map(p => {
                        const diff = benchmarkProduct
                          ? getDiffWithBenchmark(p.pricing.costPrice, benchmarkProduct.pricing.costPrice)
                          : null;

                        return (
                          <td key={p.id} className={`${rowPadding} border-r border-slate-200 bg-white`}>
                            <div className="space-y-1">
                              <span className="font-mono font-bold text-emerald-700 text-sm sm:text-base block">
                                {formatVND(p.pricing.costPrice)}
                              </span>
                              {diff && !diff.isEqual && p.id !== benchmarkId && (
                                <span
                                  className={`text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded inline-block ${
                                    diff.isHigher
                                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  }`}
                                >
                                  {diff.isHigher ? '+' : ''}
                                  {formatVND(diff.diffValue)} ({diff.isHigher ? '+' : ''}
                                  {diff.diffPercent}%)
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  )}

                  {/* 2. Giá Nhà phân phối (NPP) */}
                  <tr className="hover:bg-blue-50/40 transition-colors bg-blue-50/20">
                    <td className={`sticky left-0 z-10 bg-blue-50/80 ${rowPadding} font-semibold text-slate-800 border-r border-slate-200`}>
                      <div className="flex items-center justify-between">
                        <span className={`${fontSizeKey} font-bold text-blue-900`}>2. Giá NPP (Đại lý)</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold border border-blue-200">
                          Bán sỉ
                        </span>
                      </div>
                    </td>
                    {products.map(p => {
                      const diff = benchmarkProduct
                        ? getDiffWithBenchmark(p.pricing.distributorPrice, benchmarkProduct.pricing.distributorPrice)
                        : null;

                      return (
                        <td key={p.id} className={`${rowPadding} border-r border-slate-200 bg-blue-50/30`}>
                          <div className="space-y-1">
                            <span className="font-mono font-extrabold text-blue-900 text-sm sm:text-base block">
                              {formatVND(p.pricing.distributorPrice)}
                            </span>
                            {diff && !diff.isEqual && p.id !== benchmarkId && (
                              <span
                                className={`text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded inline-block ${
                                  diff.isHigher
                                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                    : 'bg-blue-50 text-blue-800 border border-blue-200'
                                }`}
                              >
                                {diff.isHigher ? '+' : ''}
                                {formatVND(diff.diffValue)} ({diff.isHigher ? '+' : ''}
                                {diff.diffPercent}%)
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* 3. Giá sàn niêm yết */}
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className={`sticky left-0 z-10 bg-white ${rowPadding} font-semibold text-slate-800 border-r border-slate-200`}>
                      <div className="flex items-center justify-between">
                        <span className={`${fontSizeKey} font-bold text-amber-800`}>3. Giá sàn niêm yết</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 font-semibold border border-amber-200">
                          Tối thiểu
                        </span>
                      </div>
                    </td>
                    {products.map(p => {
                      const diff = benchmarkProduct
                        ? getDiffWithBenchmark(p.pricing.floorPrice, benchmarkProduct.pricing.floorPrice)
                        : null;

                      return (
                        <td key={p.id} className={`${rowPadding} border-r border-slate-200 bg-white`}>
                          <div className="space-y-1">
                            <span className="font-mono font-bold text-amber-900 text-sm sm:text-base block">
                              {formatVND(p.pricing.floorPrice)}
                            </span>
                            {diff && !diff.isEqual && p.id !== benchmarkId && (
                              <span className="text-[11px] font-mono font-medium text-slate-600 block">
                                Chênh: {diff.isHigher ? '+' : ''}
                                {formatVND(diff.diffValue)}
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* 4. Giá bán lẻ / Thương mại */}
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className={`sticky left-0 z-10 bg-white ${rowPadding} font-semibold text-slate-800 border-r border-slate-200`}>
                      <div className="flex items-center justify-between">
                        <span className={`${fontSizeKey} font-bold text-slate-900`}>4. Giá bán lẻ thương mại</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                          Thị trường
                        </span>
                      </div>
                    </td>
                    {products.map(p => {
                      const diff = benchmarkProduct
                        ? getDiffWithBenchmark(p.pricing.retailPrice, benchmarkProduct.pricing.retailPrice)
                        : null;

                      return (
                        <td key={p.id} className={`${rowPadding} border-r border-slate-200 bg-white`}>
                          <div className="space-y-1">
                            <span className="font-mono font-bold text-slate-900 text-sm sm:text-base block">
                              {formatVND(p.pricing.retailPrice)}
                            </span>
                            {diff && !diff.isEqual && p.id !== benchmarkId && (
                              <span className="text-[11px] font-mono font-medium text-slate-500 block">
                                Chênh: {diff.isHigher ? '+' : ''}
                                {formatVND(diff.diffValue)} ({diff.isHigher ? '+' : ''}
                                {diff.diffPercent}%)
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Lợi nhuận NPP & Tỷ suất lợi nhuận */}
                  <tr className="bg-emerald-50/50 hover:bg-emerald-50/80 transition-colors">
                    <td className={`sticky left-0 z-10 bg-emerald-50/90 ${rowPadding} font-bold text-emerald-950 border-r border-slate-200`}>
                      <div className="space-y-0.5">
                        <span className={`${fontSizeKey} font-bold text-emerald-900 block`}>
                          Lợi nhuận gộp NPP (Lãi / Cái)
                        </span>
                        <span className="text-[11px] font-normal text-emerald-700">
                          Giá NPP trừ Giá nhập gốc
                        </span>
                      </div>
                    </td>
                    {products.map(p => {
                      const financials = calculateFinancials(p.pricing);
                      return (
                        <td key={p.id} className={`${rowPadding} border-r border-slate-200`}>
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-extrabold text-emerald-700 text-sm">
                                +{financials.nppMarginPercent}%
                              </span>
                              <span className="font-mono font-bold text-xs text-slate-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                                {formatVND(financials.nppGross)}
                              </span>
                            </div>
                            {/* Thanh trực quan tỷ lệ % lợi nhuận */}
                            <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-emerald-600 h-full rounded-full transition-all"
                                style={{ width: `${Math.min(financials.nppMarginPercent * 2.5, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Khoảng thương lượng / Chiết khấu sàn tối đa */}
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className={`sticky left-0 z-10 bg-white ${rowPadding} font-semibold text-slate-700 border-r border-slate-200`}>
                      <span className={`${fontSizeKey} block`}>Biên độ thương lượng tối đa</span>
                      <span className="text-[11px] text-slate-400 font-normal">
                        Giá bán lẻ trừ Giá sàn
                      </span>
                    </td>
                    {products.map(p => {
                      const financials = calculateFinancials(p.pricing);
                      return (
                        <td key={p.id} className={`${rowPadding} border-r border-slate-200 bg-white`}>
                          <span className="font-mono font-bold text-slate-800 text-xs sm:text-sm block">
                            {formatVND(financials.discountBuffer)}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            (tối đa {financials.discountBufferPercent}% giá bán lẻ)
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                </>
              )}

              {/* =================================================== */}
              {/* KHỐI 2: MÔ TẢ TỔNG QUAN SẢN PHẨM                   */}
              {/* =================================================== */}
              {viewMode !== 'pricing_margin' && (
                <>
                  <tr className="bg-slate-700 text-white font-bold">
                    <td
                      colSpan={products.length + 1}
                      onClick={() => setCollapseDescription(prev => !prev)}
                      className="sticky left-0 z-10 px-4 py-2 text-xs uppercase tracking-wider bg-slate-700 hover:bg-slate-600 text-white cursor-pointer select-none transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-300" />
                          <span>MÔ TẢ TỔNG QUAN SẢN PHẨM</span>
                        </span>
                        {collapseDescription ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                      </div>
                    </td>
                  </tr>

                  {!collapseDescription && (
                    <tr className="hover:bg-slate-50/80 transition-colors">
                      <td className={`sticky left-0 z-10 bg-white ${rowPadding} font-semibold text-slate-800 border-r border-slate-200 align-top`}>
                        <div className="space-y-0.5">
                          <span className={`${fontSizeKey} font-bold text-slate-900 block`}>
                            Mô tả sản phẩm
                          </span>
                          <span className="text-[11px] text-slate-400 font-normal">
                            Thông tin mô tả từ bảng tính
                          </span>
                        </div>
                      </td>
                      {products.map(p => (
                        <td key={p.id} className={`${rowPadding} border-r border-slate-200 bg-white align-top`}>
                          <div className="space-y-2">
                            <div className={`${fontSizeVal} text-slate-700 leading-relaxed max-h-36 overflow-y-auto whitespace-pre-line p-2.5 rounded-lg bg-slate-50 border border-slate-200/80`}>
                              {p.description ? (
                                p.description
                              ) : (
                                <span className="text-slate-400 italic">Chưa có thông tin mô tả chi tiết.</span>
                              )}
                            </div>

                            {onEditProduct && (
                              <div className="flex flex-wrap items-center gap-1.5 justify-end">
                                <button
                                  type="button"
                                  onClick={() => onEditProduct(p, true)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors cursor-pointer shadow-2xs"
                                  title="Bóc tách thông số kỹ thuật AI từ mô tả này"
                                >
                                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                                  <span>Bóc tách thông số</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onEditProduct(p, false)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
                                  title="Chỉnh sửa thông tin sản phẩm"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                                  <span>Chỉnh sửa SP</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                  )}
                </>
              )}

              {/* =================================================== */}
              {/* KHỐI 3: THÔNG SỐ KỸ THUẬT THEO TỪNG NHÓM           */}
              {/* =================================================== */}
              {viewMode !== 'pricing_margin' &&
                specGroupsWithKeys.map(group => {
                  const isCollapsed = collapsedGroups[group.groupName];

                  // Lọc các rows theo viewMode
                  const visibleKeys = group.keys.filter(key => {
                    if (viewMode !== 'differences_only') return true;
                    // Kiểm tra xem dòng này có khác biệt không
                    const values = products.map(
                      p => findSpecValue(p, group.groupName, key)?.value || 'N/A'
                    );
                    return isAttributeDifferent(values);
                  });

                  if (viewMode === 'differences_only' && visibleKeys.length === 0) {
                    return null; // Không có khác biệt nào trong nhóm này
                  }

                  return (
                    <React.Fragment key={group.groupName}>
                      {/* Tiêu đề nhóm thông số kỹ thuật */}
                      <tr className="bg-slate-100 font-bold text-slate-800">
                        <td
                          colSpan={products.length + 1}
                          onClick={() => toggleGroupCollapse(group.groupName)}
                          className="sticky left-0 z-10 px-4 py-2.5 text-xs uppercase tracking-wider bg-slate-200/90 text-slate-800 cursor-pointer select-none hover:bg-slate-300 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2 font-bold text-slate-900">
                              <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                              {group.groupName.toUpperCase()} ({visibleKeys.length} thông số)
                            </span>
                            <div className="flex items-center gap-1.5 text-slate-600 text-[11px] font-normal">
                              <span>{isCollapsed ? 'Mở rộng' : 'Thu gọn'}</span>
                              {isCollapsed ? (
                                <ChevronDown className="w-4 h-4 text-slate-600" />
                              ) : (
                                <ChevronUp className="w-4 h-4 text-slate-600" />
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>

                      {/* Các dòng thông số cụ thể */}
                      {!isCollapsed &&
                        visibleKeys.map(specKey => {
                          const values = products.map(
                            p => findSpecValue(p, group.groupName, specKey)?.value || '-'
                          );
                          const isDiff = isAttributeDifferent(values);

                          return (
                            <tr
                              key={specKey}
                              className={`transition-colors ${
                                isDiff
                                  ? 'bg-amber-50/40 hover:bg-amber-50/70 border-b border-amber-200/50'
                                  : 'hover:bg-slate-50 border-b border-slate-100'
                              }`}
                            >
                              {/* Cột 0: Tên thông số kỹ thuật (Chữ to, rõ ràng, có nhãn Khác Biệt) */}
                              <td className={`sticky left-0 z-10 bg-white ${rowPadding} border-r border-slate-200`}>
                                <div className="flex items-center justify-between gap-1.5">
                                  <span className={`${fontSizeKey} font-semibold text-slate-900`}>
                                    {specKey}
                                  </span>
                                  {isDiff && (
                                    <span
                                      className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded shrink-0 flex items-center gap-0.5"
                                      title="Thuộc tính này có giá trị khác nhau giữa các sản phẩm"
                                    >
                                      <Sparkles className="w-3 h-3 text-amber-600" />
                                      Khác nhau
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Giá trị thông số ở từng sản phẩm (Chữ to, rõ, font-medium) */}
                              {products.map(p => {
                                const specObj = findSpecValue(p, group.groupName, specKey);
                                const val = specObj?.value || '—';
                                const isHighlight = specObj?.isHighlight;

                                return (
                                  <td
                                    key={p.id}
                                    className={`${rowPadding} border-r border-slate-200 ${
                                      p.id === benchmarkId ? 'bg-blue-50/30' : 'bg-white'
                                    }`}
                                  >
                                    <span
                                      className={`${fontSizeVal} leading-relaxed ${
                                        isHighlight
                                          ? 'font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 inline-block'
                                          : val === '—'
                                          ? 'text-slate-300'
                                          : 'text-slate-800 font-medium'
                                      }`}
                                    >
                                      {val}
                                    </span>
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                    </React.Fragment>
                  );
                })}

              {/* =================================================== */}
              {/* KHỐI 4: CHÍNH SÁCH BẢO HÀNH & GHI CHÚ NỘI BỘ        */}
              {/* =================================================== */}
              <tr className="bg-slate-700 text-white font-bold">
                <td
                  colSpan={products.length + 1}
                  onClick={() => setCollapseWarranty(prev => !prev)}
                  className="sticky left-0 z-10 px-4 py-2 text-xs uppercase tracking-wider bg-slate-700 hover:bg-slate-600 text-white cursor-pointer select-none transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>CHÍNH SÁCH BẢO HÀNH & GHI CHÚ PHÂN PHỐI</span>
                    </span>
                    {collapseWarranty ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </div>
                </td>
              </tr>

              {!collapseWarranty && (
                <>
                  {/* Thời gian bảo hành */}
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className={`sticky left-0 z-10 bg-white ${rowPadding} font-semibold text-slate-800 border-r border-slate-200`}>
                      <span className={`${fontSizeKey} font-bold text-slate-900`}>Thời hạn bảo hành</span>
                    </td>
                    {products.map(p => (
                      <td key={p.id} className={`${rowPadding} border-r border-slate-200 bg-white`}>
                        <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 text-xs sm:text-sm">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          {p.warrantyMonths || 12} Tháng chính hãng
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Nhãn Tags */}
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className={`sticky left-0 z-10 bg-white ${rowPadding} font-semibold text-slate-800 border-r border-slate-200`}>
                      <span className={`${fontSizeKey} font-bold text-slate-900`}>Nhãn phân loại (Tags)</span>
                    </td>
                    {products.map(p => (
                      <td key={p.id} className={`${rowPadding} border-r border-slate-200 bg-white`}>
                        <div className="flex flex-wrap gap-1">
                          {p.tags && p.tags.length > 0 ? (
                            p.tags.map((t, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                              >
                                {t}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Ghi chú nội bộ / chính sách phân phối */}
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className={`sticky left-0 z-10 bg-white ${rowPadding} font-semibold text-slate-800 border-r border-slate-200 align-top`}>
                      <span className={`${fontSizeKey} font-bold text-slate-900`}>Ghi chú & Chính sách bán sỉ</span>
                    </td>
                    {products.map(p => (
                      <td key={p.id} className={`${rowPadding} border-r border-slate-200 bg-white align-top`}>
                        <div className={`${fontSizeVal} text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200/80`}>
                          {p.notes || <span className="text-slate-400 italic">Không có ghi chú đặc biệt.</span>}
                        </div>
                      </td>
                    ))}
                  </tr>
                </>
              )}

            </tbody>
          </table>
        </div>

        {/* ========================================================= */}
        {/* 3. BOTTOM FOOTER BAR (Ghi chú ký hiệu & Nút thao tác)     */}
        {/* ========================================================= */}
        <div className="px-4 py-2.5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 z-20">
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-3 h-3 rounded bg-blue-600 inline-block shadow-2xs" />
              Cột xanh: Mốc chuẩn đối chiếu
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-3 h-3 rounded bg-amber-300 inline-block shadow-2xs" />
              Dòng vàng: Thuộc tính có điểm khác biệt
            </span>
            <span className="flex items-center gap-1.5 text-slate-400 hidden sm:inline">
              | Nhấn vào ảnh để phóng to hình ảnh sản phẩm
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
            >
              Đóng bảng so sánh
            </button>
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 4. LIGHTBOX ZOOM MODAL: XEM ẢNH LỚN SẢN PHẨM               */}
      {/* ========================================================= */}
      {zoomProduct && (
        <div
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setZoomProduct(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full p-4 overflow-hidden shadow-2xl relative"
            onClick={e => e.stopPropagation()}
          >
            {/* Header modal */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                  {zoomProduct.sku}
                </span>
                <h3 className="font-bold text-sm text-slate-900 truncate max-w-md">
                  {zoomProduct.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setZoomProduct(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ảnh lớn */}
            <div className="py-4 flex items-center justify-center bg-slate-50 rounded-xl my-3 max-h-[60vh]">
              <img
                src={zoomProduct.thumbnail}
                alt={zoomProduct.name}
                className="max-h-[55vh] max-w-full object-contain rounded-lg shadow-sm"
              />
            </div>

            {/* Thông tin nhanh dưới ảnh */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/60">
                <span className="text-[10px] text-slate-400 block font-medium">Giá nhập:</span>
                <span className="text-xs font-bold text-emerald-700 font-mono">
                  {showCostPrice ? formatVND(zoomProduct.pricing.costPrice) : '••••••'}
                </span>
              </div>
              <div className="bg-blue-50 p-2 rounded-lg border border-blue-200/60">
                <span className="text-[10px] text-blue-600 block font-medium">Giá NPP:</span>
                <span className="text-xs font-extrabold text-blue-900 font-mono">
                  {formatVND(zoomProduct.pricing.distributorPrice)}
                </span>
              </div>
              <div className="bg-amber-50 p-2 rounded-lg border border-amber-200/60">
                <span className="text-[10px] text-amber-700 block font-medium">Giá sàn:</span>
                <span className="text-xs font-bold text-amber-900 font-mono">
                  {formatVND(zoomProduct.pricing.floorPrice)}
                </span>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/60">
                <span className="text-[10px] text-slate-400 block font-medium">Giá bán lẻ:</span>
                <span className="text-xs font-bold text-slate-900 font-mono">
                  {formatVND(zoomProduct.pricing.retailPrice)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
