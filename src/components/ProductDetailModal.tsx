import React, { useState, useEffect, useMemo } from 'react';
import { Product } from '../types/product';
import { formatVND, calculateFinancials } from '../utils/pricing';
import {
  findSimilarProducts,
  SimilarProductResult,
} from '../utils/aiProductAdvisor';
import {
  X,
  ShieldCheck,
  Scale,
  Calendar,
  Info,
  Layers,
  TrendingUp,
  Package,
  Coins,
  PanelRightClose,
  PanelRight,
  PanelRightOpen,
  Trash2,
  Edit3,
  Sparkles,
  RefreshCw,
  Loader2,
  Eye,
  Maximize2,
  Minimize2,
  ZoomIn,
} from 'lucide-react';
import { ProductImageLightboxModal } from './ProductImageLightboxModal';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onToggleCompare: (product: Product) => void;
  isComparing: boolean;
  showCostPrice: boolean;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (productId: string) => void;
  allProducts?: Product[];
  onSelectProduct?: (product: Product) => void;
  compareIds?: string[];
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onToggleCompare,
  isComparing,
  showCostPrice,
  onEditProduct,
  onDeleteProduct,
  allProducts = [],
  onSelectProduct,
  compareIds = [],
}) => {
  // Quản lý bề rộng ngăn bên: 'narrow' (Hẹp), 'standard' (Chuẩn), 'wide' (Rộng)
  const [panelWidth, setPanelWidth] = useState<'narrow' | 'standard' | 'wide'>('standard');

  // AI Sản phẩm tương tự - Mặc định LUÔN MỞ RỘNG (wide) theo yêu cầu
  const [similarProducts, setSimilarProducts] = useState<SimilarProductResult[]>([]);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);
  const [showSimilarPanel, setShowSimilarPanel] = useState(true);
  const [similarPanelWidth, setSimilarPanelWidth] = useState<'normal' | 'wide'>(() => {
    try {
      const saved = localStorage.getItem('procompare_similar_panel_width');
      if (saved === 'normal' || saved === 'wide') return saved;
    } catch (e) {}
    return 'wide'; // Mặc định luôn mở rộng (wide)
  });
  const [similarFilter, setSimilarFilter] = useState<'all' | 'compatible' | 'type' | 'group' | 'name'>('all');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string | null>(null);
  const [zoomImageProduct, setZoomImageProduct] = useState<Product | null>(null);

  const toggleSimilarPanelWidth = () => {
    setSimilarPanelWidth(w => {
      const next = w === 'normal' ? 'wide' : 'normal';
      try {
        localStorage.setItem('procompare_similar_panel_width', next);
      } catch (e) {}
      return next;
    });
  };

  // Tự động tìm sản phẩm tương tự khi mở sản phẩm (tăng giới hạn lên 40 sản phẩm)
  useEffect(() => {
    if (product && allProducts && allProducts.length > 0) {
      setIsLoadingSimilar(true);
      setSelectedBrandFilter(null);
      setSimilarFilter('all');
      findSimilarProducts(product, allProducts, undefined, 40)
        .then(results => {
          setSimilarProducts(results);
        })
        .catch(err => {
          console.warn('Lỗi tìm sản phẩm tương tự:', err);
        })
        .finally(() => {
          setIsLoadingSimilar(false);
        });
    } else {
      setSimilarProducts([]);
      setSelectedBrandFilter(null);
    }
  }, [product?.id, allProducts]);

  const handleRefreshSimilar = () => {
    if (!product || !allProducts || allProducts.length === 0) return;
    setIsLoadingSimilar(true);
    findSimilarProducts(product, allProducts, undefined, 40)
      .then(res => setSimilarProducts(res))
      .catch(e => console.warn(e))
      .finally(() => setIsLoadingSimilar(false));
  };

  // Danh sách các thương hiệu có trong danh sách gợi ý tương tự kèm số lượng sản phẩm
  const brandStatsInSimilar = useMemo(() => {
    const map: Record<string, number> = {};
    similarProducts.forEach(s => {
      const b = (s.product.brand || 'Khác').trim();
      if (b) {
        map[b] = (map[b] || 0) + 1;
      }
    });
    return Object.entries(map)
      .map(([brand, count]) => ({ brand, count }))
      .sort((a, b) => b.count - a.count || a.brand.localeCompare(b.brand, 'vi'));
  }, [similarProducts]);

  // Danh sách các sản phẩm có độ tương thích cao
  const compatibleProducts = React.useMemo(() => {
    const highMatch = similarProducts.filter(
      s =>
        (s.criteriaMatch?.typeMatch?.isSame && s.criteriaMatch?.groupMatch?.isSame) ||
        s.similarityScore >= 70 ||
        s.criteriaMatch?.typeMatch?.isSame
    );
    if (highMatch.length > 0) return highMatch;
    return similarProducts.filter(s => s.similarityScore >= 50);
  }, [similarProducts]);

  const displayedSimilarProducts = React.useMemo(() => {
    let list = similarProducts;
    if (similarFilter === 'compatible') {
      list = compatibleProducts;
    } else if (similarFilter === 'type') {
      list = similarProducts.filter(s => s.criteriaMatch?.typeMatch?.isSame);
    } else if (similarFilter === 'group') {
      list = similarProducts.filter(s => s.criteriaMatch?.groupMatch?.isSame);
    } else if (similarFilter === 'name') {
      list = similarProducts.filter(s => (s.criteriaMatch?.nameMatch?.score || 0) >= 20);
    }

    if (selectedBrandFilter) {
      list = list.filter(
        s => (s.product.brand || 'Khác').trim().toLowerCase() === selectedBrandFilter.trim().toLowerCase()
      );
    }

    return list;
  }, [similarProducts, similarFilter, compatibleProducts, selectedBrandFilter]);

  if (!product) return null;

  const financials = calculateFinancials(
    product.pricing || { costPrice: 0, distributorPrice: 0, floorPrice: 0, retailPrice: 0, currency: 'VND' }
  );

  const panelWidthStyle =
    panelWidth === 'narrow'
      ? 'min(540px, 100vw)'
      : panelWidth === 'wide'
      ? 'min(1360px, 100vw)'
      : 'min(860px, -4rem + 100vw)';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-2xs z-50 transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* PANEL BÊN TRÁI: SẢN PHẨM TƯƠNG TỰ (AI GỢI Ý ĐỐI CHIẾU) */}
      {showSimilarPanel && allProducts && allProducts.length > 0 && (
        <aside
          style={{ zIndex: 61 }}
          aria-label="Sản phẩm tương tự AI"
          className={`fixed inset-y-0 left-0 hidden md:flex flex-col ${
            similarPanelWidth === 'wide'
              ? 'w-[580px] md:w-[640px] lg:w-[700px] xl:w-[780px] 2xl:w-[860px] max-w-[95vw]'
              : 'w-[320px] lg:w-[350px] xl:w-[380px] 2xl:w-[400px]'
          } bg-white text-slate-800 backdrop-blur-md border-r border-slate-200/90 shadow-2xl animate-in slide-in-from-left duration-200 overflow-hidden transition-all`}
        >
          {/* Header Panel */}
          <div className="p-3 border-b border-slate-200 bg-slate-50/90 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/80 shadow-2xs">
                <Sparkles className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 leading-none">
                  Sản phẩm tương tự AI
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 font-bold font-mono border border-blue-200/60">
                    {similarProducts.length}
                  </span>
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Đối chiếu kho & so sánh cùng phân khúc
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleSimilarPanelWidth}
                className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                title={similarPanelWidth === 'normal' ? 'Mở rộng ngăn trái (Xem rộng rãi hơn)' : 'Thu hẹp ngăn trái (Gọn gàng)'}
              >
                {similarPanelWidth === 'normal' ? (
                  <Maximize2 className="w-3.5 h-3.5" />
                ) : (
                  <Minimize2 className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                type="button"
                onClick={handleRefreshSimilar}
                disabled={isLoadingSimilar}
                className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                title="Quét lại sản phẩm tương tự bằng AI"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSimilar ? 'animate-spin text-blue-600' : ''}`} />
              </button>
              <button
                type="button"
                onClick={() => setShowSimilarPanel(false)}
                className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                title="Tạm ẩn thanh gợi ý bên trái"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Thanh lọc nhanh tiêu chí & thương hiệu khi có nhiều sản phẩm */}
          {similarProducts.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-slate-200 bg-slate-50/50 overflow-x-auto text-[10px] shrink-0 scrollbar-thin">
              <button
                type="button"
                onClick={() => {
                  setSimilarFilter('all');
                  setSelectedBrandFilter(null);
                }}
                className={`px-2 py-0.5 rounded-full font-medium whitespace-nowrap cursor-pointer transition-all ${
                  similarFilter === 'all' && !selectedBrandFilter
                    ? 'bg-blue-600 text-white font-bold shadow-2xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Tất cả ({similarProducts.length})
              </button>
              <button
                type="button"
                onClick={() => setSimilarFilter(similarFilter === 'compatible' ? 'all' : 'compatible')}
                className={`px-2 py-0.5 rounded-full font-medium whitespace-nowrap cursor-pointer transition-all flex items-center gap-1 ${
                  similarFilter === 'compatible'
                    ? 'bg-amber-500 text-white font-bold shadow-2xs'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                }`}
                title="Sản phẩm tương thích cao (cùng loại, nhóm hoặc điểm tương đồng cao)"
              >
                🔥 Tương thích ({compatibleProducts.length})
              </button>
              <button
                type="button"
                onClick={() => setSimilarFilter(similarFilter === 'type' ? 'all' : 'type')}
                className={`px-2 py-0.5 rounded-full font-medium whitespace-nowrap cursor-pointer transition-all ${
                  similarFilter === 'type'
                    ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Cùng loại ({similarProducts.filter(s => s.criteriaMatch?.typeMatch?.isSame).length})
              </button>
              <button
                type="button"
                onClick={() => setSimilarFilter(similarFilter === 'group' ? 'all' : 'group')}
                className={`px-2 py-0.5 rounded-full font-medium whitespace-nowrap cursor-pointer transition-all ${
                  similarFilter === 'group'
                    ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Cùng nhóm ({similarProducts.filter(s => s.criteriaMatch?.groupMatch?.isSame).length})
              </button>
              <button
                type="button"
                onClick={() => setSimilarFilter(similarFilter === 'name' ? 'all' : 'name')}
                className={`px-2 py-0.5 rounded-full font-medium whitespace-nowrap cursor-pointer transition-all ${
                  similarFilter === 'name'
                    ? 'bg-purple-600 text-white font-bold shadow-2xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Khớp tên ({similarProducts.filter(s => (s.criteriaMatch?.nameMatch?.score || 0) >= 20).length})
              </button>

              {/* Phân tách và Lọc theo thương hiệu */}
              {brandStatsInSimilar.length > 0 && (
                <>
                  <span className="w-px h-3.5 bg-slate-300 mx-0.5 shrink-0" />
                  {brandStatsInSimilar.map(({ brand, count }) => {
                    const isActive = selectedBrandFilter?.toLowerCase() === brand.toLowerCase();
                    return (
                      <button
                        key={brand}
                        type="button"
                        onClick={() => setSelectedBrandFilter(isActive ? null : brand)}
                        className={`px-2 py-0.5 rounded-full font-medium whitespace-nowrap cursor-pointer transition-all ${
                          isActive
                            ? 'bg-blue-600 text-white font-bold shadow-2xs'
                            : 'bg-white text-slate-700 hover:text-blue-700 hover:bg-blue-50/70 border border-slate-200'
                        }`}
                        title={`Lọc theo thương hiệu: ${brand} (${count} sản phẩm)`}
                      >
                        {brand} ({count})
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          )}

          {/* Body: Danh sách sản phẩm tương tự */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/50">
            {isLoadingSimilar ? (
              <div className="p-8 text-center space-y-2.5">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
                <p className="text-xs text-slate-700 font-semibold">
                  AI đang phân tích sản phẩm tương tự...
                </p>
                <p className="text-[11px] text-slate-500">
                  Đang quét kho hàng để tìm các mã cùng ngành hàng & phân khúc
                </p>
              </div>
            ) : similarProducts.length === 0 ? (
              <div className="p-8 text-center text-slate-500 space-y-2">
                <Package className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs">Chưa tìm thấy sản phẩm cùng phân khúc trong kho.</p>
                <button
                  type="button"
                  onClick={handleRefreshSimilar}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold cursor-pointer"
                >
                  Tìm lại
                </button>
              </div>
            ) : displayedSimilarProducts.length === 0 ? (
              <div className="p-6 text-center text-slate-500 space-y-2">
                <p className="text-xs">Không có sản phẩm nào phù hợp với bộ lọc này.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSimilarFilter('all');
                    setSelectedBrandFilter(null);
                  }}
                  className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-blue-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer shadow-2xs"
                >
                  Hiển thị tất cả ({similarProducts.length})
                </button>
              </div>
            ) : (
              displayedSimilarProducts.map(({ product: sim, similarityScore, matchReasons, criteriaMatch }) => {
                const isItemComparing = compareIds?.includes(sim.id);
                return (
                  <div
                    key={sim.id}
                    className="p-3 rounded-xl bg-white hover:bg-blue-50/20 border border-slate-200/90 hover:border-blue-400 transition-all space-y-2.5 shadow-2xs hover:shadow-xs"
                  >
                    {/* Hàng trên: Badge điểm & SKU */}
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                        {sim.sku}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        🔥 {similarityScore}% tương đồng
                      </span>
                    </div>

                    {/* Thân thẻ: Khi mở rộng (wide), tiêu chí nằm cạnh tên; khi thu gọn (normal), xếp dọc */}
                    {similarPanelWidth === 'wide' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                        {/* Cột trái: Ảnh + Tên + Hãng/Loại + Giá */}
                        <div className="sm:col-span-6 flex items-start gap-2.5 min-w-0">
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setZoomImageProduct(sim);
                            }}
                            className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 hover:border-blue-500 overflow-hidden shrink-0 flex items-center justify-center p-1 cursor-zoom-in transition-colors group/simthumb relative shadow-2xs"
                            title="Click để xem ảnh phóng to"
                          >
                            <img
                              src={sim.thumbnail}
                              alt={sim.name}
                              loading="lazy"
                              className="max-h-full max-w-full object-contain group-hover/simthumb:scale-110 transition-transform"
                              onError={e => {
                                (e.currentTarget as HTMLImageElement).src =
                                  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Crect width="18" height="18" x="3" rx="2"/%3E%3Cpath d="M3 9h18"/%3E%3Cpath d="M9 21V9"/%3E%3C/svg%3E';
                              }}
                            />
                            <div className="absolute inset-0 bg-black/30 rounded opacity-0 group-hover/simthumb:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                              <ZoomIn className="w-3 h-3 text-white" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h5 className="text-xs font-bold text-slate-800 hover:text-blue-600 line-clamp-2 leading-tight transition-colors" title={sim.name}>
                              {sim.name}
                            </h5>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] font-mono font-bold text-amber-600">
                                {formatVND(sim.pricing?.retailPrice || 0)}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                NPP: {formatVND(sim.pricing?.distributorPrice || 0)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-1">
                              <span className="text-slate-700 font-semibold">{sim.brand || 'Chưa rõ hãng'}</span>
                              {sim.categoryType && (
                                <>
                                  <span>•</span>
                                  <span className="text-slate-500 truncate max-w-[140px]">{sim.categoryType}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Cột phải: BẢNG ĐỐI CHIẾU 3 TIÊU CHÍ NẰM CẠNH TÊN */}
                        <div className="sm:col-span-6 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200/90 text-[10px] space-y-1">
                          <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                            <span className="font-semibold text-slate-700 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-blue-600" />
                              Đối chiếu 3 tiêu chí
                            </span>
                            <span className="font-mono font-bold text-emerald-600">{similarityScore}đ</span>
                          </div>

                          {/* 1. Tên */}
                          <div className="flex items-center justify-between gap-1.5 leading-tight">
                            <div className="flex items-center gap-1 shrink-0 text-slate-500 font-medium">
                              <span>1. Tên:</span>
                              <span className="font-mono text-blue-700 font-bold">{criteriaMatch?.nameMatch?.score ?? 0}%</span>
                            </div>
                            <div className="truncate text-right" title={criteriaMatch?.nameMatch?.commonWords?.join(', ') || ''}>
                              {criteriaMatch?.nameMatch?.commonWords && criteriaMatch.nameMatch.commonWords.length > 0 ? (
                                <span className="text-emerald-700 font-semibold truncate">
                                  ✓ {criteriaMatch.nameMatch.commonWords.slice(0, 3).join(', ')}
                                </span>
                              ) : (
                                <span className="text-slate-400 italic">Khác từ khóa</span>
                              )}
                            </div>
                          </div>

                          {/* 2. Nhóm */}
                          <div className="flex items-center justify-between gap-1.5 leading-tight">
                            <span className="text-slate-500 font-medium shrink-0">2. Nhóm:</span>
                            <div className="flex items-center gap-1 truncate" title={`SP này: ${sim.categoryGroup || 'Chưa đặt'}`}>
                              <span
                                className={`px-1 py-0.2 rounded text-[9px] font-bold shrink-0 ${
                                  criteriaMatch?.groupMatch?.isSame
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                {criteriaMatch?.groupMatch?.isSame ? '✓ Cùng' : '≠ Khác'}
                              </span>
                              <span className={`truncate ${criteriaMatch?.groupMatch?.isSame ? 'text-slate-700' : 'text-amber-800 font-medium'}`}>
                                {sim.categoryGroup || '(Chưa đặt)'}
                              </span>
                            </div>
                          </div>

                          {/* 3. Loại */}
                          <div className="flex items-center justify-between gap-1.5 leading-tight">
                            <span className="text-slate-500 font-medium shrink-0">3. Loại:</span>
                            <div className="flex items-center gap-1 truncate" title={`SP này: ${sim.categoryType || 'Chưa đặt'}`}>
                              <span
                                className={`px-1 py-0.2 rounded text-[9px] font-bold shrink-0 ${
                                  criteriaMatch?.typeMatch?.isSame
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                {criteriaMatch?.typeMatch?.isSame ? '✓ Cùng' : '≠ Khác'}
                              </span>
                              <span className={`truncate ${criteriaMatch?.typeMatch?.isSame ? 'text-slate-700' : 'text-amber-800 font-medium'}`}>
                                {sim.categoryType || '(Chưa đặt)'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Giữa: Ảnh + Tên */}
                        <div className="flex items-start gap-2.5">
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setZoomImageProduct(sim);
                            }}
                            className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 hover:border-blue-500 overflow-hidden shrink-0 flex items-center justify-center p-1 cursor-zoom-in transition-colors group/simthumb relative shadow-2xs"
                            title="Click để xem ảnh phóng to"
                          >
                            <img
                              src={sim.thumbnail}
                              alt={sim.name}
                              loading="lazy"
                              className="max-h-full max-w-full object-contain group-hover/simthumb:scale-110 transition-transform"
                              onError={e => {
                                (e.currentTarget as HTMLImageElement).src =
                                  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Crect width="18" height="18" x="3" rx="2"/%3E%3Cpath d="M3 9h18"/%3E%3Cpath d="M9 21V9"/%3E%3C/svg%3E';
                              }}
                            />
                            <div className="absolute inset-0 bg-black/30 rounded opacity-0 group-hover/simthumb:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                              <ZoomIn className="w-3 h-3 text-white" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h5 className="text-xs font-bold text-slate-800 hover:text-blue-600 line-clamp-2 leading-tight transition-colors" title={sim.name}>
                              {sim.name}
                            </h5>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] font-mono font-bold text-amber-600">
                                {formatVND(sim.pricing?.retailPrice || 0)}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                NPP: {formatVND(sim.pricing?.distributorPrice || 0)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* BẢNG ĐỐI CHIẾU 3 TIÊU CHÍ SIÊU GỌN */}
                        <div className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200/90 text-[10px] space-y-1">
                          <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                            <span className="font-semibold text-slate-700 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-blue-600" />
                              Đối chiếu 3 tiêu chí
                            </span>
                            <span className="font-mono font-bold text-emerald-600">{similarityScore}đ</span>
                          </div>

                          {/* 1. Tên */}
                          <div className="flex items-center justify-between gap-1.5 leading-tight">
                            <div className="flex items-center gap-1 shrink-0 text-slate-500 font-medium">
                              <span>1. Tên:</span>
                              <span className="font-mono text-blue-700 font-bold">{criteriaMatch?.nameMatch?.score ?? 0}%</span>
                            </div>
                            <div className="truncate text-right" title={criteriaMatch?.nameMatch?.commonWords?.join(', ') || ''}>
                              {criteriaMatch?.nameMatch?.commonWords && criteriaMatch.nameMatch.commonWords.length > 0 ? (
                                <span className="text-emerald-700 font-semibold truncate">
                                  ✓ {criteriaMatch.nameMatch.commonWords.slice(0, 3).join(', ')}
                                </span>
                              ) : (
                                <span className="text-slate-400 italic">Khác từ khóa</span>
                              )}
                            </div>
                          </div>

                          {/* 2. Nhóm */}
                          <div className="flex items-center justify-between gap-1.5 leading-tight">
                            <span className="text-slate-500 font-medium shrink-0">2. Nhóm:</span>
                            <div className="flex items-center gap-1 truncate" title={`SP này: ${sim.categoryGroup || 'Chưa đặt'}`}>
                              <span
                                className={`px-1 py-0.2 rounded text-[9px] font-bold shrink-0 ${
                                  criteriaMatch?.groupMatch?.isSame
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                {criteriaMatch?.groupMatch?.isSame ? '✓ Cùng' : '≠ Khác'}
                              </span>
                              <span className={`truncate ${criteriaMatch?.groupMatch?.isSame ? 'text-slate-700' : 'text-amber-800 font-medium'}`}>
                                {sim.categoryGroup || '(Chưa đặt)'}
                              </span>
                            </div>
                          </div>

                          {/* 3. Loại */}
                          <div className="flex items-center justify-between gap-1.5 leading-tight">
                            <span className="text-slate-500 font-medium shrink-0">3. Loại:</span>
                            <div className="flex items-center gap-1 truncate" title={`SP này: ${sim.categoryType || 'Chưa đặt'}`}>
                              <span
                                className={`px-1 py-0.2 rounded text-[9px] font-bold shrink-0 ${
                                  criteriaMatch?.typeMatch?.isSame
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                {criteriaMatch?.typeMatch?.isSame ? '✓ Cùng' : '≠ Khác'}
                              </span>
                              <span className={`truncate ${criteriaMatch?.typeMatch?.isSame ? 'text-slate-700' : 'text-amber-800 font-medium'}`}>
                                {sim.categoryType || '(Chưa đặt)'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Nút tác vụ nhanh */}
                    <div className="flex items-center justify-end gap-2 pt-1.5 border-t border-slate-200/80">
                      {onSelectProduct && (
                        <button
                          type="button"
                          onClick={() => onSelectProduct(sim)}
                          className="py-1 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          title="Xem chi tiết sản phẩm này"
                        >
                          <Eye className="w-3 h-3 text-slate-500" />
                          <span>Xem chi tiết</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onToggleCompare(sim)}
                        className={`py-1 px-2.5 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                          isItemComparing
                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
                        }`}
                        title="Đưa vào so sánh"
                      >
                        <Scale className="w-3 h-3" />
                        <span>{isItemComparing ? 'Bỏ so sánh' : '+ So sánh'}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>
      )}

      {/* Ngăn bên Slide-over Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Chi tiết sản phẩm ${product.name}`}
        tabIndex={-1}
        style={{
          zIndex: 61,
          width: panelWidthStyle,
          transform: 'none',
        }}
        className="fixed inset-y-0 right-0 w-full bg-card shadow-ultra flex flex-col h-[100dvh] border-l border-border/40 outline-none transform-gpu animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between gap-4 border-b border-border/60 bg-card shrink-0"
          style={{
            paddingTop: 'max(0.5rem, env(safe-area-inset-top, 0px))',
            paddingBottom: '0.5rem',
            paddingLeft: 'max(0.75rem, env(safe-area-inset-left, 0px))',
            paddingRight: 'max(0.75rem, env(safe-area-inset-right, 0px))',
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
              <Package className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs bg-foreground text-background px-2 py-0.5 rounded">
                  {product.sku}
                </span>
                <span className="text-[11px] text-muted-foreground font-medium">
                  {product.categoryGroup} &bull; {product.categoryType}
                </span>
              </div>
              <h3 className="text-base font-semibold text-foreground leading-tight truncate mt-0.5" title={product.name}>
                {product.name}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Nút bật/tắt panel AI Sản phẩm tương tự */}
            {allProducts && allProducts.length > 0 && (
              <button
                type="button"
                onClick={() => setShowSimilarPanel(prev => !prev)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs mr-1 ${
                  showSimilarPanel
                    ? 'bg-blue-600 text-white shadow-blue-200'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                }`}
                title="Bật/tắt thanh gợi ý sản phẩm tương tự bên trái màn hình"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">SP tương tự AI</span>
                {similarProducts.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-mono">
                    {similarProducts.length}
                  </span>
                )}
              </button>
            )}

            {/* Nhóm nút điều chỉnh bề rộng (Hẹp | Chuẩn | Rộng) */}
            <div
              role="group"
              aria-label="Bề rộng ngăn bên"
              className="flex items-center gap-0.5 shrink-0 rounded-xl border border-border/60 p-0.5"
            >
              <button
                type="button"
                aria-pressed={panelWidth === 'narrow'}
                aria-label="Hẹp"
                title="Bề rộng hẹp (540px)"
                onClick={() => setPanelWidth('narrow')}
                className={`p-2 rounded-lg transition-colors active:scale-90 cursor-pointer ${
                  panelWidth === 'narrow'
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <PanelRightClose className="w-4 h-4 stroke-[2.5px]" aria-hidden="true" />
              </button>

              <button
                type="button"
                aria-pressed={panelWidth === 'standard'}
                aria-label="Chuẩn"
                title="Bề rộng chuẩn (768px)"
                onClick={() => setPanelWidth('standard')}
                className={`p-2 rounded-lg transition-colors active:scale-90 cursor-pointer ${
                  panelWidth === 'standard'
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <PanelRight className="w-4 h-4 stroke-[2.5px]" aria-hidden="true" />
              </button>

              <button
                type="button"
                aria-pressed={panelWidth === 'wide'}
                aria-label="Rộng"
                title="Bề rộng rộng (1100px)"
                onClick={() => setPanelWidth('wide')}
                className={`p-2 rounded-lg transition-colors active:scale-90 cursor-pointer ${
                  panelWidth === 'wide'
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <PanelRightOpen className="w-4 h-4 stroke-[2.5px]" aria-hidden="true" />
              </button>
            </div>

            {/* Nút đóng */}
            <button
              type="button"
              aria-label="Đóng"
              onClick={onClose}
              className="p-2.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors active:scale-90 shrink-0 cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[2.5px]" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Nội dung chi tiết cuộn */}
        <div className="flex-1 overflow-y-auto bg-muted/50 p-4 sm:p-5 custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-4">
            
            {/* CARD 1: THÔNG TIN SẢN PHẨM & HÌNH ẢNH */}
            <div className="w-full bg-card p-3.5 sm:p-4 md:p-5 rounded-xl border border-border shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pb-2 sm:pb-2.5 border-b border-primary/20">
                <h4 className="text-xs uppercase tracking-wider flex min-w-0 items-center gap-1.5 sm:gap-2 text-primary font-bold">
                  <Package className="w-3.5 h-3.5" aria-hidden="true" />
                  <span className="truncate">Thông tin cơ bản &amp; Hình ảnh</span>
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-start">
                <div
                  onClick={() => setZoomImageProduct(product)}
                  className="sm:col-span-1 rounded-2xl overflow-hidden border-2 border-border bg-muted/30 aspect-square mx-auto w-28 sm:w-full max-w-[130px] shadow-2xs cursor-zoom-in relative group/mainphoto"
                  title="Click để xem ảnh mở rộng"
                >
                  <img
                    src={product.thumbnail}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover/mainphoto:scale-105 transition-transform duration-200"
                    onError={e => {
                      const imgEl = e.currentTarget as HTMLImageElement;
                      imgEl.onerror = null;
                      imgEl.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Crect width="18" height="18" x="3" y="3" rx="2"/%3E%3Cpath d="M3 9h18"/%3E%3Cpath d="M9 21V9"/%3E%3C/svg%3E';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/35 opacity-0 group-hover/mainphoto:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                    <span className="px-2 py-1 rounded bg-black/70 text-white text-[10px] font-semibold flex items-center gap-1 backdrop-blur-xs">
                      <ZoomIn className="w-3 h-3 text-blue-400" /> Phóng to
                    </span>
                  </div>
                </div>

                <div className="sm:col-span-3 space-y-2.5">
                  <div>
                    {product.brand && (
                      <span className="text-xs font-bold uppercase tracking-wider text-primary block">
                        Hãng: {product.brand}
                      </span>
                    )}
                    <h2 className="text-base font-bold text-foreground leading-snug">
                      {product.name}
                    </h2>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {product.tags.map(t => (
                      <span
                        key={t}
                        className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/60"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1 border-t border-border/40">
                    {product.warrantyMonths && (
                      <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                        <ShieldCheck className="w-4 h-4" />
                        Bảo hành {product.warrantyMonths} tháng
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Cập nhật: {product.updatedAt}
                    </span>
                  </div>

                  {product.description && (
                    <div className="pt-2 border-t border-border/40">
                      <span className="text-[11px] font-bold text-foreground block mb-1">
                        Mô tả sản phẩm:
                      </span>
                      <p className="text-xs text-muted-foreground leading-relaxed italic bg-muted/20 p-2.5 rounded-lg border border-border/40">
                        {product.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* CARD 2: CƠ CẤU 4 TẦNG GIÁ */}
            <div className="w-full bg-card p-3.5 sm:p-4 md:p-5 rounded-xl border border-border shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pb-2 sm:pb-2.5 border-b border-primary/20">
                <h4 className="text-xs uppercase tracking-wider flex min-w-0 items-center gap-1.5 sm:gap-2 text-primary font-bold">
                  <Coins className="w-3.5 h-3.5" aria-hidden="true" />
                  <span className="truncate">Cơ cấu 4 tầng giá (VND)</span>
                </h4>
                <span className="text-xs font-mono font-bold text-emerald-600 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  LN gộp: +{financials.grossMarginPercent}% ({formatVND(financials.grossProfit)})
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-muted/30 rounded-xl border border-border">
                  <span className="text-[11px] text-muted-foreground block mb-0.5">1. Giá nhập (Gốc)</span>
                  {showCostPrice ? (
                    <span className="font-mono font-bold text-emerald-600 text-sm">
                      {formatVND(product.pricing.costPrice)}
                    </span>
                  ) : (
                    <span className="font-mono text-muted-foreground text-xs">•••••• (Ẩn)</span>
                  )}
                </div>

                <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <span className="text-[11px] text-blue-700 dark:text-blue-400 block font-medium mb-0.5">
                    2. Giá NPP (Đại lý)
                  </span>
                  <span className="font-mono font-bold text-blue-900 dark:text-blue-300 text-sm">
                    {formatVND(product.pricing.distributorPrice)}
                  </span>
                </div>

                <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                  <span className="text-[11px] text-amber-700 dark:text-amber-400 block font-medium mb-0.5">
                    3. Giá sàn
                  </span>
                  <span className="font-mono font-bold text-amber-900 dark:text-amber-300 text-sm">
                    {formatVND(product.pricing.floorPrice)}
                  </span>
                </div>

                <div className="p-3 bg-muted/30 rounded-xl border border-border">
                  <span className="text-[11px] text-muted-foreground block mb-0.5">4. Giá bán lẻ</span>
                  <span className="font-mono font-bold text-foreground text-sm">
                    {formatVND(product.pricing.retailPrice)}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 text-[11px] text-muted-foreground font-mono">
                Biên độ thương lượng tối đa giữa Giá sàn &amp; Giá bán lẻ:{' '}
                <strong className="text-foreground font-bold">
                  {formatVND(financials.discountBuffer)} ({financials.discountBufferPercent}%)
                </strong>
              </div>
            </div>

            {/* CARD 3: THÔNG SỐ KỸ THUẬT ĐẦY ĐỦ */}
            <div className="w-full bg-card p-3.5 sm:p-4 md:p-5 rounded-xl border border-border shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pb-2 sm:pb-2.5 border-b border-primary/20">
                <h4 className="text-xs uppercase tracking-wider flex min-w-0 items-center gap-1.5 sm:gap-2 text-primary font-bold">
                  <Layers className="w-3.5 h-3.5" aria-hidden="true" />
                  <span className="truncate">
                    Thông số kỹ thuật đầy đủ ({product.specifications.length} nhóm)
                  </span>
                </h4>
              </div>

              <div className="space-y-3">
                {product.specifications.map(sg => (
                  <div key={sg.groupName} className="border border-border rounded-xl overflow-hidden">
                    <div className="bg-muted/40 px-3.5 py-2 text-xs font-bold text-foreground uppercase tracking-wider border-b border-border/60">
                      {sg.groupName}
                    </div>
                    <div className="divide-y divide-border/40 bg-card">
                      {sg.items.map(item => (
                        <div
                          key={item.key}
                          className="px-3.5 py-2 flex items-center justify-between text-xs"
                        >
                          <span className="text-muted-foreground font-medium">{item.key}:</span>
                          <span
                            className={`text-foreground text-right ${
                              item.isHighlight ? 'font-bold text-primary' : ''
                            }`}
                          >
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CARD 4: GHI CHÚ CHÍNH SÁCH */}
            {product.notes && (
              <div className="w-full bg-amber-500/5 p-3.5 rounded-xl border border-amber-500/20 space-y-1">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  Ghi chú chính sách bán hàng &amp; cảnh báo
                </span>
                <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                  {product.notes}
                </p>
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div
          className="bg-card border-t border-border/60 flex flex-col-reverse sm:flex-row items-center shadow-sticky shrink-0 w-full gap-2"
          style={{
            paddingTop: '0.5rem',
            paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))',
            paddingLeft: 'max(0.75rem, env(safe-area-inset-left, 0px))',
            paddingRight: 'max(0.75rem, env(safe-area-inset-right, 0px))',
          }}
        >
          <div className="flex items-center justify-between w-full gap-2 flex-wrap">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium ring-offset-background transition-colors border bg-background hover:bg-muted hover:text-foreground h-8 px-3 text-xs border-border text-muted-foreground cursor-pointer"
            >
              Đóng
            </button>
            <div className="flex items-center gap-2">
              {onDeleteProduct && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${product.name}" (${product.sku}) không?`)) {
                      onDeleteProduct(product.id);
                      onClose();
                    }
                  }}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium ring-offset-background transition-colors border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground h-8 px-3 text-xs cursor-pointer shadow-2xs"
                  title="Xóa sản phẩm này"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1 shrink-0" />
                  <span>Xóa</span>
                </button>
              )}

              {onEditProduct && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEditProduct(product);
                  }}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg font-semibold ring-offset-background transition-colors border border-border bg-secondary text-secondary-foreground hover:bg-secondary/80 h-8 px-3 text-xs cursor-pointer shadow-2xs"
                  title="Chỉnh sửa thông tin sản phẩm này"
                >
                  <Edit3 className="w-3.5 h-3.5 mr-1 shrink-0" />
                  <span>Sửa</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => onToggleCompare(product)}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium ring-offset-background transition-colors h-8 px-3.5 text-xs text-white shadow-sm cursor-pointer ${
                  isComparing ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary hover:bg-primary/90'
                }`}
              >
                <Scale className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                <span>{isComparing ? 'Bỏ so sánh' : 'Đưa vào so sánh'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* LIGHTBOX MODAL: XEM ẢNH LỚN MỞ RỘNG KHI CLICK VÀO ẢNH */}
      <ProductImageLightboxModal
        product={zoomImageProduct}
        onClose={() => setZoomImageProduct(null)}
        showCostPrice={showCostPrice}
      />
    </>
  );
};
