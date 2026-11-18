import React, { useState } from 'react';

/**
 * Modal đăng nhập Chế độ Giáo viên
 * Xác thực qua POST /api/login, lưu token trong React State (KHÔNG dùng localStorage)
 */
export default function TeacherLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMessage('Vui lòng nhập mật khẩu của Thầy/Cô.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Mật khẩu chưa chính xác, vui lòng thử lại.');
      }

      // Đăng nhập thành công, chuyển token lên state cha
      onLoginSuccess(data.token);
      setPassword('');
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Có lỗi xảy ra khi xác thực.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-icon">👩‍🏫</span>
          <h3 className="modal-title">Đăng Nhập Chế Độ Thầy Cô</h3>
          <button
            type="button"
            className="btn-close-modal"
            onClick={onClose}
            aria-label="Đóng cửa sổ"
          >
            ✕
          </button>
        </div>

        <p className="modal-description">
          Chế độ Thầy Cô cho phép quản lý đề bài, tùy chỉnh Rubric tiêu chí và duyệt bài chấm của học sinh. Mật khẩu được bảo vệ an toàn trên hệ thống.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="modal-input-group">
            <label htmlFor="teacher-pass-input" className="field-label">
              Mật khẩu giáo viên:
            </label>
            <div className="password-input-wrapper">
              <input
                id="teacher-pass-input"
                type={showPassword ? 'text' : 'password'}
                className="input-password"
                placeholder="Nhập mật khẩu..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                disabled={isLoading}
              />
              <button
                type="button"
                className="btn-toggle-eye"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? '👁️' : '🙈'}
              </button>
            </div>
            <p className="password-hint">
              💡 <em>Mật khẩu mặc định: <strong>giaovien123</strong></em>
            </p>
          </div>

          {errorMessage && (
            <div className="modal-error-alert" role="alert">
              ⚠️ {errorMessage}
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary-clean"
              onClick={onClose}
              disabled={isLoading}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="btn-primary-big btn-unlock"
              disabled={isLoading}
            >
              {isLoading ? '⏳ Đang xác thực...' : '🔓 Đăng nhập ngay'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
