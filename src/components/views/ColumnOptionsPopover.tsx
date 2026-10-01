import React, { useState, useEffect, useRef } from 'react';
import {
  Pin,
  RotateCcw,
  GripVertical,
  Check,
  AlignLeft,
  AlignCenter,
  AlignRight,
  WrapText,
  Baseline,
} from 'lucide-react';
import { ColumnConfig } from './ColumnSettingsModal';

export type TableDensity = 'compact' | 'normal' | 'spacious';

interface ColumnOptionsPopoverProps {
  columns: ColumnConfig[];
  onChangeColumns: (newCols: ColumnConfig[]) => void;
  onResetDefaults: () => void;
  density: TableDensity;
  onDensityChange: (density: TableDensity) => void;
  onClose: () => void;
}

export const ColumnOptionsPopover: React.FC<ColumnOptionsPopoverProps> = ({
  columns,
  onChangeColumns,
  onResetDefaults,
  density,
  onDensityChange,
  onClose,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [draggedColId, setDraggedColId] = useState<string | null>(null);
  const [dragOverColId, setDragOverColId] = useState<string | null>(null);

  // Đóng khi click ra ngoài hoặc bấm Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Thống kê cột hiển thị & ghim
  const visibleCount = columns.filter(c => c.visible).length;
  const pinnedCount = columns.filter(c => c.pinned).length;

  // Kiểm tra trạng thái wrap toàn bộ
  const isAllWrapped = columns.every(c => c.wrap);

  // Chuyển đổi định dạng chữ dài toàn bộ cột
  const handleGlobalWrapChange = (wrap: boolean) => {
    const updated = columns.map(c => ({ ...c, wrap }));
    onChangeColumns(updated);
  };

  // Cập nhật thuộc tính của 1 cột
  const updateColumn = (id: string, updates: Partial<ColumnConfig>) => {
    const updated = columns.map(c => (c.id === id ? { ...c, ...updates } : c));
    onChangeColumns(updated);
  };

  // Bật/tắt hiển thị
  const toggleVisibility = (id: string) => {
    const col = columns.find(c => c.id === id);
    if (!col) return;
    if (col.visible && visibleCount <= 1) return;
    updateColumn(id, { visible: !col.visible });
  };

  // Bật/tắt ghim
  const togglePin = (id: string) => {
    const col = columns.find(c => c.id === id);
    if (!col) return;
    updateColumn(id, { pinned: !col.pinned });
  };

  // Bật/tắt xuống dòng riêng từng cột
  const toggleColumnWrap = (id: string) => {
    const col = columns.find(c => c.id === id);
    if (!col) return;
    updateColumn(id, { wrap: !col.wrap });
  };

  // Căn lề
  const setColumnAlign = (id: string, align: 'left' | 'center' | 'right') => {
    updateColumn(id, { align });
  };

  // Độ rộng
  const setColumnWidth = (id: string, width: number) => {
    const safeWidth = Math.max(40, Math.min(800, isNaN(width) ? 100 : width));
    updateColumn(id, { width: safeWidth });
  };

  // Kéo thả sắp xếp cột (HTML5 Drag & Drop)
  const handleDragStart = (colId: string, e: React.DragEvent) => {
    setDraggedColId(colId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', colId);
  };

  const handleDragOver = (colId: string, e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColId !== colId) {
      setDragOverColId(colId);
    }
  };

  const handleDrop = (targetColId: string, e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedColId || draggedColId === targetColId) {
      setDraggedColId(null);
      setDragOverColId(null);
      return;
    }

    const fromIdx = columns.findIndex(c => c.id === draggedColId);
    const toIdx = columns.findIndex(c => c.id === targetColId);

    if (fromIdx !== -1 && toIdx !== -1) {
      const newCols = [...columns];
      const [movedCol] = newCols.splice(fromIdx, 1);
      newCols.splice(toIdx, 0, movedCol);
      onChangeColumns(newCols);
    }

    setDraggedColId(null);
    setDragOverColId(null);
  };

  const handleDragEnd = () => {
    setDraggedColId(null);
    setDragOverColId(null);
  };

  // Lọc danh sách cột theo từ khóa tìm kiếm
  const filteredColumns = columns.filter(col =>
    col.label.toLowerCase().includes(searchFilter.trim().toLowerCase())
  );

  return (
    <div
      ref={popoverRef}
      role="menu"
      aria-label="Tùy chọn cột"
      className="absolute right-0 top-full mt-2 bg-card backdrop-blur-xl rounded-xl shadow-2xl border border-border z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
      style={{ opacity: 1, transform: 'none' }}
    >
      <div className="w-[395px] overflow-hidden flex flex-col">
        {/* Phần 1: Tiêu đề + Thống kê hiển thị/ghim + Nút khôi phục mặc định */}
        <div className="px-3 py-2 border-b border-border bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-semibold text-foreground">Cột hiển thị &amp; Định dạng</h4>
            <div className="flex items-center gap-1">
              <span
                className="text-xs tabular-nums text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full font-medium"
                title="Số cột đang hiển thị"
              >
                {visibleCount}/{columns.length}
              </span>
              <span
                className="text-[10px] text-amber-700 dark:text-amber-300 bg-amber-500/15 px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5"
                title="Số cột đang ghim cố định"
              >
                <Pin className="w-2.5 h-2.5 fill-current" aria-hidden="true" />
                {pinnedCount} ghim
              </span>
            </div>
          </div>
          <div className="relative inline-flex items-center gap-1">
            <button
              type="button"
              onClick={onResetDefaults}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
              title="Khôi phục cài đặt mặc định"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Phần 2: Giãn dòng & Chữ dài */}
        <div className="px-3 py-2 border-b border-border bg-muted/10 space-y-2">
          {/* Giãn dòng: Gọn | Vừa | Thoáng */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-muted-foreground w-16 shrink-0">Giãn dòng:</span>
            <div className="flex-1 grid grid-cols-3 gap-1 bg-muted/40 p-0.5 rounded-lg border border-border/40">
              <button
                type="button"
                onClick={() => onDensityChange('compact')}
                className={
                  density === 'compact'
                    ? 'text-[11px] py-1 rounded-md transition-all font-medium cursor-pointer bg-primary text-primary-foreground shadow-sm'
                    : 'text-[11px] py-1 rounded-md transition-all font-medium cursor-pointer text-muted-foreground hover:text-foreground'
                }
              >
                Gọn
              </button>
              <button
                type="button"
                onClick={() => onDensityChange('normal')}
                className={
                  density === 'normal'
                    ? 'text-[11px] py-1 rounded-md transition-all font-medium cursor-pointer bg-primary text-primary-foreground shadow-sm'
                    : 'text-[11px] py-1 rounded-md transition-all font-medium cursor-pointer text-muted-foreground hover:text-foreground'
                }
              >
                Vừa
              </button>
              <button
                type="button"
                onClick={() => onDensityChange('spacious')}
                className={
                  density === 'spacious'
                    ? 'text-[11px] py-1 rounded-md transition-all font-medium cursor-pointer bg-primary text-primary-foreground shadow-sm'
                    : 'text-[11px] py-1 rounded-md transition-all font-medium cursor-pointer text-muted-foreground hover:text-foreground'
                }
              >
                Thoáng
              </button>
            </div>
          </div>

          {/* Chữ dài: Cắt gọn (...) | Xuống dòng */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-muted-foreground w-16 shrink-0">Chữ dài:</span>
            <div className="flex-1 grid grid-cols-2 gap-1 bg-muted/40 p-0.5 rounded-lg border border-border/40">
              <button
                type="button"
                onClick={() => handleGlobalWrapChange(false)}
                className={
                  !isAllWrapped
                    ? 'text-[11px] py-1 px-1.5 rounded-md transition-all font-medium flex items-center justify-center gap-1.5 cursor-pointer bg-primary text-primary-foreground shadow-sm'
                    : 'text-[11px] py-1 px-1.5 rounded-md transition-all font-medium flex items-center justify-center gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground'
                }
                title="Cắt gọn nội dung dài và hiển thị dấu ba chấm (...)"
              >
                <Baseline className="w-3 h-3" aria-hidden="true" />
                <span>Cắt gọn (...)</span>
              </button>
              <button
                type="button"
                onClick={() => handleGlobalWrapChange(true)}
                className={
                  isAllWrapped
                    ? 'text-[11px] py-1 px-1.5 rounded-md transition-all font-medium flex items-center justify-center gap-1.5 cursor-pointer bg-primary text-primary-foreground shadow-sm'
                    : 'text-[11px] py-1 px-1.5 rounded-md transition-all font-medium flex items-center justify-center gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground'
                }
                title="Tự động xuống dòng khi nội dung dài hơn độ rộng cột"
              >
                <WrapText className="w-3 h-3" aria-hidden="true" />
                <span>Xuống dòng</span>
              </button>
            </div>
          </div>
        </div>

        {/* Phần 3: Tìm kiếm cột */}
        <div className="px-3 py-1.5 border-b border-border bg-muted/10">
          <input
            placeholder="Tìm kiếm cột..."
            aria-label="Tìm kiếm cột hiển thị"
            className="w-full rounded-md border border-border bg-background px-2.5 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            type="text"
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
          />
        </div>

        {/* Phần 4: Tiêu đề danh sách cột */}
        <div className="px-3 py-1 bg-muted/25 border-b border-border/60 flex items-center justify-between text-[10px] font-medium text-muted-foreground select-none">
          <span>Tên cột (Kéo thả)</span>
          <div className="flex items-center gap-2.5 pr-0.5">
            <span>Căn lề</span>
            <span>Dòng</span>
            <span>Ghim</span>
            <span>Độ rộng</span>
          </div>
        </div>

        {/* Phần 5: Danh sách cột có thể kéo thả sắp xếp */}
        <div className="p-1.5 max-h-[350px] overflow-y-auto custom-scrollbar space-y-0.5">
          {filteredColumns.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted-foreground">
              Không tìm thấy cột nào khớp
            </div>
          ) : (
            filteredColumns.map(col => {
              const isDragging = draggedColId === col.id;
              const isOver = dragOverColId === col.id;

              const rowBorderClass = isOver
                ? 'border-primary bg-primary/10'
                : isDragging
                ? 'opacity-40 border-dashed border-border'
                : col.pinned
                ? 'border-transparent bg-amber-500/[0.04] hover:bg-amber-500/[0.08]'
                : 'border-transparent hover:bg-muted/40';

              const checkBtnClass = col.visible
                ? 'bg-primary border-primary text-primary-foreground'
                : 'border-border bg-background hover:border-primary';

              const labelClass = col.visible
                ? 'text-foreground'
                : 'text-muted-foreground line-through opacity-70';

              return (
                <div
                  key={col.id}
                  draggable
                  onDragStart={e => handleDragStart(col.id, e)}
                  onDragOver={e => handleDragOver(col.id, e)}
                  onDrop={e => handleDrop(col.id, e)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg select-none transition-colors group cursor-pointer border ${rowBorderClass}`}
                >
                  {/* Tay cầm kéo thả */}
                  <div
                    className="shrink-0 cursor-grab active:cursor-grabbing touch-none p-0.5 text-muted-foreground/50 group-hover:text-foreground hover:bg-muted rounded transition-colors"
                    title="Kéo thả để sắp xếp thứ tự cột"
                  >
                    <GripVertical className="w-3.5 h-3.5" aria-hidden="true" />
                  </div>

                  {/* Nút tích chọn hiển thị / ẩn */}
                  <button
                    type="button"
                    onClick={() => toggleVisibility(col.id)}
                    aria-pressed={col.visible}
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0 cursor-pointer ${checkBtnClass}`}
                    title={col.visible ? 'Đang hiển thị (Bấm để ẩn)' : 'Đang ẩn (Bấm để hiện)'}
                  >
                    {col.visible && <Check className="w-2.5 h-2.5 stroke-[3px]" aria-hidden="true" />}
                  </button>

                  {/* Tên cột */}
                  <span
                    className={`text-xs flex-1 truncate font-medium ${labelClass}`}
                    title={col.label}
                  >
                    {col.label}
                  </span>

                  {/* Nhóm điều khiển: Căn lề | Dòng | Ghim | Độ rộng */}
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Căn lề cột (Trái, Giữa, Phải) */}
                    <div
                      className="flex items-center bg-muted/60 rounded p-0.5 border border-border/60"
                      title="Căn lề cột (Trái, Giữa, Phải)"
                    >
                      <button
                        type="button"
                        onClick={() => setColumnAlign(col.id, 'left')}
                        className={
                          col.align === 'left'
                            ? 'p-0.5 rounded transition-all cursor-pointer bg-primary text-primary-foreground shadow-xs'
                            : 'p-0.5 rounded transition-all cursor-pointer text-muted-foreground hover:text-foreground'
                        }
                        title="Căn trái"
                      >
                        <AlignLeft className="w-2.5 h-2.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setColumnAlign(col.id, 'center')}
                        className={
                          col.align === 'center'
                            ? 'p-0.5 rounded transition-all cursor-pointer bg-primary text-primary-foreground shadow-xs'
                            : 'p-0.5 rounded transition-all cursor-pointer text-muted-foreground hover:text-foreground'
                        }
                        title="Căn giữa"
                      >
                        <AlignCenter className="w-2.5 h-2.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setColumnAlign(col.id, 'right')}
                        className={
                          col.align === 'right'
                            ? 'p-0.5 rounded transition-all cursor-pointer bg-primary text-primary-foreground shadow-xs'
                            : 'p-0.5 rounded transition-all cursor-pointer text-muted-foreground hover:text-foreground'
                        }
                        title="Căn phải"
                      >
                        <AlignRight className="w-2.5 h-2.5" aria-hidden="true" />
                      </button>
                    </div>

                    {/* Nút bật/tắt xuống dòng */}
                    <button
                      type="button"
                      onClick={() => toggleColumnWrap(col.id)}
                      className={
                        col.wrap
                          ? 'p-1 rounded border transition-all cursor-pointer bg-primary/10 border-primary/40 text-primary'
                          : 'p-1 rounded border transition-all cursor-pointer bg-muted/40 border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted'
                      }
                      title={col.wrap ? 'Đang bật: Xuống dòng tự động' : 'Đang bật: Cắt gọn 1 dòng (...)'}
                    >
                      <WrapText className="w-3 h-3" aria-hidden="true" />
                    </button>

                    {/* Nút ghim cố định */}
                    <button
                      type="button"
                      onClick={() => togglePin(col.id)}
                      className={
                        col.pinned
                          ? 'p-1 rounded border transition-all cursor-pointer bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25'
                          : 'p-1 rounded border transition-all cursor-pointer bg-muted/40 border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted'
                      }
                      title={
                        col.pinned
                          ? 'Đang ghim cố định bên trái (Bấm để bỏ ghim)'
                          : 'Ghim cố định cột bên trái'
                      }
                    >
                      <Pin className={`w-3 h-3 ${col.pinned ? 'fill-current' : ''}`} aria-hidden="true" />
                    </button>

                    {/* Ô nhập kích thước cột (px) */}
                    <div className="relative w-14 shrink-0 flex items-center">
                      <input
                        type="number"
                        min="40"
                        max="800"
                        value={col.width}
                        onChange={e => setColumnWidth(col.id, parseInt(e.target.value, 10))}
                        className="w-full text-right pr-4 pl-1.5 py-0.5 text-xs font-mono rounded border border-border/60 bg-muted/20 text-foreground focus:bg-background focus:border-primary focus:outline-none"
                        title="Độ rộng cột (pixel)"
                      />
                      <span className="absolute right-1 text-[10px] text-muted-foreground pointer-events-none">
                        px
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
