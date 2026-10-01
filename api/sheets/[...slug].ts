import {
  getSpreadsheetInfo,
  pushProductsToSheet,
  pullProductsFromSheet,
  aiAnalyzeSheetSpecs,
} from '../../src/server/googleSheetsService.ts';

export default async function handler(req: any, res: any) {
  // Thêm CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Lấy action từ slug hoặc query
  const slug = req.query.slug;
  const action = Array.isArray(slug) ? slug.join('/') : (slug || '');

  try {
    // 1. GET /api/sheets/info
    if (req.method === 'GET' && (action === 'info' || action === '')) {
      const info = await getSpreadsheetInfo();
      return res.status(200).json({ success: true, ...info });
    }

    // 2. GET /api/sheets/products
    if (req.method === 'GET' && action === 'products') {
      const sheetTitle = (req.query.sheetTitle as string) || 'Sản phẩm';
      const products = await pullProductsFromSheet(sheetTitle);
      return res.status(200).json({ success: true, count: products.length, products });
    }

    // 3. POST /api/sheets/push
    if (req.method === 'POST' && action === 'push') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { products, sheetTitle = 'Sản phẩm' } = body || {};
      if (!Array.isArray(products)) {
        return res.status(400).json({ success: false, error: 'Dữ liệu products không hợp lệ' });
      }
      const updatedRows = await pushProductsToSheet(products, sheetTitle);
      return res.status(200).json({ success: true, updatedRows, sheetTitle });
    }

    // 4. POST /api/sheets/pull
    if (req.method === 'POST' && action === 'pull') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { sheetTitle = 'Sản phẩm' } = body || {};
      const products = await pullProductsFromSheet(sheetTitle);
      return res.status(200).json({ success: true, count: products.length, products });
    }

    // 5. POST /api/sheets/ai-parse-specs
    if (req.method === 'POST' && action === 'ai-parse-specs') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { products, sheetTitle = 'Sản phẩm' } = body || {};
      if (!Array.isArray(products)) {
        return res.status(400).json({ success: false, error: 'Dữ liệu products không hợp lệ' });
      }
      const updated = await aiAnalyzeSheetSpecs(products, sheetTitle);
      return res.status(200).json({ success: true, count: updated.length, products: updated });
    }

    return res.status(404).json({ success: false, error: `Endpoint /api/sheets/${action} không hỗ trợ` });
  } catch (error: any) {
    console.error('Lỗi Vercel Serverless Sheets API:', error);
    return res.status(500).json({ success: false, error: error?.message || 'Lỗi server kết nối Google Sheets' });
  }
}
