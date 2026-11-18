import React, { useState, useEffect } from 'react';
import { DEFAULT_RUBRICS } from '../../api/_db.js';

export const GENRES = [
  'Kể chuyện sáng tạo',
  'Văn miêu tả phong cảnh',
  'Văn tả người',
  'Viết đoạn văn / bài văn biểu cảm, nêu cảm xúc',
  'Viết đoạn văn giới thiệu',
  'Viết báo cáo công việc và chương trình hoạt động',
  'Viết đoạn văn nêu ý kiến'
];

export default function TeacherRubricEditor({ teacherToken, onRubricsUpdated }) {
  const [rubrics, setRubrics] = useState(DEFAULT_RUBRICS);
  const [selectedGenre, setSelectedGenre] = useState('Kể chuyện sáng tạo');
  const [currentCriteria, setCurrentCriteria] = useState([]);
  const [targetMaxScore, setTargetMaxScore] = useState(10);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Tải danh sách Rubric từ server
  const fetchRubrics = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/rubric');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi tải rubric');
      if (data.rubrics) {
        setRubrics(data.rubrics);
        const active = data.rubrics[selectedGenre] || DEFAULT_RUBRICS[selectedGenre];
        setCurrentCriteria(JSON.parse(JSON.stringify(active.tieuChi || [])));
        setTargetMaxScore(Number(active.tongDiemMax) || 10);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRubrics();
  }, []);

  // Đổi dạng văn đang chỉnh sửa
  const handleSelectGenre = (genre) => {
    setSelectedGenre(genre);
    const active = rubrics[genre] || DEFAULT_RUBRICS[genre];
    setCurrentCriteria(JSON.parse(JSON.stringify(active.tieuChi || [])));
    setTargetMaxScore(Number(active.tongDiemMax) || 10);
    setError('');
    setSuccessMsg('');
  };

  // Cập nhật từng tiêu chí
  const handleUpdateCriterion = (index, field, value) => {
    const updated = [...currentCriteria];
    updated[index] = { ...updated[index], [field]: value };
    setCurrentCriteria(updated);
  };

  // Thêm tiêu chí mới
  const handleAddCriterion = () => {
    setCurrentCriteria([
      ...currentCriteria,
      {
        key: `tc_${Date.now().toString().slice(-4)}`,
        label: 'Tiêu chí mới',
        desc: 'Mô tả tiêu chí',
        max: 1.0
      }
    ]);
  };

  // Xóa tiêu chí
  const handleRemoveCriterion = (index) => {
    if (currentCriteria.length <= 1) {
      setError('Mỗi dạng văn cần ít nhất 1 tiêu chí chấm.');
      return;
    }
    const updated = currentCriteria.filter((_, i) => i !== index);
    setCurrentCriteria(updated);
  };

  // Khôi phục bộ tiêu chí mặc định chuẩn lớp 5
  const handleResetDefault = () => {
    const def = DEFAULT_RUBRICS[selectedGenre];
    if (def) {
      setCurrentCriteria(JSON.parse(JSON.stringify(def.tieuChi)));
      setTargetMaxScore(def.tongDiemMax || 10);
      setSuccessMsg(`Đã khôi phục bộ tiêu chí chuẩn của dạng "${selectedGenre}".`);
      setError('');
    }
  };

  // Tính tổng điểm hiện tại
  const currentTotal = currentCriteria.reduce((sum, c) => sum + (Number(c.max) || 0), 0);
  const roundedTotal = Math.round(currentTotal * 10) / 10;
  const isTotalValid = Math.abs(roundedTotal - targetMaxScore) < 0.01;

  // Lưu Rubric lên server
  const handleSaveRubric = async () => {
    if (!isTotalValid) {
      setError(`Tổng điểm các tiêu chí (${roundedTotal}đ) chưa bằng thang điểm tối đa (${targetMaxScore}đ). Vui lòng cân đối lại!`);
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const payload = {
        dangVan: selectedGenre,
        tieuChi: currentCriteria.map(c => ({
          key: c.key || `tc_${Math.random()}`,
          label: c.label.trim(),
          desc: c.desc.trim(),
          max: Number(c.max) || 0
        })),
        tongDiemMax: targetMaxScore
      };

      const res = await fetch('/api/rubric', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacherToken}`
        },
        body: JSON.stringify({ rubric: payload })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi lưu rubric');

      setSuccessMsg(`Đã lưu Rubric cho dạng văn "${selectedGenre}" thành công!`);
      setRubrics({ ...rubrics, [selectedGenre]: payload });
      if (onRubricsUpdated) onRubricsUpdated();
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
          <h2 className="panel-title">⚖️ Tùy Chỉnh Rubric Tiêu Chí Chấm Văn</h2>
          <p className="panel-subtitle">
            Mỗi dạng văn có bộ tiêu chí riêng. AI sẽ tạo prompt động và chấm điểm theo đúng các tiêu chí Thầy/Cô thiết lập.
          </p>
        </div>
      </div>

      {/* CHỌN DẠNG VĂN */}
      <div className="genre-tabs-row">
        {GENRES.map((genre) => (
          <button
            key={genre}
            type="button"
            className={`genre-tab-btn ${genre === selectedGenre ? 'active' : ''}`}
            onClick={() => handleSelectGenre(genre)}
          >
            {genre}
          </button>
        ))}
      </div>

      {error && <div className="alert-box error">⚠️ {error}</div>}
      {successMsg && <div className="alert-box success">✅ {successMsg}</div>}

      {/* KHUNG CHỈNH SỬA TIÊU CHÍ */}
      <div className="rubric-editor-card">
        <div className="rubric-editor-header">
          <div>
            <h3 className="rubric-genre-title">Bộ Tiêu Chí Dạng: <strong>{selectedGenre}</strong></h3>
            <p className="rubric-guide">Thầy/Cô có thể đổi tên, mô tả và phân bổ điểm cho từng tiêu chí.</p>
          </div>
          <button
            type="button"
            className="btn-secondary-clean btn-reset-default"
            onClick={handleResetDefault}
          >
            🔄 Khôi phục mặc định chuẩn
          </button>
        </div>

        {/* BẢNG CÁC TIÊU CHÍ */}
        <div className="criteria-edit-list">
          {currentCriteria.map((criterion, idx) => (
            <div key={idx} className="criterion-edit-item">
              <span className="criterion-num-badge">{idx + 1}</span>

              <div className="criterion-fields-grid">
                <div className="criterion-field-name">
                  <label className="sub-label">Tên tiêu chí:</label>
                  <input
                    type="text"
                    className="input-text"
                    value={criterion.label}
                    onChange={(e) => handleUpdateCriterion(idx, 'label', e.target.value)}
                    placeholder="Ví dụ: Bố cục 3 phần"
                  />
                </div>

                <div className="criterion-field-score">
                  <label className="sub-label">Điểm tối đa:</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="10"
                    className="input-number"
                    value={criterion.max}
                    onChange={(e) => handleUpdateCriterion(idx, 'max', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="criterion-field-desc">
                  <label className="sub-label">Mô tả ngắn (Căn cứ AI chấm):</label>
                  <input
                    type="text"
                    className="input-text"
                    value={criterion.desc}
                    onChange={(e) => handleUpdateCriterion(idx, 'desc', e.target.value)}
                    placeholder="Ví dụ: Đủ mở bài, thân bài, kết bài mạch lạc"
                  />
                </div>
              </div>

              <button
                type="button"
                className="btn-remove-criterion"
                onClick={() => handleRemoveCriterion(idx)}
                title="Xóa tiêu chí này"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="btn-secondary-clean btn-add-criterion"
          onClick={handleAddCriterion}
        >
          ➕ Thêm tiêu chí mới
        </button>

        {/* TỔNG ĐIỂM & BÁO LỖI NẾU LỆCH */}
        <div className={`rubric-total-bar ${isTotalValid ? 'valid' : 'invalid'}`}>
          <div className="total-bar-info">
            <span className="total-label">Tổng điểm các tiêu chí:</span>
            <span className="total-number">{roundedTotal} / {targetMaxScore} điểm</span>
          </div>

          {!isTotalValid && (
            <p className="total-error-note">
              ⚠️ Tổng điểm ({roundedTotal}đ) đang lệch so với thang điểm {targetMaxScore}đ ({roundedTotal > targetMaxScore ? `thừa ${(roundedTotal - targetMaxScore).toFixed(1)}đ` : `thiếu ${(targetMaxScore - roundedTotal).toFixed(1)}đ`}). Thầy/Cô hãy chỉnh lại điểm tối đa để tổng tròn {targetMaxScore}đ nhé!
            </p>
          )}

          <button
            type="button"
            className="btn-primary-big btn-save-rubric"
            onClick={handleSaveRubric}
            disabled={!isTotalValid || isLoading}
          >
            💾 Lưu Rubric Cho Dạng Văn Này
          </button>
        </div>
      </div>
    </div>
  );
}
