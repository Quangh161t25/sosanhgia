import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Layers,
  Package,
  DollarSign,
  FileText,
  Settings,
  List,
  FolderTree,
} from 'lucide-react';
import {
  ColumnConfig,
  ColumnGroupId,
  COLUMN_GROUPS,
  getColumnGroup,
} from './ColumnSettingsModal';

export type TableDensity = 'compact' | 'normal' | 'spacious';

interface ColumnOptionsPopoverProps {
  columns: ColumnConfig[];
  onChangeColumns: (newCols: ColumnConfig[]) => void;
  onResetDefaults: () => void;
  density: TableDensity;
  onDensityChange: (density: TableDensity) => void;
  onClose: () => void;
  isTableGroupingEnabled?: boolean;
  onToggleTableGrouping?: (enabled: boolean) => void;
}

const GROUP_ORDER: ColumnGroupId[] = ['system', 'general', 'category', 'pricing', 'details'];

const GROUP_ICONS: Record<ColumnGroupId, React.FC<{ className?: string }>> = {
  system: Settings,
  general: Package,
  category: Layers,
  pricing: DollarSign,
  details: FileText,
};

export const ColumnOptionsPopover: React.FC<ColumnOptionsPopoverProps> = ({
  columns,
  onChangeColumns,
  onResetDefaults,
  density,
  onDensityChange,
  onClose,
  isTableGroupingEnabled = false,
  onToggleTableGrouping,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'flat' | 'grouped'>('grouped');
  const [searchFilter, setSearchFilter] = useState('');
  const [draggedColId, setDraggedColId] = useState<string | null>(null);
  const [dragOverColId, setDragOverColId] = useState<string | null>(null);

  // Trạng thái đóng/mở từng nhóm trong chế độ xem nhóm (mặc định mở hết)
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

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

  // Bật/tắt hiển thị 1 cột
  const toggleVisibility = (id: string) => {
    const col = columns.find(c => c.id === id);
    if (!col) return;
    if (col.visible && visibleCount <= 1) return;
    updateColumn(id, { visible: !col.visible });
  };

  // Bật / tắt hiển thị toàn bộ cột trong 1 nhóm
  const toggleGroupVisibility = (groupId: ColumnGroupId) => {
    const groupCols = columns.filter(c => getColumnGroup(c.id) === groupId);
    const anyVisible = groupCols.some(c => c.visible);

    // Nếu có ít nhất 1 cột đang bật -> Tắt toàn bộ nhóm (trừ khi đó là tất cả cột còn lại của bảng)
    const nextVisibleState = !anyVisible;
    const updated = columns.map(c => {
      if (getColumnGroup(c.id) === groupId) {
        return { ...c, visible: nextVisibleState };
      }
      return c;
    });

    // Đảm bảo còn ít nhất 1 cột hiển thị
    if (updated.some(c => c.visible)) {
      onChangeColumns(updated);
    }
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

  // Toggle thu gọn/mở rộng nhóm
  const toggleCollapseGroup = (groupId: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // Lọc danh sách cột theo từ khóa tìm kiếm
  const filteredColumns = useMemo(() => {
    if (!searchFilter.trim()) return columns;
    const q = searchFilter.trim().toLowerCase();
    return columns.filter(col => col.label.toLowerCase().includes(q));
  }, [columns, searchFilter]);

  // Gom cột theo nhóm
  const groupedData = useMemo(() => {
    const map: Record<ColumnGroupId, ColumnConfig[]> = {
      system: [],
      general: [],
      category: [],
      pricing: [],
      details: [],
    };

    filteredColumns.forEach(col => {
      const grp = getColumnGroup(col.id);
      map[grp].push(col);
    });

    return map;
  }, [filteredColumns]);

  // Hàm render 1 dòng cột
  const renderColumnRow = (col: ColumnConfig, isGrouped: boolean = false) => {
    const isDragging = draggedColId === col.id;
    const isOver = dragOverColId === col.id;

    const rowBorderClass = isOver
      ? 'border-blue-500 bg-blue-50/60'
      : isDragging
      ? 'opacity-40 border-dashed border-slate-300'
      : col.pinned
      ? 'border-transparent bg-amber-500/[0.04] hover:bg-amber-500/[0.08]'
      : 'border-transparent hover:bg-slate-100/70';

    const checkBtnClass = col.visible
      ? 'bg-blue-600 border-blue-600 text-white'
      : 'border-slate-300 bg-white hover:border-blue-500';

    const labelClass = col.visible
      ? 'text-slate-800'
      : 'text-slate-400 line-through opacity-70';

    return (
      <div
        key={col.id}
        draggable={!isGrouped}
        onDragStart={!isGrouped ? e => handleDragStart(col.id, e) : undefined}
        onDragOver={!isGrouped ? e => handleDragOver(col.id, e) : undefined}
        onDrop={!isGrouped ? e => handleDrop(col.id, e) : undefined}
        onDragEnd={!isGrouped ? handleDragEnd : undefined}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg select-none transition-colors group cursor-pointer border ${rowBorderClass}`}
      >
        {/* Tay cầm kéo thả (chỉ trong chế độ Flat list) */}
        {!isGrouped && (
          <div
            className="shrink-0 cursor-grab active:cursor-grabbing touch-none p-0.5 text-slate-400 group-hover:text-slate-700 hover:bg-slate-200/50 rounded transition-colors"
            title="Kéo thả để sắp xếp thứ tự cột"
          >
            <GripVertical className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
        )}

        {/* Nút tích chọn hiển thị / ẩn */}
        <button
          type="button"
          onClick={() => toggleVisibility(col.id)}
          aria-pressed={col.visible}
          className={`w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0 cursor-pointer ${checkBtnClass}`}
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
            className="flex items-center bg-slate-100 rounded p-0.5 border border-slate-200/80"
            title="Căn lề cột"
          >
            <button
              type="button"
              onClick={() => setColumnAlign(col.id, 'left')}
              className={
                col.align === 'left'
                  ? 'p-0.5 rounded transition-all cursor-pointer bg-white text-blue-600 shadow-2xs font-bold'
                  : 'p-0.5 rounded transition-all cursor-pointer text-slate-400 hover:text-slate-700'
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
                  ? 'p-0.5 rounded transition-all cursor-pointer bg-white text-blue-600 shadow-2xs font-bold'
                  : 'p-0.5 rounded transition-all cursor-pointer text-slate-400 hover:text-slate-700'
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
                  ? 'p-0.5 rounded transition-all cursor-pointer bg-white text-blue-600 shadow-2xs font-bold'
                  : 'p-0.5 rounded transition-all cursor-pointer text-slate-400 hover:text-slate-700'
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
                ? 'p-1 rounded border transition-all cursor-pointer bg-blue-50 border-blue-200 text-blue-600'
                : 'p-1 rounded border transition-all cursor-pointer bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100'
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
                ? 'p-1 rounded border transition-all cursor-pointer bg-amber-500/15 border-amber-500/30 text-amber-600 hover:bg-amber-500/25'
                : 'p-1 rounded border transition-all cursor-pointer bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100'
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
              className="w-full text-right pr-4 pl-1 text-xs font-mono rounded border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
              title="Độ rộng cột (pixel)"
            />
            <span className="absolute right-1 text-[10px] text-slate-400 pointer-events-none">
              px
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      ref={popoverRef}
      role="menu"
      aria-label="Tùy chọn cột"
      className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 ring-1 ring-slate-900/10"
      style={{ opacity: 1, transform: 'none' }}
    >
      <div className="w-[415px] overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Phần 1: Tiêu đề + Thống kê hiển thị/ghim + Nút khôi phục mặc định */}
        <div className="px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-slate-800">Cột hiển thị &amp; Định dạng</h4>
            <div className="flex items-center gap-1.5">
              <span
                className="text-xs tabular-nums text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full font-semibold border border-blue-200"
                title="Số cột đang hiển thị"
              >
                {visibleCount}/{columns.length}
              </span>
              <span
                className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded-full font-semibold flex items-center gap-0.5 border border-amber-200"
                title="Số cột đang ghim cố định"
              >
                <Pin className="w-2.5 h-2.5 fill-current" aria-hidden="true" />
                {pinnedCount} ghim
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onResetDefaults}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all cursor-pointer"
              title="Khôi phục cài đặt mặc định"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Phần 2: Chuyển đổi Kiểu xem (Danh sách phẳng vs Xem theo nhóm) + Bật/tắt Gộp nhóm bảng */}
        <div className="px-3.5 py-2 border-b border-slate-100 bg-slate-50/40 space-y-2">
          
          {/* Nút chuyển đổi kiểu xem */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-slate-600">Kiểu xem:</span>
            <div className="flex items-center bg-slate-200/70 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('grouped')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'grouped'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Gom các cột liên quan thành từng nhóm chuyên đề (Thông tin, Phân loại, Giá, Thông số)"
              >
                <FolderTree className="w-3.5 h-3.5" />
                <span>Theo nhóm</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('flat')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'flat'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Xem danh sách phẳng toàn bộ cột (hỗ trợ kéo thả sắp xếp)"
              >
                <List className="w-3.5 h-3.5" />
                <span>Danh sách</span>
              </button>
            </div>
          </div>

          {/* Công tắc Gộp nhóm tiêu đề trên bảng dữ liệu */}
          {onToggleTableGrouping && (
            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <span className="text-[11px] text-slate-600 font-medium flex items-center gap-1">
                <Layers className="w-3 h-3 text-indigo-500" />
                Gộp nhóm tiêu đề 2 tầng trên bảng:
              </span>
              <button
                type="button"
                onClick={() => onToggleTableGrouping(!isTableGroupingEnabled)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer border ${
                  isTableGroupingEnabled
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {isTableGroupingEnabled ? 'Đang Bật' : 'Tắt'}
              </button>
            </div>
          )}

        </div>

        {/* Phần 3: Giãn dòng & Chữ dài */}
        <div className="px-3.5 py-2 border-b border-slate-100 bg-white space-y-2">
          {/* Giãn dòng: Gọn | Vừa | Thoáng */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-slate-500 w-16 shrink-0">Giãn dòng:</span>
            <div className="flex-1 grid grid-cols-3 gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200/80">
              <button
                type="button"
                onClick={() => onDensityChange('compact')}
                className={
                  density === 'compact'
                    ? 'text-[11px] py-1 rounded-md transition-all font-semibold cursor-pointer bg-white text-blue-600 shadow-2xs'
                    : 'text-[11px] py-1 rounded-md transition-all font-medium cursor-pointer text-slate-600 hover:text-slate-900'
                }
              >
                Gọn
              </button>
              <button
                type="button"
                onClick={() => onDensityChange('normal')}
                className={
                  density === 'normal'
                    ? 'text-[11px] py-1 rounded-md transition-all font-semibold cursor-pointer bg-white text-blue-600 shadow-2xs'
                    : 'text-[11px] py-1 rounded-md transition-all font-medium cursor-pointer text-slate-600 hover:text-slate-900'
                }
              >
                Vừa
              </button>
              <button
                type="button"
                onClick={() => onDensityChange('spacious')}
                className={
                  density === 'spacious'
                    ? 'text-[11px] py-1 rounded-md transition-all font-semibold cursor-pointer bg-white text-blue-600 shadow-2xs'
                    : 'text-[11px] py-1 rounded-md transition-all font-medium cursor-pointer text-slate-600 hover:text-slate-900'
                }
              >
                Thoáng
              </button>
            </div>
          </div>

          {/* Chữ dài: Cắt gọn (...) | Xuống dòng */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-slate-500 w-16 shrink-0">Chữ dài:</span>
            <div className="flex-1 grid grid-cols-2 gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200/80">
              <button
                type="button"
                onClick={() => handleGlobalWrapChange(false)}
                className={
                  !isAllWrapped
                    ? 'text-[11px] py-1 px-1.5 rounded-md transition-all font-semibold flex items-center justify-center gap-1.5 cursor-pointer bg-white text-blue-600 shadow-2xs'
                    : 'text-[11px] py-1 px-1.5 rounded-md transition-all font-medium flex items-center justify-center gap-1.5 cursor-pointer text-slate-600 hover:text-slate-900'
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
                    ? 'text-[11px] py-1 px-1.5 rounded-md transition-all font-semibold flex items-center justify-center gap-1.5 cursor-pointer bg-white text-blue-600 shadow-2xs'
                    : 'text-[11px] py-1 px-1.5 rounded-md transition-all font-medium flex items-center justify-center gap-1.5 cursor-pointer text-slate-600 hover:text-slate-900'
                }
                title="Tự động xuống dòng khi nội dung dài hơn độ rộng cột"
              >
                <WrapText className="w-3 h-3" aria-hidden="true" />
                <span>Xuống dòng</span>
              </button>
            </div>
          </div>
        </div>

        {/* Phần 4: Tìm kiếm cột */}
        <div className="px-3.5 py-1.5 border-b border-slate-100 bg-slate-50/30">
          <input
            placeholder="Tìm kiếm cột..."
            aria-label="Tìm kiếm cột hiển thị"
            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            type="text"
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
          />
        </div>

        {/* Phần 5: Tiêu đề danh sách cột */}
        <div className="px-3 py-1 bg-slate-100/70 border-b border-slate-200/70 flex items-center justify-between text-[10px] font-semibold text-slate-500 select-none">
          <span>{viewMode === 'grouped' ? 'Nhóm & Cột' : 'Tên cột (Kéo thả)'}</span>
          <div className="flex items-center gap-2 pr-0.5">
            <span>Căn lề</span>
            <span>Dòng</span>
            <span>Ghim</span>
            <span>Độ rộng</span>
          </div>
        </div>

        {/* Phần 6: Danh sách cột theo CHẾ ĐỘ XEM */}
        <div className="p-1.5 max-h-[380px] overflow-y-auto custom-scrollbar space-y-1">
          {viewMode === 'grouped' ? (
            /* CHẾ ĐỘ XEM THEO NHÓM (GROUPED VIEW) */
            GROUP_ORDER.map(grpId => {
              const grpCols = groupedData[grpId];
              if (!grpCols || grpCols.length === 0) return null;

              const grpDef = COLUMN_GROUPS[grpId];
              const IconComp = GROUP_ICONS[grpId];
              const isCollapsed = Boolean(collapsedGroups[grpId]);

              const groupVisibleCount = grpCols.filter(c => c.visible).length;
              const allVisible = groupVisibleCount === grpCols.length;
              const someVisible = groupVisibleCount > 0 && !allVisible;

              return (
                <div
                  key={grpId}
                  className="rounded-xl border border-slate-200/90 overflow-hidden bg-white shadow-2xs mb-1"
                >
                  {/* Header Nhóm: Tên + Icon + Số lượng + Nút Bật/Tắt cả nhóm + Nút Thu gọn */}
                  <div
                    onClick={() => toggleCollapseGroup(grpId)}
                    className="px-2.5 py-1.5 bg-slate-50/80 hover:bg-slate-100/80 flex items-center justify-between transition-colors cursor-pointer select-none border-b border-slate-100"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <IconComp className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="text-xs font-bold text-slate-800 truncate">
                        {grpDef.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono font-semibold bg-slate-200 text-slate-700">
                        {groupVisibleCount}/{grpCols.length}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                      {/* Nút Bật / Tắt cả nhóm */}
                      <button
                        type="button"
                        onClick={() => toggleGroupVisibility(grpId)}
                        className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                        title={
                          allVisible
                            ? `Ẩn toàn bộ nhóm [${grpDef.name}]`
                            : `Hiện toàn bộ nhóm [${grpDef.name}]`
                        }
                      >
                        {allVisible ? (
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                        ) : someVisible ? (
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5 text-slate-300" />
                        )}
                      </button>

                      {/* Nút thu gọn / mở rộng */}
                      <button
                        type="button"
                        onClick={() => toggleCollapseGroup(grpId)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                      >
                        {isCollapsed ? (
                          <ChevronRight className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Nội dung danh sách các cột trong nhóm */}
                  {!isCollapsed && (
                    <div className="p-1 space-y-0.5 bg-white">
                      {grpCols.map(col => renderColumnRow(col, true))}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            /* CHẾ ĐỘ XEM DANH SÁCH PHẲNG (FLAT LIST - KÉO THẢ SẮP XẾP) */
            filteredColumns.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                Không tìm thấy cột nào khớp
              </div>
            ) : (
              filteredColumns.map(col => renderColumnRow(col, false))
            )
          )}
        </div>

      </div>
    </div>
  );
};
