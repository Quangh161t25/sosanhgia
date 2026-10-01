import React, { useState, useEffect } from 'react';
import { Product } from '../types/product';
import {
  X,
  Sparkles,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Key,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  RotateCcw
} from 'lucide-react';
import {
  parseMultiProductsWithAI,
  SAMPLE_SPEC_TEXT_MULTI,
  getSavedGeminiKey,
  saveGeminiKey
} from '../utils/aiSpecParser';
import { formatVND } from '../utils/pricing';

interface MultiProductAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportProducts: (newProducts: Product[], openCompareNow: boolean) => void;
}

export const MultiProductAIModal: React.FC<MultiProductAIModalProps> = ({
  isOpen,
  onClose,
  onImportProducts,
}) => {
  if (!isOpen) return null;

  const [rawText, setRawText] = useState('');
  const [apiKey, setApiKey] = useState(getSavedGeminiKey());
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [usedGemini, setUsedGemini] = useState<boolean | null>(null);
  const [extractedProducts, setExtractedProducts] = useState<Partial<Product>[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [expandedIndices, setExpandedIndices] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setApiKey(getSavedGeminiKey());
  }, [isOpen]);

  const handleSaveKey = () => {
    saveGeminiKey(apiKey);
    setShowKeyConfig(false);
  };

  const handleLoadSample = () => {
    setRawText(SAMPLE_SPEC_TEXT_MULTI);
  };

  const handleAnalyze = async () => {
    if (!rawText.trim()) return;
    setIsAnalyzing(true);
    setExtractedProducts([]);
    try {
      const result = await parseMultiProductsWithAI(rawText, apiKey);
      setExtractedProducts(result.products);
      setUsedGemini(result.usedGemini);
      // Mặc định chọn tất cả sản phẩm vừa bóc tách
      setSelectedIndices(result.products.map((_, i) => i));
      // Mở rộng sản phẩm đầu tiên
      setExpandedIndices({ 0: true });
    } catch (err) {
      console.error('Lỗi phân tích đa sản phẩm:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleSelect = (index: number) => {
    setSelectedIndices(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const toggleExpand = (index: number) => {
    setExpandedIndices(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleConfirmImport = (openCompareNow: boolean) => {
    const toImport = extractedProducts
      .filter((_, idx) => selectedIndices.includes(idx))
      .map((p, i) => {
        return {
          id: p.id || `prod-ai-${Date.now()}-${i}`,
          sku: p.sku || `MD-${Math.floor(1000 + Math.random() * 9000)}`,
          name: p.name || `Sản phẩm ${i + 1}`,
          categoryGroup: p.categoryGroup || 'Thiết bị thông minh',
          categoryType: p.categoryType || 'Sản phẩm',
          brand: p.brand || '',
          thumbnail:
            p.thumbnail ||
            'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?auto=format&fit=crop&w=600&q=80',
          warrantyMonths: p.warrantyMonths || 12,
          pricing: p.pricing || {
            costPrice: 1000000,
            distributorPrice: 1350000,
            floorPrice: 1650000,
            retailPrice: 2100000,
            currency: 'VND',
          },
          specifications: p.specifications || [],
          tags: p.tags || ['Nhập từ AI'],
          notes: p.notes || 'Trích xuất tự động bằng AI',
          status: 'active' as const,
          updatedAt: new Date().toISOString().split('T')[0],
        } as Product;
      });

    if (toImport.length > 0) {
      onImportProducts(toImport, openCompareNow);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <Sparkles className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  AI Bóc Tách & Lập Bảng So Sánh Nhiều Sản Phẩm
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full border border-blue-400/30">
                  Hybrid AI
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Dán văn bản catalogue hoặc đoạn so sánh chứa nhiều sản phẩm để AI tự động trích xuất thông số theo nhóm
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* Engine Status Bar & API Key Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Động cơ xử lý:</span>
              {apiKey ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-300">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  Google Gemini AI (Flash)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold border border-blue-300">
                  ⚡ AI Thông Minh Cục Bộ (Không cần API key)
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowKeyConfig(!showKeyConfig)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{apiKey ? 'Đổi Gemini API Key' : 'Cấu hình Gemini API Key'}</span>
            </button>
          </div>

          {/* API Key Input Collapsible */}
          {showKeyConfig && (
            <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-900">Google Gemini API Key</span>
                <span className="text-[11px] text-blue-600">Lưu an toàn trên trình duyệt của bạn</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="Dán mã API key (vd: AIzaSy...)"
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-blue-300 bg-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleSaveKey}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  Lưu
                </button>
              </div>
            </div>
          )}

          {/* Input Textarea Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                Văn bản đặc tính kỹ thuật nhiều sản phẩm
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200 transition-colors"
                >
                  Điền văn bản mẫu (3 nồi chiên)
                </button>
                {rawText && (
                  <button
                    type="button"
                    onClick={() => setRawText('')}
                    className="text-xs text-slate-400 hover:text-slate-600 p-1"
                    title="Xóa trắng"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <textarea
              rows={8}
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              placeholder="Dán toàn bộ văn bản vào đây... Ví dụ:
Sản phẩm 1: Nồi chiên không dầu Lock&Lock 5.2L
- Mã SKU: EJF-357
- Giá bán: 2.450.000đ
- Công suất: 1800W
- Dung tích: 5.2 Lít

Sản phẩm 2: Nồi chiên không dầu Philips 7.3L
- Mã SKU: HD-9650
- Giá bán: 6.890.000đ
- Công suất: 2200W
- Dung tích: 7.3 Lít..."
              className="w-full p-3.5 text-xs font-mono rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all leading-relaxed"
            />
          </div>

          {/* Action Analyze Button */}
          <div className="flex items-center justify-between pt-1">
            <div className="text-[11px] text-slate-500">
              Hệ thống tự động gom thông số theo các nhóm chuẩn (Vận hành, Kích thước, Công nghệ, Bảo hành)
            </div>
            <button
              type="button"
              disabled={isAnalyzing || !rawText.trim()}
              onClick={handleAnalyze}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-md transition-all ${
                isAnalyzing || !rawText.trim()
                  ? 'bg-slate-300 cursor-not-allowed text-slate-500 shadow-none'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/25 active:scale-98'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>AI Đang Phân Tích & Gom Nhóm...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Phân Tích & Bóc Tách Hàng Loạt</span>
                </>
              )}
            </button>
          </div>

          {/* Analysis Results */}
          {extractedProducts.length > 0 && (
            <div className="pt-4 border-t border-slate-200 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Đã bóc tách thành công {extractedProducts.length} sản phẩm
                  </h3>
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {usedGemini ? 'Google Gemini AI' : 'Bộ phân tích Heuristic'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedIndices(extractedProducts.map((_, i) => i))}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Chọn tất cả
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => setSelectedIndices([])}
                    className="text-slate-500 hover:underline font-medium"
                  >
                    Bỏ chọn
                  </button>
                </div>
              </div>

              {/* Product Cards List */}
              <div className="space-y-3">
                {extractedProducts.map((prod, idx) => {
                  const isSelected = selectedIndices.includes(idx);
                  const isExpanded = expandedIndices[idx];
                  const totalSpecs = prod.specifications?.reduce((acc, g) => acc + g.items.length, 0) || 0;

                  return (
                    <div
                      key={idx}
                      className={`border rounded-xl transition-all ${
                        isSelected
                          ? 'border-blue-300 bg-blue-50/20 shadow-xs'
                          : 'border-slate-200 bg-white opacity-70'
                      }`}
                    >
                      {/* Product Header Row */}
                      <div className="p-3.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(idx)}
                            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded border border-blue-200">
                                {prod.sku}
                              </span>
                              <h4 className="text-xs font-bold text-slate-900">{prod.name}</h4>
                              {prod.brand && (
                                <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                  {prod.brand}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                              <span>Giá bán lẻ: <strong className="text-slate-800">{formatVND(prod.pricing?.retailPrice || 0)}</strong></span>
                              <span>•</span>
                              <span>Giá NPP: <strong className="text-blue-700">{formatVND(prod.pricing?.distributorPrice || 0)}</strong></span>
                              <span>•</span>
                              <span className="text-emerald-700 font-semibold">{prod.specifications?.length || 0} nhóm ({totalSpecs} thông số)</span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleExpand(idx)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Expanded Specification Details */}
                      {isExpanded && prod.specifications && (
                        <div className="px-4 pb-4 pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white/70">
                          {prod.specifications.map((group, gIdx) => (
                            <div key={gIdx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1 text-xs">
                              <span className="font-bold text-[11px] text-slate-700 uppercase tracking-wider block">
                                {group.groupName}
                              </span>
                              <div className="space-y-1 divide-y divide-slate-100">
                                {group.items.map((item, iIdx) => (
                                  <div key={iIdx} className="flex justify-between pt-1 text-[11px]">
                                    <span className="text-slate-500">{item.key}:</span>
                                    <span className="font-semibold text-slate-800 text-right">{item.value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Đóng
          </button>

          {extractedProducts.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={selectedIndices.length === 0}
                onClick={() => handleConfirmImport(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 transition-colors shadow-xs"
              >
                Thêm vào danh mục ({selectedIndices.length})
              </button>

              <button
                type="button"
                disabled={selectedIndices.length === 0}
                onClick={() => handleConfirmImport(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all"
              >
                <span>Nhập & So Sánh Ngay</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
