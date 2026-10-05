import React, { useState, useEffect } from 'react';
import {
  Scale,
  Lock,
  User,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { UserEmployee } from '../../types/auth';
import { pullEmployeesFromGoogleSheet } from '../../utils/googleSheetsApi';

interface LoginViewProps {
  employees: UserEmployee[];
  onLoginSuccess: (user: UserEmployee) => void;
  onRefreshEmployees?: () => Promise<void>;
  isLoadingEmployees?: boolean;
}

export const LoginView: React.FC<LoginViewProps> = ({
  employees: initialEmployees,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [liveEmployees, setLiveEmployees] = useState<UserEmployee[]>(initialEmployees);
  const [isLoadingLive, setIsLoadingLive] = useState(false);

  // Tải danh sách nhân viên mới nhất trực tiếp từ Google Sheet khi mở trang đăng nhập
  const fetchFreshList = async () => {
    setIsLoadingLive(true);
    try {
      const fresh = await pullEmployeesFromGoogleSheet();
      if (fresh && fresh.length > 0) {
        setLiveEmployees(fresh);
      }
    } catch (e) {
      console.warn('Lỗi tải nhân viên từ Sheet trên LoginView:', e);
    } finally {
      setIsLoadingLive(false);
    }
  };

  useEffect(() => {
    fetchFreshList();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanUsername) {
      setErrorMessage('Vui lòng nhập tên tài khoản hoặc mã nhân viên');
      return;
    }

    if (!cleanPassword) {
      setErrorMessage('Vui lòng nhập mật khẩu');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Tải danh sách nhân viên mới nhất từ Google Sheet tab NHAN_VIEN theo thời gian thực
      let currentList = liveEmployees;
      try {
        const fresh = await pullEmployeesFromGoogleSheet();
        if (fresh && fresh.length > 0) {
          currentList = fresh;
          setLiveEmployees(fresh);
        }
      } catch (fetchErr) {
        console.warn('Không thể kéo dữ liệu mới, dùng danh sách đệm:', fetchErr);
      }

      // 2. Đối chiếu tài khoản và mật khẩu trực tiếp từ Sheet NHAN_VIEN
      const found = currentList.find(
        emp =>
          (emp.taiKhoan.toLowerCase() === cleanUsername || emp.id.toLowerCase() === cleanUsername) &&
          String(emp.matKhau).trim() === cleanPassword
      );

      if (found) {
        onLoginSuccess(found);
      } else {
        setErrorMessage(
          'Tài khoản hoặc mật khẩu không chính xác trên Google Sheet (tab NHAN_VIEN). Vui lòng kiểm tra lại!'
        );
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Lỗi khi kết nối xác thực Google Sheet');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = (acc: string, pass: string) => {
    setUsername(acc);
    setPassword(pass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden select-none">
      {/* Background Ambient Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg shadow-blue-500/30 mb-3">
            <Scale className="w-7 h-7" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">PROCOMPARE</h1>
          <p className="text-xs text-slate-500 mt-1">Hệ thống So sánh Giá & Quản trị B2B</p>

          {/* Badge đồng bộ Google Sheet NHAN_VIEN */}
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Xác thực từ Google Sheet (NHAN_VIEN)</span>
            {isLoadingLive && <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />}
          </div>
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
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Mật khẩu</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu (vd: 123456)..."
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
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 disabled:opacity-70 mt-3"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang xác thực Google Sheet...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Đăng nhập vào hệ thống</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Accounts from Sheet NHAN_VIEN */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Tài khoản trên Google Sheet:
            </span>
            <button
              type="button"
              onClick={fetchFreshList}
              disabled={isLoadingLive}
              title="Cập nhật lại từ Sheet"
              className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingLive ? 'animate-spin' : ''}`} />
              <span>Làm mới</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {liveEmployees.slice(0, 4).map(emp => (
              <button
                key={emp.id}
                type="button"
                onClick={() => handleQuickFill(emp.taiKhoan, emp.matKhau)}
                className="px-2 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-lg text-[11px] font-medium border border-slate-200 transition-colors cursor-pointer"
                title={`Quyền: ${emp.quyen}`}
              >
                {emp.taiKhoan} ({emp.quyen})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="mt-4 text-center text-xs text-slate-500 z-10">
        &copy; {new Date().getFullYear()} ProCompare &bull; Dữ liệu nhân viên từ Google Sheet SO_SANH_GIA
      </div>
    </div>
  );
};
