import React from 'react';
import { Product } from '../../types/product';
import { calculateFinancials, formatVND } from '../../utils/pricing';
import { Wallet, TrendingUp, Layers, ArrowLeft, ArrowUpRight, Scale } from 'lucide-react';

interface FinanceViewProps {
  products: Product[];
  onBackToHome: () => void;
  showCostPrice: boolean;
  onOpenCompare: () => void;
  compareCount: number;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  products,
  onBackToHome,
  showCostPrice,
  onOpenCompare,
  compareCount,
}) => {
  // Financial summaries
  const totalProducts = products.length;
  const avgNppMargin =
    products.reduce((acc, p) => acc + calculateFinancials(p.pricing).nppMarginPercent, 0) /
    (totalProducts || 1);

  const totalRetailValue = products.reduce((acc, p) => acc + p.pricing.retailPrice, 0);
  const totalCostValue = products.reduce((acc, p) => acc + p.pricing.costPrice, 0);

  return (
    <div className="w-full p-4 sm:p-6 space-y-5">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBackToHome}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại</span>
          </button>
          <h2 className="text-base font-bold text-slate-900">
            Tài Chính & Đối Chiếu 4 Tầng Giá Phân Phối
          </h2>
        </div>

        {compareCount > 0 && (
          <button
            type="button"
            onClick={onOpenCompare}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Mở Bảng So Sánh ({compareCount})</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Biên Lợi Nhuận NPP Trung Bình</div>
          <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">
            +{avgNppMargin.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Mức chênh giữa Giá NPP và Giá nhập</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Tổng Giá Trị Thương Mại (Niêm yết)</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {formatVND(totalRetailValue)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Tính trên 1 đơn vị mỗi mã sản phẩm</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Chế Độ Xem Giá Nhập</div>
          <div className="text-2xl font-bold font-mono text-blue-600 mt-1">
            {showCostPrice ? 'Đang Mở' : 'Đang Khóa'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {showCostPrice ? 'Hiển thị đầy đủ 4 tầng giá' : 'Đã ẩn giá gốc để bảo mật khi trình chiếu'}
          </div>
        </div>
      </div>

      {/* 4-Tier Pricing Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Bảng Đối Chiếu 4 Tầng Giá B2B
          </h3>
          <span className="text-[11px] text-slate-400">{products.length} mã sản phẩm</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Mã SKU</th>
                <th className="py-3 px-4">Tên sản phẩm</th>
                {showCostPrice && (
                  <th className="py-3 px-4 text-right text-emerald-800">1. Giá nhập (Gốc)</th>
                )}
                <th className="py-3 px-4 text-right text-blue-800">2. Giá NPP (Đại lý)</th>
                <th className="py-3 px-4 text-right text-amber-800">3. Giá sàn</th>
                <th className="py-3 px-4 text-right">4. Giá thương mại</th>
                <th className="py-3 px-4 text-right">% Lãi NPP</th>
                <th className="py-3 px-4 text-right">Tiền lãi NPP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map(p => {
                const f = calculateFinancials(p.pricing);
                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-bold text-blue-700">{p.sku}</td>
                    <td className="py-2.5 px-4 font-medium text-slate-800 max-w-xs truncate">{p.name}</td>
                    {showCostPrice && (
                      <td className="py-2.5 px-4 text-right font-mono text-emerald-700 font-semibold">
                        {formatVND(p.pricing.costPrice)}
                      </td>
                    )}
                    <td className="py-2.5 px-4 text-right font-mono text-blue-900 font-bold">
                      {formatVND(p.pricing.distributorPrice)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-amber-800">
                      {formatVND(p.pricing.floorPrice)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-900 font-semibold">
                      {formatVND(p.pricing.retailPrice)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono">
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded text-[11px] font-bold">
                        +{f.nppMarginPercent}%
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-semibold text-emerald-800">
                      +{formatVND(f.nppGross)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
