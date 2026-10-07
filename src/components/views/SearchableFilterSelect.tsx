import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';
import { removeVietnameseTones } from '../../utils/pricing';

export interface SearchableFilterSelectProps {
  label: string;
  // Single-select props
  value?: string;
  onChange?: (value: string) => void;
  // Multi-select props
  multiple?: boolean;
  selectedValues?: string[];
  onMultiChange?: (values: string[]) => void;

  options: string[];
  counts?: Record<string, number>;
  placeholder?: string;
  className?: string;
}

export const SearchableFilterSelect: React.FC<SearchableFilterSelectProps> = ({
  label,
  value = '',
  onChange,
  multiple = false,
  selectedValues = [],
  onMultiChange,
  options,
  counts = {},
  placeholder,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Sắp xếp toàn bộ options theo A-Z chuẩn Tiếng Việt
  const sortedOptions = useMemo(() => {
    const unique = Array.from(new Set(options.map(o => (o || '').trim()))).filter(Boolean);
    return unique.sort((a, b) => a.localeCompare(b, 'vi', { sensitivity: 'base' }));
  }, [options]);

  // Lọc gợi ý theo từ khóa đã điền (hỗ trợ tiếng Việt không dấu)
  const filteredOptions = useMemo(() => {
    if (!query.trim()) return sortedOptions;
    const cleanQ = removeVietnameseTones(query);
    const rawQ = query.toLowerCase().trim();

    return sortedOptions.filter(opt => {
      const lower = opt.toLowerCase();
      const clean = removeVietnameseTones(opt);
      return lower.includes(rawQ) || clean.includes(cleanQ);
    });
  }, [sortedOptions, query]);

  // Chuỗi text hiển thị khi ô đóng
  const displayText = useMemo(() => {
    if (multiple) {
      if (selectedValues.length === 0) return '';
      if (selectedValues.length === 1) return selectedValues[0];
      return `Đã chọn (${selectedValues.length}) ${label}`;
    }
    return value;
  }, [multiple, selectedValues, label, value]);

  // Đồng bộ query khi đóng dropdown
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  // Xử lý click ra ngoài để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cuộn đến item đang highlight bằng phím mũi tên
  useEffect(() => {
    if (highlightIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[data-filter-item]');
      if (items[highlightIndex]) {
        items[highlightIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightIndex]);

  // Xử lý chọn (Single)
  const handleSelectSingle = (selectedVal: string) => {
    if (onChange) onChange(selectedVal);
    setIsOpen(false);
    setHighlightIndex(-1);
  };

  // Xử lý chọn / bỏ chọn (Multi)
  const handleToggleMulti = (optVal: string) => {
    if (!onMultiChange) return;
    const lowerOpt = optVal.toLowerCase();
    const isAlready = selectedValues.some(v => v.toLowerCase() === lowerOpt);
    if (isAlready) {
      onMultiChange(selectedValues.filter(v => v.toLowerCase() !== lowerOpt));
    } else {
      onMultiChange([...selectedValues, optVal]);
    }
  };

  // Chọn tất cả (Multi)
  const handleSelectAll = () => {
    if (!onMultiChange) return;
    const newSet = new Set(selectedValues);
    filteredOptions.forEach(opt => newSet.add(opt));
    onMultiChange(Array.from(newSet));
  };

  // Bỏ chọn tất cả (Multi)
  const handleClearAll = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (multiple) {
      if (onMultiChange) onMultiChange([]);
    } else {
      if (onChange) onChange('');
    }
    setQuery('');
    setHighlightIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex(prev => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightIndex >= 0 && highlightIndex < filteredOptions.length) {
        const item = filteredOptions[highlightIndex];
        if (multiple) {
          handleToggleMulti(item);
        } else {
          handleSelectSingle(item);
        }
      } else if (filteredOptions.length > 0) {
        if (multiple) {
          handleToggleMulti(filteredOptions[0]);
        } else {
          handleSelectSingle(filteredOptions[0]);
        }
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const defaultPlaceholder = placeholder || `Tất cả ${label}`;
  const hasSelected = multiple ? selectedValues.length > 0 : Boolean(value);

  return (
    <div ref={containerRef} className={`relative min-w-[140px] max-w-[220px] flex-1 ${isOpen ? 'z-50' : 'z-auto'} ${className}`}>
      {/* Ô nhập liệu kiêm nút hiển thị */}
      <div
        className={`relative flex items-center bg-slate-50 hover:bg-white rounded-lg border transition-all ${
          isOpen
            ? 'border-blue-500 bg-white ring-2 ring-blue-500/20 shadow-xs'
            : hasSelected
            ? 'border-blue-400 bg-blue-50/40 text-blue-800'
            : 'border-slate-200'
        }`}
      >
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? query : displayText}
          placeholder={defaultPlaceholder}
          onChange={e => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
            setHighlightIndex(0);
          }}
          onFocus={() => {
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className={`w-full pl-2.5 pr-12 py-1.5 text-xs placeholder-slate-400 bg-transparent focus:outline-none truncate font-medium ${
            hasSelected && !isOpen ? 'text-blue-800 font-semibold' : 'text-slate-800'
          }`}
        />

        {/* Nút Xóa nhanh (khi có giá trị) */}
        <div className="absolute right-1.5 flex items-center gap-0.5">
          {hasSelected ? (
            <button
              type="button"
              onClick={handleClearAll}
              className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              title={`Xóa lọc ${label}`}
            >
              <X className="w-3 h-3" />
            </button>
          ) : null}

          {/* Mũi tên Dropdown */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(prev => !prev);
              if (!isOpen && inputRef.current) {
                inputRef.current.focus();
              }
            }}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            title="Mở danh sách lựa chọn"
          >
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={listRef}
          style={{ zIndex: 90 }}
          className="absolute left-0 top-full mt-1 w-full min-w-[240px] max-w-[320px] max-h-72 overflow-y-auto bg-white rounded-xl border border-slate-200 shadow-2xl ring-1 ring-slate-900/10 py-1 text-xs animate-in fade-in zoom-in-95 duration-100"
        >
          {/* Header trong chế độ Multiple */}
          {multiple ? (
            <div className="px-2.5 py-1.5 border-b border-slate-100 flex items-center justify-between gap-1 bg-slate-50/70 rounded-t-lg">
              <span className="text-[11px] font-semibold text-slate-600">
                Đã chọn: <strong className="text-blue-600">{selectedValues.length}</strong>/{sortedOptions.length}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-[11px] text-blue-600 hover:underline font-medium px-1.5 py-0.5 rounded hover:bg-blue-50 cursor-pointer"
                >
                  Chọn tất cả
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() => handleClearAll()}
                  className="text-[11px] text-slate-500 hover:text-red-600 hover:underline font-medium px-1.5 py-0.5 rounded hover:bg-red-50 cursor-pointer"
                >
                  Bỏ chọn
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Tùy chọn "Tất cả" ở đầu (Single) */}
              <button
                type="button"
                onClick={() => handleSelectSingle('')}
                className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-slate-100 transition-colors cursor-pointer ${
                  !value ? 'bg-blue-50/70 text-blue-700 font-bold' : 'text-slate-600'
                }`}
              >
                <span className="truncate italic">Tất cả {label}</span>
                {!value && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 ml-1" />}
              </button>
              <div className="h-px bg-slate-100 my-1" />
            </>
          )}

          {/* Danh sách các lựa chọn được sắp xếp A-Z */}
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-3 text-center text-slate-400 italic text-[11px]">
              Không tìm thấy {label.toLowerCase()} phù hợp
            </div>
          ) : (
            filteredOptions.map((opt, idx) => {
              const isSelected = multiple
                ? selectedValues.some(v => v.toLowerCase() === opt.toLowerCase())
                : value.toLowerCase() === opt.toLowerCase();
              const isHighlighted = idx === highlightIndex;
              const count = counts[opt];

              return (
                <div
                  key={opt}
                  data-filter-item
                  onClick={() => {
                    if (multiple) {
                      handleToggleMulti(opt);
                    } else {
                      handleSelectSingle(opt);
                    }
                  }}
                  onMouseEnter={() => setHighlightIndex(idx)}
                  className={`w-full px-3 py-1.5 flex items-center justify-between transition-colors cursor-pointer select-none ${
                    isSelected
                      ? 'bg-blue-50/80 text-blue-800 font-semibold'
                      : isHighlighted
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                    {/* Checkbox trong chế độ Multi */}
                    {multiple && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // handled by parent onClick
                        className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer pointer-events-none"
                      />
                    )}
                    <span className="truncate" title={opt}>
                      {opt}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {count !== undefined && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                          isSelected
                            ? 'bg-blue-200 text-blue-900'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                    {!multiple && isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                  </div>
                </div>
              );
            })
          )}

          {/* Footer nút Xong cho chế độ Multiple */}
          {multiple && (
            <div className="p-1.5 border-t border-slate-100 flex items-center justify-end bg-slate-50/50 mt-1">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer shadow-2xs"
              >
                Xong
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
