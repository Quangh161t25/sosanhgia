import React from 'react';
import {
  Package,
  Scale,
  Settings,
  ArrowRight
} from 'lucide-react';
import { NavigationTab } from '../layout/AppSidebar';
import { Product } from '../../types/product';
import { calculateFinancials } from '../../utils/pricing';
import { UserEmployee } from '../../types/auth';

interface HomeViewProps {
  onSelectTab: (tab: NavigationTab) => void;
  compareCount: number;
  products: Product[];
  currentUser?: UserEmployee | null;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onSelectTab,
  compareCount,
  products,
  currentUser,
}) => {
  const cards = [
    {
      id: 'products' as NavigationTab,
      iconBg: 'bg-blue-600',
      icon: <Package className="w-6 h-6 text-white" />,
      title: 'Sản phẩm',
      description: `Danh mục ${products.length} modul linh kiện, thiết bị và bảng thông số kỹ thuật.`,
      badge: `${products.length} SP`,
      badgeColor: 'bg-blue-50 text-blue-700',
    },
    {
      id: 'compare' as NavigationTab,
      iconBg: 'bg-indigo-600',
      icon: <Scale className="w-6 h-6 text-white" />,
      title: 'So sánh',
      description: 'Đối chiếu chéo nhiều sản phẩm, tự động phát hiện điểm khác biệt thông số kỹ thuật.',
      badge: `${compareCount} đang chọn`,
      badgeColor: 'bg-indigo-50 text-indigo-700',
    },
    {
      id: 'settings' as NavigationTab,
      iconBg: 'bg-slate-800',
      icon: <Settings className="w-6 h-6 text-white" />,
      title: 'Cài đặt',
      description: 'Cấu hình bảo mật, phân quyền giá nhập và khóa API Gemini cho AI.',
      badge: 'Hệ thống',
      badgeColor: 'bg-slate-100 text-slate-700',
    },
  ];

  const avgMargin =
    products.reduce((acc, p) => acc + calculateFinancials(p.pricing).nppMarginPercent, 0) /
    (products.length || 1);

  return (
    <div className="w-full p-6 sm:p-8 space-y-6">
      
      {/* Greeting Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>Chào mừng trở lại,</span>
          <span className="text-blue-600">{currentUser?.hoTen || 'Lê Minh Công'}</span>
          <span>👋</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
          <span>Hệ thống Quản lý Bảng Giá & Ma Trận Thông Số Kỹ Thuật Đa Tầng</span>
          {currentUser?.quyen && (
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
              {currentUser.quyen}
            </span>
          )}
        </p>
      </div>

      {/* Main Module Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map(c => (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelectTab(c.id)}
            className="bg-white rounded-2xl p-6 border border-slate-200/90 hover:border-blue-400 hover:shadow-lg transition-all text-left flex flex-col items-center text-center group cursor-pointer relative"
          >
            <span
              className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${c.badgeColor}`}
            >
              {c.badge}
            </span>

            <div
              className={`w-14 h-14 rounded-2xl ${c.iconBg} flex items-center justify-center mb-4 shadow-md group-hover:scale-105 transition-transform`}
            >
              {c.icon}
            </div>

            <h3 className="text-base font-bold text-slate-800 group-hover:text-blue-600 transition-colors mb-1.5">
              {c.title}
            </h3>

            <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
              {c.description}
            </p>
          </button>
        ))}
      </div>

      {/* Quick Summary Statistics Panel */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Chỉ Số Nghiệp Vụ Tổng Quan
          </h4>
          <span className="text-[11px] text-slate-400">Cập nhật tự động</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          <div className="pt-2 sm:pt-0 sm:px-3">
            <div className="text-[11px] text-slate-400">Tổng sản phẩm hệ thống</div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">{products.length} Modul</div>
          </div>

          <div className="pt-2 sm:pt-0 sm:px-3">
            <div className="text-[11px] text-slate-400">Đang chọn đối chiếu</div>
            <div className="text-xl font-bold font-mono text-blue-600 mt-0.5">
              {compareCount} / 5 Modul
            </div>
          </div>

          <div className="pt-2 sm:pt-0 sm:px-3">
            <div className="text-[11px] text-slate-400">Biên lãi NPP bình quân</div>
            <div className="text-xl font-bold font-mono text-emerald-600 mt-0.5">
              +{avgMargin.toFixed(1)}%
            </div>
          </div>

          <div className="pt-2 sm:pt-0 sm:px-3">
            <div className="text-[11px] text-slate-400">Phân loại & Ngành hàng</div>
            <div className="text-xl font-bold font-mono text-indigo-600 mt-0.5">
              {new Set(products.map(p => p.categoryGroup)).size} Ngành
            </div>
          </div>
        </div>
      </div>

      {/* Two Direct Action Workspaces */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Go to Modul So Sánh */}
        <div className="bg-gradient-to-br from-indigo-50/90 via-blue-50/50 to-white rounded-2xl p-5 border border-indigo-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Vào Modul So Sánh</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Bảng ma trận đối chiếu thông số & tìm điểm khác biệt giữa các model
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectTab('compare')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shrink-0 shadow-md shadow-indigo-500/20 transition-all active:scale-98"
          >
            <span>Mở ngay</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Go to Modul Sản Phẩm */}
        <div className="bg-gradient-to-br from-blue-50/90 via-slate-50 to-white rounded-2xl p-5 border border-blue-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Vào Modul Sản Phẩm</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Bảng quản lý danh mục, 4 tầng giá, xuất CSV và thêm mới sản phẩm
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectTab('products')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shrink-0 shadow-md shadow-blue-500/20 transition-all active:scale-98"
          >
            <span>Mở danh mục</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
};
