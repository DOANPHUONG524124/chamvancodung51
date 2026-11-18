import React, { useState, useEffect } from 'react';
import OwlMascot from './OwlMascot';

export default function StudentLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [classes, setClasses] = useState(['Lớp 5A1', 'Lớp 5A2']);
  const [selectedClass, setSelectedClass] = useState('Lớp 5A1');
  const [studentsInClass, setStudentsInClass] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [pinCode, setPinCode] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Tải danh sách lớp và học sinh
  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg('');
    setPinCode('');

    const fetchClassStudents = async () => {
      try {
        const res = await fetch(`/api/hoc-sinh?lop=${encodeURIComponent(selectedClass)}`);
        const data = await res.json();
        if (data.classes && data.classes.length > 0) {
          setClasses(data.classes);
        }
        if (data.students) {
          setStudentsInClass(data.students);
          if (data.students.length > 0) {
            setSelectedStudentId(data.students[0].maHocSinh);
          } else {
            setSelectedStudentId('');
          }
        }
      } catch (err) {
        console.error('Lỗi tải danh sách học sinh:', err);
      }
    };

    fetchClassStudents();
  }, [isOpen, selectedClass]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudentId) {
      setErrorMsg('Em hãy chọn tên của mình từ danh sách nhé!');
      return;
    }
    if (!pinCode.trim()) {
      setErrorMsg('Em hãy nhập mã PIN (4 số) do Cô giáo cấp nhé!');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/hoc-sinh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          lop: selectedClass,
          maHocSinh: selectedStudentId,
          maPin: pinCode.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Đăng nhập không thành công.');

      if (onLoginSuccess && data.student) {
        onLoginSuccess(data.student);
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Mã PIN chưa đúng hoặc có lỗi kết nối.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card student-login-card" onClick={(e) => e.stopPropagation()}>
        <div className="student-login-header">
          <OwlMascot state="welcome" size={90} />
          <h2 className="student-modal-title">Chào Em Vào Lớp Học!</h2>
          <p className="student-modal-subtitle">
            Em chọn Lớp và Tên của mình để Cú lưu lại bài viết và gửi Cô giáo chấm điểm nhé 🦉✨
          </p>
          <button type="button" className="btn-close-modal" onClick={onClose}>
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="alert-box error" role="alert">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="student-login-form">
          {/* BƯỚC 1: CHỌN LỚP */}
          <div className="form-group">
            <label className="field-label" htmlFor="student-class-select">
              1. Em học lớp nào?
            </label>
            <select
              id="student-class-select"
              className="input-select big-select"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              {classes.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* BƯỚC 2: CHỌN TÊN */}
          <div className="form-group">
            <label className="field-label" htmlFor="student-name-select">
              2. Tên của em là:
            </label>
            {studentsInClass.length === 0 ? (
              <div className="empty-class-note">
                Chưa có danh sách học sinh lớp này. Em nhờ Cô giáo cập nhật danh sách nhé!
              </div>
            ) : (
              <select
                id="student-name-select"
                className="input-select big-select"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
              >
                {studentsInClass.map((s) => (
                  <option key={s.maHocSinh} value={s.maHocSinh}>
                    {s.maHocSinh} - {s.hoVaTen}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* BƯỚC 3: MÃ PIN */}
          <div className="form-group">
            <label className="field-label" htmlFor="student-pin-input">
              3. Mã PIN của em (4 số cô giáo cấp):
            </label>
            <input
              id="student-pin-input"
              type="password"
              inputMode="numeric"
              maxLength={6}
              className="input-text student-pin-input"
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              placeholder="••••"
              autoFocus
              required
            />
            <span className="field-hint">💡 Nếu chưa có mã PIN, em hãy hỏi Cô giáo trên lớp nha!</span>
          </div>

          <div className="student-login-actions">
            <button
              type="submit"
              className="btn-primary-big btn-student-enter"
              disabled={isLoading || !selectedStudentId}
            >
              {isLoading ? '⏳ Đang vào lớp...' : '🚀 Vào góc luyện viết ngay!'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
