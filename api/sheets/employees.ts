import { pullEmployeesFromSheet } from '../../src/server/googleSheetsService';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const sheetTitle = (req.query?.sheetTitle as string) || 'NHAN_VIEN';
    const employees = await pullEmployeesFromSheet(sheetTitle);
    return res.status(200).json({ success: true, count: employees.length, employees });
  } catch (error: any) {
    console.error('Lỗi API /api/sheets/employees:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Lỗi kết nối đọc danh sách nhân viên từ Google Sheets',
    });
  }
}
