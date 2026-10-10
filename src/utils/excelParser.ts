import { Product, SpecGroup } from '../types/product';

/**
 * Phân tích số tiền linh hoạt theo mọi định dạng thực tế của Việt Nam:
 * - Số nguyên/thực: 500000 -> 500000
 * - Định dạng phân cách: "500.000", "500,000", "500 000"
 * - Định dạng có đơn vị: "500.000 ₫", "500.000 đ", "500k", "1.5tr", "1.5 triệu"
 */
export function parseExcelPrice(val: any): number {
  if (typeof val === 'number') {
    return isNaN(val) ? 0 : Math.round(val);
  }
  if (!val) return 0;
  let s = String(val).trim();
  if (!s) return 0;

  // Bỏ ký hiệu tiền tệ và khoảng trắng thừa
  s = s.replace(/[₫đVNDvnd\s]/gi, '').trim();

  // Dạng viết tắt: 321k -> 321000
  if (/k$/i.test(s)) {
    const num = parseFloat(s.replace(/k$/i, '').replace(',', '.'));
    return isNaN(num) ? 0 : Math.round(num * 1000);
  }

  // Dạng viết tắt: 1.5tr / 1.5 triệu -> 1500000
  if (/tr(?:i[eệ]u)?$/i.test(s)) {
    const num = parseFloat(s.replace(/tr(?:i[eệ]u)?$/i, '').replace(',', '.'));
    return isNaN(num) ? 0 : Math.round(num * 1000000);
  }

  // Phân cách hàng nghìn bằng dấu chấm hoặc dấu phẩy
  if (s.includes('.') && s.includes(',')) {
    if (s.indexOf('.') < s.indexOf(',')) {
      // Dạng chuẩn US: 1,500.50 -> 1500
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      // Dạng chuẩn VN: 1.500,50 -> 1500
      s = s.replace(/,/g, '');
    }
  } else if (/^\d{1,3}(\.\d{3})+$/.test(s) || /^\d+\.\d{3}$/.test(s)) {
    s = s.replace(/\./g, '');
  } else if (/^\d{1,3}(,\d{3})+$/.test(s) || /^\d+,\d{3}$/.test(s)) {
    s = s.replace(/,/g, '');
  } else {
    s = s.replace(/[^\d.-]/g, '');
  }

  const result = Number(s);
  return isNaN(result) ? 0 : Math.round(result);
}

/**
 * Chuyển chuỗi thông số kỹ thuật dạng text sang SpecGroup[]
 * Hỗ trợ các định dạng:
 * 1. [Tên nhóm] Khóa: Giá trị | Khóa 2: Giá trị 2
 * 2. Khóa: Giá trị (mỗi dòng một cặp)
 */
export function parseSpecsTextToGroups(text: string): SpecGroup[] {
  if (!text) return [];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const groups: SpecGroup[] = [];
  let currentGroup: SpecGroup = { groupName: 'Thông số kỹ thuật', items: [] };

  for (const line of lines) {
    const groupMatch = line.match(/^\[(.*?)\]\s*(.*)$/);
    if (groupMatch) {
      if (currentGroup.items.length > 0) {
        groups.push(currentGroup);
      }
      currentGroup = { groupName: groupMatch[1].trim(), items: [] };
      const rest = groupMatch[2].trim();
      if (rest) {
        const parts = rest.split('|');
        for (const part of parts) {
          const colonIdx = part.indexOf(':');
          if (colonIdx > 0) {
            currentGroup.items.push({
              key: part.substring(0, colonIdx).trim(),
              value: part.substring(colonIdx + 1).trim(),
              isHighlight: /công suất|dung tích|lực hút|lực siết|pin|kích thước|khối lượng/i.test(part),
            });
          }
        }
      }
    } else {
      const colonIdx = line.indexOf(':');
      if (colonIdx > 0 && colonIdx < 50) {
        currentGroup.items.push({
          key: line.substring(0, colonIdx).trim(),
          value: line.substring(colonIdx + 1).trim(),
          isHighlight: /công suất|dung tích|lực hút|lực siết|pin|kích thước|khối lượng/i.test(line),
        });
      }
    }
  }

  if (currentGroup.items.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
}

/**
 * Tìm dòng tiêu đề (header) thực tế trong bảng tính.
 * Không bị nhầm lẫn nếu có dòng tên công ty / tiêu đề báo cáo ở các dòng 1, 2, 3 đầu tiên.
 */
export function findHeaderRowIndex(rawRows: any[][]): number {
  if (!rawRows || rawRows.length === 0) return 0;

  const headerKeywords = [
    'sku', 'mã', 'model', 'modul', 'mã sp', 'mã hàng',
    'tên', 'name', 'sản phẩm', 'hàng hóa', 'mặt hàng', 'diễn giải',
    'đơn giá', 'giá bán', 'giá nhập', 'giá npp', 'giá sàn', 'giá lẻ', 'giá', 'cost', 'price',
    'thương hiệu', 'brand', 'hãng', 'nhãn hiệu',
    'nhóm', 'loại', 'ngành', 'danh mục',
    'bảo hành', 'bh',
    'thông số', 'quy cách', 'kỹ thuật', 'mô tả', 'ảnh'
  ];

  let bestIndex = 0;
  let maxScore = 0;

  const checkLimit = Math.min(rawRows.length, 25);
  for (let r = 0; r < checkLimit; r++) {
    const row = rawRows[r];
    if (!row || !Array.isArray(row)) continue;

    let score = 0;
    for (const cell of row) {
      if (!cell) continue;
      const str = String(cell).toLowerCase().trim();
      if (headerKeywords.some(kw => str.includes(kw))) {
        score++;
      }
    }

    if (score > maxScore) {
      maxScore = score;
      bestIndex = r;
    }
  }

  // Nếu tìm được dòng có ít nhất 2 cột khớp từ khóa sản phẩm, chọn dòng đó
  return maxScore >= 2 ? bestIndex : 0;
}

/**
 * Tìm trang tính (Sheet) phù hợp nhất trong file Excel
 */
export function findBestProductSheet(workbook: any): string {
  if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
    return '';
  }

  // Ưu tiên sheet có tên chứa từ khóa sản phẩm
  for (const sName of workbook.SheetNames) {
    const lower = sName.toLowerCase().trim();
    if (
      lower.includes('sản phẩm') ||
      lower.includes('san pham') ||
      lower.includes('danh mục') ||
      lower.includes('danh muc') ||
      lower.includes('báo giá') ||
      lower.includes('bao gia') ||
      lower.includes('product') ||
      lower.includes('data') ||
      lower.includes('hàng hóa') ||
      lower.includes('hang hoa')
    ) {
      return sName;
    }
  }

  // Fallback: chọn sheet đầu tiên
  return workbook.SheetNames[0];
}

/**
 * Phân tích danh sách sản phẩm từ mảng 2 chiều rawRows của SheetJS
 */
export function parseProductsFromRawRows(rawRows: any[][]): Product[] {
  if (!rawRows || rawRows.length < 2) return [];

  const headerIdx = findHeaderRowIndex(rawRows);
  const headerRow = rawRows[headerIdx] || [];

  const colMap = {
    stt: -1,
    sku: -1,
    name: -1,
    brand: -1,
    group: -1,
    type: -1,
    warranty: -1,
    cost: -1,
    npp: -1,
    floor: -1,
    retail: -1,
    img: -1,
    tags: -1,
    notes: -1,
    desc: -1,
    specs: -1,
    status: -1,
  };

  headerRow.forEach((colHeader: any, idx: number) => {
    if (!colHeader) return;
    const h = String(colHeader).toLowerCase().trim();

    // Cột STT (bỏ qua, không gán cho SKU)
    if (h === 'stt' || h === 'no' || h === 'no.' || h === 'số tt' || h === 'stt.') {
      colMap.stt = idx;
      return;
    }

    // SKU / Mã sản phẩm / Model
    if (colMap.sku === -1 && (
      h.includes('sku') ||
      h.includes('mã sp') ||
      h.includes('mã hàng') ||
      h.includes('mã modul') ||
      h.includes('mã sản phẩm') ||
      h === 'mã' ||
      h === 'model' ||
      h === 'mã hiệu'
    )) {
      colMap.sku = idx;
    }
    // Tên sản phẩm / Tên hàng hóa
    else if (colMap.name === -1 && (
      h.includes('tên sp') ||
      h.includes('tên sản phẩm') ||
      h.includes('tên hàng') ||
      h.includes('tên mặt hàng') ||
      h.includes('hàng hóa') ||
      h.includes('diễn giải') ||
      h === 'tên' ||
      h === 'name' ||
      h === 'sản phẩm'
    )) {
      colMap.name = idx;
    }
    // Thương hiệu / Hãng sản xuất
    else if (colMap.brand === -1 && (
      h.includes('thương hiệu') ||
      h.includes('brand') ||
      h.includes('hãng') ||
      h.includes('nhãn hiệu') ||
      h.includes('nhà sản xuất')
    )) {
      colMap.brand = idx;
    }
    // Nhóm danh mục / Ngành hàng
    else if (colMap.group === -1 && (
      h.includes('nhóm danh mục') ||
      h.includes('nhóm ngành') ||
      h.includes('ngành hàng') ||
      h.includes('nhóm sp') ||
      h.includes('danh mục') ||
      h === 'nhóm'
    )) {
      colMap.group = idx;
    }
    // Loại sản phẩm / Phân loại
    else if (colMap.type === -1 && (
      h.includes('loại sản phẩm') ||
      h.includes('loại sp') ||
      h.includes('phân loại') ||
      h.includes('dòng sp') ||
      h === 'loại'
    )) {
      colMap.type = idx;
    }
    // Thời hạn bảo hành
    else if (colMap.warranty === -1 && (
      h.includes('bảo hành') ||
      h.includes('bh (tháng)') ||
      h.includes('thời hạn bh') ||
      h === 'bh'
    )) {
      colMap.warranty = idx;
    }
    // 1. Giá nhập (Cost / Giá gốc / Giá mua)
    else if (colMap.cost === -1 && (
      h.includes('giá nhập') ||
      h.includes('giá gốc') ||
      h.includes('giá mua') ||
      h.includes('cost') ||
      h.includes('giá vốn')
    )) {
      colMap.cost = idx;
    }
    // 2. Giá NPP / Đại lý / Bán buôn (Tránh trùng với % lợi nhuận)
    else if (colMap.npp === -1 && (
      h.includes('giá npp') ||
      h.includes('giá đại lý') ||
      h.includes('giá sỉ') ||
      h.includes('giá bán buôn') ||
      h.includes('wholesale') ||
      (h.includes('npp') && !h.includes('lợi nhuận') && !h.includes('%'))
    )) {
      colMap.npp = idx;
    }
    // 3. Giá sàn / Giá tối thiểu (Tránh trùng với chiết khấu)
    else if (colMap.floor === -1 && (
      h.includes('giá sàn') ||
      h.includes('giá min') ||
      h.includes('giá đáy') ||
      (h.includes('sàn') && !h.includes('chiết khấu'))
    )) {
      colMap.floor = idx;
    }
    // 4. Giá bán lẻ / Đơn giá / Giá niêm yết
    else if (colMap.retail === -1 && (
      h.includes('giá bán lẻ') ||
      h.includes('giá niêm yết') ||
      h.includes('đơn giá') ||
      h.includes('giá bán') ||
      h.includes('giá lẻ') ||
      h.includes('retail') ||
      h === 'giá'
    )) {
      colMap.retail = idx;
    }
    // Link ảnh
    else if (colMap.img === -1 && (
      h.includes('ảnh') ||
      h.includes('image') ||
      h.includes('hình') ||
      h.includes('link ảnh') ||
      h.includes('picture')
    )) {
      colMap.img = idx;
    }
    // Nhãn tags
    else if (colMap.tags === -1 && (
      h.includes('tags') ||
      h.includes('nhãn tags') ||
      h.includes('nhãn') ||
      h.includes('từ khóa')
    )) {
      colMap.tags = idx;
    }
    // Ghi chú
    else if (colMap.notes === -1 && (
      h.includes('ghi chú') ||
      h.includes('chú thích') ||
      h.includes('notes') ||
      h.includes('chính sách')
    )) {
      colMap.notes = idx;
    }
    // Mô tả sản phẩm
    else if (colMap.desc === -1 && (
      h.includes('mô tả') ||
      h.includes('desc') ||
      h.includes('giới thiệu') ||
      h.includes('chi tiết sản phẩm')
    )) {
      colMap.desc = idx;
    }
    // Thông số kỹ thuật
    else if (colMap.specs === -1 && (
      h.includes('thông số') ||
      h.includes('specs') ||
      h.includes('kỹ thuật') ||
      h.includes('quy cách')
    )) {
      colMap.specs = idx;
    }
    // Trạng thái
    else if (colMap.status === -1 && (
      h.includes('trạng thái') ||
      h.includes('status') ||
      h.includes('tình trạng')
    )) {
      colMap.status = idx;
    }
  });

  // Fallback thông minh nếu không tìm thấy cột SKU hoặc Tên qua tiêu đề:
  if (colMap.sku === -1 || colMap.name === -1) {
    const validCols = headerRow
      .map((_, i) => i)
      .filter(i => i !== colMap.stt);

    if (colMap.sku === -1 && validCols.length > 0) {
      colMap.sku = validCols[0];
    }
    if (colMap.name === -1 && validCols.length > 1) {
      colMap.name = validCols[1];
    }
  }

  const extracted: Product[] = [];

  for (let r = headerIdx + 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!row || !Array.isArray(row) || row.length === 0 || !row.some((cell: any) => Boolean(cell))) {
      continue;
    }

    const hasSku = colMap.sku !== -1 && row[colMap.sku] !== undefined && String(row[colMap.sku]).trim() !== '';
    const hasName = colMap.name !== -1 && row[colMap.name] !== undefined && String(row[colMap.name]).trim() !== '';
    const hasBrand = colMap.brand !== -1 && row[colMap.brand] !== undefined && String(row[colMap.brand]).trim() !== '';
    const hasGroup = colMap.group !== -1 && row[colMap.group] !== undefined && String(row[colMap.group]).trim() !== '';
    const hasType = colMap.type !== -1 && row[colMap.type] !== undefined && String(row[colMap.type]).trim() !== '';
    const hasWarranty = colMap.warranty !== -1 && row[colMap.warranty] !== undefined && String(row[colMap.warranty]).trim() !== '';
    const hasCost = colMap.cost !== -1 && row[colMap.cost] !== undefined && String(row[colMap.cost]).trim() !== '';
    const hasNpp = colMap.npp !== -1 && row[colMap.npp] !== undefined && String(row[colMap.npp]).trim() !== '';
    const hasFloor = colMap.floor !== -1 && row[colMap.floor] !== undefined && String(row[colMap.floor]).trim() !== '';
    const hasRetail = colMap.retail !== -1 && row[colMap.retail] !== undefined && String(row[colMap.retail]).trim() !== '';
    const hasImg = colMap.img !== -1 && row[colMap.img] !== undefined && String(row[colMap.img]).trim() !== '';
    const hasTags = colMap.tags !== -1 && row[colMap.tags] !== undefined && String(row[colMap.tags]).trim() !== '';
    const hasNotes = colMap.notes !== -1 && row[colMap.notes] !== undefined && String(row[colMap.notes]).trim() !== '';
    const hasDesc = colMap.desc !== -1 && row[colMap.desc] !== undefined && String(row[colMap.desc]).trim() !== '';
    const hasSpecs = colMap.specs !== -1 && row[colMap.specs] !== undefined && String(row[colMap.specs]).trim() !== '';
    const hasStatus = colMap.status !== -1 && row[colMap.status] !== undefined && String(row[colMap.status]).trim() !== '';

    // Bỏ qua dòng trống hoặc dòng tổng cộng / chữ ký
    const rawSku = hasSku ? String(row[colMap.sku]).trim() : '';
    const rawName = hasName ? String(row[colMap.name]).trim() : '';
    if (!rawSku && !rawName) continue;
    if (/^(tổng|tổng cộng|người lập|giám đốc|kế toán|ghi chú)/i.test(rawSku || rawName)) continue;

    // Tự sinh SKU nếu có Tên nhưng chưa có SKU
    const sku = (rawSku || `SP-${r}`).toUpperCase();
    const name = rawName || `Sản phẩm ${sku}`;
    const brand = hasBrand ? String(row[colMap.brand]).trim() : 'LOCK&KING';
    const categoryGroup = hasGroup ? String(row[colMap.group]).trim() : 'Điện gia dụng';
    const categoryType = hasType ? String(row[colMap.type]).trim() : 'Sản phẩm';
    const warrantyMonths = hasWarranty ? Number(row[colMap.warranty]) || 12 : 12;

    const costPrice = hasCost ? parseExcelPrice(row[colMap.cost]) : 0;
    const distributorPrice = hasNpp ? parseExcelPrice(row[colMap.npp]) : 0;
    const floorPrice = hasFloor ? parseExcelPrice(row[colMap.floor]) : 0;
    const retailPrice = hasRetail ? parseExcelPrice(row[colMap.retail]) : 0;

    const thumbnail = hasImg
      ? String(row[colMap.img]).trim()
      : 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=500';

    const tags = hasTags
      ? String(row[colMap.tags])
          .split(',')
          .map((t: string) => t.trim())
          .filter(Boolean)
      : [];

    const notes = hasNotes ? String(row[colMap.notes]).trim() : '';
    const description = hasDesc ? String(row[colMap.desc]).trim() : '';
    const rawSpecs = hasSpecs ? String(row[colMap.specs]).trim() : '';
    const specifications = parseSpecsTextToGroups(rawSpecs);
    const stableId = sku;

    extracted.push({
      id: stableId,
      sku,
      name,
      brand,
      categoryGroup,
      categoryType,
      warrantyMonths,
      pricing: {
        costPrice,
        distributorPrice,
        floorPrice,
        retailPrice,
        currency: 'VND',
      },
      thumbnail,
      specifications,
      tags,
      notes,
      description,
      status: 'active',
      rawFilledFields: {
        sku: hasSku,
        name: hasName,
        brand: hasBrand,
        categoryGroup: hasGroup,
        categoryType: hasType,
        warrantyMonths: hasWarranty,
        costPrice: hasCost,
        distributorPrice: hasNpp,
        floorPrice: hasFloor,
        retailPrice: hasRetail,
        thumbnail: hasImg,
        tags: hasTags,
        notes: hasNotes,
        description: hasDesc,
        specifications: hasSpecs,
        status: hasStatus,
      },
      updatedAt: new Date().toISOString().split('T')[0],
    });
  }

  return extracted;
}
