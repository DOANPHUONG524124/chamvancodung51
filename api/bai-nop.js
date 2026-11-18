import { requireTeacherAuth, verifyTeacherToken } from './_auth.js';
import { getSubmissions, updateSubmission, getStudentSubmissions } from './_db.js';

/**
 * Serverless function: /api/bai-nop
 * - GET:
 *   + Giáo viên (có token): Xem danh sách bài nộp, lọc theo mã đề, mã học sinh, trạng thái
 *   + Học sinh: Tra cứu bài của mình theo mã số học sinh (chỉ hiện kết quả nếu đã được cô giáo duyệt)
 * - PUT / POST: Giáo viên sửa điểm, cập nhật nhận xét và duyệt bài (Yêu cầu token giáo viên)
 */
export default async function handler(req, res) {
  const method = req.method;

  if (method === 'GET') {
    const isTeacher = hasTeacherToken(req);
    const maHocSinh = req.query?.maHocSinh;

    // Chế độ tra cứu của học sinh (không có token giáo viên, có mã học sinh)
    if (!isTeacher && maHocSinh) {
      const studentSubmissions = await getStudentSubmissions(maHocSinh);
      return res.status(200).json({ success: true, submissions: studentSubmissions });
    }

    // Các trường hợp xem danh sách tổng thể bắt buộc phải có quyền giáo viên
    if (!requireTeacherAuth(req, res)) {
      return;
    }

    const submissions = await getSubmissions({
      filterMaDe: req.query?.filterMaDe,
      filterMaHS: req.query?.filterMaHS,
      filterTrangThai: req.query?.filterTrangThai
    });

    return res.status(200).json({ success: true, submissions });
  }

  // Thao tác cập nhật điểm / duyệt bài của giáo viên
  if (method === 'PUT' || method === 'POST') {
    if (!requireTeacherAuth(req, res)) {
      return;
    }

    const { maBai, diemGiaoVienChinh, nhanXetGiaoVien, trangThai } = req.body || {};
    if (!maBai) {
      return res.status(400).json({ error: 'Thiếu mã bài nộp để cập nhật.' });
    }

    const result = await updateSubmission({
      maBai,
      diemGiaoVienChinh,
      nhanXetGiaoVien,
      trangThai: trangThai || 'da_duyet'
    });

    return res.status(200).json(result);
  }

  return res.status(405).json({ error: 'Phương thức không được hỗ trợ.' });
}

function hasTeacherToken(req) {
  const authHeader = req.headers?.authorization || req.headers?.Authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    return verifyTeacherToken(token).valid;
  }
  const customHeader = req.headers && req.headers['x-teacher-token'];
  if (customHeader) {
    return verifyTeacherToken(String(customHeader)).valid;
  }
  return false;
}
