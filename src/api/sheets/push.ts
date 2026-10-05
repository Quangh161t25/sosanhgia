import { pushProductsToSheet } from '../../server/googleSheetsService';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (_) {}
    } else if (!body || (typeof body === 'object' && Object.keys(body).length === 0)) {
      // Đề phòng trường hợp body là stream
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
      }
      if (chunks.length > 0) {
        const raw = Buffer.concat(chunks).toString('utf-8');
        try {
          body = JSON.parse(raw);
        } catch (_) {}
      }
    }

    const { products, sheetTitle = 'Sản phẩm' } = body || {};
    if (!Array.isArray(products)) {
      return res.status(400).json({ success: false, error: 'Dữ liệu products không hợp lệ hoặc rỗng' });
    }
    const result = await pushProductsToSheet(products, sheetTitle);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Lỗi API /api/sheets/push:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Lỗi đẩy dữ liệu lên Google Sheets',
    });
  }
}
