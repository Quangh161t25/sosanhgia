import React, { useState, useEffect } from 'react';
import {
  Layers,
  Key,
  Check,
  RotateCcw,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  Loader2,
  ExternalLink,
  FileSpreadsheet,
  CloudUpload,
  RefreshCw,
} from 'lucide-react';
import {
  getSavedGeminiKey,
  saveGeminiKey,
  testGeminiApiKey,
  saveGeminiKeyToSheet,
  syncGeminiKeyFromSheet,
} from '../../utils/aiSpecParser';

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
  const [isSavingToSheet, setIsSavingToSheet] = useState(false);
  const [isLoadingFromSheet, setIsLoadingFromSheet] = useState(false);
  const [sheetSyncMsg, setSheetSyncMsg] = useState<{ text: string; success: boolean } | null>(null);

  // Tự động nạp Gemini Key từ Google Sheet tab CAI_DAT khi mở trang cài đặt
  useEffect(() => {
    setIsLoadingFromSheet(true);
    syncGeminiKeyFromSheet()
      .then(k => {
        if (k) setApiKey(k);
      })
      .catch(() => {})
      .finally(() => {
        setIsLoadingFromSheet(false);
      });
  }, []);

  const handleSaveLocalKey = () => {
    saveGeminiKey(apiKey);
    setSaveSuccess(true);
    setTestKeyResult(null);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleSaveToGoogleSheet = async () => {
    if (!apiKey.trim()) {
      alert('Vui lòng nhập mã Gemini API Key trước khi lưu lên Google Sheet.');
      return;
    }
    setIsSavingToSheet(true);
    setSheetSyncMsg(null);
    try {
      await saveGeminiKeyToSheet(apiKey);
      setSheetSyncMsg({
        text: 'Đã lưu và đồng bộ thành công API Key lên tab "CAI_DAT" trên Google Sheet!',
        success: true,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e: any) {
      setSheetSyncMsg({
        text: 'Lỗi lưu lên Google Sheet: ' + (e?.message || 'Không thể kết nối'),
        success: false,
      });
    } finally {
      setIsSavingToSheet(false);
    }
  };

  const handleReloadFromGoogleSheet = async () => {
    setIsLoadingFromSheet(true);
    setSheetSyncMsg(null);
    try {
      const k = await syncGeminiKeyFromSheet();
      if (k) {
        setApiKey(k);
        setSheetSyncMsg({
          text: 'Đã nạp thành công API Key từ tab "CAI_DAT" trên Google Sheet!',
          success: true,
        });
      } else {
        setSheetSyncMsg({
          text: 'Tab "CAI_DAT" trên Google Sheet hiện chưa có API Key nào.',
          success: false,
        });
      }
    } catch (e: any) {
      setSheetSyncMsg({
        text: 'Lỗi nạp từ Google Sheet: ' + (e?.message || 'Không rõ'),
        success: false,
      });
    } finally {
      setIsLoadingFromSheet(false);
    }
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
        <h2 className="text-base font-bold text-slate-900">Hệ Thống & Cấu Hình Quản Trị</h2>
      </div>

      {/* 1. Google Gemini AI Engine Configuration with Sheet CAI_DAT sync */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-slate-900">Cấu Hình Google Gemini AI API Key</h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                  <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
                  <span>Lưu tại Google Sheet (tab CAI_DAT)</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Khóa API được lưu trữ trực tiếp trên Google Sheet giúp dùng chung trên mọi thiết bị và máy tính
              </p>
            </div>
          </div>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium shrink-0"
          >
            Lấy API Key Google AI Studio <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="space-y-3 pt-1">
          <label className="block text-xs font-semibold text-slate-700">Mã API Key:</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={e => {
                setApiKey(e.target.value);
                setTestKeyResult(null);
                setSheetSyncMsg(null);
              }}
              placeholder="Dán API Key (vd: AIzaSy...)"
              className="flex-1 px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleTestKey}
              disabled={isTestingKey || !apiKey.trim()}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              {isTestingKey ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-blue-600" />}
              <span>Kiểm tra Key</span>
            </button>
            <button
              type="button"
              onClick={handleSaveToGoogleSheet}
              disabled={isSavingToSheet}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-70"
            >
              {isSavingToSheet ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CloudUpload className="w-3.5 h-3.5" />
              )}
              <span>Lưu vào Google Sheet (CAI_DAT)</span>
            </button>
            <button
              type="button"
              onClick={handleReloadFromGoogleSheet}
              disabled={isLoadingFromSheet}
              title="Đọc lại Key mới nhất từ sheet CAI_DAT"
              className="px-2.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs font-medium flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFromSheet ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Nạp lại</span>
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
              {testKeyResult.success ? (
                <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              )}
              <span className="font-medium">{testKeyResult.message}</span>
            </div>
          )}

          {sheetSyncMsg && (
            <div
              className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                sheetSyncMsg.success
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {sheetSyncMsg.success ? (
                <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              )}
              <span className="font-medium">{sheetSyncMsg.text}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Google Sheet: <strong className="text-slate-800">SO_SANH_GIA</strong> &bull; Tab lưu cấu hình: <strong className="text-emerald-700 font-mono">CAI_DAT</strong> (Cột C: Giá trị cấu hình).
            </span>
          </div>
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
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              showCostPrice
                ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {showCostPrice ? <Eye className="w-3.5 h-3.5 text-amber-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
            <span>{showCostPrice ? 'Đang hiện Giá Nhập' : 'Đang ẩn Giá Nhập'}</span>
          </button>
        </div>
      </div>

      {/* 3. Database Sync & Reset */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Đồng Bộ & Khôi Phục Dữ Liệu</h3>
              <p className="text-xs text-slate-500">
                Hiện có {totalProducts} sản phẩm trong hệ thống
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onResetData}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Đồng bộ lại từ Google Sheet</span>
          </button>
        </div>
      </div>
    </div>
  );
};
