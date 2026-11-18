import React, { useState } from 'react';
import OwlMascot from './OwlMascot';

export default function StudentLookupModal({ isOpen, onClose, topics = [] }) {
  const [studentIdInput, setStudentIdInput] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    e.preventDefault();
    const cleanId = studentIdInput.trim();
    if (!cleanId) {
      setError('Em vui lòng nhập mã số học sinh của mình nhé!');
      return;
    }

    setIsLoading(true);
    setError('');
    setHasSearched(true);

    try {
      const res = await fetch(`/api/bai-nop?maHocSinh=${encodeURIComponent(cleanId)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi tra cứu bài nộp');
      setSubmissions(data.submissions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getTopicTitle = (maDe) => {
    const t = topics.find((item) => item.maDe === maDe);
    return t ? t.tenBai : (maDe || 'Đề tập làm văn');
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card lookup-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-icon">🔍</span>
          <div>
            <h3 className="modal-title">Tra Cứu Bài Làm Của Em</h3>
            <p className="modal-subtitle">Nhập mã số học sinh để xem nhận xét và sao từ Cô giáo nhé!</p>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* FORM NHẬP MÃ HỌC SINH */}
        <form onSubmit={handleSearch} className="lookup-search-form">
          <div className="lookup-input-row">
            <input
              type="text"
              className="input-text lookup-input"
              placeholder="Ví dụ: HS01, 05, Nam..."
              value={studentIdInput}
              onChange={(e) => setStudentIdInput(e.target.value)}
              autoFocus
            />
            <button type="submit" className="btn-primary-big btn-lookup-search" disabled={isLoading}>
              {isLoading ? '⏳ Đang tìm...' : '🔍 Xem bài'}
            </button>
          </div>
        </form>

        {error && <div className="alert-box error">⚠️ {error}</div>}

        {/* KẾT QUẢ TRA CỨU */}
        <div className="lookup-results-container">
          {hasSearched && !isLoading && submissions.length === 0 && (
            <div className="lookup-empty-card">
              <OwlMascot state="thinking" size={90} />
              <p>Chưa tìm thấy bài văn nào với mã số <strong>{studentIdInput}</strong>. Em kiểm tra lại mã số nhé!</p>
            </div>
          )}

          {submissions.map((sub) => {
            const isApproved = sub.trangThai === 'da_duyet';

            return (
              <div key={sub.maBai} className={`lookup-result-card ${isApproved ? 'approved' : 'pending'}`}>
                <div className="result-card-header">
                  <span className="result-topic-name">📖 {getTopicTitle(sub.maDe)}</span>
                  <span className={`result-status-tag ${sub.trangThai}`}>
                    {isApproved ? '🟢 Đã được Cô duyệt' : '🟡 Đang chờ Cô duyệt'}
                  </span>
                </div>

                <div className="result-time-text">
                  Gửi lúc: {sub.thoiGian ? new Date(sub.thoiGian).toLocaleString('vi-VN') : ''}
                </div>

                {/* NẾU CHƯA ĐƯỢC DUYỆT */}
                {!isApproved && (
                  <div className="pending-notice-box">
                    <OwlMascot state="thinking" size={80} />
                    <div>
                      <p className="pending-notice-title">Cú đã đọc bài của em rồi nè! 🦉</p>
                      <p className="pending-notice-desc">
                        Bài văn đang được Cô giáo đọc lại và chuẩn bị gửi lời khen cho em. Em quay lại xem sau ít phút nhé!
                      </p>
                    </div>
                  </div>
                )}

                {/* NẾU ĐÃ ĐƯỢC DUYỆT -> HIỆN SAO, LỜI KHEN, GỢI Ý (KHÔNG HIỆN ĐIỂM SỐ CON SỐ) */}
                {isApproved && (
                  <div className="approved-content-box">
                    <div className="stars-banner mini">
                      <div className="stars-row">
                        {'★'.repeat(sub.sao || 5)}
                        {'☆'.repeat(5 - (sub.sao || 5))}
                      </div>
                      <span className="badge-honor-title">🏅 Bài văn đã hoàn thành xuất sắc!</span>
                    </div>

                    <div className="feedback-section praise-box mini">
                      <h4>🦉 Cú gửi lời khen tới em:</h4>
                      <p className="praise-text">{sub.khen}</p>
                    </div>

                    {sub.goiY && sub.goiY.length > 0 && (
                      <div className="feedback-section tips-box mini">
                        <h4>💡 Mẹo nhỏ để bài sau hay hơn:</h4>
                        <ul className="tips-list">
                          {sub.goiY.map((g, i) => (
                            <li key={i} className="tip-item">
                              <span className="tip-bullet">🌱</span>
                              <span className="tip-text">{g}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {sub.loiChinhTa && sub.loiChinhTa.length > 0 && (
                      <div className="feedback-section spelling-box mini">
                        <h4>✍️ Mẹo chính tả cùng Cú:</h4>
                        <div className="spelling-grid">
                          {sub.loiChinhTa.map((item, idx) => (
                            <div key={idx} className="spelling-card">
                              <span className="word-wrong"><s>{item.sai}</s></span>
                              <span className="word-arrow">➔</span>
                              <span className="word-correct">{item.dung}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {sub.nhanXetGiaoVien && (
                      <div className="teacher-review-student-view">
                        <h4>👩‍🏫 Lời nhắn từ Cô giáo:</h4>
                        <p className="teacher-message-text">"{sub.nhanXetGiaoVien}"</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
