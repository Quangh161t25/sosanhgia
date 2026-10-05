import React, { useState, useEffect, useMemo, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { Loader2, RefreshCw, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';
import { Product } from './types/product';
import { UserEmployee } from './types/auth';
import { DEFAULT_EMPLOYEES_SNAPSHOT } from './data/employeesSnapshot';
import { LoginView } from './components/auth/LoginView';
import { AppSidebar, NavigationTab } from './components/layout/AppSidebar';
import { TopNavbar } from './components/layout/TopNavbar';
import { HomeView } from './components/views/HomeView';
import { ProductsView } from './components/views/ProductsView';
import { SystemView } from './components/views/SystemView';
import { CopyrightView } from './components/views/CopyrightView';
import { ComparisonMatrix } from './components/ComparisonMatrix';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ProductFormModal } from './components/ProductFormModal';
import { ExcelImportModal } from './components/ExcelImportModal';
import { FloatingCompareDock } from './components/FloatingCompareDock';
import { calculateFinancials } from './utils/pricing';
import {
  getLocalSheetsConfig,
  pushProductsToGoogleSheet,
  pullProductsFromGoogleSheet,
  pullEmployeesFromGoogleSheet,
} from './utils/googleSheetsApi';
import { syncGeminiKeyFromSheet } from './utils/aiSpecParser';
import { SHEET_PRODUCTS_SNAPSHOT } from './data/sheetProductsSnapshot';

const STORAGE_KEY_PRODUCTS = 'procompare_products_v2';
const STORAGE_KEY_ROLE = 'procompare_show_cost_v1';
const STORAGE_KEY_AUTH = 'procompare_auth_user_v1';
const STORAGE_KEY_LOGGED_OUT = 'procompare_logged_out';

// Ánh xạ tab sang đường dẫn URL chuẩn SEO & tiếng Việt
export const TAB_ROUTES: Record<NavigationTab, string> = {
  home: '/',
  products: '/san-pham',
  compare: '/so-sanh',
  settings: '/cai-dat',
};

export function getTabFromPathname(pathname: string): NavigationTab {
  try {
    const raw = decodeURIComponent(pathname || '').toLowerCase().trim();
    const clean = raw.replace(/^\/+|\/+$/g, '');
    if (!clean || clean === 'home' || clean === 'trang-chu') return 'home';
    if (
      clean.includes('san-pham') ||
      clean.includes('sanpham') ||
      clean.includes('sản phẩm') ||
      clean.includes('san pham') ||
      clean.includes('products') ||
      clean.includes('product')
    ) {
      return 'products';
    }
    if (
      clean.includes('so-sanh') ||
      clean.includes('sosanh') ||
      clean.includes('so sánh') ||
      clean.includes('so sanh') ||
      clean.includes('compare')
    ) {
      return 'compare';
    }
    if (
      clean.includes('cai-dat') ||
      clean.includes('caidat') ||
      clean.includes('cài đặt') ||
      clean.includes('cai dat') ||
      clean.includes('settings')
    ) {
      return 'settings';
    }
  } catch (e) {
    // Ignore error
  }
  return 'products';
}

export default function App() {
  // 0. Quản lý phiên Đăng nhập / Đăng xuất (Dữ liệu từ Google Sheet NHAN_VIEN)
  const [currentUser, setCurrentUser] = useState<UserEmployee | null>(() => {
    try {
      const isLoggedOut = localStorage.getItem(STORAGE_KEY_LOGGED_OUT);
      if (isLoggedOut === 'true') return null;

      const saved = localStorage.getItem(STORAGE_KEY_AUTH);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Lỗi đọc tài khoản đăng nhập:', e);
    }
    // Không tự động đăng nhập nếu chưa có phiên hợp lệ (yêu cầu đăng nhập từ Google Sheet)
    return null;
  });

  const [employees, setEmployees] = useState<UserEmployee[]>(DEFAULT_EMPLOYEES_SNAPSHOT);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);

  const handleSyncEmployees = useCallback(async () => {
    setIsLoadingEmployees(true);
    try {
      const list = await pullEmployeesFromGoogleSheet();
      if (list && list.length > 0) {
        setEmployees(list);
        setCurrentUser(prevUser => {
          if (!prevUser) return null;
          const updated = list.find(
            e => e.taiKhoan.toLowerCase() === prevUser.taiKhoan.toLowerCase()
          );
          if (!updated) return prevUser;
          if (
            updated.hoTen === prevUser.hoTen &&
            updated.quyen === prevUser.quyen &&
            updated.matKhau === prevUser.matKhau &&
            updated.anh === prevUser.anh
          ) {
            return prevUser;
          }
          try {
            localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });
      }
    } catch (e) {
      console.error('Lỗi tải danh sách nhân viên từ Google Sheet:', e);
    } finally {
      setIsLoadingEmployees(false);
    }
  }, []);

  useEffect(() => {
    handleSyncEmployees();
    syncGeminiKeyFromSheet().catch(() => {});
  }, [handleSyncEmployees]);

  const handleLogout = useCallback(() => {
    localStorage.setItem(STORAGE_KEY_LOGGED_OUT, 'true');
    localStorage.removeItem(STORAGE_KEY_AUTH);
    setCurrentUser(null);
  }, []);

  const handleLoginSuccess = useCallback((user: UserEmployee) => {
    localStorage.removeItem(STORAGE_KEY_LOGGED_OUT);
    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(user));
    setCurrentUser(user);
  }, []);

  // 1. Navigation state với URL Pathname thực tế
  const [currentTab, setCurrentTab] = useState<NavigationTab>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path && path !== '/') {
        return getTabFromPathname(path);
      }
    }
    return 'products';
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // 2. Trạng thái tải & đồng bộ dữ liệu Google Sheet
  const [isLoadingSheets, setIsLoadingSheets] = useState(true);
  const [sheetSyncError, setSheetSyncError] = useState<string | null>(null);
  const [syncToast, setSyncToast] = useState<{ message: string; type: 'syncing' | 'success' | 'error' } | null>(null);

  // 3. Danh sách sản phẩm (đồng bộ trực tiếp từ Google Sheet thực tế)
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      // Dọn dẹp cache v1 cũ nếu có
      localStorage.removeItem('procompare_products_v1');

      const saved = localStorage.getItem(STORAGE_KEY_PRODUCTS);
      if (saved) {
        const parsed: Product[] = JSON.parse(saved);
        // Loại bỏ mock data cũ nếu còn trong cache
        const hasMock = parsed.some(p => p.sku === 'NC-AF65PRO' || p.id === 'prod-01');
        // Loại bỏ cache cũ nếu giá bị cắt thành 3 số (vd 321 thay vì 321000)
        const hasTruncatedPrices = parsed.some(
          p => p.pricing && p.pricing.costPrice > 0 && p.pricing.costPrice < 10000
        );
        if (!hasMock && !hasTruncatedPrices && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Lỗi đọc LocalStorage:', e);
    }
    // Dữ liệu khởi tạo mặc định từ Google Sheet SO_SANH_GIA (73 sản phẩm thực tế)
    return SHEET_PRODUCTS_SNAPSHOT;
  });

  // Tự động tải và đồng bộ toàn bộ danh mục sản phẩm từ Google Sheet khi mở trang web
  useEffect(() => {
    let isCancelled = false;
    async function loadInitialProducts() {
      // Chỉ hiện loading overlay toàn màn hình nếu hoàn toàn chưa có sản phẩm nào
      if (products.length === 0) {
        setIsLoadingSheets(true);
      }
      setSheetSyncError(null);
      try {
        const cfg = getLocalSheetsConfig();
        const sheetProducts = await pullProductsFromGoogleSheet(cfg.sheetTitle || 'Sản phẩm');
        if (!isCancelled && sheetProducts && sheetProducts.length > 0) {
          setProducts(sheetProducts);
          try {
            localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(sheetProducts));
          } catch (e) {
            console.error('Lỗi lưu cache:', e);
          }
        }
      } catch (err: any) {
        console.error('Lỗi kết nối Google Sheet ban đầu:', err);
        // Chỉ hiện màn hình lỗi nếu chưa có dữ liệu sản phẩm nào hiển thị
        if (!isCancelled && products.length === 0) {
          setSheetSyncError(err?.message || 'Không thể kết nối đến Google Sheet');
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingSheets(false);
        }
      }
    }

    loadInitialProducts();
    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
      } catch (e) {
        console.error('Lỗi ghi LocalStorage:', e);
      }
    }
  }, [products]);

  // 4. Quyền xem Giá Nhập (Role Security)
  const [showCostPrice, setShowCostPrice] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY_ROLE) !== 'false';
  });

  const handleToggleCostPrice = () => {
    setShowCostPrice(prev => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY_ROLE, String(next));
      return next;
    });
  };

  // 5. Danh sách ID sản phẩm được chọn so sánh (tối đa 5 sản phẩm)
  const [compareIds, setCompareIds] = useState<string[]>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlCompare = params.get('compare');
      if (urlCompare) {
        return urlCompare.split(',').filter(Boolean);
      }
    } catch (e) {
      console.error('Lỗi đọc URL param:', e);
    }
    return [];
  });

  // Đồng bộ hai chiều giữa URL trình duyệt và trạng thái ứng dụng (Pathname + Query Params)
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const targetPath = TAB_ROUTES[currentTab] || '/san-pham';
      url.pathname = targetPath;

      if (compareIds.length > 0) {
        url.searchParams.set('compare', compareIds.join(','));
      } else {
        url.searchParams.delete('compare');
      }

      const newUrlStr = url.pathname + url.search;
      const currentUrlStr = window.location.pathname + window.location.search;
      if (newUrlStr !== currentUrlStr) {
        window.history.replaceState({ tab: currentTab }, '', newUrlStr);
      }
    } catch (e) {
      // Ignore in restricted environments
    }
  }, [currentTab, compareIds]);

  // Lắng nghe sự kiện Back / Forward của trình duyệt
  useEffect(() => {
    const handlePopState = () => {
      const tab = getTabFromPathname(window.location.pathname);
      setCurrentTab(tab);
      const params = new URLSearchParams(window.location.search);
      const urlCompare = params.get('compare');
      if (urlCompare) {
        setCompareIds(urlCompare.split(',').filter(Boolean));
      } else {
        setCompareIds([]);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 5. Modals State
  const [isMatrixOpen, setIsMatrixOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [openFormWithAi, setOpenFormWithAi] = useState(false);
  const [isExcelImportOpen, setIsExcelImportOpen] = useState(false);

  const handleEditProductFromMatrix = useCallback((product: Product, openAiSpec = false) => {
    setEditingProduct(product);
    setOpenFormWithAi(openAiSpec);
    setIsFormOpen(true);
  }, []);

  // Toggle thêm/bỏ so sánh
  const handleToggleCompare = useCallback((product: Product) => {
    setCompareIds(prev => {
      if (prev.includes(product.id)) {
        return prev.filter(id => id !== product.id);
      }
      if (prev.length >= 5) {
        alert('Bạn chỉ có thể so sánh tối đa 5 sản phẩm cùng một lúc để đảm bảo hiển thị trực quan!');
        return prev;
      }
      return [...prev, product.id];
    });
  }, []);

  const handleRemoveCompare = useCallback((productId: string) => {
    setCompareIds(prev => prev.filter(id => id !== productId));
  }, []);

  const handleClearAllCompare = useCallback(() => {
    setCompareIds([]);
  }, []);

  const handleAddFromMatrix = useCallback((product: Product) => {
    setCompareIds(prev => {
      if (!prev.includes(product.id) && prev.length < 5) {
        return [...prev, product.id];
      }
      return prev;
    });
  }, []);

  const handleReorderProducts = useCallback((reordered: Product[]) => {
    setCompareIds(reordered.map(p => p.id));
  }, []);

  // Làm mới / Đồng bộ lại toàn bộ dữ liệu mới nhất từ Google Sheet
  const handleResetData = async () => {
    if (confirm('Bạn có muốn tải lại toàn bộ dữ liệu danh mục mới nhất từ Google Sheet (SO_SANH_GIA)?')) {
      setIsLoadingSheets(true);
      setSheetSyncError(null);
      try {
        const cfg = getLocalSheetsConfig();
        const sheetProducts = await pullProductsFromGoogleSheet(cfg.sheetTitle || 'Sản phẩm');
        setProducts(sheetProducts);
        setCompareIds([]);
        localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(sheetProducts));
        alert(`Đã đồng bộ thành công ${sheetProducts.length} sản phẩm thực tế từ Google Sheet!`);
      } catch (err: any) {
        alert('Lỗi nạp dữ liệu từ Google Sheet: ' + (err?.message || 'Không rõ'));
      } finally {
        setIsLoadingSheets(false);
      }
    }
  };

  // Xuất file Excel (.xlsx) toàn bộ danh mục sản phẩm chuẩn 20 cột
  const handleExportCatalog = () => {
    const data = products.map(p => {
      const f = calculateFinancials(p.pricing);
      const specsText = p.specifications
        ? p.specifications
            .map(g => `[${g.groupName}] ${g.items.map(i => `${i.key}: ${i.value}`).join(' | ')}`)
            .join('\n')
        : '';

      return {
        'Mã SKU / Modul': p.sku,
        'Tên sản phẩm': p.name,
        'Thương hiệu': p.brand,
        'Nhóm danh mục': p.categoryGroup,
        'Loại sản phẩm': p.categoryType,
        'Thời hạn BH (tháng)': p.warrantyMonths || 12,
        '1. Giá nhập (VND)': p.pricing.costPrice,
        '2. Giá NPP (VND)': p.pricing.distributorPrice,
        '3. Giá sàn (VND)': p.pricing.floorPrice,
        '4. Giá bán lẻ (VND)': p.pricing.retailPrice,
        '% Lợi nhuận NPP': `${f.nppMarginPercent}%`,
        'Lợi nhuận NPP (VND)': f.nppGross,
        'Link ảnh': p.thumbnail,
        'Nhãn Tags': (p.tags || []).join(', '),
        'Mô tả sản phẩm': p.description || '',
        'Thông số kỹ thuật': specsText,
        'Ghi chú': p.notes || '',
        'Trạng thái': 'Đang kinh doanh',
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [
      { wch: 16 },
      { wch: 32 },
      { wch: 15 },
      { wch: 16 },
      { wch: 16 },
      { wch: 18 },
      { wch: 16 },
      { wch: 16 },
      { wch: 16 },
      { wch: 16 },
      { wch: 16 },
      { wch: 18 },
      { wch: 30 },
      { wch: 22 },
      { wch: 35 },
      { wch: 45 },
      { wch: 25 },
      { wch: 16 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Danh mục sản phẩm');
    XLSX.writeFile(wb, `Danh_Muc_San_Pham_SoSanhGia_${Date.now()}.xlsx`);
  };

  // Cập nhật danh mục sản phẩm từ bên ngoài (nhập Excel, đồng bộ Sheet modal)
  const handleUpdateProducts = useCallback(async (newProducts: Product[]) => {
    setProducts(newProducts);
    try {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(newProducts));
    } catch (e) {
      console.error('Lỗi lưu LocalStorage:', e);
    }

    // Tự động đẩy lên Google Sheet ngay lập tức
    try {
      const cfg = getLocalSheetsConfig();
      if (newProducts.length > 0) {
        setSyncToast({ message: `Đang lưu ${newProducts.length} sản phẩm lên Google Sheet...`, type: 'syncing' });
        await pushProductsToGoogleSheet(newProducts, cfg.sheetTitle || 'Sản phẩm');
        setSyncToast({ message: `Đã cập nhật & đồng bộ ${newProducts.length} sản phẩm lên Google Sheet thành công!`, type: 'success' });
        setTimeout(() => setSyncToast(null), 3500);
      }
    } catch (e: any) {
      console.error('Lỗi tự động đồng bộ Google Sheet khi cập nhật danh sách:', e);
      setSyncToast({ message: `Lỗi đồng bộ Google Sheet: ${e?.message || 'Không thể kết nối'}`, type: 'error' });
      setTimeout(() => setSyncToast(null), 6000);
    }
  }, []);

  // Lưu sản phẩm từ Form Modal (Thêm mới hoặc Cập nhật)
  const handleSaveProduct = async (updated: Product) => {
    // 1. Tính toán danh sách sản phẩm mới đồng bộ
    const index = products.findIndex(
      p => p.id === updated.id || (p.sku && updated.sku && p.sku.trim().toUpperCase() === updated.sku.trim().toUpperCase())
    );
    const nextList = index >= 0
      ? products.map((p, i) => (i === index ? updated : p))
      : [updated, ...products];

    setProducts(nextList);
    try {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(nextList));
    } catch (e) {
      console.error('Lỗi lưu LocalStorage:', e);
    }

    // 2. Tự động đồng bộ trực tiếp lên Google Sheet ngay lập tức
    try {
      const cfg = getLocalSheetsConfig();
      if (nextList.length > 0) {
        setSyncToast({ message: `Đang lưu "${updated.name || updated.sku}" lên Google Sheet...`, type: 'syncing' });
        await pushProductsToGoogleSheet(nextList, cfg.sheetTitle || 'Sản phẩm');
        setSyncToast({ message: `Đã lưu & đồng bộ "${updated.sku || updated.name}" lên Google Sheet thành công!`, type: 'success' });
        setTimeout(() => setSyncToast(null), 3500);
      }
    } catch (e: any) {
      console.error('Lỗi tự động đồng bộ Google Sheet khi lưu:', e);
      setSyncToast({ message: `Lỗi đồng bộ Google Sheet: ${e?.message || 'Không thể kết nối'}`, type: 'error' });
      setTimeout(() => setSyncToast(null), 6000);
    }
  };

  // Xóa sản phẩm
  const handleDeleteProduct = async (productId: string) => {
    const deletedProd = products.find(p => p.id === productId);
    const nextList = products.filter(p => p.id !== productId);
    setProducts(nextList);
    setCompareIds(prev => prev.filter(id => id !== productId));
    try {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(nextList));
    } catch (e) {
      console.error('Lỗi lưu LocalStorage:', e);
    }

    // Tự động đồng bộ lên Google Sheet ngay lập tức
    try {
      const cfg = getLocalSheetsConfig();
      if (nextList.length > 0) {
        setSyncToast({ message: `Đang đồng bộ xóa trên Google Sheet...`, type: 'syncing' });
        await pushProductsToGoogleSheet(nextList, cfg.sheetTitle || 'Sản phẩm');
        setSyncToast({ message: `Đã xóa "${deletedProd?.sku || productId}" và cập nhật Google Sheet!`, type: 'success' });
        setTimeout(() => setSyncToast(null), 3500);
      }
    } catch (e: any) {
      console.error('Lỗi tự động đồng bộ Google Sheet khi xóa:', e);
      setSyncToast({ message: `Lỗi đồng bộ Google Sheet khi xóa: ${e?.message || 'Không thể kết nối'}`, type: 'error' });
      setTimeout(() => setSyncToast(null), 6000);
    }
  };

  // Các sản phẩm đang được chọn so sánh
  const selectedProductsToCompare = useMemo(() => {
    return compareIds
      .map(id => products.find(p => p.id === id))
      .filter((p): p is Product => Boolean(p));
  }, [compareIds, products]);

  // Màn hình tải khi đang kết nối & lấy dữ liệu từ Google Sheet ban đầu
  if (isLoadingSheets && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-6 font-sans">
        <div className="relative flex items-center justify-center mb-6">
          <div className="absolute w-24 h-24 rounded-full bg-emerald-500/20 animate-ping" />
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 border border-emerald-400/40">
            <FileSpreadsheet className="w-8 h-8 text-white animate-pulse" />
          </div>
        </div>

        <h2 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
          Đang kết nối & tải dữ liệu Google Sheet...
        </h2>
        <p className="text-sm text-slate-400 mt-2 text-center max-w-md">
          Đang đồng bộ hóa trực tiếp từ bảng tính <span className="text-emerald-400 font-semibold font-mono">SO_SANH_GIA</span> (tab Sản phẩm) theo thời gian thực.
        </p>

        <div className="mt-6 flex items-center gap-2 text-xs text-slate-500 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
          <span>Hệ thống chỉ sử dụng dữ liệu thực tế từ Google Sheet, không dùng dữ liệu giả</span>
        </div>
      </div>
    );
  }

  // Màn hình thông báo lỗi kết nối nếu không thể tải từ Google Sheet
  if (sheetSyncError && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-6 font-sans">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
          <FileSpreadsheet className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-100">Không thể kết nối đến Google Sheet</h2>
        <p className="text-xs text-rose-400 mt-1 max-w-md text-center">{sheetSyncError}</p>
        <button
          type="button"
          onClick={handleResetData}
          className="mt-6 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-all shadow-md shadow-emerald-600/30 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Thử kết nối lại</span>
        </button>
      </div>
    );
  }

  // Màn hình đăng nhập nếu chưa có phiên làm việc
  if (!currentUser) {
    return (
      <LoginView
        employees={employees}
        onLoginSuccess={handleLoginSuccess}
        onRefreshEmployees={handleSyncEmployees}
        isLoadingEmployees={isLoadingEmployees}
      />
    );
  }

  // Subtitle breadcrumb (đi thẳng từ Trang chủ tới Sản phẩm, không còn mục 'Danh sách' thừa)
  const currentSubTitle = undefined;

  return (
    <div className="flex h-screen bg-slate-100/70 overflow-hidden font-sans">
      
      {/* 1. Left Sidebar matching Image 2 & 3 */}
      <AppSidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        compareCount={compareIds.length}
        showCostPrice={showCostPrice}
        onToggleCostPrice={handleToggleCostPrice}
      />

      {/* 2. Main Right Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Navbar matching Image 2 & 3 */}
        <TopNavbar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          subTitle={currentSubTitle}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onOpenSettings={() => setCurrentTab('settings')}
          onResetData={handleResetData}
          totalProducts={products.length}
          showCostPrice={showCostPrice}
          onToggleCostPrice={handleToggleCostPrice}
          currentUser={currentUser}
          onLogout={handleLogout}
          onSyncEmployees={handleSyncEmployees}
        />

        {/* Scrollable View Area */}
        <main className={`flex-1 min-w-0 ${currentTab === 'compare' ? 'flex flex-col overflow-hidden' : 'overflow-y-auto'}`}>
          {currentTab === 'home' && (
            <HomeView
              onSelectTab={setCurrentTab}
              compareCount={compareIds.length}
              products={products}
              currentUser={currentUser}
            />
          )}

          {currentTab === 'products' && (
            <ProductsView
              products={products}
              onBackToHome={() => setCurrentTab('home')}
              onOpenAddModal={() => {
                setEditingProduct(null);
                setIsFormOpen(true);
              }}
              onEditProduct={prod => {
                setEditingProduct(prod);
                setIsFormOpen(true);
              }}
              onViewDetail={setDetailProduct}
              onDeleteProduct={handleDeleteProduct}
              compareIds={compareIds}
              onSetCompareProducts={ids => setCompareIds(ids)}
              onOpenCompare={() => setCurrentTab('compare')}
              onExportCatalog={handleExportCatalog}
              showCostPrice={showCostPrice}
              onUpdateProducts={handleUpdateProducts}
              onOpenExcelImport={() => setIsExcelImportOpen(true)}
            />
          )}

          {currentTab === 'compare' && (
            <ComparisonMatrix
              products={selectedProductsToCompare}
              allCatalogProducts={products}
              onClose={() => setCurrentTab('products')}
              onRemoveProduct={handleRemoveCompare}
              onAddProduct={handleAddFromMatrix}
              onReorderProducts={handleReorderProducts}
              showCostPrice={showCostPrice}
              isEmbedded={true}
              onSelectQuickCategory={categoryType => {
                const matching = products.filter(p => p.categoryType === categoryType).slice(0, 3);
                setCompareIds(matching.map(m => m.id));
              }}
              onEditProduct={handleEditProductFromMatrix}
            />
          )}

          {currentTab === 'settings' && (
            <SystemView
              onBackToHome={() => setCurrentTab('home')}
              showCostPrice={showCostPrice}
              onToggleCostPrice={handleToggleCostPrice}
              onResetData={handleResetData}
              totalProducts={products.length}
            />
          )}
        </main>
      </div>

      {/* Floating Bottom Dock for Selected Comparison Products (chỉ hiện khi chưa ở trang so sánh) */}
      {currentTab !== 'compare' && !isMatrixOpen && (
        <FloatingCompareDock
          selectedProducts={selectedProductsToCompare}
          onRemoveProduct={handleRemoveCompare}
          onClearAll={handleClearAllCompare}
          onOpenCompareMatrix={() => setIsMatrixOpen(true)}
        />
      )}

      {/* Fullscreen / Modal Comparison Matrix Workspace */}
      {isMatrixOpen && (
        <ComparisonMatrix
          products={selectedProductsToCompare}
          allCatalogProducts={products}
          onClose={() => setIsMatrixOpen(false)}
          onRemoveProduct={handleRemoveCompare}
          onAddProduct={handleAddFromMatrix}
          onReorderProducts={handleReorderProducts}
          showCostPrice={showCostPrice}
          onEditProduct={handleEditProductFromMatrix}
        />
      )}

      {/* Product Quick View Detail Modal */}
      <ProductDetailModal
        product={detailProduct}
        onClose={() => setDetailProduct(null)}
        onToggleCompare={handleToggleCompare}
        isComparing={Boolean(detailProduct && compareIds.includes(detailProduct.id))}
        showCostPrice={showCostPrice}
        onEditProduct={prod => handleEditProductFromMatrix(prod, false)}
        onDeleteProduct={handleDeleteProduct}
      />

      {/* Product Add / Edit Modal */}
      <ProductFormModal
        isOpen={isFormOpen}
        productToEdit={editingProduct}
        initialOpenAiSpec={openFormWithAi}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProduct(null);
          setOpenFormWithAi(false);
        }}
        onSave={handleSaveProduct}
        onOpenExcelImport={() => setIsExcelImportOpen(true)}
      />

      {/* Modal Nhập Dữ Liệu Excel (.xlsx, .xls, .csv) toàn hệ thống */}
      <ExcelImportModal
        isOpen={isExcelImportOpen}
        onClose={() => setIsExcelImportOpen(false)}
        currentProducts={products}
        onImportProducts={handleUpdateProducts}
        showCostPrice={showCostPrice}
      />

      {/* Toast thông báo đồng bộ Google Sheet thời gian thực */}
      {syncToast && (
        <div
          className={`fixed bottom-6 right-6 z-70 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md transition-all animate-in slide-in-from-bottom-3 duration-200 text-sm font-medium ${
            syncToast.type === 'syncing'
              ? 'bg-slate-900/95 text-white border-blue-500/50 shadow-blue-500/10'
              : syncToast.type === 'success'
              ? 'bg-emerald-950/95 text-emerald-200 border-emerald-500/50 shadow-emerald-500/20'
              : 'bg-rose-950/95 text-rose-200 border-rose-500/50 shadow-rose-500/20'
          }`}
        >
          {syncToast.type === 'syncing' && <Loader2 className="w-4 h-4 animate-spin text-blue-400 shrink-0" />}
          {syncToast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {syncToast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
          <span>{syncToast.message}</span>
        </div>
      )}

    </div>
  );
}
