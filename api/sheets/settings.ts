import { pullSettingsFromSheet, pushSettingsToSheet } from '../../src/server/googleSheetsService';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '2mb',
    },
  },
};

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const sheetTitle = (req.query?.sheetTitle as string) || 'CAI_DAT';
      const settings = await pullSettingsFromSheet(sheetTitle);
      return res.status(200).json({ success: true, settings });
    }

    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch (_) {}
      } else if (!body || (typeof body === 'object' && Object.keys(body).length === 0)) {
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

      const { settings, sheetTitle = 'CAI_DAT' } = body || {};
      if (!settings || typeof settings !== 'object') {
        return res.status(400).json({ success: false, error: 'Dữ liệu settings không hợp lệ' });
      }

      const result = await pushSettingsToSheet(settings, sheetTitle);
      return res.status(200).json(result);
    }

    return res.status(405).json({ success: false, error: 'Phương thức không được hỗ trợ' });
  } catch (error: any) {
    console.error('Lỗi API /api/sheets/settings:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Lỗi thao tác với cấu hình Google Sheets',
    });
  }
}
