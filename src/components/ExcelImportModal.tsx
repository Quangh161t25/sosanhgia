import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileText,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { Product, SpecGroup } from '../types/product';
import { formatVND } from '../utils/pricing';
import { getLocalSheetsConfig, pushProductsToGoogleSheet } from '../utils/googleSheetsApi';
import {
  parseProductsFromRawRows,
  findBestProductSheet,
} from '../utils/excelParser';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProducts: Product[];
  onImportProducts: (newProducts: Product[], syncSheet?: boolean) => void | Promise<void>;
  showCostPrice: boolean;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  currentProducts,
  onImportProducts,
  showCostPrice,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedProducts, setParsedProducts] = useState<Product[]>([]);
  const [availableSheets, setAvailableSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [duplicateMode, setDuplicateMode] = useState<'update' | 'skip'>('update');
  const [autoSyncSheet, setAutoSyncSheet] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const workbookRef = useRef<XLSX.WorkBook | null>(null);

  // Bản đồ sản phẩm hiện tại theo Mã SKU / ID để đối chiếu trùng lặp
  const existingMap = React.useMemo(() => {
    const map = new Map<string, Product>();
    currentProducts.forEach(p => {
      const key = (p.sku || p.id || '').trim().toUpperCase();
      if (key) map.set(key, p);
    });
    return map;
  }, [currentProducts]);

  // Phân tích thống kê Mới vs Trùng ID
  const { newCount, duplicateCount, analyzedItems } = React.useMemo(() => {
    let news = 0;
    let dups = 0;
    const items = parsedProducts.map(p => {
      const key = (p.sku || p.id || '').trim().toUpperCase();
      const isDuplicate = existingMap.has(key);
      if (isDuplicate) {
        dups++;
      } else {
        news++;
      }
      return {
        product: p,
        key,
        isDuplicate,
      };
    });
    return { newCount: news, duplicateCount: dups, analyzedItems: items };
  }, [parsedProducts, existingMap]);

  if (!isOpen) return null;

  // 3. Tải file Excel mẫu chuẩn 16 cột
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Mã SKU / Modul': 'LK-30NC',
        'Tên sản phẩm': 'Nồi luộc gà Lock&King size 30',
        'Thương hiệu': 'LOCK&KING',
        'Nhóm danh mục': 'Điện gia dụng',
        'Loại sản phẩm': 'Nồi inox',
        'Thời hạn BH (tháng)': 12,
        '1. Giá nhập (VND)': 321000,
        '2. Giá NPP (VND)': 399000,
        '3. Giá sàn (VND)': 975000,
        '4. Giá bán lẻ (VND)': 750000,
        'Link ảnh': 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=500',
        'Nhãn Tags': 'Inox cao cấp, Bếp từ, 30cm',
        'Ghi chú': 'Chính sách chiết khấu tốt cho đơn sỉ từ 10 bộ',
        'Mô tả sản phẩm': 'Nồi luộc gà Inox cao cấp LOCK&KING LK-30NC. Chất liệu: Inox cao cấp, vung kính cường lực, dùng được mọi loại bếp.',
        'Thông số kỹ thuật': '[Kích thước & Thiết kế] Chất liệu: Inox cao cấp | Kích thước: 30 cm | Khối lượng: 3,1 kg\n[Thông số kỹ thuật khác] Tay cầm: Quai đinh tán | Vung: Kính cường lực | Sử dụng: Bếp từ, bếp ga, bếp điện',
        'Trạng thái': 'Đang kinh doanh',
      },
      {
        'Mã SKU / Modul': 'LK-32NC1',
        'Tên sản phẩm': 'Nồi luộc gà Lock&King size 32',
        'Thương hiệu': 'LOCK&KING',
        'Nhóm danh mục': 'Điện gia dụng',
        'Loại sản phẩm': 'Nồi inox',
        'Thời hạn BH (tháng)': 12,
        '1. Giá nhập (VND)': 406600,
        '2. Giá NPP (VND)': 455000,
        '3. Giá sàn (VND)': 1079000,
        '4. Giá bán lẻ (VND)': 830000,
        'Link ảnh': 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500',
        'Nhãn Tags': 'Inox 304, Size lớn, Bếp từ',
        'Ghi chú': 'Hàng có sẵn kho Hà Nội và HCM',
        'Mô tả sản phẩm': 'Nồi luộc gà cỡ lớn 32cm, thân dày, quai đúc nguyên khối chịu lực cao.',
        'Thông số kỹ thuật': '[Kích thước & Thiết kế] Đường kính: 32 cm | Chiều cao: 22 cm | Dung tích: 15 Lít\n[Chất liệu & Bảo hành] Thân nồi: Inox 304 cao cấp | Đáy: 3 lớp truyền nhiệt nhanh',
        'Trạng thái': 'Đang kinh doanh',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    ws['!cols'] = [
      { wch: 16 },
      { wch: 32 },
      { wch: 15 },
      { wch: 16 },
      { wch: 16 },
      { wch: 18 },
      { wch: 16 },
      { wch: 16 },
      { wch: 16 },
      { wch: 16 },
      { wch: 30 },
      { wch: 22 },
      { wch: 28 },
      { wch: 40 },
      { wch: 45 },
      { wch: 16 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sản phẩm');
    XLSX.writeFile(wb, 'Mau_Nhap_San_Pham_SoSanhGia.xlsx');
  };

  // 4. Đọc và phân tích file Excel do người dùng tải lên
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    processFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;
    processFile(droppedFile);
  };

  const processWorkbookSheet = (wb: XLSX.WorkBook, sheetName: string) => {
    const worksheet = wb.Sheets[sheetName];
    if (!worksheet) {
      throw new Error(`Không tìm thấy trang tính "${sheetName}".`);
    }
    const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    if (!rawRows || rawRows.length < 2) {
      throw new Error(`Trang tính "${sheetName}" chưa có dữ liệu sản phẩm (cần có ít nhất 2 dòng).`);
    }

    const extracted = parseProductsFromRawRows(rawRows);
    if (extracted.length === 0) {
      throw new Error(
        `Không trích xuất được sản phẩm nào từ trang tính "${sheetName}". Vui lòng kiểm tra lại cấu trúc cột (cần có cột Tên hoặc Mã SKU).`
      );
    }

    setParsedProducts(extracted);
  };

  const processFile = async (f: File) => {
    setFile(f);
    setErrorMsg(null);
    setIsParsing(true);

    try {
      const data = await f.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      workbookRef.current = workbook;

      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new Error('File Excel không có trang tính (Sheet) nào.');
      }

      setAvailableSheets(workbook.SheetNames);
      const bestSheet = findBestProductSheet(workbook);
      setSelectedSheet(bestSheet);

      processWorkbookSheet(workbook, bestSheet);
    } catch (err: any) {
      console.error('Lỗi đọc file Excel:', err);
      setErrorMsg(err?.message || 'Có lỗi xảy ra khi đọc file Excel.');
      setParsedProducts([]);
    } finally {
      setIsParsing(false);
    }
  };

  const handleSelectSheet = (sheetName: string) => {
    setSelectedSheet(sheetName);
    if (!workbookRef.current) return;
    setErrorMsg(null);
    try {
      processWorkbookSheet(workbookRef.current, sheetName);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Lỗi khi đọc trang tính đã chọn.');
      setParsedProducts([]);
    }
  };

  // 5. Xác nhận nhập dữ liệu và đồng bộ lên Google Sheet
  const handleConfirmImport = async () => {
    if (parsedProducts.length === 0) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      let finalProducts: Product[] = [];

      if (importMode === 'replace') {
        finalProducts = parsedProducts.map(p => {
          const key = (p.sku || p.id || '').trim().toUpperCase();
          return {
            ...p,
            id: key,
            sku: key,
            updatedAt: new Date().toISOString().split('T')[0],
          };
        });
      } else {
        // Mode merge:
        // 1. Tạo Map bắt đầu từ danh sách sản phẩm hiện tại
        const productMap = new Map<string, Product>();
        currentProducts.forEach(p => {
          const key = (p.sku || p.id || '').trim().toUpperCase();
          if (key) {
            productMap.set(key, { ...p, id: key, sku: key });
          }
        });

        // 2. Xử lý từng sản phẩm từ file Excel tải lên
        parsedProducts.forEach(p => {
          const key = (p.sku || p.id || '').trim().toUpperCase();
          if (!key) return;

          const exists = productMap.has(key);
          if (exists) {
            if (duplicateMode === 'update') {
              // CẬP NHẬT LẠI DÒNG: Ghi đè dữ liệu mới từ Excel
              const existingProd = productMap.get(key)!;
              productMap.set(key, {
                ...existingProd,
                ...p,
                id: key,
                sku: key,
                updatedAt: new Date().toISOString().split('T')[0],
              });
            } else {
              // BỎ QUA DÒNG TRÙNG: Giữ nguyên dữ liệu cũ trong hệ thống
            }
          } else {
            // SẢN PHẨM MỚI: Thêm mới vào hệ thống
            productMap.set(key, {
              ...p,
              id: key,
              sku: key,
              updatedAt: new Date().toISOString().split('T')[0],
            });
          }
        });

        finalProducts = Array.from(productMap.values());
      }

      // Cập nhật state hệ thống (sẽ tự động đồng bộ Google Sheet nếu autoSyncSheet = true)
      await onImportProducts(finalProducts, autoSyncSheet);

      const addedCount = newCount;
      const updatedCount = duplicateMode === 'update' ? duplicateCount : 0;
      const skippedCount = duplicateMode === 'skip' ? duplicateCount : 0;

      let msg = `Nhập dữ liệu thành công!\n- Tổng cộng danh mục: ${finalProducts.length} sản phẩm.\n- Đã thêm mới: ${addedCount} sản phẩm.\n`;
      if (duplicateCount > 0 && importMode !== 'replace') {
        if (duplicateMode === 'update') {
          msg += `- Đã cập nhật lại: ${updatedCount} dòng trùng Mã SKU theo file Excel.\n`;
        } else {
          msg += `- Đã bỏ qua: ${skippedCount} dòng trùng Mã SKU (giữ nguyên dữ liệu cũ).\n`;
        }
      }
      if (autoSyncSheet) {
        msg += `- Đã tự động gửi yêu cầu đồng bộ trực tiếp lên Google Sheet!`;
      }

      alert(msg);
      onClose();
    } catch (err: any) {
      console.error('Lỗi khi lưu sản phẩm:', err);
      setErrorMsg(err?.message || 'Có lỗi xảy ra khi lưu hoặc đồng bộ lên Google Sheet.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 lg:p-6 overflow-hidden animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* MODAL HEADER */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Tải Dữ Liệu Sản Phẩm Bằng Excel
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  .xlsx / .xls / .csv
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Nhập danh mục sản phẩm hàng loạt, tự động nhận diện 4 tầng giá, thông số kỹ thuật và đồng bộ Google Sheet
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors text-xs font-bold shadow-2xs cursor-pointer"
              title="Tải file mẫu Excel chuẩn để điền dữ liệu"
            >
              <Download className="w-4 h-4" />
              <span>Tải file Excel mẫu (.xlsx)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/40">
          {/* VÙNG KÉO THẢ / CHỌN FILE */}
          {parsedProducts.length === 0 ? (
            <div
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-8 sm:p-12 text-center bg-white hover:bg-emerald-50/20 transition-all cursor-pointer group shadow-2xs"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-xs">
                <Upload className="w-8 h-8" />
              </div>

              <h4 className="text-base font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                Kéo & thả file Excel vào đây, hoặc nhấn để chọn file từ máy tính
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Hỗ trợ định dạng <b>.xlsx</b>, <b>.xls</b> hoặc <b>.csv</b>. Tự động nhận diện các cột SKU, Tên, 4 tầng giá, Mô tả, Thông số kỹ thuật.
              </p>

              <div className="mt-5 flex items-center justify-center gap-3">
                <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-medium">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Excel (.xlsx, .xls)
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-medium">
                  <FileText className="w-3.5 h-3.5 text-blue-600" /> Bảng tính CSV (.csv)
                </span>
              </div>
            </div>
          ) : (
            /* FILE ĐÃ TẢI LÊN */
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{file?.name}</span>
                    <span className="text-xs text-slate-400">
                      ({file ? Math.round(file.size / 1024) : 0} KB)
                    </span>
                  </div>
                  <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Đã trích xuất thành công {parsedProducts.length} sản phẩm
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {availableSheets.length > 1 && (
                  <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-500">Trang tính:</span>
                    <select
                      value={selectedSheet}
                      onChange={e => handleSelectSheet(e.target.value)}
                      className="text-xs font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
                    >
                      {availableSheets.map(s => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Chọn file khác
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {/* THÔNG BÁO LỖI */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMsg}</div>
            </div>
          )}

          {isParsing && (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">Đang phân tích cấu trúc file Excel...</p>
              <p className="text-xs text-slate-500 mt-1">Đang đọc các cột giá, mô tả và thông số kỹ thuật...</p>
            </div>
          )}

          {/* XEM TRƯỚC DỮ LIỆU ĐÃ BÓC TÁCH */}
          {parsedProducts.length > 0 && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-blue-600" />
                    Bảng xem trước dữ liệu ({parsedProducts.length} sản phẩm)
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {newCount} sản phẩm mới
                    </span>
                    {duplicateCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        {duplicateCount} trùng Mã SKU / ID
                      </span>
                    )}
                  </div>
                </div>

                {/* Tùy chọn chế độ nhập */}
                <div className="flex items-center gap-3 text-xs font-medium text-slate-700 bg-white p-2 rounded-xl border border-slate-200">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      value="merge"
                      checked={importMode === 'merge'}
                      onChange={() => setImportMode('merge')}
                      className="text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className="font-semibold text-slate-800">Thêm & Gộp theo Mã SKU</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      value="replace"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="text-rose-600 focus:ring-rose-500 cursor-pointer"
                    />
                    <span className="text-rose-700 font-semibold">Thay thế toàn bộ</span>
                  </label>
                </div>
              </div>

              {/* KHỐI LỰA CHỌN KHI PHÁT HIỆN TRÙNG MÃ SKU / ID */}
              {duplicateCount > 0 && importMode === 'merge' && (
                <div className="p-3.5 sm:p-4 rounded-xl border border-amber-200 bg-amber-50/70 space-y-2.5 shadow-2xs">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h5 className="text-xs font-bold text-amber-950">
                          Phát hiện {duplicateCount} sản phẩm trùng Mã SKU / ID với hệ thống hiện tại
                        </h5>
                        <span className="text-[11px] text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-md font-medium">
                          ({newCount} mới + {duplicateCount} đã tồn tại)
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        Chọn phương án xử lý cho các dòng bị trùng mã SKU:
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <label
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                        duplicateMode === 'update'
                          ? 'bg-white border-emerald-500 shadow-xs ring-2 ring-emerald-500/20'
                          : 'bg-white/80 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="duplicateMode"
                        value="update"
                        checked={duplicateMode === 'update'}
                        onChange={() => setDuplicateMode('update')}
                        className="mt-0.5 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          1. Cập nhật lại dòng (Ghi đè)
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 font-semibold">
                            Khuyên dùng
                          </span>
                        </span>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          Cập nhật giá và thông tin mới từ file Excel cho <b>{duplicateCount}</b> sản phẩm trùng, đồng thời nạp <b>{newCount}</b> sản phẩm mới.
                        </p>
                      </div>
                    </label>

                    <label
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                        duplicateMode === 'skip'
                          ? 'bg-white border-blue-500 shadow-xs ring-2 ring-blue-500/20'
                          : 'bg-white/80 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="duplicateMode"
                        value="skip"
                        checked={duplicateMode === 'skip'}
                        onChange={() => setDuplicateMode('skip')}
                        className="mt-0.5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-900">
                          2. Bỏ qua dòng bị trùng
                        </span>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          Giữ nguyên dữ liệu cũ trong hệ thống cho <b>{duplicateCount}</b> sản phẩm trùng, chỉ nạp thêm <b>{newCount}</b> sản phẩm mới từ Excel.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* BẢNG XEM TRƯỚC */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="max-h-72 overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0 bg-slate-100/90 backdrop-blur-xs text-slate-700 border-b border-slate-200 z-10">
                      <tr>
                        <th className="p-2.5 font-bold">Mã SKU / Trạng thái</th>
                        <th className="p-2.5 font-bold">Tên sản phẩm</th>
                        <th className="p-2.5 font-bold">Thương hiệu</th>
                        <th className="p-2.5 font-bold">Nhóm / Loại</th>
                        {showCostPrice && <th className="p-2.5 font-bold text-right text-emerald-700">1. Giá nhập</th>}
                        <th className="p-2.5 font-bold text-right text-blue-800">2. Giá NPP</th>
                        <th className="p-2.5 font-bold text-right text-amber-800">3. Giá sàn</th>
                        <th className="p-2.5 font-bold text-right text-slate-900">4. Giá bán lẻ</th>
                        <th className="p-2.5 font-bold text-center">Thông số</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {analyzedItems.map(({ product: p, isDuplicate }, idx) => (
                        <tr key={p.id || idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-2.5">
                            <div className="font-mono font-bold text-blue-700">{p.sku}</div>
                            {importMode === 'replace' ? (
                              <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 mt-0.5">
                                Thay thế
                              </span>
                            ) : isDuplicate ? (
                              duplicateMode === 'update' ? (
                                <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 mt-0.5">
                                  Trùng ID • Sẽ cập nhật
                                </span>
                              ) : (
                                <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-300 mt-0.5">
                                  Trùng ID • Sẽ bỏ qua
                                </span>
                              )
                            ) : (
                              <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 mt-0.5">
                                Mới • Sẽ thêm
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 font-semibold text-slate-900 max-w-[200px] truncate" title={p.name}>
                            {p.name}
                          </td>
                          <td className="p-2.5 text-slate-700">{p.brand}</td>
                          <td className="p-2.5 text-slate-500">{p.categoryType}</td>
                          {showCostPrice && (
                            <td className="p-2.5 font-mono font-bold text-emerald-700 text-right">
                              {formatVND(p.pricing.costPrice)}
                            </td>
                          )}
                          <td className="p-2.5 font-mono font-bold text-blue-900 text-right">
                            {formatVND(p.pricing.distributorPrice)}
                          </td>
                          <td className="p-2.5 font-mono font-bold text-amber-800 text-right">
                            {formatVND(p.pricing.floorPrice)}
                          </td>
                          <td className="p-2.5 font-mono font-bold text-slate-900 text-right">
                            {formatVND(p.pricing.retailPrice)}
                          </td>
                          <td className="p-2.5 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              {p.specifications.reduce((sum, g) => sum + g.items.length, 0)} thông số
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* TÙY CHỌN ĐỒNG BỘ GOOGLE SHEET */}
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSyncSheet}
                    onChange={e => setAutoSyncSheet(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-emerald-950 block">
                      Tự động đồng bộ toàn bộ danh mục lên Google Sheet ngay sau khi nhập
                    </span>
                    <span className="text-[11px] text-emerald-700 block">
                      Dữ liệu trên Google Sheet (SO_SANH_GIA) sẽ được cập nhật đồng nhất ngay tức thì
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="px-5 py-3 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            {parsedProducts.length > 0 && (
              <span>
                Tổng cộng: <b>{parsedProducts.length}</b> sản phẩm
                {importMode === 'merge' && duplicateCount > 0 && (
                  <span className="ml-1.5 text-slate-600 font-medium">
                    ({newCount} mới, {duplicateCount} trùng - {duplicateMode === 'update' ? 'sẽ cập nhật dòng' : 'sẽ bỏ qua'})
                  </span>
                )}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>

            <button
              type="button"
              disabled={parsedProducts.length === 0 || isSubmitting}
              onClick={handleConfirmImport}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xs cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang nhập dữ liệu...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {importMode === 'replace'
                      ? `Thay thế toàn bộ (${parsedProducts.length} sản phẩm)`
                      : duplicateCount > 0
                      ? duplicateMode === 'update'
                        ? `Cập nhật ${duplicateCount} dòng & Thêm ${newCount} mới`
                        : `Bỏ qua ${duplicateCount} trùng & Thêm ${newCount} mới`
                      : `Xác nhận nạp ${newCount} sản phẩm`}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
