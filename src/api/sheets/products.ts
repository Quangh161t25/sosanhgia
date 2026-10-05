import { pullProductsFromSheet } from '../../server/googleSheetsService';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const sheetTitle = (req.query?.sheetTitle as string) || 'Sản phẩm';
    const products = await pullProductsFromSheet(sheetTitle);
    return res.status(200).json({ success: true, count: products.length, products });
  } catch (error: any) {
    console.error('Lỗi API /api/sheets/products:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Lỗi kết nối đọc dữ liệu sản phẩm từ Google Sheets',
    });
  }
}
