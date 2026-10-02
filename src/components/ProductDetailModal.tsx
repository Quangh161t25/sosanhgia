import React, { useState } from 'react';
import { Product } from '../types/product';
import { formatVND, calculateFinancials } from '../utils/pricing';
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
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onToggleCompare: (product: Product) => void;
  isComparing: boolean;
  showCostPrice: boolean;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (productId: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onToggleCompare,
  isComparing,
  showCostPrice,
  onEditProduct,
  onDeleteProduct,
}) => {
  // Quản lý bề rộng ngăn bên: 'narrow' (Hẹp), 'standard' (Chuẩn), 'wide' (Rộng)
  const [panelWidth, setPanelWidth] = useState<'narrow' | 'standard' | 'wide'>('standard');

  if (!product) return null;

  const financials = calculateFinancials(
    product.pricing || { costPrice: 0, distributorPrice: 0, floorPrice: 0, retailPrice: 0, currency: 'VND' }
  );

  const panelWidthStyle =
    panelWidth === 'narrow'
      ? 'min(540px, 100vw)'
      : panelWidth === 'wide'
      ? 'min(1100px, 100vw)'
      : 'min(768px, -4rem + 100vw)';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-2xs z-50 transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

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
                <div className="sm:col-span-1 rounded-full overflow-hidden border-2 border-border bg-muted/30 aspect-square mx-auto w-28 sm:w-full max-w-[130px] shadow-2xs">
                  <img
                    src={product.thumbnail}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
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
                  NPP: +{financials.nppMarginPercent}% ({formatVND(financials.nppGross)})
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
                    <span className="font-mono text-muted-foreground text-xs">•••••• ₫ (Ẩn)</span>
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
    </>
  );
};
