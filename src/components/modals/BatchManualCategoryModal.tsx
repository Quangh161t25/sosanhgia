import React, { useState, useEffect, useMemo } from 'react';
import { Product } from '../../types/product';
import {
  X,
  Layers,
  Check,
  CheckCheck,
  Search,
  FolderEdit,
  Tag,
  Save,
  RotateCcw,
} from 'lucide-react';
import { STANDARD_GROUPS } from '../../utils/aiCategoryAdvisor';

interface BatchManualCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProducts: Product[];
  allProducts: Product[];
  onUpdateProducts: (updatedProducts: Product[]) => void;
}

interface ItemRow {
  productId: string;
  sku: string;
  name: string;
  brand?: string;
  categoryGroup: string;
  categoryType: string;
  isModified: boolean;
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

export const BatchManualCategoryModal: React.FC<BatchManualCategoryModalProps> = ({
  isOpen,
  onClose,
  selectedProducts,
  allProducts,
  onUpdateProducts,
}) => {
  const [items, setItems] = useState<Record<string, ItemRow>>({});
  const [quickGroup, setQuickGroup] = useState('');
  const [quickType, setQuickType] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Danh sách các nhóm hiện có (Sắp xếp A-Z)
  const existingGroups = useMemo(() => {
    const list = Array.from(
      new Set(allProducts.map(p => p.categoryGroup?.trim()).filter(Boolean) as string[])
    );
    const base = list.length > 0 ? list : STANDARD_GROUPS;
    return base.slice().sort((a, b) => a.localeCompare(b, 'vi', { sensitivity: 'base' }));
  }, [allProducts]);

  // Danh sách các loại hiện có (Sắp xếp A-Z)
  const existingTypes = useMemo(() => {
    const list = Array.from(
      new Set(allProducts.map(p => p.categoryType?.trim()).filter(Boolean) as string[])
    );
    const combined = Array.from(new Set([...list, ...COMMON_TYPES]));
    return combined.slice().sort((a, b) => a.localeCompare(b, 'vi', { sensitivity: 'base' }));
  }, [allProducts]);

  // Khởi tạo state khi mở modal
  useEffect(() => {
    if (isOpen && selectedProducts.length > 0) {
      const initial: Record<string, ItemRow> = {};
      selectedProducts.forEach(p => {
        initial[p.id] = {
          productId: p.id,
          sku: p.sku || '',
          name: p.name,
          brand: p.brand || '',
          categoryGroup: p.categoryGroup || '',
          categoryType: p.categoryType || '',
          isModified: false,
        };
      });
      setItems(initial);
      setQuickGroup('');
      setQuickType('');
      setSearchFilter('');
    }
  }, [isOpen, selectedProducts]);

  if (!isOpen) return null;

  const totalCount = selectedProducts.length;

  // Thay đổi giá trị từng dòng
  const handleItemChange = (productId: string, field: 'categoryGroup' | 'categoryType', value: string) => {
    setItems(prev => {
      const current = prev[productId];
      if (!current) return prev;
      return {
        ...prev,
        [productId]: {
          ...current,
          [field]: value,
          isModified: true,
        },
      };
    });
  };

  // Áp dụng gán nhanh cho tất cả các dòng
  const handleApplyQuickAssign = () => {
    const trimmedGroup = quickGroup.trim();
    const trimmedType = quickType.trim();

    if (!trimmedGroup && !trimmedType) {
      alert('Vui lòng chọn hoặc nhập ít nhất Nhóm danh mục hoặc Loại sản phẩm để gán.');
      return;
    }

    setItems(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(id => {
        next[id] = {
          ...next[id],
          ...(trimmedGroup ? { categoryGroup: trimmedGroup } : {}),
          ...(trimmedType ? { categoryType: trimmedType } : {}),
          isModified: true,
        };
      });
      return next;
    });
  };

  // Reset về giá trị ban đầu của sản phẩm
  const handleResetToOriginal = () => {
    if (window.confirm('Khôi phục lại Nhóm và Loại gốc của các sản phẩm đang chọn?')) {
      const initial: Record<string, ItemRow> = {};
      selectedProducts.forEach(p => {
        initial[p.id] = {
          productId: p.id,
          sku: p.sku || '',
          name: p.name,
          brand: p.brand || '',
          categoryGroup: p.categoryGroup || '',
          categoryType: p.categoryType || '',
          isModified: false,
        };
      });
      setItems(initial);
    }
  };

  // Lưu thay đổi
  const handleSave = () => {
    setIsSaving(true);
    try {
      const updatedMap = new Map<string, ItemRow>();
      Object.values(items).forEach(it => {
        updatedMap.set(it.productId, it);
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
      alert(`Đã cập nhật thành công Nhóm & Loại cho ${totalCount} sản phẩm!`);
      onClose();
    } catch (e) {
      console.error('Lỗi khi lưu Nhóm & Loại:', e);
      alert('Có lỗi xảy ra khi lưu. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  // Lọc sản phẩm hiển thị trong modal theo searchFilter
  const filteredItemsList = Object.values(items).filter(it => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase().trim();
    return (
      it.sku.toLowerCase().includes(q) ||
      it.name.toLowerCase().includes(q) ||
      (it.brand && it.brand.toLowerCase().includes(q)) ||
      it.categoryGroup.toLowerCase().includes(q) ||
      it.categoryType.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header Modal */}
        <div className="p-4 sm:px-6 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <FolderEdit className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Tự sửa Nhóm danh mục & Loại sản phẩm
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                  {totalCount} sản phẩm đang chọn
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Bạn có thể gán nhanh cho toàn bộ danh sách hoặc tự tay sửa chi tiết từng sản phẩm bên dưới.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thân Modal */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* KHUNG GÁN NHANH HÀNG LOẠT (BULK ASSIGN) */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50/80 via-blue-50/60 to-slate-50 border border-indigo-100 shadow-2xs">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCheck className="w-4 h-4 text-indigo-600" />
                Gán nhanh cho toàn bộ ({totalCount}) sản phẩm đã chọn:
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              {/* Ô chọn / gõ Nhóm danh mục */}
              <div className="sm:col-span-5">
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  Nhóm danh mục:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    list="batch-modal-groups"
                    value={quickGroup}
                    onChange={e => setQuickGroup(e.target.value)}
                    placeholder="Chọn hoặc nhập Nhóm..."
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                  />
                  <datalist id="batch-modal-groups">
                    {existingGroups.map(g => (
                      <option key={g} value={g} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Ô chọn / gõ Loại sản phẩm */}
              <div className="sm:col-span-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-blue-600" />
                  Loại sản phẩm:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    list="batch-modal-types"
                    value={quickType}
                    onChange={e => setQuickType(e.target.value)}
                    placeholder="Chọn hoặc nhập Loại..."
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                  />
                  <datalist id="batch-modal-types">
                    {existingTypes.map(t => (
                      <option key={t} value={t} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Nút Áp dụng gán nhanh */}
              <div className="sm:col-span-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleApplyQuickAssign}
                  className="w-full px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Áp dụng tất cả</span>
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              💡 <em>Mẹo:</em> Bạn có thể gán nhanh cả 2 ô hoặc chỉ gán 1 trong 2 (ô nào để trống sẽ giữ nguyên giá trị ban đầu của từng sản phẩm).
            </p>
          </div>

          {/* THANH TÌM KIẾM TRONG MODAL & RESET */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                placeholder="Tìm nhanh trong danh sách đang chọn..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <button
              type="button"
              onClick={handleResetToOriginal}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Khôi phục lại dữ liệu gốc của sản phẩm"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Khôi phục gốc</span>
            </button>
          </div>

          {/* BẢNG SỬA CHI TIẾT TỪNG DÒNG */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="max-h-[46vh] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    <th className="py-2.5 px-3 w-28">Mã SKU</th>
                    <th className="py-2.5 px-3 min-w-[200px]">Tên sản phẩm</th>
                    <th className="py-2.5 px-3 w-28">Hãng</th>
                    <th className="py-2.5 px-3 w-48">Nhóm danh mục</th>
                    <th className="py-2.5 px-3 w-48">Loại sản phẩm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredItemsList.map((row, idx) => (
                    <tr
                      key={row.productId}
                      className={`hover:bg-slate-50 transition-colors ${
                        row.isModified ? 'bg-indigo-50/20' : ''
                      }`}
                    >
                      <td className="py-2 px-3 text-center text-slate-400 text-[11px] font-mono">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 font-mono font-semibold text-blue-700">
                        {row.sku || '—'}
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-800">
                        <div className="line-clamp-2 leading-snug" title={row.name}>
                          {row.name}
                        </div>
                      </td>
                      <td className="py-2 px-3 text-slate-600 text-[11px]">
                        {row.brand || '—'}
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          list="batch-modal-groups"
                          value={row.categoryGroup}
                          onChange={e => handleItemChange(row.productId, 'categoryGroup', e.target.value)}
                          placeholder="Chưa phân nhóm..."
                          className="w-full px-2 py-1 text-xs rounded border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          list="batch-modal-types"
                          value={row.categoryType}
                          onChange={e => handleItemChange(row.productId, 'categoryType', e.target.value)}
                          placeholder="Chưa phân loại..."
                          className="w-full px-2 py-1 text-xs rounded border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Footer Modal */}
        <div className="p-3.5 sm:px-6 border-t border-slate-200 flex items-center justify-between gap-3 bg-slate-50/80">
          <div className="text-xs text-slate-500">
            Tổng số: <strong className="text-slate-800">{totalCount}</strong> sản phẩm được chọn
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Đang lưu...' : `Lưu thay đổi (${totalCount} SP)`}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
