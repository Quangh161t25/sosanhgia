// src/server/googleSheetsService.ts
import { google } from "googleapis";
import fs from "fs";
import path from "path";
var SPREADSHEET_ID = "16I-JJUzrLWHh0nuKqoJwggAcrF_xIpBbT6EAcN5Geeg";
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
var DEFAULT_SETTINGS_SHEET_TITLE = "CAI_DAT";
async function pullSettingsFromSheet(sheetTitle = DEFAULT_SETTINGS_SHEET_TITLE) {
  const { sheets } = getSheetsClient();
  try {
    await ensureSheetExists(sheetTitle);
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${sheetTitle}'!A:E`,
      valueRenderOption: "UNFORMATTED_VALUE"
    });
    const rows = res.data.values || [];
    if (rows.length <= 1) {
      return {};
    }
    const settings = {};
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;
      const key = String(row[0] || "").trim().toUpperCase();
      const val = String(row[2] !== void 0 ? row[2] : "").trim();
      if (key) {
        settings[key] = val;
      }
    }
    return settings;
  } catch (error) {
    console.error(`L\u1ED7i khi \u0111\u1ECDc sheet ${sheetTitle}:`, error);
    return {};
  }
}
async function pushSettingsToSheet(settings, sheetTitle = DEFAULT_SETTINGS_SHEET_TITLE) {
  const { sheets } = getSheetsClient();
  const sheetId = await ensureSheetExists(sheetTitle);
  const current = await pullSettingsFromSheet(sheetTitle);
  const merged = { ...current };
  for (const [k, v] of Object.entries(settings)) {
    merged[k.trim().toUpperCase()] = String(v ?? "").trim();
  }
  const metaDefs = {
    GEMINI_API_KEY: {
      label: "Kh\xF3a Google Gemini AI API Key",
      desc: "Kh\xF3a API Google Gemini AI d\xF9ng \u0111\u1EC3 b\xF3c t\xE1ch th\xF4ng s\u1ED1 k\u1EF9 thu\u1EADt t\u1EF1 \u0111\u1ED9ng"
    },
    AI_MODEL: {
      label: "M\xF4 h\xECnh AI m\u1EB7c \u0111\u1ECBnh",
      desc: "Model Google AI \u0111\u01B0\u1EE3c s\u1EED d\u1EE5ng ph\xE2n t\xEDch (v\xED d\u1EE5: gemini-2.5-flash)"
    },
    SHEET_NAME_PRODUCTS: {
      label: "Tab Danh m\u1EE5c S\u1EA3n ph\u1EA9m",
      desc: "T\xEAn tab ch\u1EE9a b\u1EA3ng d\u1EEF li\u1EC7u s\u1EA3n ph\u1EA9m trong Google Sheet"
    },
    AUTO_SYNC: {
      label: "T\u1EF1 \u0111\u1ED9ng \u0111\u1ED3ng b\u1ED9",
      desc: "T\u1EF1 \u0111\u1ED9ng \u0111\u1EA9y d\u1EEF li\u1EC7u l\xEAn Google Sheet khi th\xEAm ho\u1EB7c ch\u1EC9nh s\u1EEDa s\u1EA3n ph\u1EA9m"
    }
  };
  const rows = [
    ["M\xE3 c\u1EA5u h\xECnh", "T\xEAn c\u1EA5u h\xECnh", "Gi\xE1 tr\u1ECB c\u1EA5u h\xECnh", "M\xF4 t\u1EA3 / H\u01B0\u1EDBng d\u1EABn", "Ng\xE0y c\u1EADp nh\u1EADt"]
  ];
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const allKeys = Array.from(/* @__PURE__ */ new Set([...Object.keys(metaDefs), ...Object.keys(merged)]));
  for (const k of allKeys) {
    const key = k.trim().toUpperCase();
    const val = merged[key] !== void 0 ? merged[key] : "";
    const def = metaDefs[key] || { label: key, desc: "C\u1EA5u h\xECnh h\u1EC7 th\u1ED1ng" };
    rows.push([key, def.label, val, def.desc, today]);
  }
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${sheetTitle}'!A1`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: rows }
  });
  try {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            updateSheetProperties: {
              properties: {
                sheetId,
                gridProperties: { frozenRowCount: 1 }
              },
              fields: "gridProperties.frozenRowCount"
            }
          },
          {
            repeatCell: {
              range: {
                sheetId,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: 5
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.06, green: 0.09, blue: 0.16 },
                  textFormat: {
                    foregroundColor: { red: 1, green: 1, blue: 1 },
                    bold: true,
                    fontSize: 10
                  },
                  horizontalAlignment: "CENTER"
                }
              },
              fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)"
            }
          }
        ]
      }
    });
  } catch (e) {
  }
  return { success: true, updatedRows: rows.length - 1 };
}

// src/api/sheets/settings.ts
var config = {
  api: {
    bodyParser: {
      sizeLimit: "2mb"
    }
  }
};
async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  try {
    if (req.method === "GET") {
      const sheetTitle = req.query?.sheetTitle || "CAI_DAT";
      const settings = await pullSettingsFromSheet(sheetTitle);
      return res.status(200).json({ success: true, settings });
    }
    if (req.method === "POST") {
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
      const { settings, sheetTitle = "CAI_DAT" } = body || {};
      if (!settings || typeof settings !== "object") {
        return res.status(400).json({ success: false, error: "D\u1EEF li\u1EC7u settings kh\xF4ng h\u1EE3p l\u1EC7" });
      }
      const result = await pushSettingsToSheet(settings, sheetTitle);
      return res.status(200).json(result);
    }
    return res.status(405).json({ success: false, error: "Ph\u01B0\u01A1ng th\u1EE9c kh\xF4ng \u0111\u01B0\u1EE3c h\u1ED7 tr\u1EE3" });
  } catch (error) {
    console.error("L\u1ED7i API /api/sheets/settings:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "L\u1ED7i thao t\xE1c v\u1EDBi c\u1EA5u h\xECnh Google Sheets"
    });
  }
}
export {
  config,
  handler as default
};
