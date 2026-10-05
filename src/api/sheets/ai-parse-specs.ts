import { aiAnalyzeSheetSpecs } from '../../server/googleSheetsService';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { sheetTitle = 'Sản phẩm', apiKey } = body || {};
    const result = await aiAnalyzeSheetSpecs(sheetTitle, apiKey);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Lỗi API /api/sheets/ai-parse-specs:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Lỗi server AI phân tích thông số',
    });
  }
}
