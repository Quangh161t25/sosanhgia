import { getSpreadsheetInfo } from '../../src/server/googleSheetsService.ts';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const info = await getSpreadsheetInfo();
    return res.status(200).json({ success: true, ...info });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error?.message || 'Lỗi server' });
  }
}
