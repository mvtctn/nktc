// Rule-based parsing helper for Vietnamese construction logs
export const parseRawLog = (rawText, defaultDate = '', defaultPage = '') => {
  if (!rawText) return createEmptyLog(defaultDate, defaultPage);

  const text = rawText.trim();
  
  // 1. Extract Date (ngay)
  let ngay = defaultDate || getTodayDateString();
  const dateRegex = /(?:ngày|ngay)\s+(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/i;
  const dateMatch = text.match(dateRegex);
  if (dateMatch) {
    let day = dateMatch[1].padStart(2, '0');
    let month = dateMatch[2].padStart(2, '0');
    let year = dateMatch[3];
    if (year.length === 2) year = '20' + year; // Convert 25 -> 2025
    ngay = `${day}/${month}/${year}`;
  }

  // 2. Extract Page Number (trang)
  let trang = defaultPage || "1";
  const pageRegex = /(?:trang|trg|p\.?)\s*(\d+)/i;
  const pageMatch = text.match(pageRegex);
  if (pageMatch) {
    trang = pageMatch[1];
  }

  // 3. Extract Weather (thoi_tiet_sang, thoi_tiet_chieu)
  let thoi_tiet_sang = "Bình thường";
  let thoi_tiet_chieu = "Bình thường";
  
  const weatherText = text.toLowerCase();
  
  // Check variations
  const hasRain = weatherText.includes("mưa") || weatherText.includes("giông") || weatherText.includes("dông");
  const hasSun = weatherText.includes("nắng") || weatherText.includes("nắng gắt") || weatherText.includes("hửng nắng");
  const hasNormal = weatherText.includes("âm u") || weatherText.includes("mát") || weatherText.includes("bình thường") || weatherText.includes("khô ráo");

  // Separate morning & afternoon if possible
  const morningPart = weatherText.match(/(?:sáng|buổi sáng)\s+([^,.]+)/i);
  const afternoonPart = weatherText.match(/(?:chiều|buổi chiều)\s+([^,.]+)/i);

  if (morningPart) {
    const mText = morningPart[1];
    if (mText.includes("mưa")) thoi_tiet_sang = "Mưa";
    else if (mText.includes("nắng")) thoi_tiet_sang = "Nắng";
    else thoi_tiet_sang = "Bình thường";
  } else {
    if (hasRain && weatherText.indexOf("mưa") < weatherText.indexOf("chiều") && weatherText.includes("sáng")) thoi_tiet_sang = "Mưa";
    else if (hasSun && (weatherText.includes("sáng nắng") || !weatherText.includes("chiều nắng"))) thoi_tiet_sang = "Nắng";
  }

  if (afternoonPart) {
    const aText = afternoonPart[1];
    if (aText.includes("mưa")) thoi_tiet_chieu = "Mưa";
    else if (aText.includes("nắng")) thoi_tiet_chieu = "Nắng";
    else thoi_tiet_chieu = "Bình thường";
  } else {
    if (hasRain && (weatherText.includes("chiều mưa") || weatherText.includes("chiều đổ mưa") || !weatherText.includes("sáng mưa"))) thoi_tiet_chieu = "Mưa";
    else if (hasSun && (weatherText.includes("chiều nắng") || (hasSun && !weatherText.includes("sáng")))) thoi_tiet_chieu = "Nắng";
  }

  // Fallback if not specified morning/afternoon separately
  if (!morningPart && !afternoonPart) {
    if (hasRain) {
      thoi_tiet_sang = "Mưa";
      thoi_tiet_chieu = "Mưa";
    } else if (hasSun) {
      thoi_tiet_sang = "Nắng";
      thoi_tiet_chieu = "Nắng";
    }
  }

  // 4. Extract Manpower (so_luong_cong_nhan)
  let so_luong_cong_nhan = 0;
  const workerRegex = /(\d+)\s*(?:người|nhân sự|thợ|công nhân|lính)/i;
  const workerMatch = text.match(workerRegex);
  if (workerMatch) {
    so_luong_cong_nhan = parseInt(workerMatch[1], 10);
  }

  // 5. Extract Equipment (thiet_bi)
  const thiet_bi = [];
  const equipmentRules = [
    { key: "Máy cắt tay", patterns: [/cắt tay/i, /máy cắt tay/i] },
    { key: "Máy cắt bàn", patterns: [/cắt bàn/i, /máy cắt bàn/i] },
    { key: "Máy khoan", patterns: [/khoan/i, /máy khoan/i, /khoan bê tông/i] },
    { key: "Máy laser định cao độ", patterns: [/laser/i, /laze/i, /định cao độ/i] },
    { key: "Xe nâng người", patterns: [/xe nâng/i, /xe nâng người/i] },
    { key: "Máy đột lỗ", patterns: [/đột lỗ/i, /máy đột lỗ/i] },
    { key: "Máy hàn soi/hàn đối đầu ống HDPE", patterns: [/máy hàn/i, /hàn soi/i, /hàn đối đầu/i, /hàn ống/i, /máy hàn điện/i] }
  ];

  // Try to find quantities for each equipment
  equipmentRules.forEach(rule => {
    let quantity = 0;
    let found = false;

    for (const pattern of rule.patterns) {
      // Look for patterns like: "3 máy cắt tay", "máy cắt tay 3 chiếc", "cắt tay: 3", "cắt tay SL 3"
      const quantityPatterns = [
        new RegExp(`(\\d+)\\s*${pattern.source}`, 'i'),
        new RegExp(`${pattern.source}\\s*(?:số lượng|sl|:)?\\s*(\\d+)`, 'i')
      ];

      for (const qPattern of quantityPatterns) {
        const match = text.match(qPattern);
        if (match) {
          found = true;
          // Extract the number (it can be in match[1] or match[2] depending on pattern)
          const numStr = match[1] || match[2];
          if (numStr) {
            quantity = Math.max(quantity, parseInt(numStr, 10));
          }
        }
      }

      if (!found && text.match(pattern)) {
        found = true;
        quantity = 1; // Default to 1 if mentioned but no number found
      }
    }

    if (found && quantity > 0) {
      const qStr = quantity.toString().padStart(2, '0');
      thiet_bi.push(`${rule.key}: ${qStr} cái`);
    }
  });

  // 6. Extract Materials (vat_lieu)
  const vat_lieu = [];
  const materialRules = [
    { key: "Ống HDPE", patterns: [/ống đen/i, /ống nhựa đen/i, /hdpe/i] },
    { key: "Ống nhựa", patterns: [/ống nhựa/i] },
    { key: "Ống thép", patterns: [/ống thép/i, /ống kẽm/i] },
    { key: "Màng chít bảo vệ", patterns: [/màng chít/i, /quấn ống/i, /pe/i] }
  ];

  materialRules.forEach(rule => {
    let found = false;
    let details = "";
    
    for (const pattern of rule.patterns) {
      const match = text.match(pattern);
      if (match) {
        found = true;
        // Try to capture details around it (e.g. "ống hdpe dn110: 20m")
        const contextRegex = new RegExp(`(?:${pattern.source})\\s*([^,.\\n]{1,40})`, 'i');
        const contextMatch = text.match(contextRegex);
        if (contextMatch && contextMatch[1].trim()) {
          details = contextMatch[1].trim();
        }
        break;
      }
    }

    if (found) {
      if (details) {
        // Clean details a bit
        details = details.replace(/^[:\-\s]+/, '');
        vat_lieu.push(`${rule.key} (${details})`);
      } else {
        vat_lieu.push(rule.key);
      }
    }
  });

  // 7. Work Progress (tien_trinh_cong_viec)
  const tien_trinh_cong_viec = [];
  // Split raw text into sentences and find rows that talk about action/progress
  const lines = text.split(/[\n\.\;]/);
  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;
    
    // Skip dates, metadata, safety, weather, or equipment lists
    if (
      trimmed.match(/(?:ngày|trang|thiết bị|đội thợ|an toàn|vệ sinh|thời tiết)/i) ||
      trimmed.match(/(?:máy cắt|khoan|nâng|đột lỗ|vận chuyển)/i) && trimmed.match(/\d+\s*(?:cái|chiếc|bộ)/i)
    ) {
      return;
    }

    // Standardize HDPE terms inside sentences
    let cleanLine = trimmed
      .replace(/ống đen/gi, 'ống HDPE')
      .replace(/máy hàn điện/gi, 'máy hàn soi/hàn đối đầu ống HDPE')
      .replace(/màng chít bảo vệ/gi, 'màng chít');

    // Filter sentences starting with actions
    const actionKeywords = /^(?:thực hiện|thi công|lắp đặt|tháo|dỡ|quấn|vận chuyển|gia công|khoan|đột|hàn|chuẩn bị|đo|định vị|lấy dấu|bắt|gá|treo|cố định)/i;
    if (actionKeywords.test(cleanLine)) {
      // Capitalize first letter
      cleanLine = cleanLine.charAt(0).toUpperCase() + cleanLine.slice(1);
      tien_trinh_cong_viec.push(cleanLine);
    }
  });

  // If nothing matched, look for paragraphs containing work details
  if (tien_trinh_cong_viec.length === 0) {
    const progressRegex = /(?:tiến độ|công việc|tiến trình|hoạt động|làm)\s*:\s*([^.]+)/i;
    const match = text.match(progressRegex);
    if (match && match[1].trim()) {
      let cleanProgress = match[1].trim()
        .replace(/ống đen/gi, 'ống HDPE')
        .replace(/máy hàn điện/gi, 'máy hàn soi/hàn đối đầu ống HDPE');
      cleanProgress = cleanProgress.charAt(0).toUpperCase() + cleanProgress.slice(1);
      tien_trinh_cong_viec.push(cleanProgress);
    } else {
      // Fallback: use first few lines that are not metadata
      const fallbackLines = lines.slice(0, 3).map(l => l.trim()).filter(l => l.length > 15 && !l.match(/(?:ngày|trang|thiết bị|đội thợ)/i));
      fallbackLines.forEach(l => {
        let cleanL = l.replace(/ống đen/gi, 'ống HDPE').replace(/máy hàn điện/gi, 'máy hàn soi/hàn đối đầu ống HDPE');
        tien_trinh_cong_viec.push(cleanL.charAt(0).toUpperCase() + cleanL.slice(1));
      });
    }
  }

  // 8. Safety & Environment
  let an_toan_lao_dong = "Tốt";
  if (text.match(/không an toàn/i) || text.match(/an toàn không tốt/i) || text.match(/tai nạn/i) || text.match(/sự cố an toàn/i)) {
    an_toan_lao_dong = "Không tốt";
  }

  let ve_sinh_moi_truong = "Tốt";
  if (text.match(/vệ sinh kém/i) || text.match(/bẩn/i) || text.match(/rác thải bừa bãi/i) || text.match(/vệ sinh xấu/i)) {
    ve_sinh_moi_truong = "Xấu";
  } else if (text.match(/vệ sinh trung bình/i) || text.match(/chưa dọn dẹp kỹ/i) || text.match(/tạm được/i)) {
    ve_sinh_moi_truong = "Trung bình";
  }

  // 9. Pending Issues (ghi_chu_khac)
  const ghi_chu_list = [];
  
  // Extract "Chờ mặt bằng" (MB)
  const mbRegex = /(?:chờ mặt bằng|chờ mb|vướng mặt bằng|chưa có mặt bằng)\s*([^.,;\n]+)/i;
  const mbMatch = text.match(mbRegex);
  if (mbMatch) {
    ghi_chu_list.push(`Chờ mặt bằng thi công tại: ${mbMatch[1].trim()}`);
  }

  // Extract "Chờ vật tư"
  const vtRegex = /(?:chờ vật tư|chờ vật liệu|thiếu vật tư|chờ phối hợp|bên a cấp|chờ quạt|chờ vật tư từ bên a)\s*([^.,;\n]+)/i;
  const vtMatch = text.match(vtRegex);
  if (vtMatch) {
    ghi_chu_list.push(`Chờ vật tư phối hợp: ${vtMatch[1].trim()}`);
  }

  // Look for any other general notes/vướng mắc
  const generalNotes = text.match(/(?:vướng mắc|kiến nghị|lưu ý)\s*:\s*([^.\n]+)/i);
  if (generalNotes && generalNotes[1].trim()) {
    ghi_chu_list.push(generalNotes[1].trim());
  }

  let ghi_chu_khac = ghi_chu_list.join('. ') || "Không có vướng mắc.";
  // Make sure it ends with a dot
  if (ghi_chu_khac && !ghi_chu_khac.endsWith('.')) ghi_chu_khac += '.';

  return {
    ngay,
    trang,
    thoi_tiet_sang,
    thoi_tiet_chieu,
    thiet_bi,
    vat_lieu,
    so_luong_cong_nhan,
    tien_trinh_cong_viec: tien_trinh_cong_viec.slice(0, 5), // Cap at 5 main works
    an_toan_lao_dong,
    ve_sinh_moi_truong,
    ghi_chu_khac
  };
};

// Gemini API Parsing utility for advanced logs processing
export const parseLogWithGemini = async (rawText, apiKey, defaultDate = '', defaultPage = '') => {
  if (!apiKey) {
    throw new Error("Cần cung cấp API Key để sử dụng tính năng phân tích bằng AI");
  }

  const prompt = `
Bạn là một AI Agent - Trợ lý Kỹ sư hiện trường cấp cao của Công ty Cổ phần Hydrotech (chuyên sâu về hệ thống thoát nước mưa Siphonic và hệ thống xử lý nước công nghệ cao).
Nhiệm vụ của bạn là tiếp nhận ghi chép thô từ công trường dưới đây, sau đó làm sạch, phân tích và chuẩn hóa cấu trúc thành dữ liệu Nhật ký thi công chính xác dưới dạng JSON.

HÃY TUÂN THỦ CÁC QUY TẮC SAU:
1. TOÀN VẸN THÔNG TIN: Không tự ý bịa đặt thông tin không có trong bản ghi thô. Chuẩn hóa thuật ngữ chuyên môn: "ống đen"/"ống nhựa đen" -> "ống HDPE", "máy hàn điện" -> "máy hàn soi/hàn đối đầu ống HDPE", "màng chít" -> "màng chít bảo vệ".
2. PHÂN LOẠI THỜI TIẾT: Chuyển đổi sang các nhãn chuẩn: [Nắng / Mưa / Bình thường]. Nếu có biến động sáng/chiều, ghi rõ từng buổi.
3. ĐÁNH GIÁ AN TOÀN & VỆ SINH:
   - An toàn lao động: [Tốt / Không tốt]
   - Vệ sinh môi trường: [Tốt / Trung bình / Xấu]
4. THEO DÕI MẶT BẰNG & VẬT TƯ: Đưa các thông tin chờ mặt bằng (MB) hoặc chờ vật tư từ bên A cấp vào mục "ghi_chu_khac".
5. ĐỊNH DẠNG NGÀY: "DD/MM/YYYY" (Ngày thi công). Nếu không ghi rõ năm, mặc định là năm 2026. Nếu bản ghi không chứa ngày, hãy dùng ngày mặc định: "${defaultDate || getTodayDateString()}".
6. SỐ TRANG: Số trang dạng chuỗi ký tự số. Nếu không có, dùng số trang mặc định: "${defaultPage || "1"}".

DỮ LIỆU THÔ CẦN XỬ LÝ:
"${rawText}"

TRẢ VỀ KẾT QUẢ DƯỚI DẠNG MỘT ĐỐI TƯỢNG JSON DUY NHẤT. KHÔNG KÈM THEO LỜI THOẠI. KHÔNG BỌC TRONG BLOCK \`\`\`json ... \`\`\`.
Cấu trúc JSON như sau:
{
  "ngay": "DD/MM/YYYY",
  "trang": "Chuỗi ký tự số",
  "thoi_tiet_sang": "Nắng / Mưa / Bình thường",
  "thoi_tiet_chieu": "Nắng / Mưa / Bình thường",
  "thiet_bi": ["Tên thiết bị 1: 0X cái", "Tên thiết bị 2: 0Y cái"],
  "vat_lieu": ["Danh sách vật tư/vật liệu đưa vào sử dụng"],
  "so_luong_cong_nhan": Kiểu số nguyên,
  "tien_trinh_cong_viec": [
    "Đầu việc 1 - Ghi rõ nội dung hoạt động và vị trí cụ thể",
    "Đầu việc 2 - Ghi rõ nội dung hoạt động và vị trí cụ thể"
  ],
  "an_toan_lao_dong": "Tốt / Không tốt",
  "ve_sinh_moi_truong": "Tốt / Trung bình / Xấu",
  "ghi_chu_khac": "Các vướng mắc mặt bằng, vật tư, kiến nghị khác"
}
`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.candidates[0].content.parts[0].text.trim();
    // Parse the JSON
    return JSON.parse(resultText);
  } catch (error) {
    console.error("Lỗi khi gọi Gemini API:", error);
    // Fallback to rule-based parser
    return parseRawLog(rawText, defaultDate, defaultPage);
  }
};

// Helper utilities
const getTodayDateString = () => {
  const today = new Date();
  const day = today.getDate().toString().padStart(2, '0');
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const year = today.getFullYear();
  return `${day}/${month}/${year}`;
};

const createEmptyLog = (defaultDate = '', defaultPage = '') => {
  return {
    ngay: defaultDate || getTodayDateString(),
    trang: defaultPage || "1",
    thoi_tiet_sang: "Bình thường",
    thoi_tiet_chieu: "Bình thường",
    thiet_bi: [],
    vat_lieu: [],
    so_luong_cong_nhan: 0,
    tien_trinh_cong_viec: [],
    an_toan_lao_dong: "Tốt",
    ve_sinh_moi_truong: "Tốt",
    ghi_chu_khac: "Không có vướng mắc."
  };
};
