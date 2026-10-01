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

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProducts: Product[];
  onImportProducts: (newProducts: Product[]) => void;
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
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [autoSyncSheet, setAutoSyncSheet] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // 1. Phân tích số tiền theo định dạng thực tế
  const parseExcelPrice = (val: any): number => {
    if (typeof val === 'number') return Math.round(val);
    if (!val) return 0;
    let s = String(val).trim().replace(/[₫đVND\s]/gi, '');
    if (/k$/i.test(s)) {
      const num = parseFloat(s.replace(/k$/i, '').replace(',', '.'));
      return isNaN(num) ? 0 : Math.round(num * 1000);
    }
    if (/tr(?:i[eệ]u)?$/i.test(s)) {
      const num = parseFloat(s.replace(/tr(?:i[eệ]u)?$/i, '').replace(',', '.'));
      return isNaN(num) ? 0 : Math.round(num * 1000000);
    }
    if (s.includes('.') && s.includes(',')) {
      if (s.indexOf('.') < s.indexOf(',')) {
        s = s.replace(/\./g, '').replace(',', '.');
      } else {
        s = s.replace(/,/g, '');
      }
    } else if (/^\d{1,3}(\.\d{3})+$/.test(s) || /^\d+\.\d{3}$/.test(s)) {
      s = s.replace(/\./g, '');
    } else if (/^\d{1,3}(,\d{3})+$/.test(s) || /^\d+,\d{3}$/.test(s)) {
      s = s.replace(/,/g, '');
    } else {
      s = s.replace(/[^\d.-]/g, '');
    }
    const result = Number(s);
    return isNaN(result) ? 0 : Math.round(result);
  };

  // 2. Chuyển đổi chuỗi text thông số sang SpecGroup[]
  const parseSpecsTextToGroups = (text: string): SpecGroup[] => {
    if (!text) return [];
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const groups: SpecGroup[] = [];
    let currentGroup: SpecGroup = { groupName: 'Thông số kỹ thuật', items: [] };

    for (const line of lines) {
      const groupMatch = line.match(/^\[(.*?)\]\s*(.*)$/);
      if (groupMatch) {
        if (currentGroup.items.length > 0) {
          groups.push(currentGroup);
        }
        currentGroup = { groupName: groupMatch[1].trim(), items: [] };
        const rest = groupMatch[2].trim();
        if (rest) {
          const parts = rest.split('|');
          for (const part of parts) {
            const colonIdx = part.indexOf(':');
            if (colonIdx > 0) {
              currentGroup.items.push({
                key: part.substring(0, colonIdx).trim(),
                value: part.substring(colonIdx + 1).trim(),
              });
            }
          }
        }
      } else {
        const parts = line.split('|');
        for (const part of parts) {
          const colonIdx = part.indexOf(':');
          if (colonIdx > 0) {
            currentGroup.items.push({
              key: part.substring(0, colonIdx).trim(),
              value: part.substring(colonIdx + 1).trim(),
            });
          }
        }
      }
    }

    if (currentGroup.items.length > 0) {
      groups.push(currentGroup);
    }
    return groups;
  };

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

  const processFile = async (f: File) => {
    setFile(f);
    setErrorMsg(null);
    setIsParsing(true);

    try {
      const data = await f.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        throw new Error('File Excel không có trang tính (Sheet) nào.');
      }

      const worksheet = workbook.Sheets[firstSheetName];
      const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (!rawRows || rawRows.length < 2) {
        throw new Error('File Excel chưa có dữ liệu sản phẩm (cần có dòng tiêu đề và ít nhất 1 dòng sản phẩm).');
      }

      const headerRow = rawRows[0] || [];
      const colMap = {
        sku: -1,
        name: -1,
        brand: -1,
        group: -1,
        type: -1,
        warranty: -1,
        cost: -1,
        npp: -1,
        floor: -1,
        retail: -1,
        img: -1,
        tags: -1,
        notes: -1,
        desc: -1,
        specs: -1,
        status: -1,
      };

      headerRow.forEach((colHeader: any, idx: number) => {
        if (!colHeader) return;
        const h = String(colHeader).toLowerCase().trim();

        if (h.includes('sku') || h.includes('mã')) colMap.sku = idx;
        else if (h.includes('tên') || h.includes('name')) colMap.name = idx;
        else if (h.includes('thương hiệu') || h.includes('brand') || h.includes('hãng')) colMap.brand = idx;
        else if (h.includes('nhóm') || h.includes('ngành')) colMap.group = idx;
        else if (h.includes('loại') || h.includes('phân loại')) colMap.type = idx;
        else if (h.includes('bảo hành') || h.includes('bh') || h.includes('tháng')) colMap.warranty = idx;
        else if (h.includes('nhập') || h.includes('cost') || h.includes('gốc')) colMap.cost = idx;
        else if (h.includes('npp') || h.includes('đại lý') || h.includes('sỉ')) colMap.npp = idx;
        else if (h.includes('sàn') || h.includes('min') || h.includes('niêm yết')) colMap.floor = idx;
        else if (h.includes('bán lẻ') || h.includes('thương mại') || h.includes('lẻ') || h.includes('retail')) colMap.retail = idx;
        else if (h.includes('ảnh') || h.includes('image') || h.includes('hình')) colMap.img = idx;
        else if (h.includes('tags') || h.includes('nhãn') || h.includes('từ khóa')) colMap.tags = idx;
        else if (h.includes('chú') || h.includes('notes') || h.includes('chính sách')) colMap.notes = idx;
        else if (h.includes('mô tả') || h.includes('desc')) colMap.desc = idx;
        else if (h.includes('thông số') || h.includes('specs') || h.includes('kỹ thuật')) colMap.specs = idx;
        else if (h.includes('trạng thái') || h.includes('status')) colMap.status = idx;
      });

      // Nếu không khớp tên cột, dùng fallback theo vị trí cột mặc định
      if (colMap.sku === -1) colMap.sku = 0;
      if (colMap.name === -1) colMap.name = 1;
      if (colMap.brand === -1) colMap.brand = 2;
      if (colMap.group === -1) colMap.group = 3;
      if (colMap.type === -1) colMap.type = 4;
      if (colMap.warranty === -1) colMap.warranty = 5;
      if (colMap.cost === -1) colMap.cost = 6;
      if (colMap.npp === -1) colMap.npp = 7;
      if (colMap.floor === -1) colMap.floor = 8;
      if (colMap.retail === -1) colMap.retail = 9;
      if (colMap.img === -1) colMap.img = 10;
      if (colMap.tags === -1) colMap.tags = 11;
      if (colMap.notes === -1) colMap.notes = 12;
      if (colMap.desc === -1) colMap.desc = 13;
      if (colMap.specs === -1) colMap.specs = 14;

      const extracted: Product[] = [];

      for (let r = 1; r < rawRows.length; r++) {
        const row = rawRows[r];
        if (!row || row.length === 0 || !row.some((cell: any) => Boolean(cell))) continue;

        const rawSku = colMap.sku !== -1 && row[colMap.sku] ? String(row[colMap.sku]).trim() : '';
        const rawName = colMap.name !== -1 && row[colMap.name] ? String(row[colMap.name]).trim() : '';
        if (!rawSku && !rawName) continue;

        const sku = (rawSku || `SKU-${r}`).toUpperCase();
        const name = rawName || `Sản phẩm ${sku}`;
        const brand = colMap.brand !== -1 && row[colMap.brand] ? String(row[colMap.brand]).trim() : 'LOCK&KING';
        const categoryGroup = colMap.group !== -1 && row[colMap.group] ? String(row[colMap.group]).trim() : 'Điện gia dụng';
        const categoryType = colMap.type !== -1 && row[colMap.type] ? String(row[colMap.type]).trim() : 'Sản phẩm';
        const warrantyMonths = colMap.warranty !== -1 ? Number(row[colMap.warranty]) || 12 : 12;

        const costPrice = colMap.cost !== -1 ? parseExcelPrice(row[colMap.cost]) : 0;
        const distributorPrice = colMap.npp !== -1 ? parseExcelPrice(row[colMap.npp]) : 0;
        const floorPrice = colMap.floor !== -1 ? parseExcelPrice(row[colMap.floor]) : 0;
        const retailPrice = colMap.retail !== -1 ? parseExcelPrice(row[colMap.retail]) : 0;

        const thumbnail =
          colMap.img !== -1 && row[colMap.img]
            ? String(row[colMap.img]).trim()
            : 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=500';

        const tags =
          colMap.tags !== -1 && row[colMap.tags]
            ? String(row[colMap.tags])
                .split(',')
                .map((t: string) => t.trim())
                .filter(Boolean)
            : [];

        const notes = colMap.notes !== -1 && row[colMap.notes] ? String(row[colMap.notes]).trim() : '';
        const description = colMap.desc !== -1 && row[colMap.desc] ? String(row[colMap.desc]).trim() : '';
        const rawSpecs = colMap.specs !== -1 && row[colMap.specs] ? String(row[colMap.specs]).trim() : '';

        const specifications = parseSpecsTextToGroups(rawSpecs);

        const stableId = `excel-${sku.toLowerCase().replace(/[^a-z0-9_-]/g, '-')}`;

        extracted.push({
          id: stableId,
          sku,
          name,
          brand,
          categoryGroup,
          categoryType,
          warrantyMonths,
          pricing: {
            costPrice,
            distributorPrice,
            floorPrice,
            retailPrice,
            currency: 'VND',
          },
          thumbnail,
          specifications,
          tags,
          notes,
          description,
        });
      }

      if (extracted.length === 0) {
        throw new Error('Không trích xuất được sản phẩm hợp lệ nào từ file. Vui lòng kiểm tra lại cấu trúc cột.');
      }

      setParsedProducts(extracted);
    } catch (err: any) {
      console.error('Lỗi đọc file Excel:', err);
      setErrorMsg(err?.message || 'Có lỗi xảy ra khi đọc file Excel.');
      setParsedProducts([]);
    } finally {
      setIsParsing(false);
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
        finalProducts = [...parsedProducts];
      } else {
        // Mode merge: ghi đè theo SKU nếu trùng, thêm mới nếu chưa có
        const productMap = new Map<string, Product>();
        currentProducts.forEach(p => {
          productMap.set(p.sku.toUpperCase(), p);
        });
        parsedProducts.forEach(p => {
          productMap.set(p.sku.toUpperCase(), p);
        });
        finalProducts = Array.from(productMap.values());
      }

      // Cập nhật state hệ thống
      onImportProducts(finalProducts);

      // Tự động đẩy lên Google Sheet nếu được chọn
      if (autoSyncSheet) {
        const cfg = getLocalSheetsConfig();
        await pushProductsToGoogleSheet(finalProducts, cfg.sheetTitle || 'Sản phẩm');
      }

      alert(
        `Nhập dữ liệu thành công!\n- Tổng cộng: ${finalProducts.length} sản phẩm trong danh mục.\n${
          autoSyncSheet ? '- Đã đồng bộ trực tiếp lên Google Sheet SO_SANH_GIA!' : ''
        }`
      );
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
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-blue-600" />
                    Bảng xem trước dữ liệu trích xuất ({parsedProducts.length} sản phẩm)
                  </h4>
                </div>

                {/* Tùy chọn chế độ nhập */}
                <div className="flex items-center gap-4 text-xs font-medium text-slate-700 bg-white p-2 rounded-xl border border-slate-200">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      value="merge"
                      checked={importMode === 'merge'}
                      onChange={() => setImportMode('merge')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Thêm mới & Cập nhật theo SKU</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      value="replace"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span className="text-rose-700 font-semibold">Thay thế toàn bộ danh mục</span>
                  </label>
                </div>
              </div>

              {/* BẢNG XEM TRƯỚC */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="max-h-72 overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0 bg-slate-100/90 backdrop-blur-xs text-slate-700 border-b border-slate-200 z-10">
                      <tr>
                        <th className="p-2.5 font-bold">Mã SKU</th>
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
                      {parsedProducts.map((p, idx) => (
                        <tr key={p.id || idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-2.5 font-mono font-bold text-blue-700">{p.sku}</td>
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
                Sẵn sàng nạp <b>{parsedProducts.length}</b> sản phẩm vào hệ thống.
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
                  <span>Xác nhận nhập {parsedProducts.length} sản phẩm</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
