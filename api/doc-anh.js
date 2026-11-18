// Vercel Serverless Function: /api/doc-anh
// Nhận diện và trích xuất chữ viết tay tiếng Việt từ ảnh chụp trang vở học sinh bằng Gemini Flash-Lite

const MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash'
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Chỉ chấp nhận phương thức POST.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'Chưa cài đặt biến môi trường GEMINI_API_KEY trên Vercel.'
    });
  }

  const { image = '', mimeType = 'image/jpeg' } = req.body || {};

  if (!image) {
    return res.status(400).json({ error: 'Vui lòng cung cấp dữ liệu ảnh trang vở.' });
  }

  // Tách phần tiền tố data URL (data:image/jpeg;base64,...) nếu có
  const cleanBase64 = image.includes('base64,')
    ? image.split('base64,')[1]
    : image;

  const prompt = `Bạn là trợ lý chuyên đọc và phiên âm chữ viết tay tiếng Việt của học sinh tiểu học (lớp 5) trên trang vở kẻ ô ly.
Nhiệm vụ của bạn:
1. Đọc và chép lại toàn bộ bài văn của học sinh trong ảnh một cách trung thực nhất.
2. Giữ nguyên từng câu chữ, ngắt dòng, thụt lề đoạn văn và GIỮ NGUYÊN CẢ LỖI CHÍNH TẢ (nếu học sinh viết sai) để phục vụ cho việc chấm bài của Thầy/Cô.
3. Không tự tiện sửa lỗi của học sinh, không thêm bớt lời bình, không thêm dấu Markdown code block.
4. Chỉ trả về DUY NHẤT nội dung bài viết của học sinh.`;

  let lastError = null;

  for (const model of MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: mimeType || 'image/jpeg',
                    data: cleanBase64
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1
          }
        })
      });

      if (response.status === 429) {
        return res.status(429).json({
          error: 'Cú Thông Thái đang đọc quá nhiều ảnh cùng lúc. Em vui lòng đợi 1 phút rồi thử lại nhé!'
        });
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        if (response.status === 404) {
          lastError = errData?.error?.message || `Model ${model} không hỗ trợ ảnh`;
          continue;
        }
        return res.status(502).json({
          error: errData?.error?.message || `Lỗi từ Gemini Vision (${response.status})`
        });
      }

      const data = await response.json();
      const extractedText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const cleanText = extractedText.replace(/```[a-z]*|```/gi, '').trim();

      const words = cleanText ? cleanText.split(/\s+/).length : 0;

      return res.status(200).json({
        success: true,
        text: cleanText,
        wordCount: words,
        message: 'Đã nhận diện chữ viết từ ảnh trang vở thành công!'
      });
    } catch (err) {
      lastError = err;
      continue;
    }
  }

  console.error('OCR Error:', lastError);
  return res.status(500).json({
    error: 'Không thể nhận diện chữ từ ảnh này. Em hãy chụp ảnh rõ nét và đủ ánh sáng hơn nhé!'
  });
}
