// src/api/sheets/test-gemini-key.ts
async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    let apiKey = (body?.apiKey || "").trim();
    if (!apiKey) {
      return res.status(400).json({ success: false, message: "Vui l\xF2ng cung c\u1EA5p apiKey" });
    }
    const match = apiKey.match(/(AIzaSy[A-Za-z0-9_-]{33}|AQ\.[A-Za-z0-9_-]{30,70})/);
    if (match) {
      apiKey = match[0];
    } else {
      apiKey = apiKey.replace(/^(VITE_)?(GEMINI_)?API_KEY\s*[:=]\s*/i, "");
      apiKey = apiKey.replace(/^key\s*[:=]\s*/i, "");
      apiKey = apiKey.replace(/^Bearer\s+/i, "");
      if (apiKey.startsWith('"') && apiKey.endsWith('"') || apiKey.startsWith("'") && apiKey.endsWith("'")) {
        apiKey = apiKey.slice(1, -1).trim();
      }
    }
    const testUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`;
    const googleRes = await fetch(testUrl);
    if (googleRes.ok) {
      const data = await googleRes.json().catch(() => ({}));
      const modelsCount = Array.isArray(data?.models) ? data.models.length : 0;
      return res.status(200).json({
        success: true,
        cleanedKey: apiKey,
        message: `K\u1EBFt n\u1ED1i th\xE0nh c\xF4ng t\u1EDBi Google Gemini AI (${modelsCount > 0 ? `${modelsCount} m\xF4 h\xECnh` : "H\u1EE3p l\u1EC7"})!`
      });
    }
    const errData = await googleRes.json().catch(() => ({}));
    const errMsg = errData?.error?.message || `HTTP ${googleRes.status}`;
    const status = errData?.error?.status || "";
    let friendlyMessage = `Google API ph\u1EA3n h\u1ED3i l\u1ED7i: ${errMsg}`;
    if (errMsg.toLowerCase().includes("api key not valid") || status === "INVALID_ARGUMENT") {
      friendlyMessage = 'M\xE3 API Key kh\xF4ng h\u1EE3p l\u1EC7. Kh\xF3a Google Gemini chu\u1EA9n b\u1EAFt \u0111\u1EA7u b\u1EB1ng "AIzaSy..." g\u1ED3m 39 k\xFD t\u1EF1 t\u1EEB Google AI Studio.';
    } else if (errMsg.toLowerCase().includes("has not been used in project") || errMsg.toLowerCase().includes("disabled")) {
      friendlyMessage = "API Key h\u1EE3p l\u1EC7 nh\u01B0ng d\u1ECBch v\u1EE5 Generative Language API ch\u01B0a \u0111\u01B0\u1EE3c b\u1EADt tr\xEAn Google Cloud Console.";
    } else if (errMsg.toLowerCase().includes("quota") || status === "RESOURCE_EXHAUSTED") {
      friendlyMessage = "API Key h\u1EE3p l\u1EC7 nh\u01B0ng \u0111\xE3 h\u1EBFt h\u1EA1n m\u1EE9c (Quota) mi\u1EC5n ph\xED h\xF4m nay.";
    } else if (errMsg.toLowerCase().includes("referer") || status === "PERMISSION_DENIED") {
      friendlyMessage = `API Key b\u1ECB gi\u1EDBi h\u1EA1n domain/IP: ${errMsg}.`;
    }
    return res.status(200).json({
      success: false,
      cleanedKey: apiKey,
      message: friendlyMessage,
      rawError: errMsg
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `L\u1ED7i k\u1EBFt n\u1ED1i t\u1EEB m\xE1y ch\u1EE7: ${error?.message || "Kh\xF4ng th\u1EC3 li\xEAn l\u1EA1c m\xE1y ch\u1EE7 Google"}`
    });
  }
}
export {
  handler as default
};
