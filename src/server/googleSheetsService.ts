import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { Product, SpecGroup, SpecItem } from '../types/product';

const SPREADSHEET_ID = '16I-JJUzrLWHh0nuKqoJwggAcrF_xIpBbT6EAcN5Geeg';
const DEFAULT_SHEET_TITLE = 'Sản phẩm';

function getCredentials() {
  const possiblePaths = [
    path.resolve(process.cwd(), 'service-account.json'),
    path.resolve(process.cwd(), '../service-account.json'),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        return JSON.parse(fs.readFileSync(p, 'utf8'));
      } catch (e) {
        console.error('Failed to parse service-account.json at', p, e);
      }
    }
  }

  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  }

  // Fallback mặc định cho môi trường Vercel / Cloud nếu chưa cài đặt biến môi trường
  return {
    type: "service_account",
    project_id: "cty-lnk-161",
    private_key_id: "8b79277cbe4d9b5a7b8254a0961a5d4932283388",
    private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDTg5BFj22QViBG\nTyE073/XFsN/Tu0qf9zHmCREpC0V8hMUIG1sh7BhcfEYMpoQy3PK1EKmcVFj33/f\nn8p1KI+4vGrFAJgXLPxlbNmfJA1S2Ru5rMZxamZPiQ+vfCSVbjlyfb019oaDTd55\nTYWxl8QjI7uv+bd8p2aJDCk6fMams96j82kjQG5GObrmDNINtNWXW9S7K32Yndjx\nOcoFe4VFICAau9y2phJFdw1Dh82fa2DMtnJttCeRN+wgQhoH0299XEoyJvGTzBTH\n1hJnwzKiiZHlLNMTAmzqlp+/YZa9kkqBhslKG+w3U0qS6gJA2Qh2yJQCEQYUk5OD\nqDrd2ZmBAgMBAAECggEAJIbhJJ4dE/LHrpSuPaPJnkW0W7kv3GnJ4R8tTjxS++n6\n8PwboYU6SM3CTsU4VYOpGsM2wmMp5Nc9UEtaTYrEbSj+wEg2u7PdX4+hcmnpsh/D\nubg0afQvuHcJQissbzDik1rTEO1is+y/6Y9hcfatXMsoN77meMy4+Jxkx1CyhqmT\ncOowEwASxDkSKN4472OSujg7ECkQY224FlafLbjU5nsRgF2EqfA4Z10e+FGQE6l0\n+E6mD135lUyk/Ug6zjizEdEmHC8+BBfsGJCIYizBFJZ7KjfF5VPbdWHBdw+m0qQr\nMIqfTrfiO7TVs8VqiFv3JEOYKSG6ZM7oAIii7xsGdQKBgQDxqLxd+NPbZFp0OKEU\nAOmNt2CjA/iEmCeNZ8Cjkkn6lWS6q8X9fdWEHAgWJPcnOZA4U3PrZSNFZzrJ9f+b\nVWS5/zynJgAY96YAQoOiTJjnJUlaMTNt+QkEtduFZKOwy1I4Ig9fFwQQBIrlE4rQ\nc39QaYm7Az9JLJAqVwScMYlAPQKBgQDgEN1NOKMUkEbOtLIWWnUWTzCtSChs4AvQ\nbhIivQAMQRcZ4ALtpf1RIJgqHyh2SA3ptGaujJDic61tfTeEUx1NEIFdisFpLIG6\nu88g0KMU/0hJd0yabg/Cgh464Sp2XTeiB3tDd7LwfdUMZFVameiSREAZW/feLbPO\nbmJ/3aFulQKBgCwSScgZiQmJ07U+XqH3SKC/wK/6GWiVFyGCum8aTsOUWzpv+Tux\npy7grdjcBPbyWIrtLUbQuw39NYt/gY4ilKwXEEirdXkYMP37I2aF8Zy2ABqivm5f\n7HUfdVlucSvc6LG0BHmjCOqi6XG9jqNVbPKNTMD+ZpxBtEkEdaLGpfFBAoGAE+bL\nkTlPmtr5vxBjpQKh1bpw62M2W/1Gb1vndnhtEamSYLT57ZvJtTP87/jWgjMCMVjZ\nqfVIRSTbKZdun+019AtcQi+54BqY5zoZOqPtaEcIZ6YWAr113uPpxXcMa3j6IQUj\nGKoAFcZHbxNWVXbIJn2zZ804Zd6PUu2RCCRqW0UCgYEAv5rs4lg2tdIx3zKX67qQ\naFDBvxYriDqUuACpzV9TlZme6tDp+S21BGhwzwl9dcaWjda++lqyBqtkSHZtGAY+\nNf7d7jqgqgiofhYlBTSVo8qU8vVvIlzgzOb+Z3aZPiZHiCu8K4YAJ9Qn5q8Fz1PV\n4b87bpePRsmiNvOiCsTBaRY=\n-----END PRIVATE KEY-----\n",
    client_email: "lnk-773@cty-lnk-161.iam.gserviceaccount.com",
    client_id: "104867274738950549003",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/lnk-773%40cty-lnk-161.iam.gserviceaccount.com",
    universe_domain: "googleapis.com"
  };
}

export function getSheetsClient() {
  const credentials = getCredentials();
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return {
    sheets: google.sheets({ version: 'v4', auth }),
    clientEmail: credentials.client_email,
  };
}

export interface SpreadsheetInfo {
  title: string;
  spreadsheetId: string;
  url: string;
  serviceAccountEmail: string;
  sheets: Array<{
    sheetId: number;
    title: string;
    index: number;
    rowCount?: number;
    columnCount?: number;
  }>;
}

export async function getSpreadsheetInfo(): Promise<SpreadsheetInfo> {
  const { sheets, clientEmail } = getSheetsClient();
  const meta = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
  });

  return {
    title: meta.data.properties?.title || 'SO_SANH_GIA',
    spreadsheetId: SPREADSHEET_ID,
    url: `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`,
    serviceAccountEmail: clientEmail,
    sheets: (meta.data.sheets || []).map(s => ({
      sheetId: s.properties?.sheetId ?? 0,
      title: s.properties?.title || '',
      index: s.properties?.index ?? 0,
      rowCount: s.properties?.gridProperties?.rowCount ?? undefined,
      columnCount: s.properties?.gridProperties?.columnCount ?? undefined,
    })),
  };
}

/**
 * Đảm bảo tab sheet tồn tại (nếu chưa có thì tạo mới)
 */
export async function ensureSheetExists(sheetTitle: string): Promise<number> {
  const { sheets } = getSheetsClient();
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const existing = meta.data.sheets?.find(s => s.properties?.title === sheetTitle);
  if (existing && existing.properties?.sheetId !== undefined && existing.properties?.sheetId !== null) {
    return existing.properties.sheetId;
  }

  // Tạo tab mới
  const addRes = await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          addSheet: {
            properties: {
              title: sheetTitle,
              gridProperties: {
                rowCount: 100,
                columnCount: 20,
                frozenRowCount: 1,
              },
            },
          },
        },
      ],
    },
  });

  return addRes.data.replies?.[0]?.addSheet?.properties?.sheetId ?? 0;
}

// Bảng tiêu đề chuẩn: Bỏ 3 cột Biên LN, Lợi nhuận NPP, Chiết khấu sàn; Thêm cột "Mô tả sản phẩm"
export const HEADERS = [
  'Mã SKU / Modul',      // 0
  'Tên sản phẩm',         // 1
  'Thương hiệu',          // 2
  'Nhóm danh mục',        // 3
  'Loại sản phẩm',        // 4
  'Thời hạn BH (tháng)',  // 5
  '1. Giá nhập (VND)',    // 6
  '2. Giá NPP (VND)',     // 7
  '3. Giá sàn (VND)',     // 8
  '4. Giá bán lẻ (VND)',  // 9
  'Link ảnh',             // 10
  'Nhãn Tags',            // 11
  'Ghi chú',              // 12
  'Mô tả sản phẩm',       // 13 (Cột người dùng nhập thông tin mô tả nhiều dòng)
  'Thông số kỹ thuật',    // 14 (AI phân tích điền dữ liệu vào đây)
  'Trạng thái',           // 15
  'ID Hệ Thống',          // 16
  'Ngày cập nhật',        // 17
  'Dữ liệu JSON',         // 18
];

function getColumnLetter(colIndex: number): string {
  let letter = '';
  while (colIndex >= 0) {
    letter = String.fromCharCode((colIndex % 26) + 65) + letter;
    colIndex = Math.floor(colIndex / 26) - 1;
  }
  return letter;
}

export function formatSpecsToText(specifications: SpecGroup[]): string {
  if (!specifications || specifications.length === 0) return '';
  return specifications
    .map(g => {
      const itemsStr = g.items.map(i => `${i.key}: ${i.value}`).join(' | ');
      return `[${g.groupName}] ${itemsStr}`;
    })
    .join('\n');
}

/**
 * Đồng bộ danh sách sản phẩm lên Google Sheet
 */
export async function pushProductsToSheet(
  products: Product[],
  targetSheetTitle: string = DEFAULT_SHEET_TITLE
): Promise<{ success: boolean; updatedRows: number; sheetTitle: string }> {
  const { sheets } = getSheetsClient();
  const sheetId = await ensureSheetExists(targetSheetTitle);

  // Chuẩn bị dữ liệu bảng
  const rows: (string | number)[][] = [HEADERS];

  for (const p of products) {
    const cost = p.pricing?.costPrice || 0;
    const npp = p.pricing?.distributorPrice || 0;
    const floor = p.pricing?.floorPrice || 0;
    const retail = p.pricing?.retailPrice || 0;

    const row = [
      p.sku || '',
      p.name || '',
      p.brand || '',
      p.categoryGroup || '',
      p.categoryType || '',
      p.warrantyMonths || 12,
      cost,
      npp,
      floor,
      retail,
      p.thumbnail || '',
      (p.tags || []).join(', '),
      p.notes || '',
      p.description || '', // Cột 13: Mô tả sản phẩm
      formatSpecsToText(p.specifications), // Cột 14: Thông số kỹ thuật
      p.status || 'active',
      p.id || '',
      p.updatedAt || new Date().toISOString().split('T')[0],
      JSON.stringify(p),
    ];
    rows.push(row);
  }

  // Xóa nội dung cũ trong sheet đó
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${targetSheetTitle}'!A:Z`,
  });

  // Ghi toàn bộ dữ liệu mới
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${targetSheetTitle}'!A1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: rows,
    },
  });

  // Áp dụng định dạng chuyên nghiệp
  try {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          // 1. Freeze dòng 1
          {
            updateSheetProperties: {
              properties: {
                sheetId,
                gridProperties: {
                  frozenRowCount: 1,
                },
              },
              fields: 'gridProperties.frozenRowCount',
            },
          },
          // 2. Định dạng Header dòng 1 (Xanh navy #0F172A, chữ trắng, in đậm, căn giữa)
          {
            repeatCell: {
              range: {
                sheetId,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: HEADERS.length,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.06, green: 0.09, blue: 0.16 }, // #0F172A
                  textFormat: {
                    foregroundColor: { red: 1, green: 1, blue: 1 },
                    bold: true,
                    fontSize: 10,
                  },
                  horizontalAlignment: 'CENTER',
                  verticalAlignment: 'MIDDLE',
                  wrapStrategy: 'WRAP',
                },
              },
              fields:
                'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,wrapStrategy)',
            },
          },
          // 3. Đặt chiều rộng các cột
          {
            updateDimensionProperties: {
              range: {
                sheetId,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: 1, // SKU
              },
              properties: { pixelSize: 130 },
              fields: 'pixelSize',
            },
          },
          {
            updateDimensionProperties: {
              range: {
                sheetId,
                dimension: 'COLUMNS',
                startIndex: 1,
                endIndex: 2, // Tên sản phẩm
              },
              properties: { pixelSize: 260 },
              fields: 'pixelSize',
            },
          },
          {
            updateDimensionProperties: {
              range: {
                sheetId,
                dimension: 'COLUMNS',
                startIndex: 6,
                endIndex: 10, // 4 tầng giá
              },
              properties: { pixelSize: 110 },
              fields: 'pixelSize',
            },
          },
          {
            updateDimensionProperties: {
              range: {
                sheetId,
                dimension: 'COLUMNS',
                startIndex: 13,
                endIndex: 14, // Mô tả sản phẩm
              },
              properties: { pixelSize: 320 },
              fields: 'pixelSize',
            },
          },
          {
            updateDimensionProperties: {
              range: {
                sheetId,
                dimension: 'COLUMNS',
                startIndex: 14,
                endIndex: 15, // Thông số kỹ thuật
              },
              properties: { pixelSize: 360 },
              fields: 'pixelSize',
            },
          },
        ],
      },
    });
  } catch (formatErr) {
    console.warn('Lưu định dạng Google Sheet cảnh báo:', formatErr);
  }

  return {
    success: true,
    updatedRows: products.length,
    sheetTitle: targetSheetTitle,
  };
}

/**
 * Tải danh sách sản phẩm từ Google Sheet về
 */
export async function pullProductsFromSheet(
  targetSheetTitle: string = DEFAULT_SHEET_TITLE
): Promise<Product[]> {
  const { sheets } = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${targetSheetTitle}'!A:Z`,
    valueRenderOption: 'UNFORMATTED_VALUE',
  });

  const rawRows = res.data.values || [];
  if (rawRows.length <= 1) {
    return [];
  }

  const headerRow = rawRows[0] || [];
  const jsonColIdx = headerRow.findIndex((h: string) => h && h.includes('Dữ liệu JSON'));
  const skuColIdx = headerRow.findIndex((h: string) => h && h.toLowerCase().includes('sku'));
  const nameColIdx = headerRow.findIndex((h: string) => h && h.toLowerCase().includes('tên'));
  const costColIdx = headerRow.findIndex((h: string) => h && h.toLowerCase().includes('nhập'));
  const nppColIdx = headerRow.findIndex((h: string) => h && h.toLowerCase().includes('npp'));
  const floorColIdx = headerRow.findIndex((h: string) => h && h.toLowerCase().includes('sàn'));
  const retailColIdx = headerRow.findIndex(
    (h: string) =>
      h &&
      (h.toLowerCase().includes('bán lẻ') ||
        h.toLowerCase().includes('niêm yết') ||
        h.toLowerCase().includes('thương mại'))
  );
  const brandColIdx = headerRow.findIndex((h: string) => h && h.toLowerCase().includes('thương hiệu'));
  const groupColIdx = headerRow.findIndex((h: string) => h && h.toLowerCase().includes('nhóm'));
  const typeColIdx = headerRow.findIndex((h: string) => h && h.toLowerCase().includes('loại'));
  const warrantyColIdx = headerRow.findIndex((h: string) => h && h.toLowerCase().includes('bảo hành'));
  const imgColIdx = headerRow.findIndex((h: string) => h && (h.toLowerCase().includes('ảnh') || h.toLowerCase().includes('link')));
  const tagsColIdx = headerRow.findIndex((h: string) => h && h.toLowerCase().includes('tags'));
  const notesColIdx = headerRow.findIndex((h: string) => h && h.toLowerCase().includes('chú'));
  const descColIdx = headerRow.findIndex((h: string) => h && h.toLowerCase().includes('mô tả'));
  const specsColIdx = headerRow.findIndex((h: string) => h && h.toLowerCase().includes('thông số'));
  const idColIdx = headerRow.findIndex((h: string) => h && (h.toLowerCase().includes('id') || h.toLowerCase().includes('mã hệ thống')));

  const colIndices = {
    sku: skuColIdx,
    name: nameColIdx,
    brand: brandColIdx,
    group: groupColIdx,
    type: typeColIdx,
    warranty: warrantyColIdx,
    cost: costColIdx,
    npp: nppColIdx,
    floor: floorColIdx,
    retail: retailColIdx,
    img: imgColIdx,
    tags: tagsColIdx,
    notes: notesColIdx,
    desc: descColIdx,
    specs: specsColIdx,
    id: idColIdx,
    json: jsonColIdx,
  };

  const parsedProducts: Product[] = [];

  for (let i = 1; i < rawRows.length; i++) {
    const row = rawRows[i];
    if (!row || row.length === 0 || !row.some((c: any) => Boolean(c))) continue;

    const p = parseProductFromRowData(row, colIndices, i);
    parsedProducts.push(p);
  }

  return parsedProducts;
}

/**
 * Phân tích số tiền theo định dạng thực tế của Việt Nam và Google Sheet
 */
export function parseVietnamesePrice(val: any): number {
  if (typeof val === 'number') {
    return val;
  }
  if (!val) return 0;
  let s = String(val).trim();
  if (!s) return 0;

  // Xóa ký hiệu tiền tệ và khoảng trắng
  s = s.replace(/[₫đVND\s]/gi, '').trim();

  // Dạng viết tắt 321k -> 321000
  if (/k$/i.test(s)) {
    const num = parseFloat(s.replace(/k$/i, '').replace(',', '.'));
    return isNaN(num) ? 0 : Math.round(num * 1000);
  }
  if (/tr(?:i[eệ]u)?$/i.test(s)) {
    const num = parseFloat(s.replace(/tr(?:i[eệ]u)?$/i, '').replace(',', '.'));
    return isNaN(num) ? 0 : Math.round(num * 1000000);
  }

  // Phân cách hàng nghìn bằng dấu chấm hoặc dấu phẩy
  if (s.includes('.') && s.includes(',')) {
    if (s.indexOf('.') < s.indexOf(',')) {
      // 1.070.000,50 -> 1070000.50
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      // 1,070,000.50 -> 1070000.50
      s = s.replace(/,/g, '');
    }
  } else if (/^\d{1,3}(\.\d{3})+$/.test(s)) {
    // 1.070.000 -> 1070000
    s = s.replace(/\./g, '');
  } else if (/^\d{1,3}(,\d{3})+$/.test(s)) {
    // 1,070,000 -> 1070000
    s = s.replace(/,/g, '');
  } else if (/^\d+\.\d{3}$/.test(s)) {
    // 321.000 -> 321000
    s = s.replace(/\./g, '');
  } else if (/^\d+,\d{3}$/.test(s)) {
    // 321,000 -> 321000
    s = s.replace(/,/g, '');
  } else {
    s = s.replace(/[^\d.-]/g, '');
  }

  const result = Number(s);
  return isNaN(result) ? 0 : result;
}

export function parseProductFromRowData(
  row: any[],
  colIndices: {
    sku: number;
    name: number;
    brand: number;
    group: number;
    type: number;
    warranty: number;
    cost: number;
    npp: number;
    floor: number;
    retail: number;
    img: number;
    tags: number;
    notes: number;
    desc: number;
    specs: number;
    id: number;
    json: number;
  },
  rowIndex: number
): Product {
  const rowSku = String((colIndices.sku !== -1 ? row[colIndices.sku] : row[0]) || `SKU-${rowIndex}`).trim();
  const rowName = String((colIndices.name !== -1 ? row[colIndices.name] : row[1]) || `Sản phẩm ${rowIndex}`).trim();
  const rowDesc = colIndices.desc !== -1 && row[colIndices.desc] ? String(row[colIndices.desc]).trim() : '';

  // Parse giá thực tế trực tiếp từ ô Google Sheet
  const costPrice = colIndices.cost !== -1 ? parseVietnamesePrice(row[colIndices.cost]) : 0;
  const distributorPrice = colIndices.npp !== -1 ? parseVietnamesePrice(row[colIndices.npp]) : 0;
  const floorPrice = colIndices.floor !== -1 ? parseVietnamesePrice(row[colIndices.floor]) : 0;
  const retailPrice = colIndices.retail !== -1 ? parseVietnamesePrice(row[colIndices.retail]) : 0;

  const brand = colIndices.brand !== -1 && row[colIndices.brand] ? String(row[colIndices.brand]).trim() : '';
  const categoryGroup = colIndices.group !== -1 && row[colIndices.group] ? String(row[colIndices.group]).trim() : 'Điện gia dụng';
  const categoryType = colIndices.type !== -1 && row[colIndices.type] ? String(row[colIndices.type]).trim() : 'Sản phẩm';
  const warrantyMonths = colIndices.warranty !== -1 ? Number(row[colIndices.warranty]) || 12 : 12;

  // Đọc từ cột JSON nếu có VÀ mã SKU trùng khớp với dòng này
  if (colIndices.json !== -1 && row[colIndices.json]) {
    try {
      const pObj = JSON.parse(row[colIndices.json]);
      if (
        pObj &&
        pObj.sku &&
        String(pObj.sku).trim().toUpperCase() === rowSku.toUpperCase()
      ) {
        // CẬP NHẬT GIÁ VÀ CÁC THÔNG TIN TỪ Ô THỰC TẾ TRÊN GOOGLE SHEET:
        // Đảm bảo giá luôn lấy từ các cột G, H, I, J thực tế trên bảng tính
        pObj.pricing = {
          costPrice,
          distributorPrice,
          floorPrice,
          retailPrice,
          currency: 'VND',
        };
        if (rowName) pObj.name = rowName;
        if (brand) pObj.brand = brand;
        if (rowDesc) pObj.description = rowDesc;
        if (categoryGroup) pObj.categoryGroup = categoryGroup;
        if (categoryType) pObj.categoryType = categoryType;
        if (warrantyMonths) pObj.warrantyMonths = warrantyMonths;
        return pObj;
      }
    } catch (e) {
      // Fallback
    }
  }

  const thumbnail = colIndices.img !== -1 && row[colIndices.img] ? String(row[colIndices.img]).trim() : '';
  const tags =
    colIndices.tags !== -1 && row[colIndices.tags]
      ? String(row[colIndices.tags])
          .split(',')
          .map((t: string) => t.trim())
          .filter(Boolean)
      : [];
  const notes = colIndices.notes !== -1 && row[colIndices.notes] ? String(row[colIndices.notes]).trim() : '';
  const rawSpecsText = colIndices.specs !== -1 && row[colIndices.specs] ? String(row[colIndices.specs]).trim() : '';

  let specifications: SpecGroup[] = [];
  if (rawSpecsText) {
    specifications = parseSpecsTextToGroups(rawSpecsText);
  }

  const rowId = colIndices.id !== -1 && row[colIndices.id] ? String(row[colIndices.id]).trim() : '';
  const cleanSku = rowSku.toUpperCase();
  const stableId =
    rowId || (cleanSku ? `sheet-${cleanSku.toLowerCase().replace(/[^a-z0-9_-]/g, '-')}` : `sheet-row-${rowIndex}`);

  return {
    id: stableId,
    sku: cleanSku,
    name: rowName,
    brand,
    categoryGroup,
    categoryType,
    thumbnail:
      thumbnail ||
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    warrantyMonths,
    pricing: {
      costPrice,
      distributorPrice,
      floorPrice,
      retailPrice,
      currency: 'VND',
    },
    specifications,
    tags,
    notes,
    description: rowDesc,
    status: 'active',
    updatedAt: new Date().toISOString().split('T')[0],
  };
}

// ==========================================
// THUẬT TOÁN AI / HEURISTIC BÓC TÁCH THÔNG SỐ
// ==========================================

const KNOWN_KEYWORDS: Record<string, string[]> = {
  'Thông số vận hành': [
    'công suất', 'điện áp', 'tần số', 'dung tích', 'tốc độ', 'vòng/phút', 'lực hút',
    'áp suất', 'nhiệt độ', 'độ ồn', 'pin', 'thời gian sạc', 'thời gian sử dụng',
    'lưu lượng', 'lực siết', 'động cơ', 'motor', 'dung lượng pin'
  ],
  'Kích thước & Thiết kế': [
    'kích thước', 'trọng lượng', 'khối lượng', 'chất liệu', 'màu sắc', 'chiều dài',
    'chiều rộng', 'chiều cao', 'đường kính', 'vỏ', 'lòng nồi', 'thiết kế', 'kiểu dáng'
  ],
  'Công nghệ & Tính năng': [
    'công nghệ', 'điều khiển', 'màn hình', 'chế độ', 'chương trình', 'kết nối',
    'wifi', 'bluetooth', 'app', 'cảm biến', 'tự động', 'tính năng', 'tiện ích', 'hẹn giờ',
    'lọc bụi', 'chống dính'
  ],
  'Tiêu chuẩn & Bảo hành': [
    'bảo hành', 'xuất xứ', 'thương hiệu', 'phụ kiện', 'chứng nhận', 'tiêu chuẩn',
    'chống nước', 'an toàn', 'tự ngắt'
  ],
};

function categorizeKey(key: string): string {
  const lower = key.toLowerCase();
  for (const [groupName, keywords] of Object.entries(KNOWN_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      return groupName;
    }
  }
  return 'Thông số kỹ thuật khác';
}

/**
 * Chuyển chuỗi định dạng "[Nhóm] Key: Value | Key2: Value2" thành SpecGroup[]
 */
function parseSpecsTextToGroups(text: string): SpecGroup[] {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const groups: SpecGroup[] = [];

  for (const line of lines) {
    // Định dạng [Tên nhóm] K1: V1 | K2: V2
    const groupMatch = line.match(/^\[([^\]]+)\]\s*(.*)$/);
    if (groupMatch) {
      const gName = groupMatch[1].trim();
      const content = groupMatch[2].trim();
      const items: SpecItem[] = [];

      content.split('|').forEach(part => {
        const colonIdx = part.indexOf(':');
        if (colonIdx > 0) {
          const k = part.substring(0, colonIdx).trim();
          const v = part.substring(colonIdx + 1).trim();
          if (k && v) {
            items.push({
              key: k,
              value: v,
              isHighlight: /công suất|dung tích|lực hút|lực siết|pin|bảo hành/i.test(k),
            });
          }
        }
      });

      if (items.length > 0) {
        groups.push({ groupName: gName, items });
        continue;
      }
    }

    // Dòng thông thường "Key: Value"
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const k = line.substring(0, colonIdx).trim();
      const v = line.substring(colonIdx + 1).trim();
      if (k && v) {
        const gName = categorizeKey(k);
        let g = groups.find(x => x.groupName.toLowerCase() === gName.toLowerCase());
        if (!g) {
          g = { groupName: gName, items: [] };
          groups.push(g);
        }
        g.items.push({
          key: k,
          value: v,
          isHighlight: /công suất|dung tích|lực hút|lực siết|pin|bảo hành/i.test(k),
        });
      }
    }
  }

  return groups;
}

/**
 * Phân tích văn bản mô tả thô (tự do) thành các nhóm thông số kỹ thuật
 */
export async function parseSpecsFromRawText(rawText: string, customApiKey?: string): Promise<SpecGroup[]> {
  if (!rawText || !rawText.trim()) return [];

  // 1. Thử gọi Gemini AI nếu có key
  const apiKey = (customApiKey || process.env.GEMINI_API_KEY || '').trim();
  if (apiKey) {
    const models = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];
    for (const model of models) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const prompt = `Bạn là chuyên gia phân tích dữ liệu kỹ thuật sản phẩm và so sánh thông số B2B.
Nhiệm vụ: Hãy phân tích đoạn mô tả kỹ thuật sản phẩm sau đây và trích xuất thành danh sách các nhóm thông số kỹ thuật (SpecGroup).
Mỗi nhóm gồm 'groupName' (ví dụ: 'Thông số vận hành', 'Kích thước & Thiết kế', 'Công nghệ & Tiện ích', 'Nguồn điện & Tiêu thụ', 'Tiêu chuẩn & Bảo hành'...) và danh sách 'items' (mỗi item có 'key', 'value', và 'isHighlight': boolean nếu là thông số nổi bật quan trọng).

Văn bản mô tả đầu vào:
"""
${rawText}
"""

YÊU CẦU: Trả về DUY NHẤT một JSON array hợp lệ:
[
  {
    "groupName": "Tên nhóm",
    "items": [
      { "key": "Tên thông số", "value": "Giá trị kèm đơn vị nếu có", "isHighlight": false }
    ]
  }
]`;

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.1,
              responseMimeType: 'application/json',
            },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const cand = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          let cleaned = cand.trim();
          if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json\s*/, '');
          if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```\s*/, '');
          if (cleaned.endsWith('```')) cleaned = cleaned.replace(/```$/, '');
          cleaned = cleaned.trim();
          const parsed = JSON.parse(cleaned);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.warn(`Gemini API (${model}) failed:`, e);
      }
    }
  }

  // 2. Phân tích nội bộ bằng regex và phân loại từ khóa tự nhiên
  const items: SpecItem[] = [];
  const text = rawText.replace(/\r?\n/g, '. ');

  // Nhận diện các cặp thông số phổ biến trong tiếng Việt
  const patterns: Array<{ regex: RegExp; key: string; isHighlight?: boolean }> = [
    { regex: /công\s*suất[:\s]+([\d\.]+\s*(?:w|kw|hp|mã\s*lực))/i, key: 'Công suất', isHighlight: true },
    { regex: /dung\s*tích(?:\s*lòng\s*nồi)?[:\s]+([\d\.]+\s*(?:l|lít|ml))/i, key: 'Dung tích', isHighlight: true },
    { regex: /điện\s*áp[:\s]+([\d\.]+\s*v(?:[\s\-]+[\d\.]+hz)?)/i, key: 'Điện áp' },
    { regex: /(?:dải\s*)?nhiệt\s*độ[:\s]+([\d\.]+(?:°c|c)?\s*[\-–]\s*[\d\.]+\s*(?:°c|c)?)/i, key: 'Dải nhiệt độ' },
    { regex: /lực\s*hút[:\s]+([\d\.]+\s*(?:pa|kpa))/i, key: 'Lực hút tối đa', isHighlight: true },
    { regex: /lực\s*siết[:\s]+([\d\.]+\s*n\.?m)/i, key: 'Lực siết tối đa', isHighlight: true },
    { regex: /tốc\s*độ(?:\s*không\s*tải)?[:\s]+([\d\.\s\-–]+(?:vòng\/phút|rpm))/i, key: 'Tốc độ không tải' },
    { regex: /(?:dung\s*lượng\s*)?pin[:\s]+([\d\.]+\s*(?:mah|ah|v))/i, key: 'Dung lượng pin', isHighlight: true },
    { regex: /trọng\s*lượng|khối\s*lượng[:\s]+([\d\.]+\s*(?:kg|g|gam))/i, key: 'Trọng lượng' },
    { regex: /kích\s*thước[:\s]+([\d\.\s]+(?:x|\*)\s*[\d\.\s]+(?:x|\*)\s*[\d\.\s]+(?:mm|cm|m)?)/i, key: 'Kích thước' },
    { regex: /chất\s*liệu(?:\s*lòng\s*nồi)?[:\s]+([^,\.\n\t]+?)(?=\s{2,}|$|[,\.\n])/i, key: 'Chất liệu' },
    { regex: /bảo\s*hành[:\s]+(\d+\s*(?:tháng|năm))/i, key: 'Bảo hành' },
    { regex: /độ\s*ồn[:\s]+([<≤]?\s*[\d\.]+\s*db)/i, key: 'Độ ồn' },
    { regex: /công\s*nghệ[:\s]+([^,\.\n\t]+?)(?=\s{2,}|$|[,\.\n])/i, key: 'Công nghệ' },
    { regex: /bảng\s*điều\s*khiển[:\s]+([^,\.\n\t]+?)(?=\s{2,}|$|[,\.\n])/i, key: 'Bảng điều khiển' },
  ];

  for (const p of patterns) {
    const m = text.match(p.regex);
    if (m && m[1]) {
      items.push({
        key: p.key,
        value: m[1].trim(),
        isHighlight: Boolean(p.isHighlight),
      });
    }
  }

  // Quét thêm bất kỳ cặp "Key: Value" có trong rawText (hỗ trợ cả xuống dòng hoặc cách nhau bởi 2 khoảng trắng trở lên)
  const segments = rawText.split(/\r?\n|  +/).map(l => l.trim()).filter(Boolean);
  for (const seg of segments) {
    const clean = seg.replace(/^[\*\-\•\–\—\+]\s*/, '').trim();
    const colonIdx = clean.indexOf(':');
    if (colonIdx > 0 && colonIdx < 50) {
      const k = clean.substring(0, colonIdx).trim();
      const v = clean.substring(colonIdx + 1).trim();
      if (k && v && !items.some(it => it.key.toLowerCase() === k.toLowerCase())) {
        items.push({
          key: k,
          value: v,
          isHighlight: /công suất|dung tích|lực hút|lực siết|pin|bảo hành|kích thước|khối lượng/i.test(k),
        });
      }
    }
  }

  // Nhóm các items vào các nhóm chuẩn
  const groups: SpecGroup[] = [];
  for (const item of items) {
    const gName = categorizeKey(item.key);
    let g = groups.find(x => x.groupName.toLowerCase() === gName.toLowerCase());
    if (!g) {
      g = { groupName: gName, items: [] };
      groups.push(g);
    }
    g.items.push(item);
  }

  return groups;
}

/**
 * NHỜ AI PHÂN TÍCH: Đọc cột "Mô tả sản phẩm" trên Google Sheet,
 * bóc tách thông số kỹ thuật và điền vào cột "Thông số kỹ thuật"
 */
export async function aiAnalyzeSheetSpecs(
  sheetTitle: string = DEFAULT_SHEET_TITLE,
  customApiKey?: string
): Promise<{ success: boolean; analyzedCount: number; sheetTitle: string; products: Product[] }> {
  const { sheets } = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${sheetTitle}'!A:Z`,
    valueRenderOption: 'UNFORMATTED_VALUE',
  });

  const rawRows = res.data.values || [];
  if (rawRows.length <= 1) {
    return { success: true, analyzedCount: 0, sheetTitle, products: [] };
  }

  const headerRow = rawRows[0] || [];
  const skuColIdx = headerRow.findIndex((h: string) => h && h.toLowerCase().includes('sku'));
  const nameColIdx = headerRow.findIndex((h: string) => h && h.toLowerCase().includes('tên'));
  const brandColIdx = headerRow.findIndex((h: string) => h && h.toLowerCase().includes('thương hiệu'));
  const groupColIdx = headerRow.findIndex((h: string) => h && h.toLowerCase().includes('nhóm'));
  const typeColIdx = headerRow.findIndex((h: string) => h && h.toLowerCase().includes('loại'));
  const warrantyColIdx = headerRow.findIndex((h: string) => h && h.toLowerCase().includes('bảo hành'));
  const costColIdx = headerRow.findIndex((h: string) => h && h.toLowerCase().includes('nhập'));
  const nppColIdx = headerRow.findIndex((h: string) => h && h.toLowerCase().includes('npp'));
  const floorColIdx = headerRow.findIndex((h: string) => h && h.toLowerCase().includes('sàn'));
  const retailColIdx = headerRow.findIndex(
    (h: string) =>
      h &&
      (h.toLowerCase().includes('bán lẻ') ||
        h.toLowerCase().includes('niêm yết') ||
        h.toLowerCase().includes('thương mại'))
  );
  const imgColIdx = headerRow.findIndex((h: string) => h && (h.toLowerCase().includes('ảnh') || h.toLowerCase().includes('link')));
  const tagsColIdx = headerRow.findIndex((h: string) => h && h.toLowerCase().includes('tags'));
  const notesColIdx = headerRow.findIndex((h: string) => h && h.toLowerCase().includes('chú'));
  const descColIdx = headerRow.findIndex((h: string) => h && h.toLowerCase().includes('mô tả'));
  const specsColIdx = headerRow.findIndex((h: string) => h && h.toLowerCase().includes('thông số'));
  const idColIdx = headerRow.findIndex((h: string) => h && (h.toLowerCase().includes('id') || h.toLowerCase().includes('mã hệ thống')));
  const jsonColIdx = headerRow.findIndex((h: string) => h && h.includes('Dữ liệu JSON'));

  if (descColIdx === -1 || specsColIdx === -1) {
    throw new Error(`Không tìm thấy cột "Mô tả sản phẩm" hoặc "Thông số kỹ thuật" trên tab "${sheetTitle}". Vui lòng bấm "Đồng bộ lên Sheet" để khởi tạo lại bảng tiêu đề.`);
  }

  const colIndices = {
    sku: skuColIdx,
    name: nameColIdx,
    brand: brandColIdx,
    group: groupColIdx,
    type: typeColIdx,
    warranty: warrantyColIdx,
    cost: costColIdx,
    npp: nppColIdx,
    floor: floorColIdx,
    retail: retailColIdx,
    img: imgColIdx,
    tags: tagsColIdx,
    notes: notesColIdx,
    desc: descColIdx,
    specs: specsColIdx,
    id: idColIdx,
    json: jsonColIdx,
  };

  let analyzedCount = 0;
  const updateValues: { range: string; values: string[][] }[] = [];
  const updatedProducts: Product[] = [];

  for (let i = 1; i < rawRows.length; i++) {
    const row = rawRows[i];
    if (!row || row.length === 0 || !row.some((c: any) => Boolean(c))) continue;

    // Parse sản phẩm chính xác của dòng này
    const p = parseProductFromRowData(row, colIndices, i);
    const rawDesc = String(row[descColIdx] || '').trim();

    if (!rawDesc) {
      updatedProducts.push(p);
      continue;
    }

    // Phân tích thông số từ mô tả của chính dòng này
    const specGroups = await parseSpecsFromRawText(rawDesc, customApiKey);
    const specsText = formatSpecsToText(specGroups);

    const specsColLetter = getColumnLetter(specsColIdx);
    updateValues.push({
      range: `'${sheetTitle}'!${specsColLetter}${i + 1}`,
      values: [[specsText]],
    });

    analyzedCount++;

    p.description = rawDesc;
    p.specifications = specGroups;
    updatedProducts.push(p);

    if (jsonColIdx !== -1) {
      const jsonColLetter = getColumnLetter(jsonColIdx);
      updateValues.push({
        range: `'${sheetTitle}'!${jsonColLetter}${i + 1}`,
        values: [[JSON.stringify(p)]],
      });
    }
  }

  // Cập nhật hàng loạt vào Google Sheet
  if (updateValues.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: updateValues,
      },
    });
  }

  return {
    success: true,
    analyzedCount,
    sheetTitle,
    products: updatedProducts,
  };
}

/**
 * Tải danh sách nhân viên và quyền từ sheet NHAN_VIEN
 */
export async function pullEmployeesFromSheet(
  sheetTitle: string = 'NHAN_VIEN'
): Promise<{
  id: string;
  hoTen: string;
  taiKhoan: string;
  matKhau: string;
  anh?: string;
  quyen: string;
}[]> {
  const { sheets } = getSheetsClient();
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${sheetTitle}'!A:Z`,
      valueRenderOption: 'UNFORMATTED_VALUE',
    });

    const rows = res.data.values || [];
    if (rows.length <= 1) {
      return [];
    }

    const header = (rows[0] || []).map((h: any) => String(h || '').toLowerCase().trim());
    const idIdx = header.findIndex((h: string) => h === 'id' || h.includes('mã'));
    const hoTenIdx = header.findIndex((h: string) => h.includes('họ tên') || h.includes('hoten') || h.includes('tên'));
    const taiKhoanIdx = header.findIndex((h: string) => h.includes('tài khoản') || h.includes('taikhoan') || h.includes('username') || h.includes('user'));
    const matKhauIdx = header.findIndex((h: string) => h.includes('mật khẩu') || h.includes('matkhau') || h.includes('password') || h.includes('pass'));
    const anhIdx = header.findIndex((h: string) => h.includes('ảnh') || h.includes('anh') || h.includes('avatar') || h.includes('hình'));
    const quyenIdx = header.findIndex((h: string) => h.includes('quyen') || h.includes('quyền') || h.includes('vai trò') || h.includes('chức vụ') || h.includes('role'));

    const employees: {
      id: string;
      hoTen: string;
      taiKhoan: string;
      matKhau: string;
      anh?: string;
      quyen: string;
    }[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      const taiKhoan = String(taiKhoanIdx !== -1 ? row[taiKhoanIdx] ?? '' : row[2] ?? '').trim();
      const hoTen = String(hoTenIdx !== -1 ? row[hoTenIdx] ?? '' : row[1] ?? '').trim();
      if (!taiKhoan && !hoTen) continue;

      const id = String(idIdx !== -1 ? row[idIdx] ?? '' : row[0] ?? `NV${String(i).padStart(2, '0')}`).trim();
      const matKhau = String(matKhauIdx !== -1 ? row[matKhauIdx] ?? '' : row[3] ?? '123456').trim();
      const anh = String(anhIdx !== -1 ? row[anhIdx] ?? '' : row[4] ?? '').trim();
      const quyen = String(quyenIdx !== -1 ? row[quyenIdx] ?? '' : row[5] ?? 'Nhân viên').trim();

      employees.push({
        id: id || `NV${String(i).padStart(2, '0')}`,
        hoTen: hoTen || taiKhoan,
        taiKhoan,
        matKhau,
        anh,
        quyen: quyen || 'Nhân viên',
      });
    }

    return employees;
  } catch (error: any) {
    console.error('Lỗi khi đọc sheet NHAN_VIEN:', error);
    throw error;
  }
}

