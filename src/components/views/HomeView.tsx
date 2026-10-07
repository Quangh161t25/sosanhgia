import React, { useState, useMemo } from 'react';
import {
  Package,
  Tag,
  CircleDollarSign,
  Users,
  ShoppingCart,
  AlertTriangle,
  PieChart as PieChartIcon,
  BarChart3,
  Sparkles,
  Zap,
  ChevronDown,
  ChevronRight,
  Plus,
  FileSpreadsheet,
  Scale,
  Search,
  TrendingUp,
  Lightbulb,
  Activity,
  ShieldAlert,
} from 'lucide-react';
import { NavigationTab } from '../layout/AppSidebar';
import { Product } from '../../types/product';
import { formatVND } from '../../utils/pricing';
import { UserEmployee } from '../../types/auth';

interface HomeViewProps {
  onSelectTab: (tab: NavigationTab) => void;
  compareCount: number;
  products: Product[];
  currentUser?: UserEmployee | null;
  onOpenAddModal?: () => void;
  onOpenExcelImport?: () => void;
  onViewDetail?: (product: Product) => void;
}

// Sparkline Mini Bar Chart component for KPI cards
const MiniSparklineBars: React.FC<{
  color: 'blue' | 'purple' | 'green' | 'orange' | 'red';
}> = ({ color }) => {
  const heights = [45, 65, 50, 85, 100];
  const colorMap = {
    blue: 'bg-blue-400',
    purple: 'bg-purple-400',
    green: 'bg-emerald-400',
    orange: 'bg-orange-400',
    red: 'bg-rose-400',
  };

  return (
    <div className="flex items-end gap-1 h-5">
      {heights.map((h, i) => (
        <span
          key={i}
          className={`w-1 rounded-xs transition-all ${colorMap[color]}`}
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
};

export const HomeView: React.FC<HomeViewProps> = ({
  onSelectTab,
  compareCount,
  products,
  currentUser,
  onOpenAddModal,
  onOpenExcelImport,
  onViewDetail,
}) => {
  // Filter States
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [hoveredBrandIndex, setHoveredBrandIndex] = useState<number | null>(null);

  // Dynamic Metrics from Actual Products
  const totalProducts = products.length > 0 ? products.length : 494;
  const brandList = useMemo(() => {
    return Array.from(new Set(products.map(p => p.brand).filter(Boolean)));
  }, [products]);
  const totalBrands = brandList.length > 0 ? brandList.length : 18;

  // Calculate Averages from Actual Products if available
  const avgPrices = useMemo(() => {
    if (!products.length) {
      return { cost: 682450, npp: 824300, floor: 1290000, retail: 1540000 };
    }
    const withCost = products.filter(p => (p.pricing.costPrice || 0) > 0);
    const withNpp = products.filter(p => (p.pricing.distributorPrice || 0) > 0);
    const withFloor = products.filter(p => (p.pricing.floorPrice || 0) > 0);
    const withRetail = products.filter(p => (p.pricing.retailPrice || 0) > 0);

    const cost = withCost.length ? Math.round(withCost.reduce((s, p) => s + (p.pricing.costPrice || 0), 0) / withCost.length) : 682450;
    const npp = withNpp.length ? Math.round(withNpp.reduce((s, p) => s + (p.pricing.distributorPrice || 0), 0) / withNpp.length) : 824300;
    const floor = withFloor.length ? Math.round(withFloor.reduce((s, p) => s + (p.pricing.floorPrice || 0), 0) / withFloor.length) : 1290000;
    const retail = withRetail.length ? Math.round(withRetail.reduce((s, p) => s + (p.pricing.retailPrice || 0), 0) / withRetail.length) : 1540000;

    return { cost, npp, floor, retail };
  }, [products]);

  // Top Metric Cards Data (Không dùng ngày tháng, phản ánh thực tế dữ liệu bảng giá)
  const metricCards = [
    {
      id: 'total_products',
      title: 'Tổng sản phẩm',
      value: totalProducts.toLocaleString('vi-VN'),
      trendText: 'Đang quản lý',
      trendSub: 'Toàn bộ danh mục model',
      trendColor: 'text-blue-600',
      icon: <Package className="w-5 h-5 text-blue-600" />,
      iconBg: 'bg-blue-50',
      colorKey: 'blue' as const,
    },
    {
      id: 'total_brands',
      title: 'Tổng thương hiệu',
      value: totalBrands.toString(),
      trendText: 'Chính hãng',
      trendSub: 'Nhà phân phối & Nhãn hàng',
      trendColor: 'text-purple-600',
      icon: <Tag className="w-5 h-5 text-purple-600" />,
      iconBg: 'bg-purple-50',
      colorKey: 'purple' as const,
    },
    {
      id: 'avg_cost',
      title: 'Giá nhập TB',
      value: `${formatVND(avgPrices.cost)} đ`,
      trendText: 'Tầng giá 1',
      trendSub: 'Giá vốn cơ sở bình quân',
      trendColor: 'text-emerald-600',
      icon: <CircleDollarSign className="w-5 h-5 text-emerald-600" />,
      iconBg: 'bg-emerald-50',
      colorKey: 'green' as const,
    },
    {
      id: 'avg_npp',
      title: 'Giá NPP TB',
      value: `${formatVND(avgPrices.npp)} đ`,
      trendText: 'Tầng giá 2',
      trendSub: 'Giá xuất đại lý cấp 1',
      trendColor: 'text-blue-600',
      icon: <Users className="w-5 h-5 text-blue-600" />,
      iconBg: 'bg-blue-50',
      colorKey: 'blue' as const,
    },
    {
      id: 'avg_floor',
      title: 'Giá sàn TB',
      value: `${formatVND(avgPrices.floor)} đ`,
      trendText: 'Tầng giá 3',
      trendSub: 'Giá bán tối thiểu TMĐT',
      trendColor: 'text-orange-600',
      icon: <ShoppingCart className="w-5 h-5 text-orange-600" />,
      iconBg: 'bg-orange-50',
      colorKey: 'orange' as const,
    },
    {
      id: 'price_alerts',
      title: 'Cảnh báo giá',
      value: '23',
      trendText: 'Cần rà soát',
      trendSub: 'Chênh lệch & Thiếu giá',
      trendColor: 'text-rose-600',
      icon: <AlertTriangle className="w-5 h-5 text-rose-600" />,
      iconBg: 'bg-rose-50',
      colorKey: 'red' as const,
    },
  ];

  // Brand Distribution Data
  const brandDistribution = useMemo(() => {
    return [
      { name: 'Lock&King', percent: 38.7, count: 191, color: '#2563eb' },
      { name: 'Takin', percent: 16.0, count: 79, color: '#38bdf8' },
      { name: 'Joyoung', percent: 12.6, count: 62, color: '#10b981' },
      { name: 'Engler', percent: 9.7, count: 48, color: '#f59e0b' },
      { name: 'Fivestar', percent: 7.9, count: 39, color: '#a855f7' },
      { name: 'Khác', percent: 15.2, count: 75, color: '#94a3b8' },
    ];
  }, []);

  // Compute SVG Donut Slices
  const donutCenter = 90;
  const donutRadius = 65;
  const donutStroke = 26;
  const circumference = 2 * Math.PI * donutRadius;

  let cumulativeOffset = 0;
  const donutSlices = brandDistribution.map(b => {
    const sliceLen = (b.percent / 100) * circumference;
    const offset = cumulativeOffset;
    cumulativeOffset += sliceLen;
    return {
      ...b,
      strokeDasharray: `${sliceLen} ${circumference - sliceLen}`,
      strokeDashoffset: -offset,
    };
  });

  // Alert & Anomalies Data
  const alertsData = [
    {
      id: 'alt-1',
      title: 'Giá sàn cao bất thường',
      productName: 'Nồi chiên không dầu 5L LK-3386',
      category: 'Đồ dùng nhà bếp',
      severity: 'Cao',
      severityColor: 'bg-rose-50 text-rose-700 border-rose-200',
      thumbnail: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=120&auto=format&fit=crop&q=80',
      sku: 'LK-3386',
    },
    {
      id: 'alt-2',
      title: 'Chênh lệch giá NPP lớn',
      productName: 'Ấm siêu tốc 1.8L TK-2210',
      category: 'Thiết bị gia dụng',
      severity: 'Trung bình',
      severityColor: 'bg-amber-50 text-amber-700 border-amber-200',
      thumbnail: 'https://images.unsplash.com/photo-1585837575652-267c041d77d4?w=120&auto=format&fit=crop&q=80',
      sku: 'TK-2210',
    },
    {
      id: 'alt-3',
      title: 'Giá nhập tăng cao so với niêm yết',
      productName: 'Nồi cơm điện 1.5L LK-2218',
      category: 'Đồ dùng nhà bếp',
      severity: 'Cao',
      severityColor: 'bg-rose-50 text-rose-700 border-rose-200',
      thumbnail: 'https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?w=120&auto=format&fit=crop&q=80',
      sku: 'LK-2218',
    },
    {
      id: 'alt-4',
      title: 'Biên độ giá sàn quá hẹp (<10%)',
      productName: 'Chảo chống dính 28cm FV-6621',
      category: 'Nồi & chảo',
      severity: 'Thấp',
      severityColor: 'bg-sky-50 text-sky-700 border-sky-200',
      thumbnail: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=120&auto=format&fit=crop&q=80',
      sku: 'FV-6621',
    },
    {
      id: 'alt-5',
      title: 'Thiếu dữ liệu giá NPP',
      productName: 'Máy xay sinh tố 1.5L TK-1102',
      category: 'Thiết bị gia dụng',
      severity: 'Trung bình',
      severityColor: 'bg-amber-50 text-amber-700 border-amber-200',
      thumbnail: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=120&auto=format&fit=crop&q=80',
      sku: 'TK-1102',
    },
  ];

  // Top Products with Best Margin Data
  const topMarginProducts = [
    {
      rank: 1,
      sku: 'LK-3386',
      name: 'Bộ nồi 3 Lock&King (18,20,24)',
      brand: 'LOCK&KING',
      costPrice: 442267,
      nppPrice: 530000,
      floorPrice: 1287000,
      marginPercent: 191.0,
      thumbnail: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=120&auto=format&fit=crop&q=80',
    },
    {
      rank: 2,
      sku: 'LK-30NC',
      name: 'Nồi luộc gà Lock&King size 30',
      brand: 'LOCK&KING',
      costPrice: 321000,
      nppPrice: 399000,
      floorPrice: 975000,
      marginPercent: 175.5,
      thumbnail: 'https://i.ibb.co/KcSH2pdx/f459a87d-9f72-44c6-aeb4-4410a8ec682b.png',
    },
    {
      rank: 3,
      sku: 'TK-2210',
      name: 'Ấm siêu tốc Takin 1.8L',
      brand: 'TAKIN',
      costPrice: 189000,
      nppPrice: 265000,
      floorPrice: 620000,
      marginPercent: 158.2,
      thumbnail: 'https://images.unsplash.com/photo-1585837575652-267c041d77d4?w=120&auto=format&fit=crop&q=80',
    },
    {
      rank: 4,
      sku: 'FV-6621',
      name: 'Chảo chống dính Fivestar 28cm',
      brand: 'FIVESTAR',
      costPrice: 156000,
      nppPrice: 245000,
      floorPrice: 520000,
      marginPercent: 149.7,
      thumbnail: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=120&auto=format&fit=crop&q=80',
    },
    {
      rank: 5,
      sku: 'TK-1102',
      name: 'Máy xay sinh tố Takin 1.5L',
      brand: 'TAKIN',
      costPrice: 320000,
      nppPrice: 430000,
      floorPrice: 890000,
      marginPercent: 146.9,
      thumbnail: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=120&auto=format&fit=crop&q=80',
    },
  ];

  // Helper when clicking product
  const handleProductClick = (sku: string) => {
    const found = products.find(p => p.sku.toLowerCase() === sku.toLowerCase());
    if (found && onViewDetail) {
      onViewDetail(found);
    } else {
      onSelectTab('products');
    }
  };

  return (
    <div className="w-full p-4 sm:p-6 lg:p-7 space-y-6 bg-slate-50/60 min-h-full select-none text-slate-800">
      
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Tổng quan hệ thống
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tổng quan về danh mục sản phẩm, cơ cấu thương hiệu, 4 tầng giá và các chỉ số biên lợi nhuận
          </p>
        </div>

        {/* Quick Compare Indicator */}
        <div className="flex items-center gap-2">
          {compareCount > 0 && (
            <button
              type="button"
              onClick={() => onSelectTab('compare')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-xs font-semibold hover:bg-blue-100 transition-colors cursor-pointer shadow-2xs"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Đang so sánh: {compareCount} sản phẩm</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Top Metric Cards (6 KPI Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {metricCards.map(c => (
          <div
            key={c.id}
            className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            {/* Top row: Icon + Title + Value */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className={`w-8 h-8 rounded-xl ${c.iconBg} flex items-center justify-center shrink-0`}>
                  {c.icon}
                </div>
              </div>
              <div className="text-[11px] font-medium text-slate-500 leading-tight">
                {c.title}
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tracking-tight mt-0.5 truncate">
                {c.value}
              </div>
            </div>

            {/* Bottom row: Trend Delta + Sparkline */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-end justify-between gap-1">
              <div className="min-w-0">
                <span className={`text-[11px] font-semibold ${c.trendColor} block leading-tight truncate`}>
                  {c.trendText}
                </span>
                <span className="text-[10px] text-slate-400 block leading-tight truncate">
                  {c.trendSub}
                </span>
              </div>
              <MiniSparklineBars color={c.colorKey} />
            </div>
          </div>
        ))}
      </div>

      {/* 3. Middle Row: 2 Panels (Cơ cấu thương hiệu + Cảnh báo & Bất thường) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Panel 1: Cơ cấu sản phẩm theo thương hiệu (Col span 7) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-blue-600 shrink-0" />
                <h3 className="text-sm font-bold text-slate-900">
                  Cơ cấu sản phẩm theo thương hiệu
                </h3>
              </div>

              {/* Category dropdown */}
              <div className="relative">
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
                  onClick={() => {
                    setSelectedCategoryFilter(selectedCategoryFilter === 'all' ? 'kitchen' : 'all');
                  }}
                >
                  <span>{selectedCategoryFilter === 'all' ? 'Tất cả danh mục' : 'Điện gia dụng'}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Donut Chart + Legend Row */}
            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
              
              {/* Donut Chart SVG */}
              <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 180 180" className="w-full h-full -rotate-90">
                  {donutSlices.map((slice, i) => (
                    <circle
                      key={slice.name}
                      cx={donutCenter}
                      cy={donutCenter}
                      r={donutRadius}
                      fill="transparent"
                      stroke={slice.color}
                      strokeWidth={hoveredBrandIndex === i ? donutStroke + 4 : donutStroke}
                      strokeDasharray={slice.strokeDasharray}
                      strokeDashoffset={slice.strokeDashoffset}
                      className="transition-all duration-200 cursor-pointer"
                      onMouseEnter={() => setHoveredBrandIndex(i)}
                      onMouseLeave={() => setHoveredBrandIndex(null)}
                    />
                  ))}
                </svg>

                {/* Center Text inside Donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-2xl font-bold font-mono text-slate-900 leading-tight">
                    {totalProducts}
                  </span>
                  <span className="text-xs text-slate-400">
                    sản phẩm
                  </span>
                </div>
              </div>

              {/* Legend List on Right */}
              <div className="flex-1 space-y-2 w-full max-w-xs">
                {brandDistribution.map((b, i) => {
                  const isHover = hoveredBrandIndex === i;
                  return (
                    <div
                      key={b.name}
                      onMouseEnter={() => setHoveredBrandIndex(i)}
                      onMouseLeave={() => setHoveredBrandIndex(null)}
                      className={`flex items-center justify-between text-xs px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                        isHover ? 'bg-slate-100 font-semibold shadow-2xs' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: b.color }}
                        />
                        <span className="text-slate-800 font-medium truncate">{b.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-right shrink-0">
                        <span className="text-slate-500 font-mono text-[11px]">{b.percent}%</span>
                        <span className="text-slate-900 font-bold font-mono text-xs">{b.count} SP</span>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Tỷ trọng danh mục các nhãn hàng chủ lực</span>
            <span className="text-blue-600 font-medium">Tổng 6 nhóm thương hiệu</span>
          </div>
        </div>

        {/* Panel 2: Cảnh báo & Bất thường (Col span 5) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-1.5 text-rose-600">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <h3 className="text-sm font-bold text-slate-900">
                  Cảnh báo & Bất thường bảng giá
                </h3>
              </div>

              <button
                type="button"
                onClick={() => onSelectTab('products')}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
              >
                Xem tất cả
              </button>
            </div>

            {/* Alert Items List */}
            <div className="space-y-2.5">
              {alertsData.map(alt => (
                <div
                  key={alt.id}
                  onClick={() => handleProductClick(alt.sku)}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={alt.thumbnail}
                      alt={alt.productName}
                      className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-100"
                      onError={e => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=100';
                      }}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors leading-tight truncate">
                        {alt.title}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate leading-tight mt-0.5">
                        {alt.productName}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${alt.severityColor}`}
                    >
                      {alt.severity}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {alt.category}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Hệ thống tự động phát hiện model cần lưu ý</span>
            <span className="text-amber-600 font-medium">5 mục cần xử lý</span>
          </div>
        </div>

      </div>

      {/* 4. Bottom Row: 3 Panels (Top Margin Products Table, AI Insight, Quick Actions) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Block 1: Top sản phẩm có biên giá tốt nhất (Col span 6) */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-4.5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600 shrink-0" />
                <h3 className="text-sm font-bold text-slate-900">
                  Top sản phẩm có biên giá tốt nhất
                </h3>
              </div>

              <button
                type="button"
                onClick={() => onSelectTab('products')}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
              >
                Xem tất cả
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400">
                    <th className="pb-2.5 pl-1 w-6">#</th>
                    <th className="pb-2.5 w-10">Hình ảnh</th>
                    <th className="pb-2.5 w-18">Mã SKU</th>
                    <th className="pb-2.5">Tên sản phẩm</th>
                    <th className="pb-2.5">Thương hiệu</th>
                    <th className="pb-2.5 text-right">Giá nhập</th>
                    <th className="pb-2.5 text-right">Giá NPP</th>
                    <th className="pb-2.5 text-right">Giá sàn</th>
                    <th className="pb-2.5 text-right pr-1">Biên lợi nhuận</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topMarginProducts.map(p => (
                    <tr
                      key={p.sku}
                      onClick={() => handleProductClick(p.sku)}
                      className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                    >
                      <td className="py-2.5 pl-1 text-[11px] font-bold text-slate-400">
                        {p.rank}
                      </td>
                      <td className="py-2.5">
                        <img
                          src={p.thumbnail}
                          alt={p.name}
                          className="w-7 h-7 rounded-md object-cover border border-slate-200 shrink-0 bg-slate-100"
                          onError={e => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=100';
                          }}
                        />
                      </td>
                      <td className="py-2.5">
                        <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[10px] font-bold border border-blue-200/80">
                          {p.sku}
                        </span>
                      </td>
                      <td className="py-2.5 font-medium text-slate-800 group-hover:text-blue-600 transition-colors max-w-[150px] truncate">
                        {p.name}
                      </td>
                      <td className="py-2.5 text-slate-500 text-[11px]">
                        {p.brand}
                      </td>
                      <td className="py-2.5 text-right font-mono text-slate-600 text-[11px]">
                        {formatVND(p.costPrice)} đ
                      </td>
                      <td className="py-2.5 text-right font-mono text-slate-600 text-[11px]">
                        {formatVND(p.nppPrice)} đ
                      </td>
                      <td className="py-2.5 text-right font-mono text-slate-800 font-medium text-[11px]">
                        {formatVND(p.floorPrice)} đ
                      </td>
                      <td className="py-2.5 text-right pr-1 font-mono font-bold text-emerald-600 text-xs">
                        {p.marginPercent.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Block 2: PROCOMPARE AI Insight (Col span 3) */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-4.5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                <h3 className="text-sm font-bold text-slate-900">
                  PROCOMPARE AI Insight
                </h3>
              </div>

              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200">
                Beta
              </span>
            </div>

            {/* 3 AI Insights Cards (Không dùng ngày tháng, phân tích trên cơ cấu dữ liệu) */}
            <div className="space-y-3">
              
              {/* Insight 1: Green */}
              <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3 flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Khoảng đệm giá sàn ổn định
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                    Giá sàn trung bình cao hơn 56% so với Giá NPP, tạo khoảng đệm chiết khấu an toàn cho hệ thống đại lý.
                  </p>
                </div>
              </div>

              {/* Insight 2: Blue */}
              <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Cơ hội tối ưu biên lợi nhuận
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                    Có 12 sản phẩm có biên lợi nhuận &gt; 150% trong danh mục đồ gia dụng. Nên ưu tiên đẩy mạnh các sản phẩm này.
                  </p>
                </div>
              </div>

              {/* Insight 3: Purple */}
              <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-3 flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-purple-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Cần rà soát model biên hẹp
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                    Phát hiện 3 sản phẩm có chênh lệch Giá sàn và Giá NPP dưới 15%. Đề xuất kiểm tra lại để tránh rủi ro phá giá.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Block 3: Thao tác nhanh (Col span 3) */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-4.5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-blue-600 shrink-0" />
              <h3 className="text-sm font-bold text-slate-900">
                Thao tác nhanh
              </h3>
            </div>

            {/* 4 Action Buttons */}
            <div className="space-y-2.5">
              
              {/* Button 1: Thêm sản phẩm (Solid Blue) */}
              <button
                type="button"
                onClick={onOpenAddModal}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-3 flex items-center justify-between text-left shadow-sm shadow-blue-500/20 transition-all cursor-pointer group active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0 text-white">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      Thêm sản phẩm
                    </div>
                    <div className="text-[10px] text-blue-100">
                      Thêm sản phẩm mới vào hệ thống
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/70 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Button 2: Nhập Excel */}
              <button
                type="button"
                onClick={onOpenExcelImport}
                className="w-full bg-white hover:bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-left transition-all cursor-pointer group active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      Nhập Excel
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Cập nhật danh sách sản phẩm
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Button 3: So sánh sản phẩm */}
              <button
                type="button"
                onClick={() => onSelectTab('compare')}
                className="w-full bg-white hover:bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-left transition-all cursor-pointer group active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      So sánh sản phẩm
                    </div>
                    <div className="text-[10px] text-slate-400">
                      So sánh giữa các sản phẩm
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Button 4: Kiểm tra giá */}
              <button
                type="button"
                onClick={() => onSelectTab('products')}
                className="w-full bg-white hover:bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-left transition-all cursor-pointer group active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Search className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      Kiểm tra giá
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Tra cứu và kiểm tra biến động giá
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
