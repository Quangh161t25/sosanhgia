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
function getColumnLetter(colIndex) {
  let letter = "";
  while (colIndex >= 0) {
    letter = String.fromCharCode(colIndex % 26 + 65) + letter;
    colIndex = Math.floor(colIndex / 26) - 1;
  }
  return letter;
}
function formatSpecsToText(specifications) {
  if (!specifications || specifications.length === 0) return "";
  return specifications.map((g) => {
    const itemsStr = g.items.map((i) => `${i.key}: ${i.value}`).join(" | ");
    return `[${g.groupName}] ${itemsStr}`;
  }).join("\n");
}
function parseVietnamesePrice(val) {
  if (typeof val === "number") {
    return val;
  }
  if (!val) return 0;
  let s = String(val).trim();
  if (!s) return 0;
  s = s.replace(/[₫đVND\s]/gi, "").trim();
  if (/k$/i.test(s)) {
    const num = parseFloat(s.replace(/k$/i, "").replace(",", "."));
    return isNaN(num) ? 0 : Math.round(num * 1e3);
  }
  if (/tr(?:i[eệ]u)?$/i.test(s)) {
    const num = parseFloat(s.replace(/tr(?:i[eệ]u)?$/i, "").replace(",", "."));
    return isNaN(num) ? 0 : Math.round(num * 1e6);
  }
  if (s.includes(".") && s.includes(",")) {
    if (s.indexOf(".") < s.indexOf(",")) {
      s = s.replace(/\./g, "").replace(",", ".");
    } else {
      s = s.replace(/,/g, "");
    }
  } else if (/^\d{1,3}(\.\d{3})+$/.test(s)) {
    s = s.replace(/\./g, "");
  } else if (/^\d{1,3}(,\d{3})+$/.test(s)) {
    s = s.replace(/,/g, "");
  } else if (/^\d+\.\d{3}$/.test(s)) {
    s = s.replace(/\./g, "");
  } else if (/^\d+,\d{3}$/.test(s)) {
    s = s.replace(/,/g, "");
  } else {
    s = s.replace(/[^\d.-]/g, "");
  }
  const result = Number(s);
  return isNaN(result) ? 0 : result;
}
function parseProductFromRowData(row, colIndices, rowIndex) {
  const rowSku = String((colIndices.sku !== -1 ? row[colIndices.sku] : row[0]) || `SKU-${rowIndex}`).trim();
  const rowName = String((colIndices.name !== -1 ? row[colIndices.name] : row[1]) || `S\u1EA3n ph\u1EA9m ${rowIndex}`).trim();
  const rowDesc = colIndices.desc !== -1 && row[colIndices.desc] ? String(row[colIndices.desc]).trim() : "";
  const costPrice = colIndices.cost !== -1 ? parseVietnamesePrice(row[colIndices.cost]) : 0;
  const distributorPrice = colIndices.npp !== -1 ? parseVietnamesePrice(row[colIndices.npp]) : 0;
  const floorPrice = colIndices.floor !== -1 ? parseVietnamesePrice(row[colIndices.floor]) : 0;
  const retailPrice = colIndices.retail !== -1 ? parseVietnamesePrice(row[colIndices.retail]) : 0;
  const brand = colIndices.brand !== -1 && row[colIndices.brand] ? String(row[colIndices.brand]).trim() : "";
  const categoryGroup = colIndices.group !== -1 && row[colIndices.group] ? String(row[colIndices.group]).trim() : "\u0110i\u1EC7n gia d\u1EE5ng";
  const categoryType = colIndices.type !== -1 && row[colIndices.type] ? String(row[colIndices.type]).trim() : "S\u1EA3n ph\u1EA9m";
  const warrantyMonths = colIndices.warranty !== -1 ? Number(row[colIndices.warranty]) || 12 : 12;
  if (colIndices.json !== -1 && row[colIndices.json]) {
    try {
      const pObj = JSON.parse(row[colIndices.json]);
      if (pObj && pObj.sku && String(pObj.sku).trim().toUpperCase() === rowSku.toUpperCase()) {
        const cleanSku2 = String(pObj.sku).trim().toUpperCase();
        pObj.id = cleanSku2;
        pObj.sku = cleanSku2;
        pObj.pricing = {
          costPrice,
          distributorPrice,
          floorPrice,
          retailPrice,
          currency: "VND"
        };
        if (rowName) pObj.name = rowName;
        if (brand) pObj.brand = brand;
        if (rowDesc) pObj.description = rowDesc;
        if (categoryGroup) pObj.categoryGroup = categoryGroup;
        if (categoryType) pObj.categoryType = categoryType;
        if (warrantyMonths) pObj.warrantyMonths = warrantyMonths;
        return pObj;
      }
    } catch (e) {
    }
  }
  const thumbnail = colIndices.img !== -1 && row[colIndices.img] ? String(row[colIndices.img]).trim() : "";
  const tags = colIndices.tags !== -1 && row[colIndices.tags] ? String(row[colIndices.tags]).split(",").map((t) => t.trim()).filter(Boolean) : [];
  const notes = colIndices.notes !== -1 && row[colIndices.notes] ? String(row[colIndices.notes]).trim() : "";
  const rawSpecsText = colIndices.specs !== -1 && row[colIndices.specs] ? String(row[colIndices.specs]).trim() : "";
  let specifications = [];
  if (rawSpecsText) {
    specifications = parseSpecsTextToGroups(rawSpecsText);
  }
  const rowId = colIndices.id !== -1 && row[colIndices.id] ? String(row[colIndices.id]).trim().toUpperCase() : "";
  const cleanSku = rowSku.trim().toUpperCase();
  const stableId = cleanSku || rowId || `SP-ROW-${rowIndex}`;
  return {
    id: stableId,
    sku: cleanSku || stableId,
    name: rowName,
    brand,
    categoryGroup,
    categoryType,
    thumbnail: thumbnail || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
    warrantyMonths,
    pricing: {
      costPrice,
      distributorPrice,
      floorPrice,
      retailPrice,
      currency: "VND"
    },
    specifications,
    tags,
    notes,
    description: rowDesc,
    status: "active",
    updatedAt: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
  };
}
var KNOWN_KEYWORDS = {
  "Th\xF4ng s\u1ED1 v\u1EADn h\xE0nh": [
    "c\xF4ng su\u1EA5t",
    "\u0111i\u1EC7n \xE1p",
    "t\u1EA7n s\u1ED1",
    "dung t\xEDch",
    "t\u1ED1c \u0111\u1ED9",
    "v\xF2ng/ph\xFAt",
    "l\u1EF1c h\xFAt",
    "\xE1p su\u1EA5t",
    "nhi\u1EC7t \u0111\u1ED9",
    "\u0111\u1ED9 \u1ED3n",
    "pin",
    "th\u1EDDi gian s\u1EA1c",
    "th\u1EDDi gian s\u1EED d\u1EE5ng",
    "l\u01B0u l\u01B0\u1EE3ng",
    "l\u1EF1c si\u1EBFt",
    "\u0111\u1ED9ng c\u01A1",
    "motor",
    "dung l\u01B0\u1EE3ng pin"
  ],
  "K\xEDch th\u01B0\u1EDBc & Thi\u1EBFt k\u1EBF": [
    "k\xEDch th\u01B0\u1EDBc",
    "tr\u1ECDng l\u01B0\u1EE3ng",
    "kh\u1ED1i l\u01B0\u1EE3ng",
    "ch\u1EA5t li\u1EC7u",
    "m\xE0u s\u1EAFc",
    "chi\u1EC1u d\xE0i",
    "chi\u1EC1u r\u1ED9ng",
    "chi\u1EC1u cao",
    "\u0111\u01B0\u1EDDng k\xEDnh",
    "v\u1ECF",
    "l\xF2ng n\u1ED3i",
    "thi\u1EBFt k\u1EBF",
    "ki\u1EC3u d\xE1ng"
  ],
  "C\xF4ng ngh\u1EC7 & T\xEDnh n\u0103ng": [
    "c\xF4ng ngh\u1EC7",
    "\u0111i\u1EC1u khi\u1EC3n",
    "m\xE0n h\xECnh",
    "ch\u1EBF \u0111\u1ED9",
    "ch\u01B0\u01A1ng tr\xECnh",
    "k\u1EBFt n\u1ED1i",
    "wifi",
    "bluetooth",
    "app",
    "c\u1EA3m bi\u1EBFn",
    "t\u1EF1 \u0111\u1ED9ng",
    "t\xEDnh n\u0103ng",
    "ti\u1EC7n \xEDch",
    "h\u1EB9n gi\u1EDD",
    "l\u1ECDc b\u1EE5i",
    "ch\u1ED1ng d\xEDnh"
  ],
  "Ti\xEAu chu\u1EA9n & B\u1EA3o h\xE0nh": [
    "b\u1EA3o h\xE0nh",
    "xu\u1EA5t x\u1EE9",
    "th\u01B0\u01A1ng hi\u1EC7u",
    "ph\u1EE5 ki\u1EC7n",
    "ch\u1EE9ng nh\u1EADn",
    "ti\xEAu chu\u1EA9n",
    "ch\u1ED1ng n\u01B0\u1EDBc",
    "an to\xE0n",
    "t\u1EF1 ng\u1EAFt"
  ]
};
function categorizeKey(key) {
  const lower = key.toLowerCase();
  for (const [groupName, keywords] of Object.entries(KNOWN_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return groupName;
    }
  }
  return "Th\xF4ng s\u1ED1 k\u1EF9 thu\u1EADt kh\xE1c";
}
function parseSpecsTextToGroups(text) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const groups = [];
  for (const line of lines) {
    const groupMatch = line.match(/^\[([^\]]+)\]\s*(.*)$/);
    if (groupMatch) {
      const gName = groupMatch[1].trim();
      const content = groupMatch[2].trim();
      const items = [];
      content.split("|").forEach((part) => {
        const colonIdx2 = part.indexOf(":");
        if (colonIdx2 > 0) {
          const k = part.substring(0, colonIdx2).trim();
          const v = part.substring(colonIdx2 + 1).trim();
          if (k && v) {
            items.push({
              key: k,
              value: v,
              isHighlight: /công suất|dung tích|lực hút|lực siết|pin|bảo hành/i.test(k)
            });
          }
        }
      });
      if (items.length > 0) {
        groups.push({ groupName: gName, items });
        continue;
      }
    }
    const colonIdx = line.indexOf(":");
    if (colonIdx > 0) {
      const k = line.substring(0, colonIdx).trim();
      const v = line.substring(colonIdx + 1).trim();
      if (k && v) {
        const gName = categorizeKey(k);
        let g = groups.find((x) => x.groupName.toLowerCase() === gName.toLowerCase());
        if (!g) {
          g = { groupName: gName, items: [] };
          groups.push(g);
        }
        g.items.push({
          key: k,
          value: v,
          isHighlight: /công suất|dung tích|lực hút|lực siết|pin|bảo hành/i.test(k)
        });
      }
    }
  }
  return groups;
}
async function parseSpecsFromRawText(rawText, customApiKey) {
  if (!rawText || !rawText.trim()) return [];
  const apiKey = (customApiKey || process.env.GEMINI_API_KEY || "").trim();
  if (apiKey) {
    const models = [
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-flash",
      "gemini-3.8-flash",
      "gemini-3.5-flash",
      "gemini-flash-latest",
      "gemini-1.5-pro"
    ];
    for (const model of models) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const prompt = `B\u1EA1n l\xE0 chuy\xEAn gia ph\xE2n t\xEDch d\u1EEF li\u1EC7u k\u1EF9 thu\u1EADt s\u1EA3n ph\u1EA9m v\xE0 so s\xE1nh th\xF4ng s\u1ED1 B2B.
Nhi\u1EC7m v\u1EE5: H\xE3y ph\xE2n t\xEDch \u0111o\u1EA1n m\xF4 t\u1EA3 k\u1EF9 thu\u1EADt s\u1EA3n ph\u1EA9m sau \u0111\xE2y v\xE0 tr\xEDch xu\u1EA5t th\xE0nh danh s\xE1ch c\xE1c nh\xF3m th\xF4ng s\u1ED1 k\u1EF9 thu\u1EADt (SpecGroup).
M\u1ED7i nh\xF3m g\u1ED3m 'groupName' (v\xED d\u1EE5: 'Th\xF4ng s\u1ED1 v\u1EADn h\xE0nh', 'K\xEDch th\u01B0\u1EDBc & Thi\u1EBFt k\u1EBF', 'C\xF4ng ngh\u1EC7 & Ti\u1EC7n \xEDch', 'Ngu\u1ED3n \u0111i\u1EC7n & Ti\xEAu th\u1EE5', 'Ti\xEAu chu\u1EA9n & B\u1EA3o h\xE0nh'...) v\xE0 danh s\xE1ch 'items' (m\u1ED7i item c\xF3 'key', 'value', v\xE0 'isHighlight': boolean n\u1EBFu l\xE0 th\xF4ng s\u1ED1 n\u1ED5i b\u1EADt quan tr\u1ECDng).

V\u0103n b\u1EA3n m\xF4 t\u1EA3 \u0111\u1EA7u v\xE0o:
"""
${rawText}
"""

Y\xCAU C\u1EA6U: Tr\u1EA3 v\u1EC1 DUY NH\u1EA4T m\u1ED9t JSON array h\u1EE3p l\u1EC7:
[
  {
    "groupName": "T\xEAn nh\xF3m",
    "items": [
      { "key": "T\xEAn th\xF4ng s\u1ED1", "value": "Gi\xE1 tr\u1ECB k\xE8m \u0111\u01A1n v\u1ECB n\u1EBFu c\xF3", "isHighlight": false }
    ]
  }
]`;
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.1,
              responseMimeType: "application/json"
            }
          })
        });
        if (res.ok) {
          const data = await res.json();
          const cand = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
          let cleaned = cand.trim();
          if (cleaned.startsWith("```json")) cleaned = cleaned.replace(/^```json\s*/, "");
          if (cleaned.startsWith("```")) cleaned = cleaned.replace(/^```\s*/, "");
          if (cleaned.endsWith("```")) cleaned = cleaned.replace(/```$/, "");
          cleaned = cleaned.trim();
          const parsed = JSON.parse(cleaned);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.warn(`Gemini API (${model}) failed:`, e);
      }
    }
  }
  const items = [];
  const text = rawText.replace(/\r?\n/g, ". ");
  const patterns = [
    { regex: /công\s*suất[:\s]+([\d\.]+\s*(?:w|kw|hp|mã\s*lực))/i, key: "C\xF4ng su\u1EA5t", isHighlight: true },
    { regex: /dung\s*tích(?:\s*lòng\s*nồi)?[:\s]+([\d\.]+\s*(?:l|lít|ml))/i, key: "Dung t\xEDch", isHighlight: true },
    { regex: /điện\s*áp[:\s]+([\d\.]+\s*v(?:[\s\-]+[\d\.]+hz)?)/i, key: "\u0110i\u1EC7n \xE1p" },
    { regex: /(?:dải\s*)?nhiệt\s*độ[:\s]+([\d\.]+(?:°c|c)?\s*[\-–]\s*[\d\.]+\s*(?:°c|c)?)/i, key: "D\u1EA3i nhi\u1EC7t \u0111\u1ED9" },
    { regex: /lực\s*hút[:\s]+([\d\.]+\s*(?:pa|kpa))/i, key: "L\u1EF1c h\xFAt t\u1ED1i \u0111a", isHighlight: true },
    { regex: /lực\s*siết[:\s]+([\d\.]+\s*n\.?m)/i, key: "L\u1EF1c si\u1EBFt t\u1ED1i \u0111a", isHighlight: true },
    { regex: /tốc\s*độ(?:\s*không\s*tải)?[:\s]+([\d\.\s\-–]+(?:vòng\/phút|rpm))/i, key: "T\u1ED1c \u0111\u1ED9 kh\xF4ng t\u1EA3i" },
    { regex: /(?:dung\s*lượng\s*)?pin[:\s]+([\d\.]+\s*(?:mah|ah|v))/i, key: "Dung l\u01B0\u1EE3ng pin", isHighlight: true },
    { regex: /trọng\s*lượng|khối\s*lượng[:\s]+([\d\.]+\s*(?:kg|g|gam))/i, key: "Tr\u1ECDng l\u01B0\u1EE3ng" },
    { regex: /kích\s*thước[:\s]+([\d\.\s]+(?:x|\*)\s*[\d\.\s]+(?:x|\*)\s*[\d\.\s]+(?:mm|cm|m)?)/i, key: "K\xEDch th\u01B0\u1EDBc" },
    { regex: /chất\s*liệu(?:\s*lòng\s*nồi)?[:\s]+([^,\.\n\t]+?)(?=\s{2,}|$|[,\.\n])/i, key: "Ch\u1EA5t li\u1EC7u" },
    { regex: /bảo\s*hành[:\s]+(\d+\s*(?:tháng|năm))/i, key: "B\u1EA3o h\xE0nh" },
    { regex: /độ\s*ồn[:\s]+([<≤]?\s*[\d\.]+\s*db)/i, key: "\u0110\u1ED9 \u1ED3n" },
    { regex: /công\s*nghệ[:\s]+([^,\.\n\t]+?)(?=\s{2,}|$|[,\.\n])/i, key: "C\xF4ng ngh\u1EC7" },
    { regex: /bảng\s*điều\s*khiển[:\s]+([^,\.\n\t]+?)(?=\s{2,}|$|[,\.\n])/i, key: "B\u1EA3ng \u0111i\u1EC1u khi\u1EC3n" }
  ];
  for (const p of patterns) {
    const m = text.match(p.regex);
    if (m && m[1]) {
      items.push({
        key: p.key,
        value: m[1].trim(),
        isHighlight: Boolean(p.isHighlight)
      });
    }
  }
  const segments = rawText.split(/\r?\n|  +/).map((l) => l.trim()).filter(Boolean);
  for (const seg of segments) {
    const clean = seg.replace(/^[\*\-\•\–\—\+]\s*/, "").trim();
    const colonIdx = clean.indexOf(":");
    if (colonIdx > 0 && colonIdx < 50) {
      const k = clean.substring(0, colonIdx).trim();
      const v = clean.substring(colonIdx + 1).trim();
      if (k && v && !items.some((it) => it.key.toLowerCase() === k.toLowerCase())) {
        items.push({
          key: k,
          value: v,
          isHighlight: /công suất|dung tích|lực hút|lực siết|pin|bảo hành|kích thước|khối lượng/i.test(k)
        });
      }
    }
  }
  const groups = [];
  for (const item of items) {
    const gName = categorizeKey(item.key);
    let g = groups.find((x) => x.groupName.toLowerCase() === gName.toLowerCase());
    if (!g) {
      g = { groupName: gName, items: [] };
      groups.push(g);
    }
    g.items.push(item);
  }
  return groups;
}
async function aiAnalyzeSheetSpecs(sheetTitle = DEFAULT_SHEET_TITLE, customApiKey) {
  const { sheets } = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${sheetTitle}'!A:Z`,
    valueRenderOption: "UNFORMATTED_VALUE"
  });
  const rawRows = res.data.values || [];
  if (rawRows.length <= 1) {
    return { success: true, analyzedCount: 0, sheetTitle, products: [] };
  }
  const headerRow = rawRows[0] || [];
  const skuColIdx = headerRow.findIndex((h) => h && h.toLowerCase().includes("sku"));
  const nameColIdx = headerRow.findIndex((h) => h && h.toLowerCase().includes("t\xEAn"));
  const brandColIdx = headerRow.findIndex((h) => h && h.toLowerCase().includes("th\u01B0\u01A1ng hi\u1EC7u"));
  const groupColIdx = headerRow.findIndex((h) => h && h.toLowerCase().includes("nh\xF3m"));
  const typeColIdx = headerRow.findIndex((h) => h && h.toLowerCase().includes("lo\u1EA1i"));
  const warrantyColIdx = headerRow.findIndex((h) => h && h.toLowerCase().includes("b\u1EA3o h\xE0nh"));
  const costColIdx = headerRow.findIndex((h) => h && h.toLowerCase().includes("nh\u1EADp"));
  const nppColIdx = headerRow.findIndex((h) => h && h.toLowerCase().includes("npp"));
  const floorColIdx = headerRow.findIndex((h) => h && h.toLowerCase().includes("s\xE0n"));
  const retailColIdx = headerRow.findIndex(
    (h) => h && (h.toLowerCase().includes("b\xE1n l\u1EBB") || h.toLowerCase().includes("ni\xEAm y\u1EBFt") || h.toLowerCase().includes("th\u01B0\u01A1ng m\u1EA1i"))
  );
  const imgColIdx = headerRow.findIndex((h) => h && (h.toLowerCase().includes("\u1EA3nh") || h.toLowerCase().includes("link")));
  const tagsColIdx = headerRow.findIndex((h) => h && h.toLowerCase().includes("tags"));
  const notesColIdx = headerRow.findIndex((h) => h && h.toLowerCase().includes("ch\xFA"));
  const descColIdx = headerRow.findIndex((h) => h && h.toLowerCase().includes("m\xF4 t\u1EA3"));
  const specsColIdx = headerRow.findIndex((h) => h && h.toLowerCase().includes("th\xF4ng s\u1ED1"));
  const idColIdx = headerRow.findIndex((h) => h && (h.toLowerCase().includes("id") || h.toLowerCase().includes("m\xE3 h\u1EC7 th\u1ED1ng")));
  const jsonColIdx = headerRow.findIndex((h) => h && h.includes("D\u1EEF li\u1EC7u JSON"));
  if (descColIdx === -1 || specsColIdx === -1) {
    throw new Error(`Kh\xF4ng t\xECm th\u1EA5y c\u1ED9t "M\xF4 t\u1EA3 s\u1EA3n ph\u1EA9m" ho\u1EB7c "Th\xF4ng s\u1ED1 k\u1EF9 thu\u1EADt" tr\xEAn tab "${sheetTitle}". Vui l\xF2ng b\u1EA5m "\u0110\u1ED3ng b\u1ED9 l\xEAn Sheet" \u0111\u1EC3 kh\u1EDFi t\u1EA1o l\u1EA1i b\u1EA3ng ti\xEAu \u0111\u1EC1.`);
  }
  const colIndices = {
    sku: skuColIdx,
    name: nameColIdx,
    brand: brandColIdx,
    group: groupColIdx,
    type: typeColIdx,
    warranty: warrantyColIdx,
    cost: costColIdx,
    npp: nppColIdx,
    floor: floorColIdx,
    retail: retailColIdx,
    img: imgColIdx,
    tags: tagsColIdx,
    notes: notesColIdx,
    desc: descColIdx,
    specs: specsColIdx,
    id: idColIdx,
    json: jsonColIdx
  };
  let analyzedCount = 0;
  const updateValues = [];
  const updatedProducts = [];
  let activeApiKey = customApiKey;
  if (!activeApiKey) {
    try {
      const sheetSettings = await pullSettingsFromSheet();
      activeApiKey = sheetSettings.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    } catch (_) {
    }
  }
  for (let i = 1; i < rawRows.length; i++) {
    const row = rawRows[i];
    if (!row || row.length === 0 || !row.some((c) => Boolean(c))) continue;
    const p = parseProductFromRowData(row, colIndices, i);
    const rawDesc = String(row[descColIdx] || "").trim();
    if (!rawDesc) {
      updatedProducts.push(p);
      continue;
    }
    const specGroups = await parseSpecsFromRawText(rawDesc, activeApiKey);
    const specsText = formatSpecsToText(specGroups);
    const specsColLetter = getColumnLetter(specsColIdx);
    updateValues.push({
      range: `'${sheetTitle}'!${specsColLetter}${i + 1}`,
      values: [[specsText]]
    });
    analyzedCount++;
    p.description = rawDesc;
    p.specifications = specGroups;
    updatedProducts.push(p);
    if (jsonColIdx !== -1) {
      const jsonColLetter = getColumnLetter(jsonColIdx);
      updateValues.push({
        range: `'${sheetTitle}'!${jsonColLetter}${i + 1}`,
        values: [[JSON.stringify(p)]]
      });
    }
  }
  if (updateValues.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        valueInputOption: "USER_ENTERED",
        data: updateValues
      }
    });
  }
  return {
    success: true,
    analyzedCount,
    sheetTitle,
    products: updatedProducts
  };
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

// src/api/sheets/ai-parse-specs.ts
async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { sheetTitle = "S\u1EA3n ph\u1EA9m", apiKey } = body || {};
    const result = await aiAnalyzeSheetSpecs(sheetTitle, apiKey);
    return res.status(200).json(result);
  } catch (error) {
    console.error("L\u1ED7i API /api/sheets/ai-parse-specs:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "L\u1ED7i server AI ph\xE2n t\xEDch th\xF4ng s\u1ED1"
    });
  }
}
export {
  handler as default
};
