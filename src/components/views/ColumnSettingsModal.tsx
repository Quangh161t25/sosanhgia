import React from 'react';
import {
  X,
  SlidersHorizontal,
  ArrowUp,
  ArrowDown,
  Pin,
  Eye,
  EyeOff,
  AlignLeft,
  AlignCenter,
  AlignRight,
  WrapText,
  RotateCcw,
  Check
} from 'lucide-react';

export type ColumnGroupId = 'system' | 'general' | 'category' | 'pricing' | 'details';

export interface ColumnGroupDef {
  id: ColumnGroupId;
  name: string;
  shortName: string;
}

export const COLUMN_GROUPS: Record<ColumnGroupId, ColumnGroupDef> = {
  system: { id: 'system', name: 'Hệ thống', shortName: 'Hệ thống' },
  general: { id: 'general', name: 'Thông tin sản phẩm', shortName: 'Thông tin' },
  category: { id: 'category', name: 'Phân loại danh mục', shortName: 'Phân loại' },
  pricing: { id: 'pricing', name: '4 Tầng giá & Lợi nhuận', shortName: 'Bảng giá' },
  details: { id: 'details', name: 'Thông số & Chi tiết', shortName: 'Chi tiết' },
};

export function getColumnGroup(colId: string): ColumnGroupId {
  if (['checkbox', 'actions'].includes(colId)) return 'system';
  if (['thumbnail', 'sku', 'name', 'brand'].includes(colId)) return 'general';
  if (['categoryGroup', 'categoryType'].includes(colId)) return 'category';
  if (['costPrice', 'distributorPrice', 'floorPrice', 'retailPrice', 'margin'].includes(colId)) return 'pricing';
  return 'details';
}

export interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
  pinned: boolean; // Ghim bên trái
  align: 'left' | 'center' | 'right';
  wrap: boolean; // true: xuống dòng, false: nowrap/cắt bớt
  width: number; // Kích thước pixel
  minWidth?: number;
  group?: ColumnGroupId;
}

interface ColumnSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  columns: ColumnConfig[];
  onChangeColumns: (newCols: ColumnConfig[]) => void;
  onResetDefaults: () => void;
}

export const ColumnSettingsModal: React.FC<ColumnSettingsModalProps> = ({
  isOpen,
  onClose,
  columns,
  onChangeColumns,
  onResetDefaults,
}) => {
  if (!isOpen) return null;

  const moveColumn = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= columns.length) return;
    const reordered = [...columns];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;
    onChangeColumns(reordered);
  };

  const updateColumn = (id: string, updates: Partial<ColumnConfig>) => {
    const updated = columns.map(c => (c.id === id ? { ...c, ...updates } : c));
    onChangeColumns(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Tùy Biến Cột Bảng Dữ Liệu
              </h3>
              <p className="text-[11px] text-slate-500">
                1. Sắp xếp &bull; 2. Ghim &bull; 3. Ẩn/Hiện &bull; 4. Căn lề & Xuống dòng &bull; 5. Kích thước cột
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Column list table */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2">
          <div className="text-[11px] text-slate-500 bg-blue-50 border border-blue-200 rounded-xl p-2.5 flex items-center justify-between">
            <span>
              💡 <strong>Mẹo:</strong> Bạn cũng có thể kéo trực tiếp viền cột ngay trên bảng ngoài web để chỉnh kích thước!
            </span>
            <button
              type="button"
              onClick={onResetDefaults}
              className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 shrink-0 ml-2"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Khôi phục mặc định</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
            {columns.map((col, idx) => {
              if (col.id === 'checkbox') return null; // Checkbox luôn cố định

              return (
                <div
                  key={col.id}
                  className={`p-3 flex flex-wrap items-center justify-between gap-3 text-xs ${
                    col.visible ? 'bg-white' : 'bg-slate-50 opacity-60'
                  }`}
                >
                  {/* Left: Tên cột & Checkbox Ẩn/Hiện */}
                  <div className="flex items-center gap-2.5 min-w-[180px]">
                    {/* 3. Ẩn / Hiện */}
                    <button
                      type="button"
                      onClick={() => updateColumn(col.id, { visible: !col.visible })}
                      title={col.visible ? 'Nhấn để ẩn cột' : 'Nhấn để hiện cột'}
                      className={`p-1 rounded-md transition-colors ${
                        col.visible ? 'text-blue-600 hover:bg-blue-50' : 'text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {col.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    <span className={`font-semibold ${col.visible ? 'text-slate-800' : 'text-slate-400'}`}>
                      {col.label}
                    </span>
                  </div>

                  {/* Middle Controls: Sắp xếp, Ghim, Căn lề, Xuống dòng */}
                  <div className="flex flex-wrap items-center gap-2">
                    
                    {/* 1. Sắp xếp thứ tự */}
                    <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                      <button
                        type="button"
                        disabled={idx <= 1} // Không đổi chỗ cho cột checkbox
                        onClick={() => moveColumn(idx, 'up')}
                        title="Di chuyển lên trước"
                        className="p-1 rounded hover:bg-white text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === columns.length - 1}
                        onClick={() => moveColumn(idx, 'down')}
                        title="Di chuyển ra sau"
                        className="p-1 rounded hover:bg-white text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* 2. Ghim cột */}
                    <button
                      type="button"
                      onClick={() => updateColumn(col.id, { pinned: !col.pinned })}
                      title={col.pinned ? 'Đang ghim bên trái (nhấn để bỏ ghim)' : 'Ghim cột cố định bên trái khi cuộn'}
                      className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors ${
                        col.pinned
                          ? 'bg-amber-50 text-amber-700 border-amber-300'
                          : 'border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-700'
                      }`}
                    >
                      <Pin className="w-3.5 h-3.5" />
                      <span className="text-[10px]">{col.pinned ? 'Đã ghim' : 'Ghim'}</span>
                    </button>

                    {/* 4. Căn lề */}
                    <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                      <button
                        type="button"
                        onClick={() => updateColumn(col.id, { align: 'left' })}
                        title="Căn trái"
                        className={`p-1 rounded ${col.align === 'left' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-500'}`}
                      >
                        <AlignLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => updateColumn(col.id, { align: 'center' })}
                        title="Căn giữa"
                        className={`p-1 rounded ${col.align === 'center' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-500'}`}
                      >
                        <AlignCenter className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => updateColumn(col.id, { align: 'right' })}
                        title="Căn phải"
                        className={`p-1 rounded ${col.align === 'right' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-500'}`}
                      >
                        <AlignRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* 4. Xuống dòng (Wrap text) */}
                    <button
                      type="button"
                      onClick={() => updateColumn(col.id, { wrap: !col.wrap })}
                      title={col.wrap ? 'Đang bật xuống dòng (nhấn để hiển thị 1 dòng)' : 'Đang rút gọn 1 dòng (nhấn để tự động xuống dòng)'}
                      className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                        col.wrap
                          ? 'bg-blue-50 text-blue-700 border-blue-300 font-semibold'
                          : 'border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-700'
                      }`}
                    >
                      <WrapText className="w-3.5 h-3.5" />
                      <span className="text-[10px]">{col.wrap ? 'Xuống dòng' : '1 Dòng'}</span>
                    </button>

                    {/* 5. Kích thước cột (Width px) */}
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={60}
                        max={600}
                        step={10}
                        value={col.width}
                        onChange={e => updateColumn(col.id, { width: Math.max(60, Number(e.target.value)) })}
                        className="w-16 px-1.5 py-1 text-xs font-mono font-bold rounded-lg border border-slate-300 bg-white text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <span className="text-[10px] text-slate-400">px</span>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Xong & Áp dụng</span>
          </button>
        </div>

      </div>
    </div>
  );
};
