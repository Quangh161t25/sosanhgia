import React, { useEffect, useState } from 'react';
import { Product } from '../types/product';
import { formatVND } from '../utils/pricing';
import { X, ZoomIn, ZoomOut, ExternalLink, Eye, Tag, Package } from 'lucide-react';

interface ProductImageLightboxModalProps {
  product: Product | null;
  onClose: () => void;
  onViewDetail?: (product: Product) => void;
  showCostPrice?: boolean;
}

export const ProductImageLightboxModal: React.FC<ProductImageLightboxModalProps> = ({
  product,
  onClose,
  onViewDetail,
  showCostPrice = false,
}) => {
  const [isZoomed, setIsZoomed] = useState(false);

  // Lắng nghe phím ESC để đóng modal
  useEffect(() => {
    if (!product) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product, onClose]);

  // Reset zoom khi đổi sản phẩm
  useEffect(() => {
    setIsZoomed(false);
  }, [product?.id]);

  if (!product) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 pr-3">
            <span className="font-mono font-bold text-xs bg-blue-600 text-white px-2.5 py-1 rounded-md shrink-0 shadow-xs">
              {product.sku}
            </span>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-white truncate" title={product.name}>
                {product.name}
              </h3>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                {product.brand && (
                  <span className="flex items-center gap-1 font-medium text-slate-300">
                    <Tag className="w-3 h-3 text-blue-400" /> {product.brand}
                  </span>
                )}
                {product.categoryType && (
                  <>
                    <span>•</span>
                    <span className="text-slate-400">{product.categoryType}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Nút phóng to / thu nhỏ ảnh */}
            <button
              type="button"
              onClick={() => setIsZoomed(z => !z)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title={isZoomed ? 'Thu nhỏ kích thước chuẩn (Fit)' : 'Phóng to ảnh (1.5x)'}
            >
              {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
            </button>

            {/* Mở ảnh gốc trong tab mới */}
            {product.thumbnail && (
              <a
                href={product.thumbnail}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Mở ảnh gốc trong tab mới (Xem kích thước tối đa)"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {/* Đóng modal */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Đóng (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Khung hiển thị ảnh lớn */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 flex items-center justify-center bg-slate-950/80 min-h-[320px] max-h-[64vh]">
          {product.thumbnail ? (
            <div
              className={`relative flex items-center justify-center transition-transform duration-200 cursor-zoom-in ${
                isZoomed ? 'scale-150 cursor-zoom-out' : 'scale-100'
              }`}
              onClick={() => setIsZoomed(z => !z)}
              title={isZoomed ? 'Click để thu nhỏ' : 'Click để phóng to thêm'}
            >
              <img
                src={product.thumbnail}
                alt={product.name}
                loading="eager"
                decoding="async"
                className="max-h-[58vh] max-w-full object-contain rounded-xl shadow-2xl border border-slate-800/80 select-none bg-slate-900/40"
                onError={e => {
                  const imgEl = e.currentTarget as HTMLImageElement;
                  imgEl.onerror = null;
                  imgEl.src =
                    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"%3E%3Crect width="18" height="18" x="3" y="3" rx="2"/%3E%3Cpath d="M3 9h18"/%3E%3Cpath d="M9 21V9"/%3E%3C/svg%3E';
                }}
              />
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <Package className="w-12 h-12 mx-auto text-slate-600" />
              <p className="text-sm">Sản phẩm này chưa có hình ảnh thumbnail.</p>
            </div>
          )}
        </div>

        {/* Footer: Thông tin giá & Hành động */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-900/90 shrink-0 flex flex-wrap items-center justify-between gap-3">
          {/* 4 tầng giá nhanh */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1 min-w-[280px]">
            <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block font-medium">1. Giá nhập</span>
              <span className="text-xs sm:text-sm font-bold text-emerald-400 font-mono">
                {showCostPrice ? formatVND(product.pricing.costPrice) : '••••••'}
              </span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-blue-400 block font-medium">2. Giá NPP</span>
              <span className="text-xs sm:text-sm font-bold text-blue-300 font-mono">
                {formatVND(product.pricing.distributorPrice)}
              </span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-amber-400 block font-medium">3. Giá sàn</span>
              <span className="text-xs sm:text-sm font-bold text-amber-300 font-mono">
                {formatVND(product.pricing.floorPrice)}
              </span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-purple-400 block font-medium">4. Giá bán lẻ</span>
              <span className="text-xs sm:text-sm font-bold text-purple-300 font-mono">
                {formatVND(product.pricing.retailPrice)}
              </span>
            </div>
          </div>

          {/* Nút hành động */}
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            {onViewDetail && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onViewDetail(product);
                }}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Eye className="w-4 h-4" />
                <span>Xem chi tiết thông số</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
