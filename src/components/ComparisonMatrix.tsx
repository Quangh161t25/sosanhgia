import React, { useState, useMemo, useEffect } from 'react';
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
  analyzeComparisonMatrix,
  ComparisonAnalysisResult,
} from '../utils/aiProductAdvisor';
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
  Pin,
  PinOff,
  RefreshCw,
  Loader2,
  Trophy,
  TrendingUp,
  AlertCircle,
  UserCheck,
  Award,
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

  // 2. Tùy chọn hiển thị không gian, ảnh & ghim đầu cột
  const [showImages, setShowImages] = useState(true);
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [zoomProduct, setZoomProduct] = useState<Product | null>(null);
  const [isStickyHeader, setIsStickyHeader] = useState(true);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // 3. Thu gọn từng khối chính
  const [collapsePricing, setCollapsePricing] = useState(false);
  const [collapseDescription, setCollapseDescription] = useState(false);
  const [collapseWarranty, setCollapseWarranty] = useState(false);

  // 4. AI Đánh giá vượt trội & phân tích chiến lược
  const [aiAnalysis, setAiAnalysis] = useState<ComparisonAnalysisResult | null>(null);
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);
  const [showAiVerdict, setShowAiVerdict] = useState(false);
  const [collapseAiInsights, setCollapseAiInsights] = useState(false);

  // Tự động đồng bộ / đặt lại trạng thái AI khi danh sách sản phẩm so sánh thay đổi
  useEffect(() => {
    if (aiAnalysis) {
      const currentIds = new Set(products.map(p => p.id));
      const analyzedIds = Object.keys(aiAnalysis.insights);
      const isSame =
        analyzedIds.length === products.length &&
        analyzedIds.every(id => currentIds.has(id));
      if (!isSame) {
        setAiAnalysis(null);
        setShowAiVerdict(false);
      }
    }
  }, [products, aiAnalysis]);

  // Các sản phẩm quán quân từ AI
  const specsWinnerProduct = useMemo(
    () => (aiAnalysis ? products.find(p => p.id === aiAnalysis.specsWinnerId) : null),
    [aiAnalysis, products]
  );
  const marginWinnerProduct = useMemo(
    () => (aiAnalysis ? products.find(p => p.id === aiAnalysis.marginWinnerId) : null),
    [aiAnalysis, products]
  );
  const valueWinnerProduct = useMemo(
    () => (aiAnalysis ? products.find(p => p.id === aiAnalysis.valueWinnerId) : null),
    [aiAnalysis, products]
  );

  // Xử lý kích hoạt AI phân tích & đánh giá vượt trội
  const handleRunAiComparison = async () => {
    if (aiAnalysis && !showAiVerdict) {
      setShowAiVerdict(true);
      return;
    }
    setIsAnalyzingAi(true);
    try {
      const result = await analyzeComparisonMatrix(products);
      setAiAnalysis(result);
      setShowAiVerdict(true);
      setCollapseAiInsights(false);
    } catch (err) {
      console.error('Lỗi khi AI phân tích bảng so sánh:', err);
    } finally {
      setIsAnalyzingAi(false);
    }
  };

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
      '% Lợi nhuận gộp',
      ...products.map(p => `${calculateFinancials(p.pricing).grossMarginPercent}%`),
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

    // Đánh giá chiến lược từ AI (nếu có)
    if (aiAnalysis) {
      rows.push(['--- ĐÁNH GIÁ CHIẾN LƯỢC TỪ AI ---', ...products.map(() => '')]);
      rows.push(['Huy hiệu chiến lược AI', ...products.map(p => aiAnalysis.insights[p.id]?.badge.label || '-')]);
      rows.push([
        'Ưu điểm vượt trội (Pros)',
        ...products.map(p => (aiAnalysis.insights[p.id]?.pros || []).join('; ') || '-'),
      ]);
      rows.push([
        'Điểm cần cân nhắc (Cons)',
        ...products.map(p => (aiAnalysis.insights[p.id]?.cons || []).join('; ') || '-'),
      ]);
      rows.push([
        'Khách hàng phù hợp',
        ...products.map(p => aiAnalysis.insights[p.id]?.targetAudience || '-'),
      ]);
    }

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

            {/* Nút AI Đánh Giá Vượt Trội */}
            <button
              type="button"
              onClick={handleRunAiComparison}
              disabled={isAnalyzingAi || products.length < 2}
              title={
                products.length < 2
                  ? 'Cần ít nhất 2 sản phẩm để AI đánh giá đối chiếu'
                  : 'AI đối chiếu toàn diện: Tìm Quán quân Cấu hình, Quán quân Lợi nhuận NPP, Quán quân Giá tốt nhất và phân tích ưu - nhược điểm'
              }
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
                showAiVerdict && aiAnalysis
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-purple-200 hover:brightness-105'
                  : 'bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 hover:from-purple-100 hover:to-indigo-100 text-purple-700 border border-purple-200'
              } ${isAnalyzingAi ? 'opacity-80 cursor-wait' : ''}`}
            >
              {isAnalyzingAi ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
                  <span>AI đang đánh giá...</span>
                </>
              ) : (
                <>
                  <Sparkles className={`w-3.5 h-3.5 ${showAiVerdict && aiAnalysis ? 'text-amber-300 fill-amber-300' : 'text-purple-600'}`} />
                  <span>{aiAnalysis ? (showAiVerdict ? 'AI Đánh Giá' : 'Mở AI Đánh Giá') : '✨ AI Đánh Giá Vượt Trội'}</span>
                </>
              )}
            </button>

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

            {/* Nút Bật/Tắt Ghim cố định đầu cột khi cuộn */}
            <button
              type="button"
              onClick={() => setIsStickyHeader(prev => !prev)}
              title={
                isStickyHeader
                  ? 'Đang CỐ ĐỊNH đầu cột khi cuộn. Bấm để THẢ TRÔI (cuộn theo trang).'
                  : 'Đang THẢ TRÔI đầu cột. Bấm để CỐ ĐỊNH đầu cột khi cuộn.'
              }
              className={`p-1.5 rounded-xl border text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
                isStickyHeader
                  ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {isStickyHeader ? (
                <Pin className="w-3.5 h-3.5 text-blue-600" />
              ) : (
                <PinOff className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span className="hidden sm:inline">
                {isStickyHeader ? 'Đang cố định' : 'Thả trôi'}
              </span>
            </button>

            {/* Nút Thu gọn / Mở rộng đầu bảng */}
            <button
              type="button"
              onClick={() => setIsHeaderCollapsed(prev => !prev)}
              title={
                isHeaderCollapsed
                  ? 'Đang ở chế độ Siêu gọn (~42px). Bấm để mở rộng xem ảnh.'
                  : 'Đang mở rộng. Bấm để thu gọn đầu bảng (tiết kiệm 85% diện tích).'
              }
              className={`p-1.5 rounded-xl border text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
                isHeaderCollapsed
                  ? 'border-amber-500 bg-amber-50 text-amber-700 font-semibold shadow-2xs'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {isHeaderCollapsed ? (
                <ChevronDown className="w-3.5 h-3.5 text-amber-600" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span className="hidden sm:inline">
                {isHeaderCollapsed ? 'Đang thu gọn' : 'Thu gọn'}
              </span>
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
                            loading="lazy"
                            decoding="async"
                            className="w-8 h-8 rounded-md object-contain bg-slate-100 shrink-0"
                            onError={e => {
                              const imgEl = e.currentTarget as HTMLImageElement;
                              imgEl.onerror = null;
                              imgEl.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Crect width="18" height="18" x="3" y="3" rx="2"/%3E%3Cpath d="M3 9h18"/%3E%3Cpath d="M9 21V9"/%3E%3C/svg%3E';
                            }}
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

            {/* Quay lại danh mục sản phẩm */}
            <button
              type="button"
              onClick={onClose}
              title="Quay lại danh mục sản phẩm"
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors ml-0.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. MA TRẬN SO SÁNH (BẢNG THÔNG TIN RÕ RÀNG, ẢNH GỌN GÀNG) */}
        {/* ========================================================= */}
        <div 
          className="flex-1 overflow-auto bg-slate-50/50"
          onScroll={e => {
            const scrolled = e.currentTarget.scrollTop > 70;
            if (scrolled !== isScrolled) {
              setIsScrolled(scrolled);
            }
          }}
        >
          {/* ========================================================= */}
          {/* BANNER PHÁN QUYẾT & ĐÁNH GIÁ VƯỢT TRỘI TỪ AI (NẾU BẬT)     */}
          {/* ========================================================= */}
          {showAiVerdict && aiAnalysis && (
            <div className="m-3 p-4 rounded-2xl bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 text-white shadow-xl border border-purple-500/30">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/30 flex items-center justify-center border border-purple-400/40 text-purple-300 shadow-inner">
                    <Sparkles className="w-4 h-4 text-purple-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs sm:text-sm tracking-wide text-purple-100 uppercase">
                        Phán Quyết & Đánh Giá Vượt Trội Từ AI
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
                        {aiAnalysis.usedAI ? 'Gemini 2.5 Flash' : 'Thuật Toán Đa Tiêu Chí'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRunAiComparison}
                    disabled={isAnalyzingAi}
                    className="text-xs text-purple-300 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer border border-purple-400/20"
                    title="Chạy lại phân tích AI"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzingAi ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Phân tích lại</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAiVerdict(false)}
                    className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                    title="Đóng phán quyết"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Nhận định tổng kết */}
              <p className="text-xs sm:text-sm text-slate-200 my-3 leading-relaxed font-medium">
                {aiAnalysis.overallSummary}
              </p>

              {/* 3 Thẻ Vinh Danh Quán Quân */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                {/* 1. Cấu hình vượt trội */}
                {specsWinnerProduct && (
                  <div className="bg-white/5 border border-purple-400/25 rounded-xl p-3 backdrop-blur-xs flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0 border border-purple-400/30 text-purple-300">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-extrabold text-purple-300 block uppercase tracking-wider">
                        Quán quân Cấu hình
                      </span>
                      <div className="font-bold text-xs text-white truncate mt-0.5">
                        {specsWinnerProduct.sku} - {specsWinnerProduct.name}
                      </div>
                      <p className="text-[11px] text-purple-200/80 truncate mt-0.5">
                        {aiAnalysis.insights[specsWinnerProduct.id]?.pros[0] || 'Thông số trang bị đầy đủ nhất'}
                      </p>
                    </div>
                  </div>
                )}

                {/* 2. Lợi nhuận NPP cao nhất */}
                {marginWinnerProduct && (
                  <div className="bg-white/5 border border-emerald-400/25 rounded-xl p-3 backdrop-blur-xs flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-400/30 text-emerald-300">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-extrabold text-emerald-300 block uppercase tracking-wider">
                        Lợi nhuận NPP Tối Đa
                      </span>
                      <div className="font-bold text-xs text-white truncate mt-0.5">
                        {marginWinnerProduct.sku} - {marginWinnerProduct.name}
                      </div>
                      <p className="text-[11px] text-emerald-200/80 truncate mt-0.5">
                        {aiAnalysis.insights[marginWinnerProduct.id]?.pros[0] || 'Tỷ suất lợi nhuận cao nhất'}
                      </p>
                    </div>
                  </div>
                )}

                {/* 3. Giá bán tốt nhất / Dễ chốt */}
                {valueWinnerProduct && (
                  <div className="bg-white/5 border border-amber-400/25 rounded-xl p-3 backdrop-blur-xs flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0 border border-amber-400/30 text-amber-300">
                      <Award className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-extrabold text-amber-300 block uppercase tracking-wider">
                        Giá Bán Lẻ Hời Nhất (P/P)
                      </span>
                      <div className="font-bold text-xs text-white truncate mt-0.5">
                        {valueWinnerProduct.sku} - {valueWinnerProduct.name}
                      </div>
                      <p className="text-[11px] text-amber-200/80 truncate mt-0.5">
                        {formatVND(valueWinnerProduct.pricing.retailPrice)} - Dễ tiếp cận khách lẻ
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <table className="border-collapse text-left min-w-full">
            {/* Cột 0: Chỉ mục thuộc tính cố định chiều rộng; Các cột sản phẩm cố định ~280px-320px, không bị dãn bung màn hình */}
            <colgroup>
              <col className="w-[230px] min-w-[210px] max-w-[250px]" />
              {products.map(p => (
                <col key={p.id} className="w-[300px] min-w-[270px] max-w-[340px]" />
              ))}
            </colgroup>

            {/* ----------------------------------------------------- */}
            {/* STICKY HEADER: TỰ CO GỌN KHI CUỘN HOẶC THẢ TRÔI TUỲ CHỌN */}
            {/* ----------------------------------------------------- */}
            <thead
              className={`${
                isStickyHeader ? 'sticky top-0 z-20 shadow-xs' : 'relative z-10'
              } bg-white transition-all duration-150`}
            >
              {isHeaderCollapsed || (isStickyHeader && isScrolled) ? (
                /* === CHẾ ĐỘ THU GỌN MINI KHI CUỘN XUỐNG HOẶC KHI BẬT THU GỌN (TIẾT KIỆM 85% DIỆN TÍCH) === */
                <tr className="border-b border-slate-200 bg-white/95 backdrop-blur-xs">
                  {/* Cột 0: Chỉ mục */}
                  <th className="sticky left-0 z-20 bg-white/95 backdrop-blur-xs px-3 py-2 border-r border-slate-200 align-middle">
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Scale className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="text-xs font-bold text-slate-800 truncate">
                          Chỉ mục ({products.length})
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {benchmarkProduct && (
                          <span
                            className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded truncate max-w-[75px]"
                            title={`Mốc chuẩn: ${benchmarkProduct.sku}`}
                          >
                            Mốc: {benchmarkProduct.sku}
                          </span>
                        )}
                        {isHeaderCollapsed && (
                          <button
                            type="button"
                            onClick={() => setIsHeaderCollapsed(false)}
                            className="p-0.5 text-slate-400 hover:text-blue-600 cursor-pointer"
                            title="Mở rộng đầu bảng"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </th>

                  {/* Các cột sản phẩm mini */}
                  {products.map(product => {
                    const isBenchmark = product.id === benchmarkId;
                    return (
                      <th
                        key={product.id}
                        className={`px-3 py-2 border-r border-slate-200 align-middle transition-colors ${
                          isBenchmark
                            ? 'bg-blue-50/80 ring-1 ring-blue-500/25'
                            : 'bg-white/95 backdrop-blur-xs'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          {/* Khối bên trái: Ảnh mini + SKU + Tên ngắn gọn */}
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            {showImages && (
                              <div
                                onClick={() => setZoomProduct(product)}
                                className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden cursor-pointer hover:border-blue-400 shadow-2xs"
                                title="Nhấn để xem ảnh phóng to"
                              >
                                <img
                                  src={product.thumbnail}
                                  alt={product.sku}
                                  loading="lazy"
                                  decoding="async"
                                  className="max-w-full max-h-full object-contain"
                                  onError={e => {
                                    const imgEl = e.currentTarget as HTMLImageElement;
                                    imgEl.onerror = null;
                                    imgEl.src =
                                      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Crect width="18" height="18" x="3" y="3" rx="2"/%3E%3Cpath d="M3 9h18"/%3E%3Cpath d="M9 21V9"/%3E%3C/svg%3E';
                                  }}
                                />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-mono font-extrabold text-xs text-blue-700 bg-blue-50/80 px-1 py-0.2 rounded border border-blue-200/60 shrink-0">
                                  {product.sku}
                                </span>
                                {isBenchmark && (
                                  <span className="text-[9px] font-bold bg-blue-600 text-white px-1 rounded shrink-0">
                                    Mốc
                                  </span>
                                )}
                                {aiAnalysis?.insights[product.id] && (
                                  <span
                                    className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 border border-purple-200 truncate max-w-[85px]"
                                    title={aiAnalysis.insights[product.id].badge.label}
                                  >
                                    ✨ {aiAnalysis.insights[product.id].badge.label}
                                  </span>
                                )}
                              </div>
                              <p
                                className="text-[11px] font-semibold text-slate-800 truncate cursor-pointer hover:text-blue-600 leading-tight mt-0.5"
                                title={product.name}
                                onClick={() => setZoomProduct(product)}
                              >
                                {product.name}
                              </p>
                            </div>
                          </div>

                          {/* Khối bên phải: Nút làm mốc & Nút sửa & Nút xóa cột */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => setBenchmarkId(isBenchmark ? '' : product.id)}
                              className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                                isBenchmark
                                  ? 'bg-blue-600 text-white shadow-2xs'
                                  : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'
                              }`}
                              title={isBenchmark ? 'Hủy chọn mốc đối chiếu' : 'Chọn làm mốc đối chiếu'}
                            >
                              <Target className="w-3.5 h-3.5" />
                            </button>
                            {onEditProduct && (
                              <button
                                type="button"
                                onClick={() => onEditProduct(product, false)}
                                className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors cursor-pointer"
                                title="Chỉnh sửa sản phẩm"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            )}
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
                      </th>
                    );
                  })}
                </tr>
              ) : (
                /* === CHẾ ĐỘ MỞ RỘNG (ĐÃ TINH GỌN, KHÔNG CÒN RÁC THỪA CHIẾM DIỆN TÍCH) === */
                <tr className="border-b border-slate-200">
                  {/* Cột 0: Tiêu đề góc trái (Gọn gàng) */}
                  <th className="sticky left-0 z-20 bg-white p-3 border-r border-slate-200 align-top">
                    <div className="flex flex-col justify-between h-full space-y-2">
                      <div>
                        <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 block">
                          CHỈ MỤC SO SÁNH
                        </span>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          {products.length} sản phẩm đối chiếu
                        </p>
                      </div>

                      {benchmarkProduct ? (
                        <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-blue-900 leading-tight">
                          <div className="flex items-center justify-between">
                            <span className="font-bold flex items-center gap-1 text-[11px]">
                              <Target className="w-3 h-3 text-blue-600" /> Mốc: {benchmarkProduct.sku}
                            </span>
                            <button
                              type="button"
                              onClick={() => setBenchmarkId('')}
                              className="text-blue-600 hover:text-red-600 font-bold ml-1 cursor-pointer"
                              title="Xóa mốc đối chiếu"
                            >
                              ×
                            </button>
                          </div>
                          <span className="text-[10px] text-blue-700 mt-0.5 block">
                            Các cột hiển thị mức chênh (+/-)
                          </span>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400 italic">
                          Bấm "Làm mốc" để tính chênh lệch.
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => setIsHeaderCollapsed(true)}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer pt-1"
                        title="Thu nhỏ đầu bảng để mở rộng diện tích xem thông số"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                        <span>Thu gọn đầu bảng</span>
                      </button>
                    </div>
                  </th>

                  {/* Các cột sản phẩm gọn gàng */}
                  {products.map((product, idx) => {
                    const isBenchmark = product.id === benchmarkId;

                    return (
                      <th
                        key={product.id}
                        className={`p-2.5 border-r border-slate-200 align-top transition-colors ${
                          isBenchmark
                            ? 'bg-blue-50/40 ring-2 ring-blue-500/20'
                            : 'bg-white'
                        }`}
                      >
                        <div className="flex flex-col gap-1.5">
                          {/* Hàng nút tác vụ đa năng gom gọn vào 1 hàng */}
                          <div className="flex items-center justify-between text-slate-400 text-xs">
                            <div className="flex items-center gap-0.5">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveColumn(idx, 'left')}
                                className="p-1 hover:text-slate-800 disabled:opacity-20 disabled:hover:text-slate-400 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Chuyển cột sang trái"
                              >
                                <ArrowLeft className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === products.length - 1}
                                onClick={() => handleMoveColumn(idx, 'right')}
                                className="p-1 hover:text-slate-800 disabled:opacity-20 disabled:hover:text-slate-400 rounded hover:bg-slate-100 transition-colors cursor-pointer"
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

                              {onEditProduct && (
                                <button
                                  type="button"
                                  onClick={() => onEditProduct(product, false)}
                                  className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors cursor-pointer"
                                  title="Chỉnh sửa sản phẩm"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              )}

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

                          {/* Ảnh sản phẩm: GỌN GÀNG (h-16 sm:h-20, max-w-[150px]) */}
                          {showImages && (
                            <div className="relative h-16 sm:h-20 w-full max-w-[150px] mx-auto rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden p-1 group shadow-2xs">
                              <img
                                src={product.thumbnail}
                                alt={product.name}
                                loading="lazy"
                                decoding="async"
                                className="max-h-full max-w-full object-contain transition-transform duration-200 group-hover:scale-105"
                                onError={e => {
                                  const imgEl = e.currentTarget as HTMLImageElement;
                                  imgEl.onerror = null;
                                  imgEl.src =
                                    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Crect width="18" height="18" x="3" y="3" rx="2"/%3E%3Cpath d="M3 9h18"/%3E%3Cpath d="M9 21V9"/%3E%3C/svg%3E';
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => setZoomProduct(product)}
                                className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 text-white text-xs font-bold transition-opacity cursor-pointer backdrop-blur-2xs"
                                title="Nhấn để xem ảnh lớn chi tiết"
                              >
                                <ZoomIn className="w-4 h-4" />
                                <span>Xem to</span>
                              </button>

                              <div className="absolute top-1 left-1 pointer-events-none">
                                <span className="font-mono font-bold text-[9px] bg-slate-900/85 text-white px-1.5 py-0.2 rounded shadow-2xs">
                                  {product.sku}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Tiêu đề & Thương hiệu */}
                          <div className="space-y-0.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
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
                              className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1 leading-snug hover:text-blue-600 transition-colors cursor-pointer"
                              title={product.name}
                              onClick={() => setZoomProduct(product)}
                            >
                              {product.name}
                            </h4>

                            {/* Huy hiệu chiến lược AI nếu có */}
                            {aiAnalysis?.insights[product.id] && (
                              <div className="flex items-center justify-center pt-0.5">
                                <span
                                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-2xs ${
                                    aiAnalysis.insights[product.id].badge.color === 'emerald'
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                      : aiAnalysis.insights[product.id].badge.color === 'purple'
                                      ? 'bg-purple-50 text-purple-700 border-purple-300'
                                      : aiAnalysis.insights[product.id].badge.color === 'amber'
                                      ? 'bg-amber-50 text-amber-700 border-amber-300'
                                      : 'bg-blue-50 text-blue-700 border-blue-300'
                                  }`}
                                  title={aiAnalysis.insights[product.id].badge.label}
                                >
                                  <Sparkles className="w-3 h-3 shrink-0" />
                                  <span className="truncate max-w-[130px]">
                                    {aiAnalysis.insights[product.id].badge.label}
                                  </span>
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Nút Bóc tách AI thu nhỏ */}
                          {onEditProduct && (
                            <button
                              type="button"
                              onClick={() => onEditProduct(product, true)}
                              className="w-full py-0.5 px-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-2xs mt-0.5"
                              title="Bóc tách thông số kỹ thuật AI"
                            >
                              <Sparkles className="w-3 h-3 text-blue-600" />
                              <span>Bóc tách AI</span>
                            </button>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              )}
            </thead>

            {/* ----------------------------------------------------- */}
            {/* THÂN BẢNG: CÁC KHỐI THÔNG TIN SO SÁNH RÕ RÀNG, DỄ ĐỌC */}
            {/* ----------------------------------------------------- */}
            <tbody className="divide-y divide-slate-200">
              
              {/* =================================================== */}
              {/* KHỐI 0: ĐÁNH GIÁ VƯỢT TRỘI & PHÂN TÍCH CHIẾN LƯỢC TỪ AI (NẾU ĐÃ CHẠY) */}
              {/* =================================================== */}
              {aiAnalysis && (
                <>
                  <tr className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white font-bold">
                    <td
                      colSpan={products.length + 1}
                      onClick={() => setCollapseAiInsights(prev => !prev)}
                      className="sticky left-0 z-10 px-4 py-2.5 text-xs uppercase tracking-wider bg-purple-900 hover:bg-purple-800 text-white cursor-pointer select-none transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-300 animate-pulse" />
                          <span>ĐÁNH GIÁ VƯỢT TRỘI & PHÂN TÍCH CHIẾN LƯỢC TỪ AI</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-normal lowercase text-purple-200">
                            {collapseAiInsights ? 'Nhấn để mở rộng' : 'Nhấn để thu gọn'}
                          </span>
                          {collapseAiInsights ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                        </div>
                      </div>
                    </td>
                  </tr>

                  {!collapseAiInsights && (
                    <>
                      {/* Dòng 1: Danh hiệu / Định vị AI */}
                      <tr className="hover:bg-purple-50/30 transition-colors bg-purple-50/15">
                        <td className={`sticky left-0 z-10 bg-white ${rowPadding} font-semibold text-slate-800 border-r border-slate-200`}>
                          <div className="flex items-center gap-1.5">
                            <Trophy className="w-3.5 h-3.5 text-purple-600" />
                            <span className={`${fontSizeKey} font-bold text-purple-900`}>Vị thế & Huy hiệu AI</span>
                          </div>
                        </td>
                        {products.map(p => {
                          const ins = aiAnalysis.insights[p.id];
                          return (
                            <td key={p.id} className={`${rowPadding} border-r border-slate-200 bg-white align-top`}>
                              {ins ? (
                                <span
                                  className={`inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-lg border ${
                                    ins.badge.color === 'emerald'
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                      : ins.badge.color === 'purple'
                                      ? 'bg-purple-50 text-purple-700 border-purple-300'
                                      : ins.badge.color === 'amber'
                                      ? 'bg-amber-50 text-amber-700 border-amber-300'
                                      : 'bg-blue-50 text-blue-700 border-blue-300'
                                  }`}
                                >
                                  <Sparkles className="w-3 h-3" />
                                  {ins.badge.label}
                                </span>
                              ) : (
                                <span className="text-slate-400 text-xs">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Dòng 2: Ưu điểm vượt trội (Pros) */}
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className={`sticky left-0 z-10 bg-white ${rowPadding} font-semibold text-slate-800 border-r border-slate-200 align-top`}>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span className={`${fontSizeKey} font-bold text-emerald-800`}>Ưu điểm vượt trội</span>
                          </div>
                        </td>
                        {products.map(p => {
                          const ins = aiAnalysis.insights[p.id];
                          return (
                            <td key={p.id} className={`${rowPadding} border-r border-slate-200 bg-white align-top`}>
                              {ins && ins.pros.length > 0 ? (
                                <ul className="space-y-1 text-xs text-slate-700">
                                  {ins.pros.map((pro, i) => (
                                    <li key={i} className="flex items-start gap-1.5 leading-snug">
                                      <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
                                      <span className="font-medium text-slate-800">{pro}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="text-slate-400 text-xs">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Dòng 3: Điểm hạn chế / Cần lưu ý (Cons) */}
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className={`sticky left-0 z-10 bg-white ${rowPadding} font-semibold text-slate-800 border-r border-slate-200 align-top`}>
                          <div className="flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                            <span className={`${fontSizeKey} font-bold text-amber-800`}>Điểm cần cân nhắc</span>
                          </div>
                        </td>
                        {products.map(p => {
                          const ins = aiAnalysis.insights[p.id];
                          return (
                            <td key={p.id} className={`${rowPadding} border-r border-slate-200 bg-white align-top`}>
                              {ins && ins.cons.length > 0 ? (
                                <ul className="space-y-1 text-xs text-slate-600">
                                  {ins.cons.map((con, i) => (
                                    <li key={i} className="flex items-start gap-1.5 leading-snug">
                                      <span className="text-amber-500 font-bold shrink-0 mt-0.5">•</span>
                                      <span>{con}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="text-slate-400 text-xs">Không có hạn chế nổi bật</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Dòng 4: Khách hàng phù hợp (Target Audience) */}
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className={`sticky left-0 z-10 bg-white ${rowPadding} font-semibold text-slate-800 border-r border-slate-200 align-top`}>
                          <div className="flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                            <span className={`${fontSizeKey} font-bold text-blue-900`}>Đối tượng phù hợp</span>
                          </div>
                        </td>
                        {products.map(p => {
                          const ins = aiAnalysis.insights[p.id];
                          return (
                            <td key={p.id} className={`${rowPadding} border-r border-slate-200 bg-white align-top`}>
                              {ins?.targetAudience ? (
                                <div className="text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200/80 leading-relaxed font-medium">
                                  {ins.targetAudience}
                                </div>
                              ) : (
                                <span className="text-slate-400 text-xs">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    </>
                  )}
                </>
              )}

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

                  {/* Lợi nhuận gộp = (Giá bán lẻ thương mại - Giá NPP) / Giá bán lẻ x 100% */}
                  <tr className="bg-emerald-50/50 hover:bg-emerald-50/80 transition-colors">
                    <td className={`sticky left-0 z-10 bg-emerald-50/90 ${rowPadding} font-bold text-emerald-950 border-r border-slate-200`}>
                      <div className="space-y-0.5">
                        <span className={`${fontSizeKey} font-bold text-emerald-900 block`}>
                          Lợi nhuận gộp (Lãi / Cái)
                        </span>
                        <span className="text-[11px] font-normal text-emerald-700">
                          (Giá bán lẻ - Giá NPP) / Bán lẻ
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
                                +{financials.grossMarginPercent}%
                              </span>
                              <span className="font-mono font-bold text-xs text-slate-700 bg-white px-2 py-0.5 rounded border border-emerald-200 shadow-2xs">
                                {formatVND(financials.grossProfit)}
                              </span>
                            </div>
                            {/* Thanh trực quan tỷ lệ % lợi nhuận */}
                            <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-emerald-600 h-full rounded-full transition-all"
                                style={{ width: `${Math.min(financials.grossMarginPercent * 2, 100)}%` }}
                              />
                            </div>
                          </div>
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
                loading="lazy"
                decoding="async"
                className="max-h-[55vh] max-w-full object-contain rounded-lg shadow-sm"
                onError={e => {
                  const imgEl = e.currentTarget as HTMLImageElement;
                  imgEl.onerror = null;
                  imgEl.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Crect width="18" height="18" x="3" y="3" rx="2"/%3E%3Cpath d="M3 9h18"/%3E%3Cpath d="M9 21V9"/%3E%3C/svg%3E';
                }}
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
