import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDown, X, Check, Search } from 'lucide-react';
import { removeVietnameseTones } from '../../utils/pricing';

interface SearchableFilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  counts?: Record<string, number>;
  placeholder?: string;
  className?: string;
}

export const SearchableFilterSelect: React.FC<SearchableFilterSelectProps> = ({
  label,
  value,
  onChange,
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

  // Đồng bộ query khi value từ ngoài đổi
  useEffect(() => {
    if (!isOpen) {
      setQuery(value);
    }
  }, [value, isOpen]);

  // Xử lý click ra ngoài để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setQuery(value); // Đặt lại theo value hiện tại nếu chưa chọn
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value]);

  // Cuộn đến item đang highlight bằng phím mũi tên
  useEffect(() => {
    if (highlightIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[data-filter-item]');
      if (items[highlightIndex]) {
        items[highlightIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightIndex]);

  const handleSelect = (selectedVal: string) => {
    onChange(selectedVal);
    setQuery(selectedVal);
    setIsOpen(false);
    setHighlightIndex(-1);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setQuery('');
    setIsOpen(false);
    setHighlightIndex(-1);
    if (inputRef.current) {
      inputRef.current.focus();
    }
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
        handleSelect(filteredOptions[highlightIndex]);
      } else if (filteredOptions.length > 0) {
        handleSelect(filteredOptions[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery(value);
    }
  };

  const defaultPlaceholder = placeholder || `Tất cả ${label}`;

  return (
    <div ref={containerRef} className={`relative min-w-[140px] max-w-[210px] flex-1 ${isOpen ? 'z-50' : 'z-auto'} ${className}`}>
      {/* Ô nhập liệu kiêm ô chọn */}
      <div
        className={`relative flex items-center bg-slate-50 hover:bg-white rounded-lg border transition-all ${
          isOpen
            ? 'border-blue-500 bg-white ring-2 ring-blue-500/20 shadow-xs'
            : value
            ? 'border-blue-300 bg-blue-50/30'
            : 'border-slate-200'
        }`}
      >
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? query : value || ''}
          placeholder={defaultPlaceholder}
          onChange={e => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
            setHighlightIndex(0);
          }}
          onFocus={() => {
            setIsOpen(true);
            setQuery(value); // Cho phép sửa hoặc gõ tiếp
          }}
          onKeyDown={handleKeyDown}
          className="w-full pl-2.5 pr-12 py-1.5 text-xs text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none truncate font-medium"
        />

        {/* Nút Xóa nhanh (khi có giá trị) */}
        <div className="absolute right-1.5 flex items-center gap-0.5">
          {value ? (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
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
            title="Mở danh sách gợi ý"
          >
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Dropdown Danh sách Gợi ý Sắp xếp A-Z */}
      {isOpen && (
        <div
          ref={listRef}
          style={{ zIndex: 90 }}
          className="absolute left-0 top-full mt-1 w-full min-w-[200px] max-w-[280px] max-h-64 overflow-y-auto bg-white rounded-xl border border-slate-200 shadow-2xl ring-1 ring-slate-900/10 py-1 text-xs animate-in fade-in zoom-in-95 duration-100"
        >
          {/* Tùy chọn "Tất cả" ở đầu */}
          <button
            type="button"
            onClick={() => handleSelect('')}
            className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-slate-100 transition-colors cursor-pointer ${
              !value ? 'bg-blue-50/70 text-blue-700 font-bold' : 'text-slate-600'
            }`}
          >
            <span className="truncate italic">Tất cả {label}</span>
            {!value && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 ml-1" />}
          </button>

          <div className="h-px bg-slate-100 my-1" />

          {/* Danh sách các lựa chọn được sắp xếp A-Z */}
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-3 text-center text-slate-400 italic text-[11px]">
              Không tìm thấy {label.toLowerCase()} phù hợp
            </div>
          ) : (
            filteredOptions.map((opt, idx) => {
              const isSelected = value.toLowerCase() === opt.toLowerCase();
              const isHighlighted = idx === highlightIndex;
              const count = counts[opt];

              return (
                <button
                  key={opt}
                  data-filter-item
                  type="button"
                  onClick={() => handleSelect(opt)}
                  onMouseEnter={() => setHighlightIndex(idx)}
                  className={`w-full px-3 py-1.5 text-left flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : isHighlighted
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate mr-2" title={opt}>
                    {opt}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {count !== undefined && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                          isSelected
                            ? 'bg-blue-200/80 text-blue-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
