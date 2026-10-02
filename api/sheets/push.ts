import { pushProductsToSheet } from '../../src/server/googleSheetsService';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { products, sheetTitle = 'Sản phẩm' } = body || {};
    if (!Array.isArray(products)) {
      return res.status(400).json({ success: false, error: 'Dữ liệu products không hợp lệ' });
    }
    const updatedRows = await pushProductsToSheet(products, sheetTitle);
    return res.status(200).json({ success: true, updatedRows, sheetTitle });
  } catch (error: any) {
    console.error('Lỗi API /api/sheets/push:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Lỗi đẩy dữ liệu lên Google Sheets',
    });
  }
}
