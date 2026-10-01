import React from 'react';
import { Product } from '../types/product';
import { formatVND, calculateFinancials } from '../utils/pricing';
import { Scale, Check, ShieldCheck, Eye, Edit3, TrendingUp, Info } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  isSelectedForCompare: boolean;
  onToggleCompare: (product: Product) => void;
  onViewDetail: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  showCostPrice: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isSelectedForCompare,
  onToggleCompare,
  onViewDetail,
  onEditProduct,
  showCostPrice,
}) => {
  const financials = calculateFinancials(product.pricing);

  // Lấy ra 3 thông số nổi bật nhất
  const highlightedSpecs = React.useMemo(() => {
    const list: { key: string; value: string }[] = [];
    product.specifications.forEach(sg => {
      sg.items.forEach(item => {
        if (item.isHighlight && list.length < 3) {
          list.push({ key: item.key, value: item.value });
        }
      });
    });
    // Nếu chưa đủ 3, lấy các thông số đầu tiên
    if (list.length < 3) {
      product.specifications.forEach(sg => {
        sg.items.forEach(item => {
          if (!list.some(l => l.key === item.key) && list.length < 3) {
            list.push({ key: item.key, value: item.value });
          }
        });
      });
    }
    return list;
  }, [product]);

  return (
    <div
      className={`group bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
        isSelectedForCompare
          ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
          : 'border-slate-200/90 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50'
      }`}
    >
      <div>
        {/* Top Media & Badges */}
        <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
          <img
            src={product.thumbnail}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

          {/* Top Left: SKU / Modul Badge */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
            <span className="bg-slate-900/90 text-white font-mono font-bold text-xs px-2.5 py-1 rounded-md tracking-wider shadow-xs backdrop-blur-xs">
              {product.sku}
            </span>
            <span className="bg-white/90 text-slate-800 text-[10px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-xs shadow-xs">
              {product.categoryType}
            </span>
          </div>

          {/* Top Right: Compare Checkbox Button */}
          <button
            type="button"
            onClick={() => onToggleCompare(product)}
            className={`absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md ${
              isSelectedForCompare
                ? 'bg-blue-600 text-white shadow-blue-500/40'
                : 'bg-white/95 text-slate-700 hover:bg-white hover:text-blue-600 backdrop-blur-xs'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-md flex items-center justify-center border transition-colors ${
                isSelectedForCompare
                  ? 'bg-white text-blue-600 border-white'
                  : 'border-slate-300 bg-white'
              }`}
            >
              {isSelectedForCompare && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <span className="text-[11px]">
              {isSelectedForCompare ? 'Đã chọn' : 'So sánh'}
            </span>
          </button>

          {/* Bottom on Image: Warranty & Quick View */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white text-xs">
            {product.warrantyMonths && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-slate-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                BH {product.warrantyMonths}T
              </span>
            )}
            <button
              type="button"
              onClick={() => onViewDetail(product)}
              className="ml-auto flex items-center gap-1 text-[11px] bg-black/40 hover:bg-black/60 px-2 py-0.5 rounded-md text-slate-200 hover:text-white backdrop-blur-xs transition-colors"
            >
              <Eye className="w-3 h-3" />
              Chi tiết
            </button>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 space-y-3.5">
          {/* Brand & Name */}
          <div>
            {product.brand && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                {product.brand}
              </span>
            )}
            <h3
              onClick={() => onViewDetail(product)}
              className="text-sm font-bold text-slate-900 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer leading-snug mt-0.5"
              title={product.name}
            >
              {product.name}
            </h3>
          </div>

          {/* 4 Tầng Giá Matrix (Core Feature) */}
          <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-200/60 space-y-1.5">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center justify-between">
              <span>Bảng 4 tầng giá</span>
              <span className="text-emerald-700 font-semibold font-mono flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                NPP +{financials.nppMarginPercent}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Giá Nhập (Cost Price) */}
              <div className="p-1.5 rounded-lg bg-white border border-slate-200/70">
                <span className="text-[10px] text-slate-500 block leading-tight">1. Giá nhập:</span>
                {showCostPrice ? (
                  <span className="font-mono font-bold text-emerald-700 text-xs">
                    {formatVND(product.pricing.costPrice)}
                  </span>
                ) : (
                  <span className="font-mono text-slate-400 text-xs tracking-wider" title="Đang ẩn chế độ quản lý">
                    •••••• ₫
                  </span>
                )}
              </div>

              {/* Giá NPP (Distributor) */}
              <div className="p-1.5 rounded-lg bg-blue-50/60 border border-blue-200/70">
                <span className="text-[10px] text-blue-700 block leading-tight font-medium">
                  2. Giá NPP:
                </span>
                <span className="font-mono font-bold text-blue-900 text-xs">
                  {formatVND(product.pricing.distributorPrice)}
                </span>
              </div>

              {/* Giá Sàn (Floor Price) */}
              <div className="p-1.5 rounded-lg bg-amber-50/60 border border-amber-200/70">
                <span className="text-[10px] text-amber-700 block leading-tight font-medium">
                  3. Giá sàn:
                </span>
                <span className="font-mono font-bold text-amber-900 text-xs">
                  {formatVND(product.pricing.floorPrice)}
                </span>
              </div>

              {/* Giá Thương Mại (Retail) */}
              <div className="p-1.5 rounded-lg bg-white border border-slate-200/70">
                <span className="text-[10px] text-slate-500 block leading-tight">4. Thương mại:</span>
                <span className="font-mono font-bold text-slate-900 text-xs">
                  {formatVND(product.pricing.retailPrice)}
                </span>
              </div>
            </div>
          </div>

          {/* Key Specs Preview */}
          <div className="space-y-1 pt-1">
            {highlightedSpecs.map(spec => (
              <div
                key={spec.key}
                className="flex items-center justify-between text-[11px] text-slate-600 border-b border-slate-100 pb-1"
              >
                <span className="text-slate-500">{spec.key}:</span>
                <span className="font-medium text-slate-800 text-right truncate max-w-[160px]">
                  {spec.value}
                </span>
              </div>
            ))}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {product.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Notes hint */}
          {product.notes && (
            <div className="flex items-start gap-1.5 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-150">
              <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
              <p className="line-clamp-2 leading-relaxed">{product.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onEditProduct(product)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors text-xs flex items-center gap-1"
          title="Sửa thông số & giá"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span className="text-[11px]">Sửa</span>
        </button>

        <button
          type="button"
          onClick={() => onToggleCompare(product)}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            isSelectedForCompare
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-white border border-slate-300 text-slate-700 hover:border-blue-500 hover:text-blue-600 shadow-2xs'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>{isSelectedForCompare ? 'Bỏ so sánh' : 'Đưa vào so sánh'}</span>
        </button>
      </div>
    </div>
  );
};
