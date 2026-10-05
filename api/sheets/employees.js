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
async function pullEmployeesFromSheet(sheetTitle = "NHAN_VIEN") {
  const { sheets } = getSheetsClient();
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${sheetTitle}'!A:Z`,
      valueRenderOption: "UNFORMATTED_VALUE"
    });
    const rows = res.data.values || [];
    if (rows.length <= 1) {
      return [];
    }
    const header = (rows[0] || []).map((h) => String(h || "").toLowerCase().trim());
    const idIdx = header.findIndex((h) => h === "id" || h.includes("m\xE3"));
    const hoTenIdx = header.findIndex((h) => h.includes("h\u1ECD t\xEAn") || h.includes("hoten") || h.includes("t\xEAn"));
    const taiKhoanIdx = header.findIndex((h) => h.includes("t\xE0i kho\u1EA3n") || h.includes("taikhoan") || h.includes("username") || h.includes("user"));
    const matKhauIdx = header.findIndex((h) => h.includes("m\u1EADt kh\u1EA9u") || h.includes("matkhau") || h.includes("password") || h.includes("pass"));
    const anhIdx = header.findIndex((h) => h.includes("\u1EA3nh") || h.includes("anh") || h.includes("avatar") || h.includes("h\xECnh"));
    const quyenIdx = header.findIndex((h) => h.includes("quyen") || h.includes("quy\u1EC1n") || h.includes("vai tr\xF2") || h.includes("ch\u1EE9c v\u1EE5") || h.includes("role"));
    const employees = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;
      const taiKhoan = String(taiKhoanIdx !== -1 ? row[taiKhoanIdx] ?? "" : row[2] ?? "").trim();
      const hoTen = String(hoTenIdx !== -1 ? row[hoTenIdx] ?? "" : row[1] ?? "").trim();
      if (!taiKhoan && !hoTen) continue;
      const id = String(idIdx !== -1 ? row[idIdx] ?? "" : row[0] ?? `NV${String(i).padStart(2, "0")}`).trim();
      const matKhau = String(matKhauIdx !== -1 ? row[matKhauIdx] ?? "" : row[3] ?? "123456").trim();
      const anh = String(anhIdx !== -1 ? row[anhIdx] ?? "" : row[4] ?? "").trim();
      const quyen = String(quyenIdx !== -1 ? row[quyenIdx] ?? "" : row[5] ?? "Nh\xE2n vi\xEAn").trim();
      employees.push({
        id: id || `NV${String(i).padStart(2, "0")}`,
        hoTen: hoTen || taiKhoan,
        taiKhoan,
        matKhau,
        anh,
        quyen: quyen || "Nh\xE2n vi\xEAn"
      });
    }
    return employees;
  } catch (error) {
    console.error("L\u1ED7i khi \u0111\u1ECDc sheet NHAN_VIEN:", error);
    throw error;
  }
}

// src/api/sheets/employees.ts
async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  try {
    const sheetTitle = req.query?.sheetTitle || "NHAN_VIEN";
    const employees = await pullEmployeesFromSheet(sheetTitle);
    return res.status(200).json({ success: true, count: employees.length, employees });
  } catch (error) {
    console.error("L\u1ED7i API /api/sheets/employees:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "L\u1ED7i k\u1EBFt n\u1ED1i \u0111\u1ECDc danh s\xE1ch nh\xE2n vi\xEAn t\u1EEB Google Sheets"
    });
  }
}
export {
  handler as default
};
