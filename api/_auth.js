import crypto from 'crypto';

/**
 * Khóa bí mật dùng để ký token phiên của giáo viên.
 * Ưu tiên: TEACHER_SESSION_SECRET -> TEACHER_PASSWORD -> fallback mặc định an toàn
 */
const getSecret = () => {
  return process.env.TEACHER_SESSION_SECRET || process.env.TEACHER_PASSWORD || 'cham-van-lop5-teacher-secret-key-2026';
};

/**
 * Tạo token phiên HMAC cho giáo viên có hạn dùng 8 giờ
 */
export function createTeacherToken() {
  const secret = getSecret();
  const now = Date.now();
  const payload = {
    role: 'teacher',
    iat: now,
    exp: now + 8 * 60 * 60 * 1000 // Hạn dùng 8 tiếng
  };
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(payloadBase64).digest('base64url');
  return `${payloadBase64}.${signature}`;
}

/**
 * Kiểm tra tính hợp lệ và thời hạn của token phiên
 */
export function verifyTeacherToken(token) {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'Thiếu mã token xác thực phiên làm việc.' };
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return { valid: false, error: 'Token phiên không đúng định dạng.' };
  }

  const [payloadBase64, signature] = parts;
  const secret = getSecret();
  const expectedSig = crypto.createHmac('sha256', secret).update(payloadBase64).digest('base64url');

  if (signature !== expectedSig) {
    return { valid: false, error: 'Chữ ký token không hợp lệ hoặc đã bị chỉnh sửa.' };
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf8'));
    if (payload.role !== 'teacher') {
      return { valid: false, error: 'Quyền hạn trong token không hợp lệ.' };
    }
    if (Date.now() > payload.exp) {
      return { valid: false, error: 'Phiên làm việc đã hết hạn. Thầy/Cô vui lòng đăng nhập lại.' };
    }
    return { valid: true, payload };
  } catch (err) {
    return { valid: false, error: 'Không thể giải mã dữ liệu phiên làm việc.' };
  }
}

/**
 * Middleware bảo vệ các Serverless Function dành riêng cho giáo viên.
 * Trả về true nếu hợp lệ, trả về false và gửi response 401 nếu không hợp lệ.
 */
export function requireTeacherAuth(req, res) {
  const authHeader = req.headers?.authorization || req.headers?.Authorization || '';
  let token = '';

  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.body && typeof req.body.token === 'string') {
    token = req.body.token.trim();
  } else if (req.headers && req.headers['x-teacher-token']) {
    token = String(req.headers['x-teacher-token']).trim();
  }

  const check = verifyTeacherToken(token);
  if (!check.valid) {
    res.status(401).json({
      error: check.error || 'Quyền truy cập bị từ chối. Thầy/Cô vui lòng đăng nhập lại.',
      code: 'UNAUTHORIZED'
    });
    return false;
  }

  return true;
}
