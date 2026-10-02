import React, { useState, useEffect } from 'react';
import {
  Clock,
  Bell,
  Home,
  ChevronRight,
  Menu,
  ChevronDown,
  RotateCcw,
  Sparkles,
  Key,
  Scale,
  Eye,
  EyeOff,
  Settings,
  LogOut,
  User,
  Users,
} from 'lucide-react';
import { NavigationTab } from './AppSidebar';
import { UserEmployee } from '../../types/auth';

interface TopNavbarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  subTitle?: string;
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
  onResetData: () => void;
  totalProducts: number;
  showCostPrice?: boolean;
  onToggleCostPrice?: () => void;
  currentUser?: UserEmployee | null;
  onLogout?: () => void;
  onSyncEmployees?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  currentTab,
  onSelectTab,
  subTitle,
  onToggleSidebar,
  onOpenSettings,
  onResetData,
  totalProducts,
  showCostPrice,
  onToggleCostPrice,
  currentUser,
  onLogout,
  onSyncEmployees,
}) => {
  const [timeString, setTimeString] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Live ticking clock in Vietnamese
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const days = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
      const dayName = days[now.getDay()];
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setTimeString(`${dayName}, ${day}/${month}/${year}  ${hours}:${minutes}:${seconds}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const tabNames: Record<NavigationTab, string> = {
    home: 'Trang chủ',
    products: 'Sản phẩm',
    compare: 'So sánh',
    settings: 'Cài đặt',
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between sticky top-0 z-20 select-none">
      
      {/* Left: Breadcrumbs matching Image 2 & 3 */}
      <div className="flex items-center gap-2 text-xs">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors mr-1"
          title="Thu gọn / Mở rộng"
        >
          <Menu className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('home')}
          className="p-1 rounded text-slate-400 hover:text-blue-600 transition-colors"
          title="Về Trang chủ"
        >
          <Home className="w-3.5 h-3.5" />
        </button>

        <ChevronRight className="w-3 h-3 text-slate-300" />

        <button
          type="button"
          onClick={() => onSelectTab(currentTab)}
          className={`px-2.5 py-0.5 rounded-md font-medium text-xs transition-colors ${
            currentTab === 'home' && !subTitle
              ? 'bg-blue-600 text-white font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          {tabNames[currentTab]}
        </button>

        {subTitle && (
          <>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="px-2.5 py-0.5 rounded-md bg-blue-600 text-white font-semibold text-xs">
              {subTitle}
            </span>
          </>
        )}
      </div>

      {/* Right: Giá nhập, Cài đặt, Clock, Notification, Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        
        {/* Toggle Giá nhập: Đang hiện / Đang ẩn (Góc trên cùng) */}
        {onToggleCostPrice && (
          <button
            type="button"
            onClick={onToggleCostPrice}
            title={showCostPrice ? 'Ẩn giá nhập (Chế độ demo khách)' : 'Hiện giá nhập (Chế độ quản lý)'}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-2xs border ${
              showCostPrice
                ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200 hover:text-slate-800'
            }`}
          >
            {showCostPrice ? (
              <Eye className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            ) : (
              <EyeOff className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
            <span className="hidden sm:inline">
              {showCostPrice ? 'Giá nhập: Đang hiện' : 'Giá nhập: Đang ẩn'}
            </span>
          </button>
        )}

        {/* Nút Cài đặt (Góc trên cùng) */}
        <button
          type="button"
          onClick={onOpenSettings}
          title="Cài đặt hệ thống"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
            currentTab === 'settings'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 bg-white'
          }`}
        >
          <Settings className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Cài đặt</span>
        </button>

        {/* Google Sheet Live Badge */}
        <a
          href="https://docs.google.com/spreadsheets/d/16I-JJUzrLWHh0nuKqoJwggAcrF_xIpBbT6EAcN5Geeg/edit"
          target="_blank"
          rel="noopener noreferrer"
          title="Google Sheet: SO_SANH_GIA (Đã kết nối - lnk-773@cty-lnk-161.iam.gserviceaccount.com)"
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-medium hover:bg-emerald-100 transition-colors"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold">Sheet: SO_SANH_GIA</span>
        </a>

        {/* Realtime Clock Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600 text-xs font-mono font-medium">
          <Clock className="w-3.5 h-3.5 text-blue-600" />
          <span>{timeString}</span>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative"
            title="Thông báo hệ thống"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center border-2 border-white">
              {totalProducts}
            </span>
          </button>
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors text-left"
          >
            {currentUser?.anh ? (
              <img
                src={currentUser.anh}
                alt={currentUser.hoTen}
                className="w-8 h-8 rounded-full object-cover shadow-xs border border-slate-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {currentUser?.hoTen
                  ? currentUser.hoTen
                      .trim()
                      .split(/\s+/)
                      .slice(-2)
                      .map(p => p[0])
                      .join('')
                      .toUpperCase()
                  : 'LC'}
              </div>
            )}
            <div className="hidden md:block leading-tight">
              <div className="text-xs font-bold text-slate-800">
                {currentUser?.hoTen || 'Lê Minh Công'}
              </div>
              <div className="text-[10px] text-slate-400">
                {currentUser?.quyen || 'Tổng Giám Đốc'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 text-xs z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/60">
                <div className="font-bold text-slate-900 text-sm">
                  {currentUser?.hoTen || 'Lê Minh Công'}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                  <span className="font-mono text-slate-600 font-medium">@{currentUser?.taiKhoan || 'admin'}</span>
                  <span>&bull;</span>
                  <span>ID: {currentUser?.id || 'NV01'}</span>
                </div>
                <div className="mt-1.5">
                  <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md font-semibold text-[10px]">
                    {currentUser?.quyen || 'Tổng Giám Đốc'}
                  </span>
                </div>
              </div>

              <div className="py-1">
                {onSyncEmployees && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      onSyncEmployees();
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                  >
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    <span>Đồng bộ DS Nhân viên (Sheet NHAN_VIEN)</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    onResetData();
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 text-emerald-700 flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Đồng bộ lại từ Google Sheet</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    onOpenSettings();
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                >
                  <Key className="w-3.5 h-3.5 text-slate-500" />
                  <span>Cấu hình Gemini AI Key</span>
                </button>
              </div>

              {/* Đăng xuất */}
              <div className="pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout?.();
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 font-semibold transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-500" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

    </header>
  );
};
