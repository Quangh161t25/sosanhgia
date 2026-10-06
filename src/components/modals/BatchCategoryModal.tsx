import React, { useState, useEffect, useMemo } from 'react';
import { Product } from '../../types/product';
import {
  X,
  Sparkles,
  Check,
  CheckCheck,
  Loader2,
  Layers,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import {
  classifyBatchCategories,
  CategoryClassificationResult,
  STANDARD_GROUPS,
} from '../../utils/aiCategoryAdvisor';
import { getSavedGeminiKey } from '../../utils/aiSpecParser';

interface BatchCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProducts: Product[];
  allProducts: Product[];
  onUpdateProducts: (updatedProducts: Product[]) => void;
}

interface ItemState {
  productId: string;
  categoryGroup: string;
  categoryType: string;
  reason: string;
  checked: boolean;
}

const COMMON_TYPES = [
  'Bộ nồi inox',
  'Bộ nồi inox 3 món',
  'Bộ nồi inox 5 món',
  'Nồi luộc gà',
  'Quánh inox',
  'Chảo chống dính',
  'Chảo inox',
  'Bình giữ nhiệt',
  'Hộp cơm giữ nhiệt',
  'Bộ dao làm bếp',
  'Thớt kháng khuẩn',
  'Nồi chiên không dầu',
  'Ấm đun nước siêu tốc',
  'Nồi cơm điện',
  'Nồi áp suất điện',
  'Bếp từ',
  'Bếp hồng ngoại',
  'Máy xay đa năng',
  'Máy ép chậm',
  'Máy làm sữa hạt',
  'Robot hút bụi lau nhà',
  'Khóa cửa thông minh',
  'Máy lọc không khí',
];

export const BatchCategoryModal: React.FC<BatchCategoryModalProps> = ({
  isOpen,
  onClose,
  selectedProducts,
  allProducts,
  onUpdateProducts,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [items, setItems] = useState<Record<string, ItemState>>({});
  const [usedGemini, setUsedGemini] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Thanh gán nhanh hàng loạt
  const [quickGroup, setQuickGroup] = useState('');
  const [quickType, setQuickType] = useState('');

  // Danh sách các nhóm hiện có (Sắp xếp A-Z)
  const existingGroups = useMemo(() => {
    const list = Array.from(
      new Set(allProducts.map(p => p.categoryGroup).filter(Boolean) as string[])
    );
    const base = list.length > 0 ? list : STANDARD_GROUPS;
    return base.slice().sort((a, b) => a.localeCompare(b, 'vi', { sensitivity: 'base' }));
  }, [allProducts]);

  // Khởi tạo trạng thái khi mở modal
  useEffect(() => {
    if (isOpen && selectedProducts.length > 0) {
      const initial: Record<string, ItemState> = {};
      selectedProducts.forEach(p => {
        initial[p.id] = {
          productId: p.id,
          categoryGroup: p.categoryGroup || '',
          categoryType: p.categoryType || '',
          reason: 'Chờ phân tích',
          checked: true,
        };
      });
      setItems(initial);
      setHasAnalyzed(false);
      setUsedGemini(false);
      setQuickGroup('');
      setQuickType('');

      // Tự động kích hoạt phân tích ngay khi mở để người dùng không phải bấm thêm bước
      runAnalysis(selectedProducts);
    }
  }, [isOpen, selectedProducts]);

  const runAnalysis = async (productsToProcess: Product[]) => {
    if (productsToProcess.length === 0) return;
    setIsAnalyzing(true);
    try {
      const apiKey = getSavedGeminiKey();
      const { results, usedGemini: geminiSuccess } = await classifyBatchCategories(
        productsToProcess,
        existingGroups,
        apiKey
      );

      setUsedGemini(geminiSuccess);
      setItems(prev => {
        const next = { ...prev };
        productsToProcess.forEach(p => {
          const res = results[p.id];
          if (res) {
            next[p.id] = {
              productId: p.id,
              categoryGroup: res.categoryGroup,
              categoryType: res.categoryType,
              reason: res.reason || 'AI chuẩn hóa',
              checked: true,
            };
          }
        });
        return next;
      });
      setHasAnalyzed(true);
    } catch (e) {
      console.error('Lỗi khi phân loại AI hàng loạt:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isOpen) return null;

  const totalCount = selectedProducts.length;
  const checkedItems = Object.values(items).filter(it => it.checked);
  const checkedCount = checkedItems.length;
  const isAllChecked = totalCount > 0 && checkedCount === totalCount;

  const handleToggleSelectAll = () => {
    const nextVal = !isAllChecked;
    setItems(prev => {
      const updated: Record<string, ItemState> = {};
      Object.keys(prev).forEach(id => {
        updated[id] = { ...prev[id], checked: nextVal };
      });
      return updated;
    });
  };

  const handleToggleItem = (id: string) => {
    setItems(prev => ({
      ...prev,
      [id]: { ...prev[id], checked: !prev[id]?.checked },
    }));
  };

  const handleChangeGroup = (id: string, val: string) => {
    setItems(prev => ({
      ...prev,
      [id]: { ...prev[id], categoryGroup: val },
    }));
  };

  const handleChangeType = (id: string, val: string) => {
    setItems(prev => ({
      ...prev,
      [id]: { ...prev[id], categoryType: val },
    }));
  };

  // Gán nhanh Nhóm cho các dòng đang được tick
  const handleApplyQuickGroup = () => {
    if (!quickGroup) return;
    setItems(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(id => {
        if (next[id]?.checked) {
          next[id] = {
            ...next[id],
            categoryGroup: quickGroup,
            reason: `Người dùng gán nhanh nhóm [${quickGroup}]`,
          };
        }
      });
      return next;
    });
  };

  // Gán nhanh Loại cho các dòng đang được tick
  const handleApplyQuickType = () => {
    if (!quickType.trim()) return;
    setItems(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(id => {
        if (next[id]?.checked) {
          next[id] = {
            ...next[id],
            categoryType: quickType.trim(),
            reason: `Người dùng gán nhanh loại [${quickType.trim()}]`,
          };
        }
      });
      return next;
    });
  };

  const handleApplyUpdates = async () => {
    if (checkedCount === 0) {
      alert('Vui lòng chọn ít nhất 1 sản phẩm để áp dụng cập nhật.');
      return;
    }

    setIsSaving(true);
    try {
      const updatedMap = new Map<string, ItemState>();
      Object.values(items).forEach(it => {
        if (it.checked) {
          updatedMap.set(it.productId, it);
        }
      });

      const nextAllProducts = allProducts.map(prod => {
        const update = updatedMap.get(prod.id);
        if (update) {
          return {
            ...prod,
            categoryGroup: update.categoryGroup.trim(),
            categoryType: update.categoryType.trim(),
            updatedAt: new Date().toISOString().split('T')[0],
          };
        }
        return prod;
      });

      onUpdateProducts(nextAllProducts);
      alert(`Đã cập nhật thành công Nhóm & Loại danh mục cho ${checkedCount} sản phẩm!`);
      onClose();
    } catch (e) {
      console.error('Lỗi lưu cập nhật danh mục:', e);
      alert('Có lỗi xảy ra khi lưu thay đổi. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header Modal */}
        <div className="p-4 sm:px-6 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Chuẩn hóa Nhóm & Loại sản phẩm hàng loạt (AI)
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  {totalCount} sản phẩm
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                AI phân tích Tên sản phẩm để chuẩn hóa Nhóm ngành hàng và Loại sản phẩm (Bạn có thể click sửa trực tiếp bên dưới)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => runAnalysis(selectedProducts)}
              disabled={isAnalyzing}
              className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
              title="Phân tích lại toàn bộ"
            >
              <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin text-blue-600' : ''}`} />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Trạng thái công nghệ AI & Heuristic */}
        <div className="px-6 py-2.5 bg-blue-50/60 border-b border-blue-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-slate-700 font-medium">
              Chế độ:{' '}
              <strong className="text-blue-700">
                {usedGemini ? 'Google Gemini 2.5 Flash + Heuristic Engine' : 'Bộ quy tắc nhận diện chuyên sâu tiếng Việt (Ưu tiên tên sản phẩm)'}
              </strong>
            </span>
          </div>
          <div className="text-slate-500 text-[11px]">
            Đã chọn áp dụng: <strong className="text-emerald-700 font-bold">{checkedCount}</strong> / {totalCount} sản phẩm
          </div>
        </div>

        {/* VÙNG NỘI DUNG CUỘN CHÍNH */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar space-y-3">
          
          {/* THANH GÁN NHANH HÀNG LOẠT (QUICK BATCH ASSIGNMENT) */}
          <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200/90 flex flex-wrap items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <SlidersHorizontal className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Gán nhanh cho {checkedCount} dòng đã tick:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Đổi nhanh Nhóm */}
              <div className="flex items-center gap-1">
                <select
                  value={quickGroup}
                  onChange={e => setQuickGroup(e.target.value)}
                  className="h-7 px-2 text-xs rounded-lg border border-slate-300 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">-- Chọn Nhóm danh mục --</option>
                  {existingGroups.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleApplyQuickGroup}
                  disabled={!quickGroup || checkedCount === 0}
                  className="h-7 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] disabled:opacity-40 cursor-pointer shadow-2xs transition-all active:scale-95"
                >
                  Gán Nhóm
                </button>
              </div>

              {/* Đổi nhanh Loại */}
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={quickType}
                  onChange={e => setQuickType(e.target.value)}
                  placeholder="Loại SP (VD: Bộ nồi inox...)"
                  list="common-type-options"
                  className="h-7 px-2 text-xs rounded-lg border border-slate-300 bg-white font-semibold text-slate-800 w-44 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleApplyQuickType}
                  disabled={!quickType.trim() || checkedCount === 0}
                  className="h-7 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] disabled:opacity-40 cursor-pointer shadow-2xs transition-all active:scale-95"
                >
                  Gán Loại
                </button>
              </div>
            </div>
          </div>

          {/* Bảng Danh sách đối chiếu Cũ ➔ Mới */}
          {isAnalyzing && !hasAnalyzed ? (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-3" />
              <p className="text-sm font-bold text-slate-800">Đang phân tích tên sản phẩm bằng AI...</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Hệ thống đang chuẩn hóa Nhóm ngành hàng và phân loại chi tiết cho từng sản phẩm.
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700 select-none">
                    <tr>
                      <th className="p-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={isAllChecked}
                          onChange={handleToggleSelectAll}
                          title="Chọn tất cả / Bỏ chọn tất cả"
                          className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                        />
                      </th>
                      <th className="p-3 min-w-[200px]">Sản phẩm & SKU</th>
                      <th className="p-3 min-w-[220px]">
                        <div className="flex items-center gap-1">
                          <span>Nhóm danh mục</span>
                          <span className="text-[10px] text-slate-400 font-normal">(Cũ ➔ Mới)</span>
                        </div>
                      </th>
                      <th className="p-3 min-w-[220px]">
                        <div className="flex items-center gap-1">
                          <span>Loại sản phẩm</span>
                          <span className="text-[10px] text-slate-400 font-normal">(Cũ ➔ Mới)</span>
                        </div>
                      </th>
                      <th className="p-3 min-w-[160px]">Lý do / Căn cứ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedProducts.map(prod => {
                      const item = items[prod.id] || {
                        productId: prod.id,
                        categoryGroup: prod.categoryGroup || '',
                        categoryType: prod.categoryType || '',
                        reason: '',
                        checked: true,
                      };

                      const isGroupChanged = (prod.categoryGroup || '') !== item.categoryGroup;
                      const isTypeChanged = (prod.categoryType || '') !== item.categoryType;

                      return (
                        <tr
                          key={prod.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            item.checked ? 'bg-white' : 'bg-slate-50/40 opacity-60'
                          }`}
                        >
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={item.checked}
                              onChange={() => handleToggleItem(prod.id)}
                              className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                            />
                          </td>

                          {/* Tên & SKU */}
                          <td className="p-3">
                            <div className="font-bold text-slate-900 leading-snug line-clamp-2" title={prod.name}>
                              {prod.name}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="font-mono text-[11px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                                {prod.sku}
                              </span>
                              {prod.brand && (
                                <span className="text-[11px] text-slate-500">
                                  {prod.brand}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Nhóm danh mục (Cũ ➔ Mới) - Có gợi ý Datalist & Cho phép sửa tự do */}
                          <td className="p-3">
                            <div className="space-y-1">
                              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                                <span>Cũ:</span>
                                <span className="font-medium text-slate-600 line-through">
                                  {prod.categoryGroup || '(Chưa có)'}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <ArrowRight className="w-3 h-3 text-blue-600 shrink-0" />
                                <input
                                  type="text"
                                  list="group-datalist"
                                  value={item.categoryGroup}
                                  onChange={e => handleChangeGroup(prod.id, e.target.value)}
                                  placeholder="Chọn hoặc nhập nhóm..."
                                  className={`h-7 px-2 text-xs rounded border w-full font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                    isGroupChanged
                                      ? 'bg-blue-50 border-blue-400 text-blue-900'
                                      : 'bg-white border-slate-200 text-slate-800'
                                  }`}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Loại sản phẩm (Cũ ➔ Mới) - Có gợi ý Datalist & Cho phép sửa tự do */}
                          <td className="p-3">
                            <div className="space-y-1">
                              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                                <span>Cũ:</span>
                                <span className="font-medium text-slate-600 line-through">
                                  {prod.categoryType || '(Chưa có)'}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <ArrowRight className="w-3 h-3 text-emerald-600 shrink-0" />
                                <input
                                  type="text"
                                  list="common-type-options"
                                  value={item.categoryType}
                                  onChange={e => handleChangeType(prod.id, e.target.value)}
                                  placeholder="Chọn hoặc nhập loại..."
                                  className={`h-7 px-2 text-xs rounded border w-full font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                                    isTypeChanged
                                      ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                                      : 'bg-white border-slate-200 text-slate-800'
                                  }`}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Lý do AI */}
                          <td className="p-3 text-[11px] text-slate-600">
                            <span className="inline-block bg-slate-100 text-slate-700 px-2 py-1 rounded border border-slate-200 leading-tight">
                              {item.reason || 'AI tự động nhận diện'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Datalist gợi ý cho trình duyệt */}
        <datalist id="group-datalist">
          {existingGroups.map(g => (
            <option key={g} value={g} />
          ))}
        </datalist>

        <datalist id="common-type-options">
          {COMMON_TYPES.map(t => (
            <option key={t} value={t} />
          ))}
        </datalist>

        {/* Footer Modal */}
        <div className="p-4 sm:px-6 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            💡 Bạn có thể click trực tiếp vào từng ô để gõ sửa, hoặc dùng thanh "Gán nhanh" ở trên để đổi đồng loạt.
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>

            <button
              type="button"
              onClick={handleApplyUpdates}
              disabled={isSaving || checkedCount === 0}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <CheckCheck className="w-4 h-4" />
                  <span>Áp dụng cập nhật ({checkedCount} sản phẩm)</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
