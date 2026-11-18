import { createTeacherToken } from './_auth.js';

/**
 * Serverless function: /api/login
 * Xác thực mật khẩu giáo viên từ process.env.TEACHER_PASSWORD và cấp token phiên làm việc
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Chỉ chấp nhận phương thức POST.' });
  }

  const { password = '' } = req.body || {};
  const teacherPassword = process.env.TEACHER_PASSWORD || 'giaovien123';

  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Vui lòng nhập mật khẩu.' });
  }

  if (password.trim() !== teacherPassword.trim()) {
    return res.status(401).json({
      error: 'Mật khẩu giáo viên không chính xác. Thầy/Cô vui lòng thử lại!'
    });
  }

  // Cấp token phiên làm việc an toàn
  const token = createTeacherToken();

  return res.status(200).json({
    success: true,
    token,
    role: 'teacher',
    expiresIn: 8 * 60 * 60, // 8 giờ tính theo giây
    message: 'Đăng nhập chế độ Thầy Cô thành công!'
  });
}
