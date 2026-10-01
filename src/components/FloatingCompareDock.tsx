import React from 'react';
import { Product } from '../types/product';
import { Scale, X, ArrowRight, Trash2 } from 'lucide-react';

interface FloatingCompareDockProps {
  selectedProducts: Product[];
  onRemoveProduct: (productId: string) => void;
  onClearAll: () => void;
  onOpenCompareMatrix: () => void;
}

export const FloatingCompareDock: React.FC<FloatingCompareDockProps> = ({
  selectedProducts,
  onRemoveProduct,
  onClearAll,
  onOpenCompareMatrix,
}) => {
  if (selectedProducts.length === 0) return null;

  const canCompare = selectedProducts.length >= 2;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-4xl animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-3 sm:p-4 shadow-2xl border border-slate-700/80 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
        
        {/* Left: Products Carousel / Thumbnails */}
        <div className="flex items-center gap-2.5 overflow-x-auto py-1 max-w-full">
          <div className="hidden md:flex flex-col mr-2 shrink-0">
            <span className="text-xs font-bold text-blue-400 flex items-center gap-1">
              <Scale className="w-3.5 h-3.5" />
              So Sánh
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {selectedProducts.length}/5 Modul
            </span>
          </div>

          {selectedProducts.map(product => (
            <div
              key={product.id}
              className="relative group shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border-2 border-slate-700 bg-slate-800"
            >
              <img
                src={product.thumbnail}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-end p-1">
                <span className="text-[8px] sm:text-[9px] font-mono font-bold text-white truncate max-w-full leading-none">
                  {product.sku}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onRemoveProduct(product.id)}
                className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity"
                title="Bỏ sản phẩm"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}

          {/* Placeholders if < 5 */}
          {selectedProducts.length < 5 && (
            <div className="hidden lg:flex items-center justify-center w-14 h-14 rounded-xl border-2 border-dashed border-slate-700 text-slate-500 text-[10px] text-center p-1">
              + Thêm
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
          <button
            type="button"
            onClick={onClearAll}
            className="px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Xóa hết</span>
          </button>

          <button
            type="button"
            disabled={!canCompare}
            onClick={onOpenCompareMatrix}
            className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg ${
              canCompare
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/30 hover:scale-[1.02] cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <span>
              {canCompare
                ? `So Sánh Ngay (${selectedProducts.length})`
                : 'Chọn thêm 1 SP nữa'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
