import React from 'react';
import {
  Home,
  Package,
  Scale,
  TrendingUp,
  Settings,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';

export type NavigationTab = 'home' | 'products' | 'compare' | 'pricing' | 'settings';

interface AppSidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  compareCount: number;
  showCostPrice: boolean;
  onToggleCostPrice: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  compareCount,
  showCostPrice,
  onToggleCostPrice,
}) => {
  const navItems: { id: NavigationTab; label: string; icon: React.ReactNode; badge?: React.ReactNode }[] = [
    {
      id: 'home',
      label: 'Trang chủ',
      icon: <Home className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'products',
      label: 'Sản phẩm',
      icon: <Package className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'compare',
      label: 'So sánh',
      icon: <Scale className="w-4 h-4 shrink-0" />,
      badge: compareCount > 0 ? (
        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
          {compareCount}
        </span>
      ) : undefined,
    },
    {
      id: 'pricing',
      label: '4 Tầng giá',
      icon: <TrendingUp className="w-4 h-4 shrink-0" />,
    },
  ];

  return (
    <aside
      className={`bg-white border-r border-slate-200 flex flex-col justify-between transition-all duration-200 z-30 select-none ${
        isCollapsed ? 'w-16' : 'w-56'
      }`}
    >
      {/* Top Brand / Logo */}
      <div>
        <div className="h-14 border-b border-slate-100 flex items-center px-3.5 justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Scale className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="leading-tight overflow-hidden whitespace-nowrap">
                <div className="text-xs font-bold text-slate-800 tracking-tight">PROCOMPARE</div>
                <div className="text-[10px] text-slate-400 truncate">Hệ thống so sánh B2B</div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Main Navigation List */}
        <nav className="p-2 space-y-1">
          {navItems.map(item => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!isCollapsed && item.badge && <div>{item.badge}</div>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Actions */}
      <div className="p-2 border-t border-slate-100 space-y-1">
        {/* Cost Price Eye toggle */}
        <button
          type="button"
          onClick={onToggleCostPrice}
          title={showCostPrice ? 'Ẩn giá nhập (Chế độ demo khách)' : 'Hiện giá nhập (Chế độ quản lý)'}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          {showCostPrice ? (
            <Eye className="w-4 h-4 text-amber-600 shrink-0" />
          ) : (
            <EyeOff className="w-4 h-4 text-slate-400 shrink-0" />
          )}
          {!isCollapsed && (
            <span className="truncate text-[11px]">
              {showCostPrice ? 'Giá nhập: Đang hiện' : 'Giá nhập: Đang ẩn'}
            </span>
          )}
        </button>

        {/* Settings button */}
        <button
          type="button"
          onClick={() => onSelectTab('settings')}
          title={isCollapsed ? 'Cài đặt hệ thống' : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-colors ${
            currentTab === 'settings'
              ? 'bg-blue-600 text-white font-semibold'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4 text-slate-500 shrink-0" />
          {!isCollapsed && <span className="truncate">Cài đặt</span>}
        </button>
      </div>
    </aside>
  );
};
