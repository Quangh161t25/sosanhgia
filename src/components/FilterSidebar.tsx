import React from 'react';
import { Filter, Search, X, Check, SlidersHorizontal, ArrowUpDown, Tag } from 'lucide-react';
import { FilterState, Product } from '../types/product';
import { formatCompactVND } from '../utils/pricing';

interface FilterSidebarProps {
  products: Product[];
  filter: FilterState;
  onFilterChange: (newFilter: FilterState) => void;
  onResetFilter: () => void;
  filteredCount: number;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  products,
  filter,
  onFilterChange,
  onResetFilter,
  filteredCount,
}) => {
  // Trích xuất danh sách Nhóm sản phẩm duy nhất
  const categoryGroups = Array.from(new Set(products.map(p => p.categoryGroup)));

  // Trích xuất danh sách Loại sản phẩm tương ứng với nhóm đang chọn (hoặc tất cả)
  const availableTypes = Array.from(
    new Set(
      products
        .filter(p => !filter.selectedGroup || p.categoryGroup === filter.selectedGroup)
        .map(p => p.categoryType)
    )
  );

  // Trích xuất danh sách tất cả các tag
  const allTags = Array.from(new Set(products.flatMap(p => p.tags)));

  // Tìm min/max price hiện tại của toàn bộ catalog theo priceType đang chọn
  const prices = products.map(p => p.pricing[filter.priceType] || 0);
  const catalogMinPrice = Math.min(...prices, 0);
  const catalogMaxPrice = Math.max(...prices, 20_000_000);

  // Trích xuất thông số kỹ thuật động (Dynamic Specs) cho nhóm/loại đang chọn
  const dynamicSpecOptions = React.useMemo(() => {
    const relevantProducts = products.filter(p => {
      if (filter.selectedGroup && p.categoryGroup !== filter.selectedGroup) return false;
      if (filter.selectedType && p.categoryType !== filter.selectedType) return false;
      return true;
    });

    const specKeyValuesMap = new Map<string, Set<string>>();

    relevantProducts.forEach(p => {
      p.specifications.forEach(sg => {
        sg.items.forEach(item => {
          // Chỉ lấy các thông số quan trọng hoặc có giá trị ngắn (< 30 ký tự) để làm filter
          if (item.value && item.value.length <= 35) {
            if (!specKeyValuesMap.has(item.key)) {
              specKeyValuesMap.set(item.key, new Set());
            }
            specKeyValuesMap.get(item.key)!.add(item.value);
          }
        });
      });
    });

    // Chỉ giữ lại những spec keys có từ 2 giá trị khác nhau trở lên
    const result: { key: string; values: string[] }[] = [];
    specKeyValuesMap.forEach((valuesSet, key) => {
      if (valuesSet.size >= 2) {
        result.push({
          key,
          values: Array.from(valuesSet).slice(0, 6),
        });
      }
    });

    return result.slice(0, 4); // Lấy top 4 thông số đặc trưng nhất
  }, [products, filter.selectedGroup, filter.selectedType]);

  const handleGroupSelect = (group: string) => {
    const isSame = filter.selectedGroup === group;
    onFilterChange({
      ...filter,
      selectedGroup: isSame ? '' : group,
      selectedType: '', // Reset loại khi đổi nhóm
      specFilters: {},  // Reset spec filters khi đổi nhóm
    });
  };

  const handleTypeSelect = (type: string) => {
    const isSame = filter.selectedType === type;
    onFilterChange({
      ...filter,
      selectedType: isSame ? '' : type,
      specFilters: {},
    });
  };

  const handlePriceTypeChange = (priceType: FilterState['priceType']) => {
    onFilterChange({
      ...filter,
      priceType,
    });
  };

  const handleTagToggle = (tag: string) => {
    const exists = filter.selectedTags.includes(tag);
    const updated = exists
      ? filter.selectedTags.filter(t => t !== tag)
      : [...filter.selectedTags, tag];
    onFilterChange({ ...filter, selectedTags: updated });
  };

  const handleSpecSelect = (specKey: string, specVal: string) => {
    const currentVal = filter.specFilters[specKey];
    const newSpecFilters = { ...filter.specFilters };
    if (currentVal === specVal) {
      delete newSpecFilters[specKey];
    } else {
      newSpecFilters[specKey] = specVal;
    }
    onFilterChange({ ...filter, specFilters: newSpecFilters });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col gap-6">
      
      {/* Top Header: Title & Reset */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-800 tracking-tight">Bộ Lọc Thông Minh</h2>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
            {filteredCount} kết quả
          </span>
        </div>
        <button
          type="button"
          onClick={onResetFilter}
          className="text-xs text-slate-500 hover:text-red-600 font-medium transition-colors flex items-center gap-1"
        >
          <X className="w-3.5 h-3.5" />
          Xóa lọc
        </button>
      </div>

      {/* 1. Search Bar */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
          Tìm kiếm Modul / Tên SP
        </label>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filter.searchQuery}
            onChange={e => onFilterChange({ ...filter, searchQuery: e.target.value })}
            placeholder="Nhập mã modul (SKU), tên, từ khóa..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
          />
          {filter.searchQuery && (
            <button
              type="button"
              onClick={() => onFilterChange({ ...filter, searchQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Nhóm Sản Phẩm (Category Groups) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            Nhóm sản phẩm
          </label>
          {filter.selectedGroup && (
            <span className="text-[11px] text-blue-600 font-medium cursor-pointer" onClick={() => handleGroupSelect('')}>
              Tất cả
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {categoryGroups.map(group => {
            const isSelected = filter.selectedGroup === group;
            return (
              <button
                key={group}
                type="button"
                onClick={() => handleGroupSelect(group)}
                className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {group}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Loại Sản Phẩm (Category Types) */}
      {availableTypes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Loại sản phẩm
            </label>
            {filter.selectedType && (
              <span className="text-[11px] text-blue-600 font-medium cursor-pointer" onClick={() => handleTypeSelect('')}>
                Tất cả
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            {availableTypes.map(type => {
              const isSelected = filter.selectedType === type;
              const count = products.filter(
                p =>
                  p.categoryType === type &&
                  (!filter.selectedGroup || p.categoryGroup === filter.selectedGroup)
              ).length;

              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeSelect(type)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-left transition-all ${
                    isSelected
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <span className="truncate">{type}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isSelected ? 'bg-blue-200/70 text-blue-800' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Lọc Đa Tầng Giá (Multi-tier Pricing Filter) */}
      <div className="border-t border-slate-100 pt-4">
        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
          Lọc theo tầng giá
        </label>
        
        {/* Price Tier Selector Tabs */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl mb-3">
          <button
            type="button"
            onClick={() => handlePriceTypeChange('retailPrice')}
            className={`text-[11px] py-1 rounded-lg font-medium transition-all ${
              filter.priceType === 'retailPrice'
                ? 'bg-white text-slate-800 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Giá thương mại
          </button>
          <button
            type="button"
            onClick={() => handlePriceTypeChange('distributorPrice')}
            className={`text-[11px] py-1 rounded-lg font-medium transition-all ${
              filter.priceType === 'distributorPrice'
                ? 'bg-white text-blue-700 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Giá NPP
          </button>
          <button
            type="button"
            onClick={() => handlePriceTypeChange('floorPrice')}
            className={`text-[11px] py-1 rounded-lg font-medium transition-all ${
              filter.priceType === 'floorPrice'
                ? 'bg-white text-amber-700 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Giá sàn
          </button>
          <button
            type="button"
            onClick={() => handlePriceTypeChange('costPrice')}
            className={`text-[11px] py-1 rounded-lg font-medium transition-all ${
              filter.priceType === 'costPrice'
                ? 'bg-white text-emerald-700 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Giá nhập
          </button>
        </div>

        {/* Max Price Range Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Dưới mức:</span>
            <span className="font-bold text-blue-700 font-mono">
              {formatCompactVND(filter.priceRange[1])}
            </span>
          </div>
          <input
            type="range"
            min={500000}
            max={20000000}
            step={500000}
            value={filter.priceRange[1]}
            onChange={e =>
              onFilterChange({
                ...filter,
                priceRange: [filter.priceRange[0], Number(e.target.value)],
              })
            }
            className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>500K</span>
            <span>5M</span>
            <span>10M</span>
            <span>20M</span>
          </div>
        </div>
      </div>

      {/* 5. Dynamic Specifications Filters (Thuộc tính kỹ thuật tự động) */}
      {dynamicSpecOptions.length > 0 && (
        <div className="border-t border-slate-100 pt-4 space-y-3">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Thông số kỹ thuật động
            </label>
          </div>
          <div className="space-y-3">
            {dynamicSpecOptions.map(spec => (
              <div key={spec.key} className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-600 block">
                  {spec.key}:
                </span>
                <div className="flex flex-wrap gap-1">
                  {spec.values.map(val => {
                    const isSelected = filter.specFilters[spec.key] === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleSpecSelect(spec.key, val)}
                        className={`text-[10px] px-2 py-1 rounded-md border transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 font-medium'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Tags filter */}
      {allTags.length > 0 && (
        <div className="border-t border-slate-100 pt-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Nhãn nổi bật
            </label>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {allTags.map(tag => {
              const isSelected = filter.selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                    isSelected
                      ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. Sort Dropdown */}
      <div className="border-t border-slate-100 pt-4">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            Sắp xếp theo
          </label>
        </div>
        <select
          value={filter.sortBy}
          onChange={e => onFilterChange({ ...filter, sortBy: e.target.value as FilterState['sortBy'] })}
          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
        >
          <option value="margin_desc">Biên lợi nhuận NPP cao nhất</option>
          <option value="price_asc">Giá (Thấp đến Cao)</option>
          <option value="price_desc">Giá (Cao đến Thấp)</option>
          <option value="sku_asc">Mã Modul (A - Z)</option>
          <option value="name_asc">Tên sản phẩm (A - Z)</option>
        </select>
      </div>

    </div>
  );
};
