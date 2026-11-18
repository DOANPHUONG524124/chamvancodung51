import { requireTeacherAuth, verifyTeacherToken } from './_auth.js';
import { getTopics, saveTopic, deleteTopic } from './_db.js';

/**
 * Serverless function: /api/de-bai
 * - GET: Học sinh xem các đề đang mở; Giáo viên (có token) xem toàn bộ đề
 * - POST: Giáo viên thêm / sửa đề bài (Yêu cầu token giáo viên)
 * - DELETE: Giáo viên xóa đề bài (Yêu cầu token giáo viên)
 */
export default async function handler(req, res) {
  const method = req.method;

  if (method === 'GET') {
    const allTopics = await getTopics();
    const isTeacher = hasTeacherToken(req);

    // Học sinh chỉ thấy các đề đang mở ('mo')
    if (!isTeacher) {
      const openTopics = allTopics.filter(t => t.trangThai === 'mo');
      return res.status(200).json({ success: true, topics: openTopics });
    }

    // Giáo viên xem toàn bộ danh sách đề
    return res.status(200).json({ success: true, topics: allTopics });
  }

  // Các thao tác POST / DELETE yêu cầu đăng nhập giáo viên
  if (!requireTeacherAuth(req, res)) {
    return;
  }

  if (method === 'POST') {
    const topicData = req.body?.topic || req.body || {};
    if (!topicData.tenBai || !topicData.yeuCau) {
      return res.status(400).json({ error: 'Tên bài và yêu cầu đề bài không được để trống.' });
    }

    const result = await saveTopic(topicData);
    return res.status(200).json(result);
  }

  if (method === 'DELETE') {
    const maDe = req.query?.maDe || req.body?.maDe;
    if (!maDe) {
      return res.status(400).json({ error: 'Thiếu mã đề cần xóa.' });
    }

    const result = await deleteTopic(maDe);
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
