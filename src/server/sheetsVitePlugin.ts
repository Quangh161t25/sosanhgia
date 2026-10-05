import { Plugin } from 'vite';
import { IncomingMessage, ServerResponse } from 'http';
import {
  getSpreadsheetInfo,
  pushProductsToSheet,
  pullProductsFromSheet,
  aiAnalyzeSheetSpecs,
  pullEmployeesFromSheet,
  pullSettingsFromSheet,
  pushSettingsToSheet,
} from './googleSheetsService.ts';

function parseJsonBody<T = any>(req: IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', chunk => {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    });
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf-8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', err => reject(err));
  });
}

function sendJson(res: ServerResponse, data: any, statusCode: number = 200) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

function sendError(res: ServerResponse, message: string, statusCode: number = 500) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ error: message, success: false }));
}

export function googleSheetsVitePlugin(): Plugin {
  return {
    name: 'google-sheets-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';
        const pathname = url.split('?')[0].replace(/\/+$/, '') || '/';

        // Chỉ xử lý các route bắt đầu bằng /api/sheets
        if (!pathname.startsWith('/api/sheets')) {
          return next();
        }

        try {
          // 1. GET /api/sheets/info
          if (req.method === 'GET' && pathname === '/api/sheets/info') {
            const info = await getSpreadsheetInfo();
            return sendJson(res, { success: true, ...info });
          }

          // 2. GET /api/sheets/products
          if (req.method === 'GET' && pathname === '/api/sheets/products') {
            const parsedUrl = new URL(url, 'http://localhost');
            const sheetTitle = parsedUrl.searchParams.get('sheetTitle') || 'Sản phẩm';
            const products = await pullProductsFromSheet(sheetTitle);
            return sendJson(res, { success: true, count: products.length, products });
          }

          // 2b. GET /api/sheets/employees
          if (req.method === 'GET' && pathname === '/api/sheets/employees') {
            const employees = await pullEmployeesFromSheet('NHAN_VIEN');
            return sendJson(res, { success: true, count: employees.length, employees });
          }

          // 3. POST /api/sheets/push
          if (req.method === 'POST' && pathname === '/api/sheets/push') {
            const body = await parseJsonBody(req);
            const { products, sheetTitle = 'Sản phẩm' } = body;
            if (!Array.isArray(products)) {
              return sendError(res, 'products phải là một mảng Product[]', 400);
            }
            const result = await pushProductsToSheet(products, sheetTitle);
            return sendJson(res, result);
          }

          // 4. POST /api/sheets/pull
          if (req.method === 'POST' && pathname === '/api/sheets/pull') {
            const body = await parseJsonBody(req);
            const sheetTitle = body.sheetTitle || 'Sản phẩm';
            const products = await pullProductsFromSheet(sheetTitle);
            return sendJson(res, { success: true, count: products.length, products });
          }

          // 5. POST /api/sheets/ai-parse-specs
          if (req.method === 'POST' && pathname === '/api/sheets/ai-parse-specs') {
            const body = await parseJsonBody(req);
            const sheetTitle = body.sheetTitle || 'Sản phẩm';
            const apiKey = body.apiKey;
            const result = await aiAnalyzeSheetSpecs(sheetTitle, apiKey);
            return sendJson(res, result);
          }

          // 6. GET /api/sheets/settings
          if (req.method === 'GET' && pathname === '/api/sheets/settings') {
            const parsedUrl = new URL(url, 'http://localhost');
            const sheetTitle = parsedUrl.searchParams.get('sheetTitle') || 'CAI_DAT';
            const settings = await pullSettingsFromSheet(sheetTitle);
            return sendJson(res, { success: true, settings });
          }

          // 7. POST /api/sheets/settings
          if (req.method === 'POST' && pathname === '/api/sheets/settings') {
            const body = await parseJsonBody(req);
            const { settings, sheetTitle = 'CAI_DAT' } = body;
            if (!settings || typeof settings !== 'object') {
              return sendError(res, 'settings phải là một đối tượng key-value', 400);
            }
            const result = await pushSettingsToSheet(settings, sheetTitle);
            return sendJson(res, result);
          }

          return sendError(res, 'Endpoint không tồn tại', 404);
        } catch (err: any) {
          console.error('[Google Sheets API Error]:', err);
          return sendError(res, err?.message || 'Lỗi xử lý Google Sheets API', 500);
        }
      });
    },
  };
}
