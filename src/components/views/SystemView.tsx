import React, { useState } from 'react';
import { Layers, Key, Check, RotateCcw, ShieldCheck, Eye, EyeOff, ArrowLeft, Sparkles, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { getSavedGeminiKey, saveGeminiKey, testGeminiApiKey } from '../../utils/aiSpecParser';

interface SystemViewProps {
  onBackToHome: () => void;
  showCostPrice: boolean;
  onToggleCostPrice: () => void;
  onResetData: () => void;
  totalProducts: number;
}

export const SystemView: React.FC<SystemViewProps> = ({
  onBackToHome,
  showCostPrice,
  onToggleCostPrice,
  onResetData,
  totalProducts,
}) => {
  const [apiKey, setApiKey] = useState(getSavedGeminiKey());
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testKeyResult, setTestKeyResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSaveKey = () => {
    saveGeminiKey(apiKey);
    setSaveSuccess(true);
    setTestKeyResult(null);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleTestKey = async () => {
    if (!apiKey.trim()) return;
    setIsTestingKey(true);
    setTestKeyResult(null);
    try {
      const res = await testGeminiApiKey(apiKey);
      setTestKeyResult(res);
      if (res.success) {
        saveGeminiKey(apiKey);
      }
    } catch (e: any) {
      setTestKeyResult({ success: false, message: e?.message || 'Lỗi kiểm tra API Key' });
    } finally {
      setIsTestingKey(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
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
          Hệ Thống & Cấu Hình Quản Trị
        </h2>
      </div>

      {/* 1. Google Gemini AI Engine Configuration */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Cấu Hình Google Gemini AI API Key</h3>
              <p className="text-xs text-slate-500">
                Sử dụng mô hình Gemini 1.5 Flash / 2.0 Flash để bóc tách thông số kỹ thuật tự động
              </p>
            </div>
          </div>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
          >
            Lấy API Key Google AI Studio <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="space-y-2 pt-1">
          <label className="block text-xs font-semibold text-slate-700">Mã API Key:</label>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={e => {
                setApiKey(e.target.value);
                setTestKeyResult(null);
              }}
              placeholder="Dán API Key (vd: AIzaSy...)"
              className="flex-1 px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleTestKey}
              disabled={isTestingKey || !apiKey.trim()}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {isTestingKey ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-blue-600" />}
              <span>Kiểm tra Key</span>
            </button>
            <button
              type="button"
              onClick={handleSaveKey}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Lưu cấu hình</span>
            </button>
          </div>

          {testKeyResult && (
            <div
              className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                testKeyResult.success
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {testKeyResult.success ? <Check className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />}
              <span className="font-medium">{testKeyResult.message}</span>
            </div>
          )}

          {saveSuccess && !testKeyResult && (
            <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>Đã lưu API Key vào trình duyệt thành công!</span>
            </div>
          )}
          <p className="text-[11px] text-slate-400">
            * Nếu không điền API Key hoặc API Key không khả dụng, hệ thống tự động chạy bộ phân tích Heuristic AI cục bộ siêu tốc.
          </p>
        </div>
      </div>

      {/* 2. Security Role & Pricing Display */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Bảo Vệ Giá Nhập (Phân Quyền B2B)</h3>
              <p className="text-xs text-slate-500">
                Ẩn hoặc hiển thị tầng Giá Nhập (Gốc) khi thuyết trình hoặc mở máy trước mặt khách hàng
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleCostPrice}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
              showCostPrice
                ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
          >
            {showCostPrice ? <Eye className="w-4 h-4 text-amber-600" /> : <EyeOff className="w-4 h-4 text-slate-500" />}
            <span>{showCostPrice ? 'Chế độ Quản lý: Đang hiện giá nhập' : 'Chế độ Trình chiếu: Đã ẩn giá nhập'}</span>
          </button>
        </div>
      </div>

      {/* 3. Database & Cache Reset */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Dữ Liệu Danh Mục ({totalProducts} sản phẩm)</h3>
              <p className="text-xs text-slate-500">
                Đồng bộ và tải lại toàn bộ danh mục sản phẩm mới nhất từ Google Sheet (SO_SANH_GIA)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onResetData}
            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Đồng bộ từ Sheet
          </button>
        </div>
      </div>

    </div>
  );
};
