import { requireTeacherAuth } from './_auth.js';
import { getRubrics, saveRubric } from './_db.js';

/**
 * Serverless function: /api/rubric
 * - GET: Lấy bộ tiêu chí (rubric) của các dạng văn
 * - POST: Giáo viên chỉnh sửa tiêu chí & điểm tối đa (Yêu cầu token, kiểm tra tổng điểm = 10)
 */
export default async function handler(req, res) {
  const method = req.method;

  if (method === 'GET') {
    const rubrics = await getRubrics();
    return res.status(200).json({ success: true, rubrics });
  }

  if (method === 'POST') {
    if (!requireTeacherAuth(req, res)) {
      return;
    }

    const rubric = req.body?.rubric || req.body || {};
    const { dangVan, tieuChi, tongDiemMax = 10 } = rubric;

    if (!dangVan || !Array.isArray(tieuChi) || tieuChi.length === 0) {
      return res.status(400).json({ error: 'Dữ liệu dạng văn và danh sách tiêu chí không hợp lệ.' });
    }

    // Kiểm tra tổng điểm tối đa của các tiêu chí
    const expectedTotal = Number(tongDiemMax) || 10;
    const currentTotal = tieuChi.reduce((acc, c) => acc + (Number(c.max) || 0), 0);
    const roundedCurrent = Math.round(currentTotal * 10) / 10;

    if (Math.abs(roundedCurrent - expectedTotal) > 0.01) {
      return res.status(400).json({
        error: `Tổng điểm các tiêu chí (${roundedCurrent}đ) không khớp với thang điểm tối đa đã cài (${expectedTotal}đ). Thầy/Cô vui lòng cân đối lại điểm các tiêu chí nhé!`
      });
    }

    const result = await saveRubric({
      dangVan,
      tieuChi,
      tongDiemMax: expectedTotal
    });

    return res.status(200).json(result);
  }

  return res.status(405).json({ error: 'Phương thức không được hỗ trợ.' });
}
