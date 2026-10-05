import React, { useState, useEffect } from 'react';
import { Product, SpecGroup } from '../types/product';
import {
  X,
  Plus,
  Trash2,
  Layers,
  Sparkles,
  Check,
  AlertCircle,
  Key,
  PackagePlus,
  Package,
  Coins,
  PanelRightClose,
  PanelRight,
  PanelRightOpen,
  ImagePlus,
  ShieldCheck,
  Tag,
  FileText,
  Star,
  Save,
  Loader2,
  ExternalLink,
  Upload,
  FileSpreadsheet,
  Copy,
  RefreshCw,
  Bot,
  ArrowRight,
  CheckCheck,
  Eye,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { formatVND, calculateFinancials } from '../utils/pricing';
import {
  parseSpecsWithAI,
  SAMPLE_SPEC_TEXT_SINGLE,
  getSavedGeminiKey,
  saveGeminiKey,
  testGeminiApiKey,
} from '../utils/aiSpecParser';
import { parseProductsFromRawRows, findBestProductSheet } from '../utils/excelParser';
import { findSimilarProducts, SimilarProductResult } from '../utils/aiProductAdvisor';

interface ProductFormModalProps {
  productToEdit: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  initialOpenAiSpec?: boolean;
  onOpenExcelImport?: () => void;
  allProducts?: Product[];
  onAddToCompare?: (productId: string) => void;
}

const SAMPLE_IMAGES = [
  { label: 'Nồi chiên', url: 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?auto=format&fit=crop&w=600&q=80' },
  { label: 'Robot hút bụi', url: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=600&q=80' },
  { label: 'Máy khoan pin', url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80' },
  { label: 'Linh kiện modul', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80' },
];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  productToEdit,
  isOpen,
  onClose,
  onSave,
  initialOpenAiSpec = false,
  onOpenExcelImport,
  allProducts = [],
  onAddToCompare,
}) => {
  // Quản lý bề rộng ngăn bên: 'narrow' (Hẹp), 'standard' (Chuẩn), 'wide' (Rộng)
  const [panelWidth, setPanelWidth] = useState<'narrow' | 'standard' | 'wide'>('standard');

  const handleQuickFillFromExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const data = await f.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        alert('File Excel không có trang tính (Sheet) nào.');
        return;
      }
      const sheetName = findBestProductSheet(workbook);
      const ws = workbook.Sheets[sheetName];
      const rawRows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
      if (!rawRows || rawRows.length < 2) {
        alert('File Excel không có dữ liệu sản phẩm hợp lệ (cần ít nhất 2 dòng).');
        return;
      }
      const extracted = parseProductsFromRawRows(rawRows);
      if (extracted.length === 0) {
        alert('Không tìm thấy thông tin sản phẩm trong file. Vui lòng kiểm tra lại tiêu đề các cột.');
        return;
      }
      if (extracted.length > 1 && onOpenExcelImport) {
        const chooseBulk = window.confirm(
          `File này có ${extracted.length} sản phẩm.\n\n- Nhấn "OK" để chuyển sang bảng Nhập Excel hàng loạt (nạp tất cả ${extracted.length} sản phẩm vào danh mục).\n- Nhấn "Cancel" để chỉ lấy thông tin sản phẩm đầu tiên điền vào form này.`
        );
        if (chooseBulk) {
          onClose();
          onOpenExcelImport();
          return;
        }
      }
      // Điền sản phẩm đầu tiên vào form
      const first = extracted[0];
      if (first.sku) setSku(first.sku);
      if (first.name) setName(first.name);
      if (first.brand) setBrand(first.brand);
      if (first.categoryGroup) setCategoryGroup(first.categoryGroup);
      if (first.categoryType) setCategoryType(first.categoryType);
      if (first.warrantyMonths !== undefined) setWarrantyMonths(first.warrantyMonths);
      if (first.pricing) {
        if (first.pricing.costPrice) setCostPrice(first.pricing.costPrice);
        if (first.pricing.distributorPrice) setDistributorPrice(first.pricing.distributorPrice);
        if (first.pricing.floorPrice) setFloorPrice(first.pricing.floorPrice);
        if (first.pricing.retailPrice) setRetailPrice(first.pricing.retailPrice);
      }
      if (first.description) setDescription(first.description);
      if (first.notes) setNotes(first.notes);
      if (first.tags && first.tags.length > 0) setTagsInput(first.tags.join(', '));
      if (first.specifications && first.specifications.length > 0) setSpecGroups(first.specifications);
      if (first.thumbnail) setThumbnail(first.thumbnail);
      alert(`Đã điền tự động thông tin sản phẩm "${first.name}" (${first.sku}) từ file Excel thành công!`);
    } catch (err: any) {
      alert('Lỗi khi đọc file Excel: ' + (err?.message || 'Không rõ'));
    } finally {
      e.target.value = '';
    }
  };

  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [categoryGroup, setCategoryGroup] = useState('');
  const [categoryType, setCategoryType] = useState('');
  const [brand, setBrand] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [warrantyMonths, setWarrantyMonths] = useState<number | ''>('');
  const [tagsInput, setTagsInput] = useState('');
  const [notes, setNotes] = useState('');
  const [description, setDescription] = useState('');

  // 4 tầng giá
  const [costPrice, setCostPrice] = useState<number | ''>('');
  const [distributorPrice, setDistributorPrice] = useState<number | ''>('');
  const [floorPrice, setFloorPrice] = useState<number | ''>('');
  const [retailPrice, setRetailPrice] = useState<number | ''>('');

  // Specifications
  const [specGroups, setSpecGroups] = useState<SpecGroup[]>([]);

  // AI Spec Extraction States
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAppendMode, setIsAppendMode] = useState(false);
  const [apiKey, setApiKey] = useState(getSavedGeminiKey());
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [aiResultMsg, setAiResultMsg] = useState<{ text: string; success: boolean } | null>(null);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testKeyResult, setTestKeyResult] = useState<{ success: boolean; message: string } | null>(null);

  // Sản phẩm tương tự AI
  const [similarProducts, setSimilarProducts] = useState<SimilarProductResult[]>([]);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);
  const [showSimilarPanel, setShowSimilarPanel] = useState(true);

  const handleFindSimilarProducts = async (explicitTarget?: Partial<Product>) => {
    if (!allProducts || allProducts.length === 0) return;
    setIsLoadingSimilar(true);
    try {
      const base = explicitTarget || productToEdit;
      const target: Partial<Product> = {
        id: base?.id,
        sku: (sku || base?.sku || '').trim(),
        name: (name || base?.name || '').trim(),
        categoryType: (categoryType || base?.categoryType || '').trim(),
        categoryGroup: (categoryGroup || base?.categoryGroup || '').trim(),
        brand: (brand || base?.brand || '').trim(),
        description: description || base?.description || '',
        pricing: {
          costPrice: Number(costPrice) || base?.pricing?.costPrice || 0,
          distributorPrice: Number(distributorPrice) || base?.pricing?.distributorPrice || 0,
          floorPrice: Number(floorPrice) || base?.pricing?.floorPrice || 0,
          retailPrice: Number(retailPrice) || base?.pricing?.retailPrice || 0,
          currency: 'VND',
        },
        specifications: specGroups.length > 0 ? specGroups : base?.specifications || [],
      };
      const results = await findSimilarProducts(target, allProducts, apiKey);
      setSimilarProducts(results);
    } catch (e) {
      console.warn('Lỗi tìm sản phẩm tương tự:', e);
    } finally {
      setIsLoadingSimilar(false);
    }
  };

  const handleCopySpecsFromSimilar = (sim: Product) => {
    if (!sim.specifications || sim.specifications.length === 0) {
      alert('Sản phẩm này chưa có bảng thông số kỹ thuật để sao chép.');
      return;
    }
    const confirm = window.confirm(
      `Sao chép toàn bộ thông số kỹ thuật từ [${sim.sku} - ${sim.name}] sang sản phẩm đang sửa?`
    );
    if (confirm) {
      setSpecGroups(JSON.parse(JSON.stringify(sim.specifications)));
      alert(`Đã sao chép thành công ${sim.specifications.length} nhóm thông số từ ${sim.sku}!`);
    }
  };

  const handleApplyPricingFromSimilar = (sim: Product) => {
    const confirm = window.confirm(
      `Tham khảo 4 tầng giá từ [${sim.sku}]?\n- Giá NPP: ${formatVND(sim.pricing.distributorPrice)}\n- Giá bán lẻ: ${formatVND(sim.pricing.retailPrice)}`
    );
    if (confirm) {
      setDistributorPrice(sim.pricing.distributorPrice);
      setFloorPrice(sim.pricing.floorPrice);
      setRetailPrice(sim.pricing.retailPrice);
      if (sim.pricing.costPrice) setCostPrice(sim.pricing.costPrice);
    }
  };

  useEffect(() => {
    if (productToEdit) {
      setSku(productToEdit.sku);
      setName(productToEdit.name);
      setCategoryGroup(productToEdit.categoryGroup || '');
      setCategoryType(productToEdit.categoryType || '');
      setBrand(productToEdit.brand || '');
      setThumbnail(productToEdit.thumbnail || '');
      setWarrantyMonths(productToEdit.warrantyMonths ?? 12);
      setTagsInput(productToEdit.tags?.join(', ') || '');
      setNotes(productToEdit.notes || '');
      setDescription(productToEdit.description || '');
      setCostPrice(productToEdit.pricing?.costPrice ?? '');
      setDistributorPrice(productToEdit.pricing?.distributorPrice ?? '');
      setFloorPrice(productToEdit.pricing?.floorPrice ?? '');
      setRetailPrice(productToEdit.pricing?.retailPrice ?? '');
      setSpecGroups(Array.isArray(productToEdit.specifications) ? JSON.parse(JSON.stringify(productToEdit.specifications)) : []);
    } else {
      setSku('');
      setName('');
      setCategoryGroup('');
      setCategoryType('');
      setBrand('');
      setThumbnail('');
      setWarrantyMonths('');
      setTagsInput('');
      setNotes('');
      setDescription('');
      setCostPrice('');
      setDistributorPrice('');
      setFloorPrice('');
      setRetailPrice('');
      setSpecGroups([]);
    }
  }, [productToEdit, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setApiKey(getSavedGeminiKey());
      setAiResultMsg(null);
      if (initialOpenAiSpec && productToEdit?.description?.trim()) {
        handleRunAiSpecParse(productToEdit.description.trim());
      }
    }
  }, [isOpen, initialOpenAiSpec]);

  useEffect(() => {
    if (isOpen && allProducts.length > 0) {
      handleFindSimilarProducts(productToEdit || undefined);
    }
  }, [isOpen, productToEdit?.id]);

  if (!isOpen) return null;

  // Live financials preview
  const liveFinancials = calculateFinancials({
    costPrice: Number(costPrice) || 0,
    distributorPrice: Number(distributorPrice) || 0,
    floorPrice: Number(floorPrice) || 0,
    retailPrice: Number(retailPrice) || 0,
    currency: 'VND',
  });

  const handleSaveApiKey = () => {
    saveGeminiKey(apiKey);
    setShowApiKeyInput(false);
    setTestKeyResult(null);
  };

  const handleTestApiKey = async () => {
    if (!apiKey.trim()) return;
    setIsTestingKey(true);
    setTestKeyResult(null);
    try {
      const res = await testGeminiApiKey(apiKey);
      setTestKeyResult(res);
      if (res.success) {
        if (res.cleanedKey) {
          setApiKey(res.cleanedKey);
          saveGeminiKey(res.cleanedKey);
        } else {
          saveGeminiKey(apiKey);
        }
      }
    } catch (e: any) {
      setTestKeyResult({ success: false, message: e?.message || 'Lỗi kiểm tra API Key' });
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleRunAiSpecParse = async (customText?: string) => {
    const textToParse = (typeof customText === 'string' ? customText : description).trim();
    if (!textToParse) return;
    setIsAiLoading(true);
    setAiResultMsg(null);
    try {
      const { groups, usedGemini, error } = await parseSpecsWithAI(textToParse, apiKey);
      if (groups.length === 0) {
        setAiResultMsg({
          text: 'Không tìm thấy thông số nào từ mô tả. Vui lòng kiểm tra lại nội dung.',
          success: false,
        });
        return;
      }

      if (isAppendMode) {
        setSpecGroups(prev => [...prev, ...groups]);
      } else {
        setSpecGroups(groups);
      }

      const totalItems = groups.reduce((acc, g) => acc + g.items.length, 0);
      setAiResultMsg({
        text: usedGemini
          ? `✨ Đã bóc tách thành công ${groups.length} nhóm với ${totalItems} thông số bằng Google Gemini AI!`
          : `Đã phân tích thành công ${groups.length} nhóm với ${totalItems} thông số (Bộ phân tích thông minh Heuristic)${error ? ` - Lưu ý AI: ${error}` : ''}!`,
        success: true,
      });
    } catch (err: any) {
      setAiResultMsg({
        text: 'Có lỗi xảy ra khi phân tích: ' + (err?.message || 'Không rõ'),
        success: false,
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAddSpecGroup = () => {
    setSpecGroups([
      ...specGroups,
      {
        groupName: 'Nhóm thông số mới',
        items: [{ key: '', value: '', isHighlight: false }],
      },
    ]);
  };

  const handleRemoveSpecGroup = (groupIndex: number) => {
    setSpecGroups(specGroups.filter((_, i) => i !== groupIndex));
  };

  const handleAddSpecItem = (groupIndex: number) => {
    const updated = [...specGroups];
    updated[groupIndex].items.push({ key: '', value: '', isHighlight: false });
    setSpecGroups(updated);
  };

  const handleRemoveSpecItem = (groupIndex: number, itemIndex: number) => {
    const updated = [...specGroups];
    updated[groupIndex].items = updated[groupIndex].items.filter((_, i) => i !== itemIndex);
    setSpecGroups(updated);
  };

  const handleUpdateItemKey = (groupIndex: number, itemIndex: number, newKey: string) => {
    const updated = [...specGroups];
    updated[groupIndex].items[itemIndex].key = newKey;
    setSpecGroups(updated);
  };

  const handleUpdateItemValue = (groupIndex: number, itemIndex: number, newValue: string) => {
    const updated = [...specGroups];
    updated[groupIndex].items[itemIndex].value = newValue;
    setSpecGroups(updated);
  };

  const handleToggleItemHighlight = (groupIndex: number, itemIndex: number) => {
    const updated = [...specGroups];
    const cur = updated[groupIndex].items[itemIndex].isHighlight;
    updated[groupIndex].items[itemIndex].isHighlight = !cur;
    setSpecGroups(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku.trim() || !name.trim()) return;

    const parsedTags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => Boolean(t));

    const cleanSku = sku.trim().toUpperCase();

    const updatedProduct: Product = {
      id: cleanSku || (productToEdit ? productToEdit.id : `SP-${Date.now()}`),
      sku: cleanSku,
      name: name.trim(),
      categoryGroup: categoryGroup.trim(),
      categoryType: categoryType.trim(),
      brand: brand.trim(),
      thumbnail: thumbnail.trim(),
      warrantyMonths: warrantyMonths === '' ? 12 : Number(warrantyMonths),
      pricing: {
        costPrice: Number(costPrice) || 0,
        distributorPrice: Number(distributorPrice) || 0,
        floorPrice: Number(floorPrice) || 0,
        retailPrice: Number(retailPrice) || 0,
        currency: 'VND',
      },
      specifications: specGroups.filter(g => g.items.length > 0),
      tags: parsedTags,
      notes: notes.trim(),
      description: description.trim(),
      status: 'active',
      updatedAt: new Date().toISOString().split('T')[0],
    };

    onSave(updatedProduct);
    onClose();
  };

  // Xác định chiều rộng theo panelWidth
  const panelWidthStyle =
    panelWidth === 'narrow'
      ? 'min(540px, 100vw)'
      : panelWidth === 'wide'
      ? 'min(1100px, 100vw)'
      : 'min(768px, -4rem + 100vw)';

  return (
    <>
      {/* Backdrop mờ nền */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-2xs z-50 transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* PANEL BÊN TRÁI: SẢN PHẨM TƯƠNG TỰ (AI GỢI Ý ĐỐI CHIẾU & SAO CHÉP) */}
      {showSimilarPanel && allProducts && allProducts.length > 0 && (
        <aside
          style={{ zIndex: 61 }}
          aria-label="Sản phẩm tương tự AI"
          className="fixed inset-y-0 left-0 hidden md:flex flex-col w-[320px] lg:w-[350px] xl:w-[380px] 2xl:w-[420px] bg-slate-900/95 text-white backdrop-blur-md border-r border-slate-700/80 shadow-2xl animate-in slide-in-from-left duration-200 overflow-hidden"
        >
          {/* Header Panel */}
          <div className="p-3.5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600/30 text-blue-400 flex items-center justify-center border border-blue-500/30">
                <Sparkles className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5 leading-none">
                  Sản phẩm tương tự AI
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300 font-mono">
                    {similarProducts.length}
                  </span>
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Đối chiếu kho & sao chép thông số nhanh
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleFindSimilarProducts}
                disabled={isLoadingSimilar}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Quét lại sản phẩm tương tự bằng AI"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSimilar ? 'animate-spin text-blue-400' : ''}`} />
              </button>
              <button
                type="button"
                onClick={() => setShowSimilarPanel(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Tạm ẩn thanh gợi ý bên trái"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Body: Danh sách sản phẩm tương tự */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {isLoadingSimilar ? (
              <div className="p-8 text-center space-y-2.5">
                <Loader2 className="w-6 h-6 animate-spin text-blue-400 mx-auto" />
                <p className="text-xs text-slate-300 font-medium">
                  Gemini AI đang phân tích danh mục & thông số...
                </p>
                <p className="text-[11px] text-slate-500">
                  Đang quét kho hàng để tìm các sản phẩm cùng phân khúc
                </p>
              </div>
            ) : similarProducts.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <Package className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs">Chưa tìm thấy sản phẩm cùng phân khúc trong kho.</p>
                <button
                  type="button"
                  onClick={handleFindSimilarProducts}
                  className="px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 text-xs font-semibold cursor-pointer"
                >
                  Tìm lại
                </button>
              </div>
            ) : (
              similarProducts.map(({ product: sim, similarityScore, matchReasons }) => {
                const f = calculateFinancials(sim.pricing);
                return (
                  <div
                    key={sim.id}
                    className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 hover:border-blue-500/50 transition-all space-y-2"
                  >
                    {/* Hàng trên: Badge điểm & SKU */}
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-blue-400 bg-blue-950/80 px-1.5 py-0.5 rounded border border-blue-500/30">
                        {sim.sku}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        🔥 {similarityScore}% tương đồng
                      </span>
                    </div>

                    {/* Giữa: Ảnh + Tên */}
                    <div className="flex items-start gap-2">
                      <div className="w-11 h-11 rounded-lg bg-slate-900 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                        <img
                          src={sim.thumbnail}
                          alt={sim.name}
                          loading="lazy"
                          className="max-h-full max-w-full object-contain"
                          onError={e => {
                            (e.currentTarget as HTMLImageElement).src =
                              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Crect width="18" height="18" x="3" y="3" rx="2"/%3E%3Cpath d="M3 9h18"/%3E%3Cpath d="M9 21V9"/%3E%3C/svg%3E';
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="text-xs font-bold text-white line-clamp-2 leading-tight" title={sim.name}>
                          {sim.name}
                        </h5>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1">
                          <span>{sim.brand || sim.categoryType}</span>
                        </div>
                      </div>
                    </div>

                    {/* Lý do AI nhận diện */}
                    <div className="text-[10px] text-slate-300 space-y-0.5 bg-slate-900/60 p-1.5 rounded-lg border border-slate-800">
                      {matchReasons.slice(0, 2).map((r, i) => (
                        <div key={i} className="flex items-center gap-1 text-slate-300">
                          <span className="text-blue-400">•</span>
                          <span className="truncate">{r}</span>
                        </div>
                      ))}
                    </div>

                    {/* Giá tham chiếu */}
                    <div className="grid grid-cols-2 gap-1 text-[10px] pt-1 border-t border-slate-700/60">
                      <div>
                        <span className="text-slate-400 block">Giá NPP:</span>
                        <span className="font-mono font-bold text-blue-300">{formatVND(sim.pricing.distributorPrice)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 block">LN gộp:</span>
                        <span className="font-mono font-bold text-emerald-400">+{f.grossMarginPercent}%</span>
                      </div>
                    </div>

                    {/* Nút tác vụ nhanh */}
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => handleCopySpecsFromSimilar(sim)}
                        className="py-1 px-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors border border-blue-500/30 cursor-pointer"
                        title="Sao chép toàn bộ thông số kỹ thuật của sản phẩm này vào form đang sửa"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Chép thông số</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPricingFromSimilar(sim)}
                        className="py-1 px-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-200 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors border border-slate-600 cursor-pointer"
                        title="Điền mẫu 4 tầng giá của sản phẩm này vào form"
                      >
                        <Coins className="w-3 h-3 text-amber-400" />
                        <span>Tham khảo giá</span>
                      </button>
                    </div>

                    {onAddToCompare && (
                      <button
                        type="button"
                        onClick={() => onAddToCompare(sim.id)}
                        className="w-full py-1 px-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors border border-emerald-500/30 cursor-pointer"
                        title="Đưa sản phẩm tương tự này vào danh sách so sánh đối chiếu"
                      >
                        <Scale className="w-3 h-3 text-emerald-400" />
                        <span>Đưa vào so sánh đối chiếu</span>
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </aside>
      )}

      {/* Ngăn bên Slide-Over Drawer chuẩn ERP */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={productToEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
        tabIndex={-1}
        style={{
          zIndex: 61,
          width: panelWidthStyle,
          transform: 'none',
        }}
        className="fixed inset-y-0 right-0 w-full bg-card shadow-ultra flex flex-col h-[100dvh] border-l border-border/40 outline-none transform-gpu animate-in slide-in-from-right duration-200"
      >
        {/* Phần 1: Header ngăn bên */}
        <div
          className="flex items-center justify-between gap-4 border-b border-border/60 bg-card shrink-0"
          style={{
            paddingTop: 'max(0.5rem, env(safe-area-inset-top, 0px))',
            paddingBottom: '0.5rem',
            paddingLeft: 'max(0.75rem, env(safe-area-inset-left, 0px))',
            paddingRight: 'max(0.75rem, env(safe-area-inset-right, 0px))',
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
              <PackagePlus className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-foreground leading-tight truncate">
                {productToEdit ? 'Chỉnh sửa sản phẩm & Modul' : 'Thêm sản phẩm mới'}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {productToEdit
                  ? 'Cập nhật thông tin chi tiết, 4 tầng giá và thông số kỹ thuật'
                  : 'Thiết lập thông tin sản phẩm và phân tích AI vào hệ thống'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Nút Bật/Tắt Panel Sản phẩm tương tự AI */}
            {allProducts && allProducts.length > 0 && (
              <button
                type="button"
                onClick={() => setShowSimilarPanel(prev => !prev)}
                className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  showSimilarPanel
                    ? 'bg-blue-50 text-blue-700 border border-blue-300 shadow-2xs'
                    : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-border/60'
                }`}
                title={showSimilarPanel ? 'Ẩn thanh gợi ý sản phẩm tương tự bên trái' : 'Hiện thanh gợi ý sản phẩm tương tự AI bên trái'}
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">SP tương tự AI</span>
                {similarProducts.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-600 text-white font-mono">
                    {similarProducts.length}
                  </span>
                )}
              </button>
            )}

            {/* Nhóm nút điều chỉnh bề rộng ngăn bên (Hẹp | Chuẩn | Rộng) */}
            <div
              role="group"
              aria-label="Bề rộng ngăn bên"
              className="flex items-center gap-0.5 shrink-0 rounded-xl border border-border/60 p-0.5"
            >
              <button
                type="button"
                aria-pressed={panelWidth === 'narrow'}
                aria-label="Hẹp"
                title="Bề rộng hẹp (540px)"
                onClick={() => setPanelWidth('narrow')}
                className={`p-2 rounded-lg transition-colors active:scale-90 cursor-pointer ${
                  panelWidth === 'narrow'
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <PanelRightClose className="w-4 h-4 stroke-[2.5px]" aria-hidden="true" />
              </button>

              <button
                type="button"
                aria-pressed={panelWidth === 'standard'}
                aria-label="Chuẩn"
                title="Bề rộng chuẩn (768px)"
                onClick={() => setPanelWidth('standard')}
                className={`p-2 rounded-lg transition-colors active:scale-90 cursor-pointer ${
                  panelWidth === 'standard'
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <PanelRight className="w-4 h-4 stroke-[2.5px]" aria-hidden="true" />
              </button>

              <button
                type="button"
                aria-pressed={panelWidth === 'wide'}
                aria-label="Rộng"
                title="Bề rộng rộng (1100px)"
                onClick={() => setPanelWidth('wide')}
                className={`p-2 rounded-lg transition-colors active:scale-90 cursor-pointer ${
                  panelWidth === 'wide'
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <PanelRightOpen className="w-4 h-4 stroke-[2.5px]" aria-hidden="true" />
              </button>
            </div>

            {/* Nút đóng */}
            <button
              type="button"
              aria-label="Đóng"
              onClick={onClose}
              className="p-2.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors active:scale-90 shrink-0 cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[2.5px]" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Phần 2: Nội dung cuộn chính */}
        <div className="flex-1 overflow-y-auto bg-muted/50 p-4 sm:p-5 custom-scrollbar">
          <div className="max-w-4xl mx-auto">
            <form id="product-form" onSubmit={handleSubmit} className="space-y-4">
              {/* BANNER TẢI FILE EXCEL VÀO SẢN PHẨM THÊM */}
              {!productToEdit && (
                <div className="w-full p-4 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-300/80 shadow-xs flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        Tải thông tin từ file Excel (.xlsx / .csv)
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Tiết kiệm thời gian
                        </span>
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Tải file Excel lên để tự động điền các thông tin vào form này, hoặc nạp hàng loạt vào danh mục sản phẩm.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-bold shadow-2xs transition-all cursor-pointer">
                      <Upload className="w-4 h-4 text-emerald-600" />
                      <span>Chọn file Excel để điền tự động</span>
                      <input
                        type="file"
                        accept=".xlsx, .xls, .csv"
                        onChange={handleQuickFillFromExcel}
                        className="hidden"
                      />
                    </label>

                    {onOpenExcelImport && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenExcelImport();
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>Nhập Excel hàng loạt</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* CARD 1: THÔNG TIN CƠ BẢN & HÌNH ẢNH */}
              <div className="w-full bg-card p-3.5 sm:p-4 md:p-5 rounded-xl border border-border shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pb-2 sm:pb-2.5 border-b border-primary/20">
                  <h4 className="text-xs uppercase tracking-wider flex min-w-0 items-center gap-1.5 sm:gap-2 text-primary font-bold">
                    <Package className="w-3.5 h-3.5" aria-hidden="true" />
                    <span className="truncate">Thông tin cơ bản &amp; Hình ảnh</span>
                  </h4>
                </div>

                {/* Khung tải ảnh tròn Avatar đại diện */}
                <div className="flex flex-col items-center justify-center mb-2">
                  <div className="w-24">
                    <div className="relative group/frame mx-auto w-full">
                      <div
                        role="button"
                        tabIndex={0}
                        title="Ảnh đại diện sản phẩm"
                        className="relative overflow-hidden border-2 transition-all duration-200 mx-auto rounded-full border-dashed cursor-pointer border-border hover:border-primary/40 bg-muted/30 hover:bg-muted/50 aspect-square flex items-center justify-center shadow-2xs"
                      >
                        {thumbnail ? (
                          <img
                            src={thumbnail}
                            alt={name || 'Thumbnail'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-1.5 transition-colors bg-muted text-muted-foreground">
                              <ImagePlus className="w-4 h-4" aria-hidden="true" />
                            </div>
                            <p className="text-xs font-medium transition-colors leading-tight text-muted-foreground">
                              Ảnh đại diện
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Nút chọn nhanh ảnh mẫu */}
                  <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2.5">
                    <span className="text-[11px] text-muted-foreground">Ảnh mẫu:</span>
                    {SAMPLE_IMAGES.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setThumbnail(img.url)}
                        className={`text-[10px] px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                          thumbnail === img.url
                            ? 'border-primary bg-primary/10 text-primary font-semibold'
                            : 'border-border bg-background text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {img.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3.5">
                  {/* Họ tên / Tên sản phẩm */}
                  <div className="w-full sm:col-span-2">
                    <label className="text-xs font-medium leading-none mb-1.5 flex items-center gap-1.5 text-muted-foreground">
                      <span className="text-muted-foreground shrink-0">
                        <Package className="w-3 h-3" />
                      </span>
                      Tên sản phẩm đầy đủ
                      <span className="text-destructive ml-0.5 font-bold">*</span>
                    </label>
                    <input
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="VD: Nồi Chiên Không Dầu Điện Tử 6.5L QuickSteam Pro"
                      className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/40 placeholder:text-muted-foreground/60 placeholder:italic font-medium"
                    />
                  </div>

                  {/* Mã SKU / Modul */}
                  <div className="w-full">
                    <label className="text-xs font-medium leading-none mb-1.5 flex items-center gap-1.5 text-muted-foreground">
                      <span className="text-muted-foreground shrink-0">
                        <Tag className="w-3 h-3" />
                      </span>
                      Mã Modul / SKU
                      <span className="text-destructive ml-0.5 font-bold">*</span>
                    </label>
                    <input
                      required
                      value={sku}
                      onChange={e => setSku(e.target.value.toUpperCase())}
                      placeholder="VD: NC-AF65PRO"
                      className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/40 font-mono font-bold uppercase"
                    />
                  </div>

                  {/* Thương hiệu */}
                  <div className="w-full">
                    <label className="text-xs font-medium leading-none mb-1.5 flex items-center gap-1.5 text-muted-foreground">
                      <span className="text-muted-foreground shrink-0">
                        <Package className="w-3 h-3" />
                      </span>
                      Thương hiệu / Hãng
                    </label>
                    <input
                      value={brand}
                      onChange={e => setBrand(e.target.value)}
                      placeholder="VD: AeroChef, PowerTorq, RoboMaster..."
                      className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/40 placeholder:text-muted-foreground/60 placeholder:italic"
                    />
                  </div>

                  {/* Nhóm sản phẩm */}
                  <div className="w-full">
                    <label className="text-xs font-medium leading-none mb-1.5 flex items-center gap-1.5 text-muted-foreground">
                      <span className="text-muted-foreground shrink-0">
                        <Layers className="w-3 h-3" />
                      </span>
                      Nhóm danh mục
                    </label>
                    <input
                      value={categoryGroup}
                      onChange={e => setCategoryGroup(e.target.value)}
                      placeholder="VD: Điện gia dụng, Dụng cụ cầm tay..."
                      className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/40"
                    />
                  </div>

                  {/* Loại sản phẩm */}
                  <div className="w-full">
                    <label className="text-xs font-medium leading-none mb-1.5 flex items-center gap-1.5 text-muted-foreground">
                      <span className="text-muted-foreground shrink-0">
                        <Layers className="w-3 h-3" />
                      </span>
                      Loại sản phẩm
                    </label>
                    <input
                      value={categoryType}
                      onChange={e => setCategoryType(e.target.value)}
                      placeholder="VD: Nồi chiên không dầu, Robot hút bụi..."
                      className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/40"
                    />
                  </div>

                  {/* Bảo hành (tháng) */}
                  <div className="w-full">
                    <label className="text-xs font-medium leading-none mb-1.5 flex items-center gap-1.5 text-muted-foreground">
                      <span className="text-muted-foreground shrink-0">
                        <ShieldCheck className="w-3 h-3" />
                      </span>
                      Thời hạn bảo hành (tháng)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={warrantyMonths}
                      placeholder="12"
                      onChange={e => setWarrantyMonths(e.target.value === '' ? '' : Number(e.target.value))}
                      className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/40"
                    />
                  </div>

                  {/* Thẻ tag */}
                  <div className="w-full">
                    <label className="text-xs font-medium leading-none mb-1.5 flex items-center gap-1.5 text-muted-foreground">
                      <span className="text-muted-foreground shrink-0">
                        <Tag className="w-3 h-3" />
                      </span>
                      Nhãn / Tags (cách nhau dấu phẩy)
                    </label>
                    <input
                      value={tagsInput}
                      onChange={e => setTagsInput(e.target.value)}
                      placeholder="VD: Bán chạy, Công nghệ mới, Hàng hot"
                      className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/40 placeholder:text-muted-foreground/60 placeholder:italic"
                    />
                  </div>

                  {/* URL ảnh trực tiếp */}
                  <div className="w-full sm:col-span-2">
                    <label className="text-xs font-medium leading-none mb-1.5 flex items-center gap-1.5 text-muted-foreground">
                      <span className="text-muted-foreground shrink-0">
                        <ImagePlus className="w-3 h-3" />
                      </span>
                      Đường dẫn URL hình ảnh sản phẩm
                    </label>
                    <input
                      type="url"
                      value={thumbnail}
                      onChange={e => setThumbnail(e.target.value)}
                      placeholder="https://..."
                      className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/40 placeholder:text-muted-foreground/60 placeholder:italic font-mono text-[11px]"
                    />
                  </div>

                  {/* Mô tả sản phẩm & Nút bóc tách AI tích hợp trực tiếp */}
                  <div className="w-full sm:col-span-2 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="text-xs font-semibold leading-none flex items-center gap-1.5 text-foreground">
                        <span className="text-muted-foreground shrink-0">
                          <FileText className="w-3.5 h-3.5" />
                        </span>
                        <span>Mô tả sản phẩm &amp; Thông số kỹ thuật thô</span>
                      </label>

                      <div className="flex items-center gap-2">
                        {/* API status badge */}
                        {apiKey ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold border border-emerald-500/30">
                            ✨ Gemini AI
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 text-[10px] font-semibold border border-blue-500/30">
                            ⚡ AI Heuristic
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                          className="text-[11px] text-primary hover:underline flex items-center gap-0.5 font-medium cursor-pointer"
                        >
                          <Key className="w-3 h-3" />
                          {apiKey ? 'Sửa Key' : 'Cấu hình Key'}
                        </button>

                        {/* NÚT BẮT ĐẦU BÓC TÁCH AI ĐƯỢC ĐẶT TRỰC TIẾP Ở ĐÂY */}
                        <button
                          type="button"
                          disabled={isAiLoading || !description.trim()}
                          onClick={() => handleRunAiSpecParse()}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer ${
                            isAiLoading || !description.trim()
                              ? 'bg-muted-foreground/30 text-muted-foreground cursor-not-allowed'
                              : 'bg-primary hover:bg-primary/90 text-primary-foreground active:scale-95'
                          }`}
                        >
                          {isAiLoading ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Đang bóc tách...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Bắt đầu bóc tách AI</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {showApiKeyInput && (
                      <div className="p-2.5 bg-muted/40 rounded-xl border border-border space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground text-[11px]">
                            Google Gemini API Key:
                          </span>
                          <a
                            href="https://aistudio.google.com/app/apikey"
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
                          >
                            Lấy Key miễn phí <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="password"
                            value={apiKey}
                            onChange={e => {
                              setApiKey(e.target.value);
                              setTestKeyResult(null);
                            }}
                            placeholder="AIzaSy..."
                            className="flex-1 px-2.5 py-1 text-xs font-mono rounded-lg border border-border bg-background text-foreground"
                          />
                          <button
                            type="button"
                            onClick={handleTestApiKey}
                            disabled={isTestingKey || !apiKey.trim()}
                            className="px-2.5 py-1 bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50 rounded-lg font-semibold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            {isTestingKey ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                            Kiểm tra
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveApiKey}
                            className="px-3 py-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-semibold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Check className="w-3 h-3" />
                            Lưu
                          </button>
                        </div>
                        {testKeyResult && (
                          <div
                            className={`p-1.5 rounded text-[11px] flex items-center gap-1.5 ${
                              testKeyResult.success
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                            }`}
                          >
                            {testKeyResult.success ? <Check className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                            <span>{testKeyResult.message}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <textarea
                      rows={4}
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Dán nội dung mô tả, brochure hoặc thông số kỹ thuật vào đây... VD:
Model: LK-1068
Chất liệu: Inox 304
Điện áp: 220-240V
Dung tích: 1.7L
Công suất: 1850-2200W..."
                      className="flex w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/40 placeholder:text-muted-foreground/60 leading-relaxed font-mono"
                    />

                    {/* Dưới textarea: tùy chọn gộp và thông báo kết quả */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <label className="flex items-center gap-2 text-muted-foreground cursor-pointer select-none text-[11px]">
                        <input
                          type="checkbox"
                          checked={isAppendMode}
                          onChange={e => setIsAppendMode(e.target.checked)}
                          className="w-3.5 h-3.5 rounded text-primary border-border focus:ring-primary"
                        />
                        <span>Gộp thêm vào danh sách thông số bên dưới (không ghi đè)</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setDescription(SAMPLE_SPEC_TEXT_SINGLE)}
                        className="text-[11px] text-primary hover:underline font-medium cursor-pointer"
                      >
                        Dán mẫu thử
                      </button>
                    </div>

                    {aiResultMsg && (
                      <div
                        className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                          aiResultMsg.success
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {aiResultMsg.success ? (
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        )}
                        <span>{aiResultMsg.text}</span>
                      </div>
                    )}
                  </div>

                  {/* Ghi chú chính sách */}
                  <div className="w-full sm:col-span-2">
                    <label className="text-xs font-medium leading-none mb-1.5 flex items-center gap-1.5 text-muted-foreground">
                      <span className="text-muted-foreground shrink-0">
                        <FileText className="w-3 h-3" />
                      </span>
                      Ghi chú chính sách &amp; bán hàng
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Chiết khấu thêm 3% cho đơn trên 50 bộ..."
                      className="flex w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/40 placeholder:text-muted-foreground/60 placeholder:italic"
                    />
                  </div>
                </div>
              </div>

              {/* CARD 2: CƠ CẤU 4 TẦNG GIÁ & TÀI CHÍNH */}
              <div className="w-full bg-card p-3.5 sm:p-4 md:p-5 rounded-xl border border-border shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pb-2 sm:pb-2.5 border-b border-primary/20">
                  <h4 className="text-xs uppercase tracking-wider flex min-w-0 items-center gap-1.5 sm:gap-2 text-primary font-bold">
                    <Coins className="w-3.5 h-3.5" aria-hidden="true" />
                    <span className="truncate">Cơ cấu 4 tầng giá (VND)</span>
                  </h4>
                  <div className="text-xs font-mono font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    LN gộp: +{liveFinancials.grossMarginPercent}% ({formatVND(liveFinancials.grossProfit)})
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* 1. Giá nhập */}
                  <div className="w-full">
                    <label className="text-xs font-medium leading-none mb-1.5 block text-emerald-700 dark:text-emerald-400">
                      1. Giá nhập (Gốc)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={costPrice}
                      placeholder="0"
                      onChange={e => setCostPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      className="flex h-10 w-full rounded-lg border border-emerald-300 dark:border-emerald-700 bg-emerald-500/5 px-3 py-2 text-xs font-mono font-bold text-emerald-800 dark:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20"
                    />
                  </div>

                  {/* 2. Giá NPP */}
                  <div className="w-full">
                    <label className="text-xs font-medium leading-none mb-1.5 block text-blue-700 dark:text-blue-400">
                      2. Giá NPP (Đại lý)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={distributorPrice}
                      placeholder="0"
                      onChange={e => setDistributorPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      className="flex h-10 w-full rounded-lg border border-blue-300 dark:border-blue-700 bg-blue-500/5 px-3 py-2 text-xs font-mono font-bold text-blue-900 dark:text-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20"
                    />
                  </div>

                  {/* 3. Giá sàn */}
                  <div className="w-full">
                    <label className="text-xs font-medium leading-none mb-1.5 block text-amber-700 dark:text-amber-400">
                      3. Giá sàn
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={floorPrice}
                      placeholder="0"
                      onChange={e => setFloorPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      className="flex h-10 w-full rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-500/5 px-3 py-2 text-xs font-mono font-bold text-amber-900 dark:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/20"
                    />
                  </div>

                  {/* 4. Giá bán lẻ */}
                  <div className="w-full">
                    <label className="text-xs font-medium leading-none mb-1.5 block text-foreground font-semibold">
                      4. Giá bán lẻ niêm yết
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={retailPrice}
                      placeholder="0"
                      onChange={e => setRetailPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-mono font-bold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                    />
                  </div>
                </div>

                {/* Băng đo tài chính trực quan */}
                <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground font-mono">
                  <div>
                    Chiết khấu sàn:{' '}
                    <strong className="text-foreground">{liveFinancials.discountBufferPercent}%</strong>
                  </div>
                  <div>
                    Biên LN bán lẻ:{' '}
                    <strong className="text-emerald-600 font-bold">
                      +{liveFinancials.retailMarginPercent}% ({formatVND(liveFinancials.retailGross)})
                    </strong>
                  </div>
                </div>
              </div>

              {/* CARD 3: THÔNG SỐ KỸ THUẬT THEO NHÓM */}
              <div className="w-full bg-card p-3.5 sm:p-4 md:p-5 rounded-xl border border-border shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pb-2 sm:pb-2.5 border-b border-primary/20">
                  <h4 className="text-xs uppercase tracking-wider flex min-w-0 items-center gap-1.5 sm:gap-2 text-primary font-bold">
                    <Layers className="w-3.5 h-3.5" aria-hidden="true" />
                    <span className="truncate">
                      Thông số kỹ thuật ({specGroups.length} nhóm)
                    </span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddSpecGroup}
                    className="text-xs font-semibold text-primary hover:bg-primary/10 px-2.5 py-1 rounded-lg flex items-center gap-1 border border-primary/30 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Thêm nhóm</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {specGroups.length === 0 ? (
                    <div className="text-center py-6 px-4 border border-dashed border-border rounded-xl bg-muted/20">
                      <p className="text-xs text-muted-foreground mb-3 font-medium">
                        Chưa có nhóm thông số kỹ thuật nào. Bạn có thể dán nội dung vào ô <strong>Mô tả sản phẩm</strong> ở trên và bấm <strong>Bắt đầu bóc tách AI</strong>, hoặc tạo nhóm thủ công.
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={handleAddSpecGroup}
                          className="text-xs font-semibold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/30 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Tạo nhóm thủ công</span>
                        </button>
                        {description.trim() && (
                          <button
                            type="button"
                            disabled={isAiLoading}
                            onClick={() => handleRunAiSpecParse()}
                            className="text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary/90 px-3 py-1.5 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Bóc tách từ Mô tả ở trên</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    specGroups.map((group, gIdx) => (
                      <div
                        key={gIdx}
                        className="border border-border rounded-xl p-3 bg-muted/20 space-y-2.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={group.groupName}
                            onChange={e => {
                              const updated = [...specGroups];
                              updated[gIdx].groupName = e.target.value;
                              setSpecGroups(updated);
                            }}
                            placeholder="Tên nhóm thông số..."
                            className="font-bold text-xs text-foreground bg-background px-2.5 py-1 rounded-md border border-border focus:outline-none focus:border-primary flex-1 max-w-xs"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleAddSpecItem(gIdx)}
                              className="text-xs text-primary hover:underline font-medium cursor-pointer"
                            >
                              + Thêm dòng
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveSpecGroup(gIdx)}
                              title="Xóa nhóm này"
                              className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Danh sách thuộc tính & giá trị */}
                        <div className="space-y-1.5">
                          {group.items.map((item, iIdx) => (
                            <div key={iIdx} className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="Tên thuộc tính (vd: Công suất)"
                                value={item.key}
                                onChange={e => handleUpdateItemKey(gIdx, iIdx, e.target.value)}
                                className="w-1/3 px-2.5 py-1.5 text-xs rounded-md border border-border bg-background text-foreground"
                              />
                              <input
                                type="text"
                                placeholder="Giá trị (vd: 1800W)"
                                value={item.value}
                                onChange={e => handleUpdateItemValue(gIdx, iIdx, e.target.value)}
                                className="flex-1 px-2.5 py-1.5 text-xs rounded-md border border-border bg-background text-foreground font-medium"
                              />
                              <button
                                type="button"
                                onClick={() => handleToggleItemHighlight(gIdx, iIdx)}
                                title={item.isHighlight ? 'Bỏ nổi bật' : 'Đánh dấu nổi bật'}
                                className={`p-1.5 rounded transition-colors cursor-pointer ${
                                  item.isHighlight
                                    ? 'text-amber-500 bg-amber-500/10'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                              >
                                <Star className={`w-3.5 h-3.5 ${item.isHighlight ? 'fill-current' : ''}`} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveSpecItem(gIdx, iIdx)}
                                title="Xóa dòng này"
                                className="text-muted-foreground hover:text-destructive p-1.5 rounded transition-colors cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </form>
          </div>
        </div>

        {/* Phần 3: Footer chân trang dính */}
        <div
          className="bg-card border-t border-border/60 flex flex-col-reverse sm:flex-row items-center shadow-sticky shrink-0 w-full gap-2"
          style={{
            paddingTop: '0.5rem',
            paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))',
            paddingLeft: 'max(0.75rem, env(safe-area-inset-left, 0px))',
            paddingRight: 'max(0.75rem, env(safe-area-inset-right, 0px))',
          }}
        >
          <div className="flex items-center justify-between w-full gap-2 flex-wrap">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium ring-offset-background transition-colors border bg-background hover:bg-muted hover:text-foreground h-8 px-3 text-xs border-border text-muted-foreground cursor-pointer"
            >
              Hủy
            </button>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                form="product-form"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium ring-offset-background transition-colors h-8 px-3.5 text-xs bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                {productToEdit ? 'Cập nhật' : 'Thêm'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
