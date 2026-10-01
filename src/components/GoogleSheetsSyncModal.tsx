import React, { useState, useEffect } from 'react';
import {
  X,
  FileSpreadsheet,
  ExternalLink,
  UploadCloud,
  DownloadCloud,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Table,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Product } from '../types/product';
import {
  fetchSpreadsheetInfo,
  pushProductsToGoogleSheet,
  pullProductsFromGoogleSheet,
  aiAnalyzeSheetSpecsApi,
  getLocalSheetsConfig,
  saveLocalSheetsConfig,
  SheetInfoResponse,
} from '../utils/googleSheetsApi';
import { getSavedGeminiKey } from '../utils/aiSpecParser';

interface GoogleSheetsSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onUpdateProducts: (newProducts: Product[]) => void;
}

export const GoogleSheetsSyncModal: React.FC<GoogleSheetsSyncModalProps> = ({
  isOpen,
  onClose,
  products,
  onUpdateProducts,
}) => {
  const [sheetInfo, setSheetInfo] = useState<SheetInfoResponse | null>(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);
  const [selectedSheet, setSelectedSheet] = useState('Sản phẩm');
  const [autoSync, setAutoSync] = useState(false);
  const [lastSyncText, setLastSyncText] = useState<string>('');

  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // Load config & info khi mở modal
  useEffect(() => {
    if (isOpen) {
      const cfg = getLocalSheetsConfig();
      setSelectedSheet(cfg.sheetTitle || 'Sản phẩm');
      setAutoSync(Boolean(cfg.autoSyncOnSave));
      if (cfg.lastSyncedAt) {
        const d = new Date(cfg.lastSyncedAt);
        setLastSyncText(
          `${d.toLocaleTimeString('vi-VN')} ngày ${d.toLocaleDateString('vi-VN')} (${cfg.lastSyncedCount || 0} sản phẩm)`
        );
      }
      loadInfo();
    }
  }, [isOpen]);

  const loadInfo = async () => {
    setIsLoadingInfo(true);
    setStatusMsg(null);
    try {
      const info = await fetchSpreadsheetInfo();
      setSheetInfo(info);
      // Nếu tab hiện tại không nằm trong danh sách, tự chọn tab đầu tiên hoặc 'Sản phẩm'
      const titles = info.sheets.map(s => s.title);
      if (!titles.includes(selectedSheet) && titles.includes('Sản phẩm')) {
        setSelectedSheet('Sản phẩm');
      } else if (!titles.includes(selectedSheet) && titles.length > 0) {
        setSelectedSheet(titles[0]);
      }
    } catch (err: any) {
      setStatusMsg({
        text: 'Không thể kết nối đến Google Sheet: ' + (err?.message || 'Lỗi mạng'),
        type: 'error',
      });
    } finally {
      setIsLoadingInfo(false);
    }
  };

  const handleToggleAutoSync = (checked: boolean) => {
    setAutoSync(checked);
    saveLocalSheetsConfig({ autoSyncOnSave: checked });
  };

  const handlePush = async () => {
    setIsPushing(true);
    setStatusMsg(null);
    try {
      const res = await pushProductsToGoogleSheet(products, selectedSheet);
      const d = new Date();
      setLastSyncText(
        `${d.toLocaleTimeString('vi-VN')} ngày ${d.toLocaleDateString('vi-VN')} (${res.updatedRows} sản phẩm)`
      );
      setStatusMsg({
        text: `Đã đẩy thành công ${res.updatedRows} sản phẩm lên tab "${selectedSheet}" trên Google Sheet!`,
        type: 'success',
      });
      // Làm mới danh sách tab
      loadInfo();
    } catch (err: any) {
      setStatusMsg({
        text: 'Lỗi khi đẩy dữ liệu: ' + (err?.message || 'Không rõ'),
        type: 'error',
      });
    } finally {
      setIsPushing(false);
    }
  };

  const handlePull = async () => {
    setIsPulling(true);
    setStatusMsg(null);
    try {
      const pulled = await pullProductsFromGoogleSheet(selectedSheet);
      if (pulled.length === 0) {
        setStatusMsg({
          text: `Tab "${selectedSheet}" không có dữ liệu sản phẩm nào.`,
          type: 'info',
        });
        return;
      }

      onUpdateProducts(pulled);
      const d = new Date();
      setLastSyncText(
        `${d.toLocaleTimeString('vi-VN')} ngày ${d.toLocaleDateString('vi-VN')} (${pulled.length} sản phẩm)`
      );
      setStatusMsg({
        text: `Đã tải về thành công ${pulled.length} sản phẩm từ Google Sheet vào ứng dụng!`,
        type: 'success',
      });
    } catch (err: any) {
      setStatusMsg({
        text: 'Lỗi khi tải dữ liệu: ' + (err?.message || 'Không rõ'),
        type: 'error',
      });
    } finally {
      setIsPulling(false);
    }
  };

  const handleAiAnalyzeSpecs = async () => {
    setIsAiAnalyzing(true);
    setStatusMsg(null);
    try {
      const geminiKey = getSavedGeminiKey();
      const res = await aiAnalyzeSheetSpecsApi(selectedSheet, geminiKey);
      if (res.analyzedCount === 0) {
        setStatusMsg({
          text: `Không tìm thấy dòng nào có nội dung trong cột "Mô tả sản phẩm" trên tab "${selectedSheet}". Hãy nhập đoạn mô tả vào Google Sheet rồi bấm lại nhé!`,
          type: 'info',
        });
        return;
      }

      onUpdateProducts(res.products);
      const d = new Date();
      setLastSyncText(
        `${d.toLocaleTimeString('vi-VN')} ngày ${d.toLocaleDateString('vi-VN')} (AI bóc tách ${res.analyzedCount} sản phẩm)`
      );
      setStatusMsg({
        text: `⚡ Thành công: AI đã phân tích ${res.analyzedCount} sản phẩm và điền vào cột "Thông số kỹ thuật" trên Google Sheet & Ứng dụng!`,
        type: 'success',
      });
    } catch (err: any) {
      setStatusMsg({
        text: 'Lỗi khi bóc tách thông số bằng AI: ' + (err?.message || 'Không rõ'),
        type: 'error',
      });
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  if (!isOpen) return null;

  const sheetUrl = sheetInfo?.url || 'https://docs.google.com/spreadsheets/d/16I-JJUzrLWHh0nuKqoJwggAcrF_xIpBbT6EAcN5Geeg/edit';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-2xs transition-opacity animate-in fade-in duration-150"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Liên kết Google Sheet"
        className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden z-10 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/80 bg-muted/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground leading-tight">
                  Liên Kết &amp; Đồng Bộ Google Sheet
                </h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Đã kết nối
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Bảng tính: <span className="font-semibold text-foreground">SO_SANH_GIA</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={sheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors cursor-pointer"
              title="Mở Google Sheet trên tab mới"
            >
              <span>Mở Google Sheet</span>
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          {/* Thông tin tài khoản Service Account */}
          <div className="bg-muted/40 border border-border/60 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Tài khoản ủy quyền (Service Account):</span>
              </div>
              <button
                type="button"
                onClick={loadInfo}
                disabled={isLoadingInfo}
                className="text-xs text-primary hover:underline inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingInfo ? 'animate-spin' : ''}`} />
                <span>Làm mới</span>
              </button>
            </div>
            <div className="text-xs font-mono bg-background px-3 py-1.5 rounded-lg border border-border/60 text-muted-foreground select-all break-all">
              lnk-773@cty-lnk-161.iam.gserviceaccount.com
            </div>
          </div>

          {/* Chọn Tab Sheet để làm việc */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-card border border-border rounded-xl">
            <div className="flex items-center gap-2">
              <Table className="w-4 h-4 text-primary" />
              <div>
                <label htmlFor="sheet-tab-select" className="text-xs font-bold text-foreground block">
                  Sheet / Tab liên kết sản phẩm:
                </label>
                <span className="text-[11px] text-muted-foreground">
                  Dữ liệu sản phẩm sẽ được đọc &amp; ghi vào tab này
                </span>
              </div>
            </div>

            <select
              id="sheet-tab-select"
              value={selectedSheet}
              onChange={e => {
                setSelectedSheet(e.target.value);
                saveLocalSheetsConfig({ sheetTitle: e.target.value });
              }}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer min-w-[140px]"
            >
              {sheetInfo?.sheets && sheetInfo.sheets.length > 0 ? (
                sheetInfo.sheets.map(s => (
                  <option key={s.sheetId} value={s.title}>
                    Tab: {s.title}
                  </option>
                ))
              ) : (
                <>
                  <option value="Sản phẩm">Tab: Sản phẩm</option>
                  <option value="Trang tính1">Tab: Trang tính1</option>
                </>
              )}
            </select>
          </div>

          {/* 2 Thẻ hành động Đồng bộ lớn */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* THẺ 1: ĐẨY LÊN SHEET */}
            <div className="border border-border rounded-xl p-4 bg-card flex flex-col justify-between hover:border-primary/40 transition-colors">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Đồng bộ lên Sheet</h4>
                    <p className="text-[11px] text-muted-foreground">App &rarr; Google Sheet</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  Ghi toàn bộ <strong className="text-foreground">{products.length}</strong> sản phẩm hiện tại lên tab <strong>&quot;{selectedSheet}&quot;</strong> trên Google Sheet, tự động định dạng cột, kẻ viền, tô màu và tính toán tài chính.
                </p>
              </div>

              <button
                type="button"
                onClick={handlePush}
                disabled={isPushing || isPulling}
                className="w-full py-2 px-3 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                {isPushing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang đồng bộ lên Sheet...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Đồng bộ lên Google Sheet ({products.length})</span>
                  </>
                )}
              </button>
            </div>

            {/* THẺ 2: TẢI VỀ TỪ SHEET */}
            <div className="border border-border rounded-xl p-4 bg-card flex flex-col justify-between hover:border-primary/40 transition-colors">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <DownloadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Tải dữ liệu từ Sheet</h4>
                    <p className="text-[11px] text-muted-foreground">Google Sheet &rarr; App</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  Đọc toàn bộ danh sách sản phẩm từ tab <strong>&quot;{selectedSheet}&quot;</strong> của Google Sheet về ứng dụng, khôi phục đầy đủ 4 tầng giá và thông số kỹ thuật.
                </p>
              </div>

              <button
                type="button"
                onClick={handlePull}
                disabled={isPushing || isPulling}
                className="w-full py-2 px-3 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                {isPulling ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang tải từ Sheet về...</span>
                  </>
                ) : (
                  <>
                    <DownloadCloud className="w-3.5 h-3.5" />
                    <span>Tải dữ liệu từ Sheet về</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* THẺ TÍNH NĂNG ĐẶC BIỆT: AI PHÂN TÍCH MÔ TẢ -> ĐIỀN THÔNG SỐ KỸ THUẬT */}
          <div className="border border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-blue-50/50 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-blue-950/30 rounded-2xl p-4.5 space-y-3.5 shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-xs shrink-0">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                      Trợ Lý AI: Bóc tách Thông số từ cột Mô tả
                    </h4>
                    <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold shadow-2xs">
                      Theo yêu cầu
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Google Sheet (Cột &quot;Mô tả sản phẩm&quot;) &rarr; AI bóc tách &rarr; Tự động điền vào Cột &quot;Thông số kỹ thuật&quot;
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Bạn chỉ cần điền/dán văn bản tự do vào cột <strong>&quot;Mô tả sản phẩm&quot;</strong> trên Google Sheet. Khi bấm nút dưới đây, AI sẽ quét toàn bộ mô tả, trích xuất chuẩn xác các nhóm thông số (công suất, kích thước, công nghệ, bảo hành...) và <strong>tự động ghi thẳng vào cột &quot;Thông số kỹ thuật&quot;</strong> trên Google Sheet lẫn trong ứng dụng!
            </p>

            <button
              type="button"
              onClick={handleAiAnalyzeSpecs}
              disabled={isPushing || isPulling || isAiAnalyzing}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              {isAiAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>AI đang phân tích mô tả và cập nhật Google Sheet...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Bắt đầu AI phân tích mô tả &amp; Điền thông số vào Sheet</span>
                </>
              )}
            </button>
          </div>

          {/* Tùy chọn tự động đồng bộ khi sửa */}
          <div className="p-3 bg-muted/20 border border-border/80 rounded-xl flex items-center justify-between gap-3">
            <label htmlFor="auto-sync-toggle" className="flex items-center gap-2 text-xs cursor-pointer select-none">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <div>
                <span className="font-semibold text-foreground block">
                  Tự động đồng bộ khi thêm/sửa sản phẩm
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Mỗi khi bạn lưu sản phẩm mới hoặc sửa sản phẩm, hệ thống sẽ tự cập nhật lên Google Sheet
                </span>
              </div>
            </label>
            <input
              id="auto-sync-toggle"
              type="checkbox"
              checked={autoSync}
              onChange={e => handleToggleAutoSync(e.target.checked)}
              className="w-4 h-4 rounded text-primary border-border focus:ring-primary cursor-pointer shrink-0"
            />
          </div>

          {/* Status Message */}
          {statusMsg && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 border transition-all ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                  : statusMsg.type === 'error'
                  ? 'bg-destructive/10 text-destructive border-destructive/30'
                  : 'bg-muted text-muted-foreground border-border'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span className="leading-snug">{statusMsg.text}</span>
            </div>
          )}

          {/* Lần đồng bộ gần nhất */}
          {lastSyncText && (
            <div className="text-[11px] text-muted-foreground text-center">
              Lần đồng bộ gần nhất: <span className="font-medium text-foreground">{lastSyncText}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border/80 bg-muted/20 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-muted-foreground">
            Bảng tính Google Sheets: <code className="text-[10px] font-mono bg-muted px-1 py-0.5 rounded">16I-JJUzrLWHh0nuKqoJwggAcrF_xIpBbT6EAcN5Geeg</code>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
