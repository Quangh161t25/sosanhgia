import React from 'react';
import { Scale, Eye, EyeOff, Plus, FileSpreadsheet, RotateCcw, Sparkles } from 'lucide-react';

interface HeaderProps {
  showCostPrice: boolean;
  onToggleCostPrice: () => void;
  onOpenAddModal: () => void;
  onOpenAiMultiModal: () => void;
  onResetData: () => void;
  onExportCatalog: () => void;
  compareCount: number;
  onOpenCompare: () => void;
  totalProducts: number;
}

export const Header: React.FC<HeaderProps> = ({
  showCostPrice,
  onToggleCostPrice,
  onOpenAddModal,
  onOpenAiMultiModal,
  onResetData,
  onExportCatalog,
  compareCount,
  onOpenCompare,
  totalProducts,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-none">
                  Pro<span className="text-blue-600">Compare</span>
                </h1>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                  B2B Matrix
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block mt-0.5">
                So sánh đa tầng giá, biên lợi nhuận & thông số kỹ thuật ({totalProducts} sản phẩm)
              </p>
            </div>
          </div>

          {/* Quick Actions & Role Protection */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Toggle show/hide Cost Price (Security Role) */}
            <button
              type="button"
              onClick={onToggleCostPrice}
              title={showCostPrice ? 'Đang hiện Giá nhập (Chế độ Quản lý). Nhấn để ẩn khi demo cho khách' : 'Đang ẩn Giá nhập. Nhấn để hiển thị'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                showCostPrice
                  ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {showCostPrice ? (
                <>
                  <Eye className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden sm:inline">Chế độ Quản lý (Hiện giá nhập)</span>
                  <span className="sm:hidden">Giá nhập: Mở</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Chế độ Trình chiếu (Ẩn giá nhập)</span>
                  <span className="sm:hidden">Giá nhập: Ẩn</span>
                </>
              )}
            </button>

            {/* Export CSV */}
            <button
              type="button"
              onClick={onExportCatalog}
              title="Xuất bảng giá & danh mục ra file CSV / Excel"
              className="p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="hidden md:inline">Xuất Excel (CSV)</span>
            </button>

            {/* Reset mock data */}
            <button
              type="button"
              onClick={onResetData}
              title="Khôi phục lại dữ liệu mẫu ban đầu"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* AI Multi-Product Extraction button */}
            <button
              type="button"
              onClick={onOpenAiMultiModal}
              title="Dán đoạn văn bản nhiều sản phẩm để AI tự động bóc tách và tạo bảng so sánh"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white hover:from-blue-700 hover:to-violet-700 transition-all shadow-md shadow-blue-500/20 active:scale-98"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-200" />
              <span className="hidden sm:inline">AI Bóc Tách Nhiều SP</span>
              <span className="sm:hidden">AI Tách SP</span>
            </button>

            {/* Add product button */}
            <button
              type="button"
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Thêm Modul SP</span>
              <span className="sm:hidden">Thêm</span>
            </button>

            {/* Open comparison modal button if items selected */}
            {compareCount > 0 && (
              <button
                type="button"
                onClick={onOpenCompare}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md shadow-blue-500/25 animate-pulse"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>So sánh ({compareCount})</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
