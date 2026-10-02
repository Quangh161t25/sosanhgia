import { pullProductsFromSheet } from '../../src/server/googleSheetsService';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { sheetTitle = 'Sản phẩm' } = body || {};
    const products = await pullProductsFromSheet(sheetTitle);
    return res.status(200).json({ success: true, count: products.length, products });
  } catch (error: any) {
    console.error('Lỗi API /api/sheets/pull:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Lỗi tải dữ liệu từ Google Sheets',
    });
  }
}
