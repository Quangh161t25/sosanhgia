import React, { useState } from 'react';
import {
  Scale,
  Lock,
  User,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { UserEmployee } from '../../types/auth';

interface LoginViewProps {
  employees: UserEmployee[];
  onLoginSuccess: (user: UserEmployee) => void;
  onRefreshEmployees: () => Promise<void>;
  isLoadingEmployees?: boolean;
}

export const LoginView: React.FC<LoginViewProps> = ({
  employees,
  onLoginSuccess,
  onRefreshEmployees,
  isLoadingEmployees = false,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanUsername) {
      setErrorMessage('Vui lòng nhập tên tài khoản');
      return;
    }

    if (!cleanPassword) {
      setErrorMessage('Vui lòng nhập mật khẩu');
      return;
    }

    setIsSubmitting(true);

    // Tìm kiếm nhân viên khớp tài khoản và mật khẩu
    const found = employees.find(
      emp =>
        (emp.taiKhoan.toLowerCase() === cleanUsername || emp.id.toLowerCase() === cleanUsername) &&
        emp.matKhau === cleanPassword
    );

    if (found) {
      setTimeout(() => {
        setIsSubmitting(false);
        onLoginSuccess(found);
      }, 250);
    } else {
      setTimeout(() => {
        setIsSubmitting(false);
        setErrorMessage('Tài khoản hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!');
      }, 250);
    }
  };

  const handleQuickLogin = (emp: UserEmployee) => {
    setUsername(emp.taiKhoan);
    setPassword(emp.matKhau);
    setErrorMessage(null);
    onLoginSuccess(emp);
  };

  const handleManualRefresh = async () => {
    setRefreshSuccess(false);
    try {
      await onRefreshEmployees();
      setRefreshSuccess(true);
      setTimeout(() => setRefreshSuccess(false), 3000);
    } catch (e) {
      // Error is handled in parent
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden select-none">
      {/* Background Decor */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg shadow-blue-500/30 mb-3">
            <Scale className="w-7 h-7" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            PROCOMPARE
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Hệ thống Quản lý Bảng Giá & Ma Trận B2B
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="leading-snug">{errorMessage}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tài khoản / Mã nhân viên
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Nhập tên tài khoản (vd: admin)..."
                autoFocus
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Mật khẩu
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 disabled:opacity-70 mt-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{isSubmitting ? 'Đang xác thực...' : 'Đăng nhập vào hệ thống'}</span>
          </button>
        </form>

        {/* Quick Login Suggestions */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Tài khoản Sheet NHAN_VIEN</span>
            </span>

            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={isLoadingEmployees}
              className="text-[11px] text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium transition-colors cursor-pointer disabled:opacity-50"
              title="Đồng bộ danh sách nhân viên từ Google Sheet"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingEmployees ? 'animate-spin' : ''}`} />
              <span>{isLoadingEmployees ? 'Đang đồng bộ...' : 'Đồng bộ'}</span>
            </button>
          </div>

          {refreshSuccess && (
            <div className="mb-2 p-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-[11px] flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Đã đồng bộ thành công từ Google Sheet NHAN_VIEN!</span>
            </div>
          )}

          {/* Quick Click Accounts */}
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {employees.map(emp => (
              <button
                key={emp.id || emp.taiKhoan}
                type="button"
                onClick={() => handleQuickLogin(emp)}
                className="w-full text-left p-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  {emp.anh ? (
                    <img src={emp.anh} alt={emp.hoTen} className="w-6 h-6 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {emp.hoTen ? emp.hoTen.slice(0, 1).toUpperCase() : 'U'}
                    </div>
                  )}
                  <div className="truncate text-xs">
                    <span className="font-semibold text-slate-800 group-hover:text-blue-700">
                      {emp.hoTen}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1">
                      ({emp.taiKhoan})
                    </span>
                  </div>
                </div>

                <span className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-medium shrink-0 group-hover:border-blue-200 group-hover:text-blue-700">
                  {emp.quyen || 'Nhân viên'}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-3 text-[10px] text-slate-400 text-center">
            Mật khẩu mặc định: <span className="font-mono font-bold text-slate-600">123456</span>
          </div>
        </div>

      </div>

      {/* Footer copyright */}
      <div className="mt-4 text-center text-xs text-slate-500 z-10">
        &copy; {new Date().getFullYear()} ProCompare. Bản quyền thuộc về Lê Minh Công.
      </div>
    </div>
  );
};
