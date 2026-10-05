// src/server/googleSheetsService.ts
import { google } from "googleapis";
import fs from "fs";
import path from "path";
var SPREADSHEET_ID = "16I-JJUzrLWHh0nuKqoJwggAcrF_xIpBbT6EAcN5Geeg";
var DEFAULT_SHEET_TITLE = "S\u1EA3n ph\u1EA9m";
function normalizeCredentials(raw) {
  if (!raw || typeof raw !== "object") return raw;
  const creds = { ...raw };
  if (!creds.client_email) {
    creds.client_email = creds.clientemail || creds.client_email_address || creds.clientEmail || "";
  }
  if (!creds.private_key) {
    creds.private_key = creds.privatekey || creds.privateKey || "";
  }
  if (typeof creds.private_key === "string") {
    creds.private_key = creds.private_key.replace(/\\n/g, "\n");
  }
  if (!creds.project_id) {
    creds.project_id = creds.projectid || creds.projectId || "";
  }
  if (!creds.private_key_id) {
    creds.private_key_id = creds.privatekeyid || creds.privateKeyId || "";
  }
  if (!creds.client_id) {
    creds.client_id = creds.clientid || creds.clientId || "";
  }
  if (creds.type === "serviceaccount") {
    creds.type = "service_account";
  }
  return creds;
}
function getCredentials() {
  const possiblePaths = [
    path.resolve(process.cwd(), "service-account.json"),
    path.resolve(process.cwd(), "../service-account.json")
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(p, "utf8"));
        return normalizeCredentials(parsed);
      } catch (e) {
        console.error("Failed to parse service-account.json at", p, e);
      }
    }
  }
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    try {
      let raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON.trim();
      if (raw.startsWith('"') && raw.endsWith('"')) {
        raw = JSON.parse(raw);
      }
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      return normalizeCredentials(parsed);
    } catch (e) {
      console.error("Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON env:", e);
    }
  }
  return normalizeCredentials({
    type: "service_account",
    project_id: "cty-lnk-161",
    private_key_id: "8b79277cbe4d9b5a7b8254a0961a5d4932283388",
    private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDTg5BFj22QViBG\nTyE073/XFsN/Tu0qf9zHmCREpC0V8hMUIG1sh7BhcfEYMpoQy3PK1EKmcVFj33/f\nn8p1KI+4vGrFAJgXLPxlbNmfJA1S2Ru5rMZxamZPiQ+vfCSVbjlyfb019oaDTd55\nTYWxl8QjI7uv+bd8p2aJDCk6fMams96j82kjQG5GObrmDNINtNWXW9S7K32Yndjx\nOcoFe4VFICAau9y2phJFdw1Dh82fa2DMtnJttCeRN+wgQhoH0299XEoyJvGTzBTH\n1hJnwzKiiZHlLNMTAmzqlp+/YZa9kkqBhslKG+w3U0qS6gJA2Qh2yJQCEQYUk5OD\nqDrd2ZmBAgMBAAECggEAJIbhJJ4dE/LHrpSuPaPJnkW0W7kv3GnJ4R8tTjxS++n6\n8PwboYU6SM3CTsU4VYOpGsM2wmMp5Nc9UEtaTYrEbSj+wEg2u7PdX4+hcmnpsh/D\nubg0afQvuHcJQissbzDik1rTEO1is+y/6Y9hcfatXMsoN77meMy4+Jxkx1CyhqmT\ncOowEwASxDkSKN4472OSujg7ECkQY224FlafLbjU5nsRgF2EqfA4Z10e+FGQE6l0\n+E6mD135lUyk/Ug6zjizEdEmHC8+BBfsGJCIYizBFJZ7KjfF5VPbdWHBdw+m0qQr\nMIqfTrfiO7TVs8VqiFv3JEOYKSG6ZM7oAIii7xsGdQKBgQDxqLxd+NPbZFp0OKEU\nAOmNt2CjA/iEmCeNZ8Cjkkn6lWS6q8X9fdWEHAgWJPcnOZA4U3PrZSNFZzrJ9f+b\nVWS5/zynJgAY96YAQoOiTJjnJUlaMTNt+QkEtduFZKOwy1I4Ig9fFwQQBIrlE4rQ\nc39QaYm7Az9JLJAqVwScMYlAPQKBgQDgEN1NOKMUkEbOtLIWWnUWTzCtSChs4AvQ\nbhIivQAMQRcZ4ALtpf1RIJgqHyh2SA3ptGaujJDic61tfTeEUx1NEIFdisFpLIG6\nu88g0KMU/0hJd0yabg/Cgh464Sp2XTeiB3tDd7LwfdUMZFVameiSREAZW/feLbPO\nbmJ/3aFulQKBgCwSScgZiQmJ07U+XqH3SKC/wK/6GWiVFyGCum8aTsOUWzpv+Tux\npy7grdjcBPbyWIrtLUbQuw39NYt/gY4ilKwXEEirdXkYMP37I2aF8Zy2ABqivm5f\n7HUfdVlucSvc6LG0BHmjCOqi6XG9jqNVbPKNTMD+ZpxBtEkEdaLGpfFBAoGAE+bL\nkTlPmtr5vxBjpQKh1bpw62M2W/1Gb1vndnhtEamSYLT57ZvJtTP87/jWgjMCMVjZ\nqfVIRSTbKZdun+019AtcQi+54BqY5zoZOqPtaEcIZ6YWAr113uPpxXcMa3j6IQUj\nGKoAFcZHbxNWVXbIJn2zZ804Zd6PUu2RCCRqW0UCgYEAv5rs4lg2tdIx3zKX67qQ\naFDBvxYriDqUuACpzV9TlZme6tDp+S21BGhwzwl9dcaWjda++lqyBqtkSHZtGAY+\nNf7d7jqgqgiofhYlBTSVo8qU8vVvIlzgzOb+Z3aZPiZHiCu8K4YAJ9Qn5q8Fz1PV\n4b87bpePRsmiNvOiCsTBaRY=\n-----END PRIVATE KEY-----\n",
    client_email: "lnk-773@cty-lnk-161.iam.gserviceaccount.com",
    client_id: "104867274738950549003",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/lnk-773%40cty-lnk-161.iam.gserviceaccount.com",
    universe_domain: "googleapis.com"
  });
}
function getSheetsClient() {
  const credentials = getCredentials();
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  });
  return {
    sheets: google.sheets({ version: "v4", auth }),
    clientEmail: credentials.client_email
  };
}
async function ensureSheetExists(sheetTitle) {
  const { sheets } = getSheetsClient();
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const existing = meta.data.sheets?.find((s) => s.properties?.title === sheetTitle);
  if (existing && existing.properties?.sheetId !== void 0 && existing.properties?.sheetId !== null) {
    return existing.properties.sheetId;
  }
  const addRes = await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          addSheet: {
            properties: {
              title: sheetTitle,
              gridProperties: {
                rowCount: 100,
                columnCount: 20,
                frozenRowCount: 1
              }
            }
          }
        }
      ]
    }
  });
  return addRes.data.replies?.[0]?.addSheet?.properties?.sheetId ?? 0;
}
var HEADERS = [
  "M\xE3 SKU / Modul",
  // 0
  "T\xEAn s\u1EA3n ph\u1EA9m",
  // 1
  "Th\u01B0\u01A1ng hi\u1EC7u",
  // 2
  "Nh\xF3m danh m\u1EE5c",
  // 3
  "Lo\u1EA1i s\u1EA3n ph\u1EA9m",
  // 4
  "Th\u1EDDi h\u1EA1n BH (th\xE1ng)",
  // 5
  "1. Gi\xE1 nh\u1EADp (VND)",
  // 6
  "2. Gi\xE1 NPP (VND)",
  // 7
  "3. Gi\xE1 s\xE0n (VND)",
  // 8
  "4. Gi\xE1 b\xE1n l\u1EBB (VND)",
  // 9
  "Link \u1EA3nh",
  // 10
  "Nh\xE3n Tags",
  // 11
  "Ghi ch\xFA",
  // 12
  "M\xF4 t\u1EA3 s\u1EA3n ph\u1EA9m",
  // 13 (Cột người dùng nhập thông tin mô tả nhiều dòng)
  "Th\xF4ng s\u1ED1 k\u1EF9 thu\u1EADt",
  // 14 (AI phân tích điền dữ liệu vào đây)
  "Tr\u1EA1ng th\xE1i",
  // 15
  "ID H\u1EC7 Th\u1ED1ng",
  // 16
  "Ng\xE0y c\u1EADp nh\u1EADt",
  // 17
  "D\u1EEF li\u1EC7u JSON"
  // 18
];
function formatSpecsToText(specifications) {
  if (!specifications || specifications.length === 0) return "";
  return specifications.map((g) => {
    const itemsStr = g.items.map((i) => `${i.key}: ${i.value}`).join(" | ");
    return `[${g.groupName}] ${itemsStr}`;
  }).join("\n");
}
async function pushProductsToSheet(products, targetSheetTitle = DEFAULT_SHEET_TITLE) {
  const { sheets } = getSheetsClient();
  const sheetId = await ensureSheetExists(targetSheetTitle);
  const rows = [HEADERS];
  for (const p of products) {
    const cost = p.pricing?.costPrice || 0;
    const npp = p.pricing?.distributorPrice || 0;
    const floor = p.pricing?.floorPrice || 0;
    const retail = p.pricing?.retailPrice || 0;
    const row = [
      p.sku || "",
      p.name || "",
      p.brand || "",
      p.categoryGroup || "",
      p.categoryType || "",
      p.warrantyMonths || 12,
      cost,
      npp,
      floor,
      retail,
      p.thumbnail || "",
      (p.tags || []).join(", "),
      p.notes || "",
      p.description || "",
      // Cột 13: Mô tả sản phẩm
      formatSpecsToText(p.specifications),
      // Cột 14: Thông số kỹ thuật
      p.status || "active",
      p.id || "",
      p.updatedAt || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      JSON.stringify(p)
    ];
    rows.push(row);
  }
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${targetSheetTitle}'!A:Z`
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${targetSheetTitle}'!A1`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: rows
    }
  });
  try {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          // 1. Freeze dòng 1
          {
            updateSheetProperties: {
              properties: {
                sheetId,
                gridProperties: {
                  frozenRowCount: 1
                }
              },
              fields: "gridProperties.frozenRowCount"
            }
          },
          // 2. Định dạng Header dòng 1 (Xanh navy #0F172A, chữ trắng, in đậm, căn giữa)
          {
            repeatCell: {
              range: {
                sheetId,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: HEADERS.length
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.06, green: 0.09, blue: 0.16 },
                  // #0F172A
                  textFormat: {
                    foregroundColor: { red: 1, green: 1, blue: 1 },
                    bold: true,
                    fontSize: 10
                  },
                  horizontalAlignment: "CENTER",
                  verticalAlignment: "MIDDLE",
                  wrapStrategy: "WRAP"
                }
              },
              fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,wrapStrategy)"
            }
          },
          // 3. Đặt chiều rộng các cột
          {
            updateDimensionProperties: {
              range: {
                sheetId,
                dimension: "COLUMNS",
                startIndex: 0,
                endIndex: 1
                // SKU
              },
              properties: { pixelSize: 130 },
              fields: "pixelSize"
            }
          },
          {
            updateDimensionProperties: {
              range: {
                sheetId,
                dimension: "COLUMNS",
                startIndex: 1,
                endIndex: 2
                // Tên sản phẩm
              },
              properties: { pixelSize: 260 },
              fields: "pixelSize"
            }
          },
          {
            updateDimensionProperties: {
              range: {
                sheetId,
                dimension: "COLUMNS",
                startIndex: 6,
                endIndex: 10
                // 4 tầng giá
              },
              properties: { pixelSize: 110 },
              fields: "pixelSize"
            }
          },
          {
            updateDimensionProperties: {
              range: {
                sheetId,
                dimension: "COLUMNS",
                startIndex: 13,
                endIndex: 14
                // Mô tả sản phẩm
              },
              properties: { pixelSize: 320 },
              fields: "pixelSize"
            }
          },
          {
            updateDimensionProperties: {
              range: {
                sheetId,
                dimension: "COLUMNS",
                startIndex: 14,
                endIndex: 15
                // Thông số kỹ thuật
              },
              properties: { pixelSize: 360 },
              fields: "pixelSize"
            }
          }
        ]
      }
    });
  } catch (formatErr) {
    console.warn("L\u01B0u \u0111\u1ECBnh d\u1EA1ng Google Sheet c\u1EA3nh b\xE1o:", formatErr);
  }
  return {
    success: true,
    updatedRows: products.length,
    sheetTitle: targetSheetTitle
  };
}

// src/api/sheets/push.ts
var config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb"
    }
  }
};
async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  try {
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (_) {
      }
    } else if (!body || typeof body === "object" && Object.keys(body).length === 0) {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
      }
      if (chunks.length > 0) {
        const raw = Buffer.concat(chunks).toString("utf-8");
        try {
          body = JSON.parse(raw);
        } catch (_) {
        }
      }
    }
    const { products, sheetTitle = "S\u1EA3n ph\u1EA9m" } = body || {};
    if (!Array.isArray(products)) {
      return res.status(400).json({ success: false, error: "D\u1EEF li\u1EC7u products kh\xF4ng h\u1EE3p l\u1EC7 ho\u1EB7c r\u1ED7ng" });
    }
    const result = await pushProductsToSheet(products, sheetTitle);
    return res.status(200).json(result);
  } catch (error) {
    console.error("L\u1ED7i API /api/sheets/push:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "L\u1ED7i \u0111\u1EA9y d\u1EEF li\u1EC7u l\xEAn Google Sheets"
    });
  }
}
export {
  config,
  handler as default
};
