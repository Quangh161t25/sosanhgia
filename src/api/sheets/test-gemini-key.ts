export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    let apiKey = (body?.apiKey || '').trim();
    if (!apiKey) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp apiKey' });
    }

    // Tự động nhận diện chuỗi AIzaSy hoặc AQ nếu bị bao bọc
    const match = apiKey.match(/(AIzaSy[A-Za-z0-9_-]{33}|AQ\.[A-Za-z0-9_-]{30,70})/);
    if (match) {
      apiKey = match[0];
    } else {
      // Bỏ ngoặc kép và tiền tố
      apiKey = apiKey.replace(/^(VITE_)?(GEMINI_)?API_KEY\s*[:=]\s*/i, '');
      apiKey = apiKey.replace(/^key\s*[:=]\s*/i, '');
      apiKey = apiKey.replace(/^Bearer\s+/i, '');
      if ((apiKey.startsWith('"') && apiKey.endsWith('"')) || (apiKey.startsWith("'") && apiKey.endsWith("'"))) {
        apiKey = apiKey.slice(1, -1).trim();
      }
    }

    const testUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`;
    const googleRes = await fetch(testUrl);

    if (googleRes.ok) {
      const data: any = await googleRes.json().catch(() => ({}));
      const modelsCount = Array.isArray(data?.models) ? data.models.length : 0;
      return res.status(200).json({
        success: true,
        cleanedKey: apiKey,
        message: `Kết nối thành công tới Google Gemini AI (${modelsCount > 0 ? `${modelsCount} mô hình` : 'Hợp lệ'})!`,
      });
    }

    const errData: any = await googleRes.json().catch(() => ({}));
    const errMsg = errData?.error?.message || `HTTP ${googleRes.status}`;
    const status = errData?.error?.status || '';

    let friendlyMessage = `Google API phản hồi lỗi: ${errMsg}`;
    if (errMsg.toLowerCase().includes('api key not valid') || status === 'INVALID_ARGUMENT') {
      friendlyMessage = 'Mã API Key không hợp lệ. Khóa Google Gemini chuẩn bắt đầu bằng "AIzaSy..." gồm 39 ký tự từ Google AI Studio.';
    } else if (errMsg.toLowerCase().includes('has not been used in project') || errMsg.toLowerCase().includes('disabled')) {
      friendlyMessage = 'API Key hợp lệ nhưng dịch vụ Generative Language API chưa được bật trên Google Cloud Console.';
    } else if (errMsg.toLowerCase().includes('quota') || status === 'RESOURCE_EXHAUSTED') {
      friendlyMessage = 'API Key hợp lệ nhưng đã hết hạn mức (Quota) miễn phí hôm nay.';
    } else if (errMsg.toLowerCase().includes('referer') || status === 'PERMISSION_DENIED') {
      friendlyMessage = `API Key bị giới hạn domain/IP: ${errMsg}.`;
    }

    return res.status(200).json({
      success: false,
      cleanedKey: apiKey,
      message: friendlyMessage,
      rawError: errMsg,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: `Lỗi kết nối từ máy chủ: ${error?.message || 'Không thể liên lạc máy chủ Google'}`,
    });
  }
}
