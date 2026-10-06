import React, { useState, useEffect } from 'react';
import { Product, SpecGroup } from '../../types/product';
import {
  X,
  Zap,
  Check,
  CheckCheck,
  Loader2,
  AlertCircle,
  FileText,
  ListOrdered,
  Eye,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { parseSpecsWithAI, getSavedGeminiKey } from '../../utils/aiSpecParser';

interface BatchSpecsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProducts: Product[];
  allProducts: Product[];
  onUpdateProducts: (updatedProducts: Product[]) => void;
}

interface SpecResultItem {
  productId: string;
  sku: string;
  name: string;
  originalSpecCount: number;
  newSpecGroups: SpecGroup[];
  status: 'pending' | 'processing' | 'success' | 'failed' | 'skipped';
  message?: string;
  usedGemini?: boolean;
}

export const BatchSpecsModal: React.FC<BatchSpecsModalProps> = ({
  isOpen,
  onClose,
  selectedProducts,
  allProducts,
  onUpdateProducts,
}) => {
  const [onlyEmpty, setOnlyEmpty] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<SpecResultItem[]>([]);
  const [previewSpecItem, setPreviewSpecItem] = useState<SpecResultItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Đếm số sản phẩm chưa có thông số
  const emptyCount = selectedProducts.filter(
    p => !p.specifications || p.specifications.length === 0
  ).length;

  useEffect(() => {
    if (isOpen && selectedProducts.length > 0) {
      const initial: SpecResultItem[] = selectedProducts.map(p => ({
        productId: p.id,
        sku: p.sku,
        name: p.name,
        originalSpecCount: p.specifications?.length || 0,
        newSpecGroups: p.specifications ? JSON.parse(JSON.stringify(p.specifications)) : [],
        status: 'pending',
      }));
      setResults(initial);
      setIsProcessing(false);
      setCurrentIndex(0);
      setPreviewSpecItem(null);
    }
  }, [isOpen, selectedProducts]);

  if (!isOpen) return null;

  const totalCount = selectedProducts.length;

  const handleStartExtraction = async () => {
    setIsProcessing(true);
    const apiKey = getSavedGeminiKey();
    const workingResults = [...results];

    for (let i = 0; i < selectedProducts.length; i++) {
      setCurrentIndex(i);
      const prod = selectedProducts[i];
      const hasExistingSpecs = prod.specifications && prod.specifications.length > 0;

      if (onlyEmpty && hasExistingSpecs) {
        workingResults[i] = {
          ...workingResults[i],
          status: 'skipped',
          message: 'Đã có thông số (bỏ qua theo thiết lập)',
        };
        setResults([...workingResults]);
        continue;
      }

      workingResults[i] = {
        ...workingResults[i],
        status: 'processing',
      };
      setResults([...workingResults]);

      try {
        const textToParse = `${prod.name}\n${prod.description || ''}\n${prod.notes || ''}`.trim();

        if (!textToParse) {
          workingResults[i] = {
            ...workingResults[i],
            status: 'failed',
            message: 'Sản phẩm không có tên hoặc mô tả để bóc tách',
          };
          setResults([...workingResults]);
          continue;
        }

        const parseRes = await parseSpecsWithAI(textToParse, apiKey);

        if (parseRes.groups && parseRes.groups.length > 0) {
          workingResults[i] = {
            ...workingResults[i],
            newSpecGroups: parseRes.groups,
            status: 'success',
            usedGemini: parseRes.usedGemini,
            message: `Bóc tách thành công ${parseRes.groups.length} nhóm thông số`,
          };
        } else {
          workingResults[i] = {
            ...workingResults[i],
            status: 'failed',
            message: 'Không tìm thấy thông số phù hợp trong mô tả',
          };
        }
      } catch (err: any) {
        workingResults[i] = {
          ...workingResults[i],
          status: 'failed',
          message: err?.message || 'Lỗi bóc tách',
        };
      }

      setResults([...workingResults]);

      // Nghỉ nhẹ 300ms giữa các request để đảm bảo an toàn tốc độ
      await new Promise(r => setTimeout(r, 300));
    }

    setIsProcessing(false);
  };

  const successCount = results.filter(r => r.status === 'success').length;

  const handleApplySpecs = () => {
    if (successCount === 0) {
      alert('Chưa có sản phẩm nào bóc tách thành công để áp dụng.');
      return;
    }

    setIsSaving(true);
    try {
      const updateMap = new Map<string, SpecGroup[]>();
      results.forEach(r => {
        if (r.status === 'success' && r.newSpecGroups.length > 0) {
          updateMap.set(r.productId, r.newSpecGroups);
        }
      });

      const nextAllProducts = allProducts.map(prod => {
        const newSpecs = updateMap.get(prod.id);
        if (newSpecs) {
          return {
            ...prod,
            specifications: newSpecs,
            updatedAt: new Date().toISOString().split('T')[0],
          };
        }
        return prod;
      });

      onUpdateProducts(nextAllProducts);
      alert(`Đã cập nhật bảng thông số kỹ thuật mới cho ${successCount} sản phẩm thành công!`);
      onClose();
    } catch (e) {
      console.error('Lỗi lưu thông số bóc tách:', e);
      alert('Có lỗi xảy ra khi lưu thông số. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const progressPercent = totalCount > 0 ? Math.round(((currentIndex + (isProcessing ? 0.5 : 1)) / totalCount) * 100) : 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header Modal */}
        <div className="p-4 sm:px-6 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Bóc tách Thông số kỹ thuật hàng loạt bằng AI
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  {totalCount} sản phẩm
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                AI tự động trích xuất bảng thông số kỹ thuật chuẩn hóa từ mô tả và tên sản phẩm
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-40 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thanh Tùy chọn & Thống kê */}
        <div className="p-4 sm:px-6 bg-amber-50/50 border-b border-amber-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-slate-700 font-semibold">Tùy chọn bóc tách:</span>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="radio"
                name="extractMode"
                checked={onlyEmpty}
                onChange={() => setOnlyEmpty(true)}
                disabled={isProcessing}
                className="w-4 h-4 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-slate-700">
                Chỉ bóc tách SP <strong>chưa có thông số</strong> ({emptyCount} SP)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="radio"
                name="extractMode"
                checked={!onlyEmpty}
                onChange={() => setOnlyEmpty(false)}
                disabled={isProcessing}
                className="w-4 h-4 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-slate-700">
                Bóc tách lại <strong>toàn bộ {totalCount} SP</strong> đã chọn
              </span>
            </label>
          </div>

          {!isProcessing && (
            <button
              type="button"
              onClick={handleStartExtraction}
              className="px-4 py-1.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Bắt đầu Bóc tách AI</span>
            </button>
          )}
        </div>

        {/* Thanh Tiến trình (Progress bar) khi đang chạy */}
        {isProcessing && (
          <div className="px-6 py-3 bg-blue-50 border-b border-blue-200">
            <div className="flex items-center justify-between text-xs text-blue-900 font-semibold mb-1.5">
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                Đang xử lý sản phẩm {currentIndex + 1} / {totalCount}: [{selectedProducts[currentIndex]?.sku}]
              </span>
              <span>{Math.min(100, progressPercent)}%</span>
            </div>
            <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, progressPercent)}%` }}
              />
            </div>
          </div>
        )}

        {/* Bảng Danh sách Tiến độ & Kết quả */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700 select-none">
                  <tr>
                    <th className="p-3 w-12 text-center">STT</th>
                    <th className="p-3 min-w-[220px]">Sản phẩm & SKU</th>
                    <th className="p-3 min-w-[140px]">Thông số hiện có</th>
                    <th className="p-3 min-w-[150px]">Trạng thái bóc tách</th>
                    <th className="p-3 min-w-[200px]">Kết quả trích xuất</th>
                    <th className="p-3 w-20 text-center">Xem trước</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {results.map((res, idx) => {
                    const totalItems = res.newSpecGroups.reduce((acc, g) => acc + g.items.length, 0);

                    return (
                      <tr key={res.productId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 text-center text-slate-500 font-mono">
                          {idx + 1}
                        </td>

                        {/* Sản phẩm */}
                        <td className="p-3">
                          <div className="font-bold text-slate-900 leading-snug line-clamp-2" title={res.name}>
                            {res.name}
                          </div>
                          <span className="font-mono text-[11px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200 inline-block mt-1">
                            {res.sku}
                          </span>
                        </td>

                        {/* Hiện có */}
                        <td className="p-3">
                          {res.originalSpecCount > 0 ? (
                            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {res.originalSpecCount} nhóm
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Chưa có thông số</span>
                          )}
                        </td>

                        {/* Trạng thái */}
                        <td className="p-3">
                          {res.status === 'pending' && (
                            <span className="text-slate-400 text-[11px]">Chờ bóc tách</span>
                          )}
                          {res.status === 'processing' && (
                            <span className="inline-flex items-center gap-1 text-blue-600 font-semibold text-[11px]">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Đang phân tích...
                            </span>
                          )}
                          {res.status === 'skipped' && (
                            <span className="text-slate-400 text-[11px]">Đã bỏ qua (đã có)</span>
                          )}
                          {res.status === 'success' && (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <Check className="w-3 h-3" />
                              Thành công
                            </span>
                          )}
                          {res.status === 'failed' && (
                            <span className="inline-flex items-center gap-1 text-rose-700 font-medium text-[11px] bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              <AlertCircle className="w-3 h-3" />
                              {res.message || 'Thất bại'}
                            </span>
                          )}
                        </td>

                        {/* Kết quả */}
                        <td className="p-3 text-[11px]">
                          {res.status === 'success' ? (
                            <div>
                              <strong className="text-slate-800">
                                {res.newSpecGroups.length} nhóm ({totalItems} mục con)
                              </strong>
                              <div className="text-slate-500 truncate max-w-xs mt-0.5">
                                {res.newSpecGroups.map(g => g.groupName).join(' • ')}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        {/* Xem trước */}
                        <td className="p-3 text-center">
                          {res.status === 'success' && res.newSpecGroups.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setPreviewSpecItem(res)}
                              className="p-1 rounded-md text-blue-600 hover:bg-blue-50 border border-blue-200 cursor-pointer"
                              title="Xem chi tiết các thông số vừa bóc tách"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal xem trước chi tiết thông số của 1 sản phẩm */}
        {previewSpecItem && (
          <div className="absolute inset-0 z-10 bg-slate-900/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-xl max-h-[80vh] flex flex-col overflow-hidden">
              <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    Xem trước thông số: {previewSpecItem.name}
                  </h4>
                  <span className="text-[10px] font-mono text-blue-600">{previewSpecItem.sku}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewSpecItem(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto space-y-3 flex-1 custom-scrollbar text-xs">
                {previewSpecItem.newSpecGroups.map((group, gIdx) => (
                  <div key={gIdx} className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-800 text-[11px]">
                      {group.groupName}
                    </div>
                    <div className="divide-y divide-slate-100">
                      {group.items.map((it, iIdx) => (
                        <div key={iIdx} className="px-3 py-1 flex items-center justify-between gap-2">
                          <span className="text-slate-600 font-medium">{it.key}:</span>
                          <span className="font-semibold text-slate-900 text-right">{it.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 border-t border-slate-200 bg-slate-50 text-right">
                <button
                  type="button"
                  onClick={() => setPreviewSpecItem(null)}
                  className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-semibold cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Modal */}
        <div className="p-4 sm:px-6 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {successCount > 0 ? (
              <span className="text-emerald-700 font-semibold">
                ✓ Đã trích xuất thành công {successCount} / {totalCount} sản phẩm
              </span>
            ) : (
              <span>Bấm "Bắt đầu Bóc tách AI" để trích xuất thông số cho danh sách sản phẩm đã chọn</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing || isSaving}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer"
            >
              Đóng
            </button>

            <button
              type="button"
              onClick={handleApplySpecs}
              disabled={isProcessing || isSaving || successCount === 0}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <CheckCheck className="w-4 h-4" />
                  <span>Lưu & Áp dụng ({successCount} sản phẩm)</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
