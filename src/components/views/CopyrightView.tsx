import React from 'react';
import { FileCheck, ArrowLeft, ShieldCheck, Cpu, Code2, Globe } from 'lucide-react';

interface CopyrightViewProps {
  onBackToHome: () => void;
}

export const CopyrightView: React.FC<CopyrightViewProps> = ({ onBackToHome }) => {
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBackToHome}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay lại</span>
        </button>
        <h2 className="text-base font-bold text-slate-900">
          Thông Tin Bản Quyền & Hệ Thống
        </h2>
      </div>

      {/* Main card matching Image 2 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-blue-500/20">
            ERP
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              ERP ProCompare &bull; Hệ Thống So Sánh Bảng Giá & Thông Số Kỹ Thuật Đa Tầng
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Phiên bản 2.5 Enterprise B2B Matrix &bull; Phát hành 2026
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-700 block">Đơn vị sở hữu bản quyền</span>
            <div className="text-slate-900 font-semibold">Tập đoàn 5FEDU Enterprise</div>
            <div className="text-slate-500 text-[11px]">Người đại diện: Lê Minh Công - Tổng Giám Đốc</div>
            <div className="text-slate-500 text-[11px]">Email liên hệ: admin@5fedu.com</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-700 block">Tiêu chuẩn nghiệp vụ áp dụng</span>
            <div className="text-emerald-700 font-semibold">● Mô hình 4 Tầng Giá B2B chuẩn hóa</div>
            <div className="text-slate-500 text-[11px]">Bảo vệ biên lợi nhuận Nhà Phân Phối (NPP) & Đại lý</div>
            <div className="text-slate-500 text-[11px]">Ma trận so sánh thuộc tính động không giới hạn</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 text-xs space-y-1">
          <div className="font-bold text-indigo-950 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-600" />
            <span>Tích Hợp Trí Tuệ Nhân Tạo Google Gemini Flash</span>
          </div>
          <p className="text-indigo-800 text-[11px] leading-relaxed">
            Hệ thống ứng dụng công nghệ trích xuất ngữ nghĩa AI từ Google DeepMind để tự động phân tích và cấu trúc hóa bảng thông số kỹ thuật đa tầng từ văn bản thô.
          </p>
        </div>

        <div className="text-[11px] text-slate-400 text-center pt-2">
          &copy; 2026 ProCompare Enterprise ERP. Bảo lưu mọi quyền theo quy định của pháp luật.
        </div>
      </div>

    </div>
  );
};
