import { requireTeacherAuth, verifyTeacherToken } from './_auth.js';
import { getStudents, verifyStudentLogin, importStudents, deleteStudent } from './_db.js';

export default async function handler(req, res) {
  const method = req.method;

  if (method === 'GET') {
    const isTeacher = hasTeacherToken(req);
    const lop = req.query?.lop || '';

    const data = await getStudents({ lop }, isTeacher);
    return res.status(200).json(data);
  }

  if (method === 'POST') {
    const { action = 'login', lop, maHocSinh, hoVaTen, maPin, students = [] } = req.body || {};

    // 1. Học sinh đăng nhập (Công khai, không cần quyền giáo viên)
    if (action === 'login') {
      if (!lop || !maHocSinh || !maPin) {
        return res.status(400).json({ error: 'Em vui lòng chọn Lớp, Tên/Mã số và nhập Mã PIN nhé!' });
      }

      const result = await verifyStudentLogin({ lop, maHocSinh, maPin });
      if (!result.success) {
        return res.status(401).json({ error: result.error || 'Đăng nhập không thành công.' });
      }

      return res.status(200).json(result);
    }

    // Các thao tác dưới đây bắt buộc phải có quyền Giáo viên
    if (!requireTeacherAuth(req, res)) {
      return;
    }

    // 2. Nhập danh sách học sinh từ file CSV / Excel
    if (action === 'import') {
      if (!Array.isArray(students) || students.length === 0) {
        return res.status(400).json({ error: 'Dữ liệu danh sách học sinh không hợp lệ.' });
      }

      const result = await importStudents(students);
      return res.status(200).json(result);
    }

    // 3. Thêm hoặc cập nhật một học sinh
    if (action === 'save') {
      if (!maHocSinh || !hoVaTen) {
        return res.status(400).json({ error: 'Vui lòng nhập đầy đủ Mã học sinh và Họ và tên.' });
      }

      const result = await importStudents([{
        maHocSinh,
        hoVaTen,
        lop: lop || 'Lớp 5A1',
        maPin: maPin || '1234'
      }]);
      return res.status(200).json(result);
    }

    // 4. Xóa học sinh
    if (action === 'delete') {
      if (!maHocSinh) {
        return res.status(400).json({ error: 'Thiếu mã học sinh cần xóa.' });
      }

      const result = await deleteStudent(maHocSinh);
      return res.status(200).json(result);
    }

    return res.status(400).json({ error: 'Hành động không hợp lệ.' });
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
