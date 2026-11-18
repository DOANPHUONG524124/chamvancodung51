import React, { useState, useEffect } from 'react';

export const GENRES = [
  'Kể chuyện sáng tạo',
  'Văn miêu tả phong cảnh',
  'Văn tả người',
  'Viết đoạn văn / bài văn biểu cảm, nêu cảm xúc',
  'Viết đoạn văn giới thiệu',
  'Viết báo cáo công việc và chương trình hoạt động',
  'Viết đoạn văn nêu ý kiến'
];

export default function TeacherTopicManager({ teacherToken, onTopicsUpdated }) {
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form thêm / sửa đề
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTopicId, setEditingTopicId] = useState(null);
  const [formData, setFormData] = useState({
    tap: 1,
    chuDiem: '',
    tenBai: '',
    dangVan: 'Tả phong cảnh',
    yeuCau: '',
    doDai: '150-250 từ',
    trangThai: 'mo'
  });

  // Tải danh sách đề từ server
  const fetchTopics = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/de-bai', {
        headers: { Authorization: `Bearer ${teacherToken}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi tải đề bài');
      setTopics(data.topics || []);
      if (onTopicsUpdated) onTopicsUpdated();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (teacherToken) fetchTopics();
  }, [teacherToken]);

  // Mở form tạo đề mới
  const handleOpenCreate = () => {
    setEditingTopicId(null);
    setFormData({
      tap: 1,
      chuDiem: '',
      tenBai: '',
      dangVan: 'Tả phong cảnh',
      yeuCau: '',
      doDai: '150-250 từ',
      trangThai: 'mo'
    });
    setIsFormOpen(true);
    setSuccessMsg('');
    setError('');
  };

  // Mở form chỉnh sửa đề
  const handleOpenEdit = (topic) => {
    setEditingTopicId(topic.maDe);
    setFormData({
      tap: Number(topic.tap) || 1,
      chuDiem: topic.chuDiem || '',
      tenBai: topic.tenBai || '',
      dangVan: topic.dangVan || 'Tả phong cảnh',
      yeuCau: topic.yeuCau || '',
      doDai: topic.doDai || '150-250 từ',
      trangThai: topic.trangThai || 'mo'
    });
    setIsFormOpen(true);
    setSuccessMsg('');
    setError('');
  };

  // Lưu đề bài (Thêm hoặc Sửa)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.tenBai.trim() || !formData.yeuCau.trim()) {
      setError('Vui lòng nhập đầy đủ tên bài và yêu cầu đề.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const payload = {
        ...formData,
        maDe: editingTopicId || `DE-${Date.now()}`
      };

      const res = await fetch('/api/de-bai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacherToken}`
        },
        body: JSON.stringify({ topic: payload })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi lưu đề bài');

      setSuccessMsg(editingTopicId ? 'Cập nhật đề bài thành công!' : 'Thêm đề bài mới thành công!');
      setIsFormOpen(false);
      await fetchTopics();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Bật/tắt nhanh trạng thái Đang mở / Đã đóng
  const handleToggleStatus = async (topic) => {
    const newStatus = topic.trangThai === 'mo' ? 'dong' : 'mo';
    try {
      const res = await fetch('/api/de-bai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacherToken}`
        },
        body: JSON.stringify({
          topic: { ...topic, trangThai: newStatus }
        })
      });
      if (res.ok) {
        setTopics(topics.map(t => t.maDe === topic.maDe ? { ...t, trangThai: newStatus } : t));
        if (onTopicsUpdated) onTopicsUpdated();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Xóa đề bài
  const handleDeleteTopic = async (maDe, tenBai) => {
    if (!window.confirm(`Thầy/Cô có chắc chắn muốn xóa đề "${tenBai}" không?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/de-bai?maDe=${encodeURIComponent(maDe)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${teacherToken}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Không thể xóa đề bài');

      setSuccessMsg('Đã xóa đề bài thành công!');
      await fetchTopics();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="teacher-panel-content">
      <div className="panel-header-row">
        <div>
          <h2 className="panel-title">📚 Quản Lý Đề Bài Tập Làm Văn Lớp 5</h2>
          <p className="panel-subtitle">
            Giáo viên tự do thêm, sửa, đóng/mở đề bài theo kế hoạch dạy học thực tế (Học sinh chỉ thấy các đề đang mở)
          </p>
        </div>
        <button
          type="button"
          className="btn-primary-big btn-add-topic"
          onClick={handleOpenCreate}
        >
          ➕ Thêm đề bài mới
        </button>
      </div>

      {error && <div className="alert-box error">⚠️ {error}</div>}
      {successMsg && <div className="alert-box success">✅ {successMsg}</div>}

      {/* FORM THÊM / SỬA ĐỀ BÀI */}
      {isFormOpen && (
        <form className="topic-form-card" onSubmit={handleSubmitForm}>
          <div className="form-title-row">
            <h3>{editingTopicId ? '✏️ Chỉnh Sửa Đề Bài' : '✨ Tạo Đề Bài Mới'}</h3>
            <button
              type="button"
              className="btn-close-subform"
              onClick={() => setIsFormOpen(false)}
            >
              ✕ Đóng
            </button>
          </div>

          <div className="form-grid-2">
            <div className="form-field">
              <label className="field-label">Tập sách:</label>
              <select
                className="input-select"
                value={formData.tap}
                onChange={(e) => setFormData({ ...formData, tap: Number(e.target.value) })}
              >
                <option value={1}>Tập 1</option>
                <option value={2}>Tập 2</option>
              </select>
            </div>

            <div className="form-field">
              <label className="field-label">Dạng văn:</label>
              <select
                className="input-select"
                value={formData.dangVan}
                onChange={(e) => setFormData({ ...formData, dangVan: e.target.value })}
              >
                {GENRES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-field">
              <label className="field-label">Tên chủ điểm:</label>
              <input
                type="text"
                className="input-text"
                placeholder="Ví dụ: Việt Nam - Quê hương em, Cánh chim hòa bình..."
                value={formData.chuDiem}
                onChange={(e) => setFormData({ ...formData, chuDiem: e.target.value })}
              />
            </div>

            <div className="form-field">
              <label className="field-label">Độ dài mong muốn:</label>
              <input
                type="text"
                className="input-text"
                placeholder="Ví dụ: 150-250 từ hoặc 15-20 câu"
                value={formData.doDai}
                onChange={(e) => setFormData({ ...formData, doDai: e.target.value })}
              />
            </div>
          </div>

          <div className="form-field">
            <label className="field-label">Tên bài viết:</label>
            <input
              type="text"
              className="input-text"
              placeholder="Ví dụ: Tả cảnh mặt trời mọc trên cánh đồng quê em"
              value={formData.tenBai}
              onChange={(e) => setFormData({ ...formData, tenBai: e.target.value })}
              required
            />
          </div>

          <div className="form-field">
            <label className="field-label">Yêu cầu chi tiết của đề:</label>
            <textarea
              className="input-textarea"
              rows={3}
              placeholder="Nhập yêu cầu đề bài để AI làm căn cứ chấm..."
              value={formData.yeuCau}
              onChange={(e) => setFormData({ ...formData, yeuCau: e.target.value })}
              required
            />
          </div>

          <div className="form-field">
            <label className="field-label">Trạng thái phát đề:</label>
            <div className="radio-group-row">
              <label className="radio-pill">
                <input
                  type="radio"
                  name="trangThai"
                  value="mo"
                  checked={formData.trangThai === 'mo'}
                  onChange={() => setFormData({ ...formData, trangThai: 'mo' })}
                />
                <span className="radio-label">🟢 Đang mở (Học sinh được chọn làm)</span>
              </label>
              <label className="radio-pill">
                <input
                  type="radio"
                  name="trangThai"
                  value="dong"
                  checked={formData.trangThai === 'dong'}
                  onChange={() => setFormData({ ...formData, trangThai: 'dong' })}
                />
                <span className="radio-label">🔴 Đã đóng (Ẩn khỏi học sinh)</span>
              </label>
            </div>
          </div>

          <div className="form-buttons-row">
            <button
              type="button"
              className="btn-secondary-clean"
              onClick={() => setIsFormOpen(false)}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="btn-primary-big btn-save-topic"
              disabled={isLoading}
            >
              💾 {editingTopicId ? 'Cập nhật đề bài' : 'Lưu và phát đề'}
            </button>
          </div>
        </form>
      )}

      {/* DANH SÁCH ĐỀ BÀI */}
      <div className="topics-cards-grid">
        {isLoading && topics.length === 0 && (
          <p className="loading-text">⏳ Đang tải danh sách đề bài...</p>
        )}

        {!isLoading && topics.length === 0 && (
          <div className="empty-state-box">
            <p>Chưa có đề bài nào. Thầy/Cô hãy bấm nút "➕ Thêm đề bài mới" ở trên để bắt đầu nhé!</p>
          </div>
        )}

        {topics.map((t) => (
          <div key={t.maDe} className={`topic-manage-card ${t.trangThai === 'dong' ? 'closed' : ''}`}>
            <div className="topic-card-badges">
              <span className="badge-pill tap">Tập {t.tap}</span>
              <span className="badge-pill genre">{t.dangVan}</span>
              <span className={`badge-pill status ${t.trangThai}`}>
                {t.trangThai === 'mo' ? '🟢 Đang mở' : '🔴 Đã đóng'}
              </span>
            </div>

            <h3 className="topic-card-title">{t.tenBai}</h3>
            {t.chuDiem && <p className="topic-card-theme">Chủ điểm: <strong>{t.chuDiem}</strong></p>}
            <p className="topic-card-prompt">{t.yeuCau}</p>

            <div className="topic-card-footer">
              <span className="topic-length-tag">📏 {t.doDai || '150-250 từ'}</span>
              <div className="topic-card-actions">
                <button
                  type="button"
                  className="btn-card-action toggle"
                  onClick={() => handleToggleStatus(t)}
                  title={t.trangThai === 'mo' ? 'Đóng đề' : 'Mở lại đề'}
                >
                  {t.trangThai === 'mo' ? 'Khóa đề' : 'Mở đề'}
                </button>
                <button
                  type="button"
                  className="btn-card-action edit"
                  onClick={() => handleOpenEdit(t)}
                  title="Sửa đề này"
                >
                  ✏️ Sửa
                </button>
                <button
                  type="button"
                  className="btn-card-action delete"
                  onClick={() => handleDeleteTopic(t.maDe, t.tenBai)}
                  title="Xóa đề này"
                >
                  🗑️ Xóa
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
