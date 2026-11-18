import React, { useState, useEffect } from 'react';

export default function TeacherGradingReview({ teacherToken, topics = [] }) {
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Bộ lọc
  const [filterMaDe, setFilterMaDe] = useState('');
  const [filterMaHS, setFilterMaHS] = useState('');
  const [filterTrangThai, setFilterTrangThai] = useState('tat_ca'); // tat_ca | cho_duyet | da_duyet

  // Bài nộp đang được xem chi tiết / chỉnh sửa
  const [selectedSub, setSelectedSub] = useState(null);
  const [editScores, setEditScores] = useState({});
  const [editComment, setEditComment] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Modal in phiếu nhận xét PDF
  const [printSub, setPrintSub] = useState(null);
  const [isBulkPrintOpen, setIsBulkPrintOpen] = useState(false);

  // Tải danh sách bài nộp từ server
  const fetchSubmissions = async () => {
    setIsLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filterMaDe) params.append('filterMaDe', filterMaDe);
      if (filterMaHS) params.append('filterMaHS', filterMaHS);
      if (filterTrangThai) params.append('filterTrangThai', filterTrangThai);

      const res = await fetch(`/api/bai-nop?${params.toString()}`, {
        headers: { Authorization: `Bearer ${teacherToken}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi tải danh sách bài nộp');
      setSubmissions(data.submissions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (teacherToken) fetchSubmissions();
  }, [teacherToken, filterMaDe, filterTrangThai]);

  // Tìm tên đề bài từ mã đề
  const getTopicTitle = (maDe) => {
    const t = topics.find((item) => item.maDe === maDe);
    return t ? t.tenBai : (maDe || 'Đề tự do');
  };

  // Mở modal duyệt bài
  const handleOpenReview = (sub) => {
    setSelectedSub(sub);
    // Điền điểm giáo viên chỉnh (nếu đã có) hoặc lấy điểm AI gợi ý
    const initialScores = sub.diemGiaoVienChinh && Object.keys(sub.diemGiaoVienChinh).length > 0
      ? { ...sub.diemGiaoVienChinh }
      : { ...sub.diemTieuChi };
    setEditScores(initialScores);
    setEditComment(sub.nhanXetGiaoVien || sub.khen || '');
    setError('');
    setSuccessMsg('');
  };

  // Lưu điểm chỉnh sửa & Duyệt bài
  const handleApproveSubmission = async (newStatus = 'da_duyet') => {
    if (!selectedSub) return;
    setIsSaving(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/bai-nop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacherToken}`
        },
        body: JSON.stringify({
          maBai: selectedSub.maBai,
          diemGiaoVienChinh: editScores,
          nhanXetGiaoVien: editComment,
          trangThai: newStatus
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi duyệt bài');

      setSuccessMsg(`Đã ${newStatus === 'da_duyet' ? 'duyệt' : 'lưu'} bài nộp của học sinh ${selectedSub.maHocSinh} thành công!`);
      setSelectedSub(null);
      await fetchSubmissions();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Xuất bảng tổng hợp cả lớp ra file CSV (có UTF-8 BOM chuẩn cho Excel)
  const handleExportCSV = () => {
    if (submissions.length === 0) {
      alert('Không có bài nộp nào để xuất.');
      return;
    }

    const headers = [
      'Mã Bài',
      'Mã Học Sinh',
      'Đề Bài',
      'Thời Gian Nộp',
      'Điểm AI',
      'Điểm Giáo Viên Chốt',
      'Trạng Thái',
      'Nhận Xét Giáo Viên'
    ];

    const rows = submissions.map((s) => {
      const topicTitle = getTopicTitle(s.maDe).replace(/"/g, '""');
      const timeStr = s.thoiGian ? new Date(s.thoiGian).toLocaleString('vi-VN') : '';
      const gvScores = s.diemGiaoVienChinh && Object.keys(s.diemGiaoVienChinh).length > 0
        ? Object.values(s.diemGiaoVienChinh).reduce((a, b) => a + Number(b), 0)
        : s.tongDiemAI;
      const statusText = s.trangThai === 'da_duyet' ? 'Đã duyệt' : 'Chờ duyệt';
      const commentText = (s.nhanXetGiaoVien || s.khen || '').replace(/"/g, '""');

      return [
        `"${s.maBai}"`,
        `"${s.maHocSinh}"`,
        `"${topicTitle}"`,
        `"${timeStr}"`,
        s.tongDiemAI,
        gvScores,
        `"${statusText}"`,
        `"${commentText}"`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Bang_Tong_Hop_Cham_Van_Lop_5_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Mở modal phiếu nhận xét để in hoặc lưu PDF
  const handleOpenPrintPreview = (sub) => {
    setPrintSub(sub);
  };

  // Thực hiện in phiếu (Trình duyệt sẽ hiển thị cửa sổ In -> Lưu dạng PDF chuẩn tiếng Việt)
  const handlePrintDocument = () => {
    window.print();
  };

  return (
    <div className="teacher-panel-content">
      <div className="panel-header-row">
        <div>
          <h2 className="panel-title">📝 Màn Hình Duyệt Bài & Chấm Điểm</h2>
          <p className="panel-subtitle">
            Cô giáo xem điểm gợi ý của AI, điều chỉnh điểm số từng tiêu chí và nhận xét sư phạm trước khi công bố cho học sinh
          </p>
        </div>
        <div className="panel-actions-group">
          <button
            type="button"
            className="btn-secondary-clean btn-bulk-print"
            onClick={() => setIsBulkPrintOpen(true)}
            title="In gộp phiếu nhận xét của tất cả học sinh đã duyệt bài để gửi phụ huynh"
          >
            🖨️ In tất cả phiếu (Bulk PDF)
          </button>
          <button
            type="button"
            className="btn-secondary-clean btn-export-excel"
            onClick={handleExportCSV}
            title="Xuất danh sách điểm của cả lớp ra file Excel/CSV"
          >
            📊 Xuất bảng điểm cả lớp (CSV)
          </button>
        </div>
      </div>

      {error && <div className="alert-box error">⚠️ {error}</div>}
      {successMsg && <div className="alert-box success">✅ {successMsg}</div>}

      {/* THANH BỘ LỌC */}
      <div className="filter-bar-card">
        <div className="filter-group">
          <label className="sub-label">Lọc theo đề bài:</label>
          <select
            className="input-select"
            value={filterMaDe}
            onChange={(e) => setFilterMaDe(e.target.value)}
          >
            <option value="">-- Tất cả đề bài --</option>
            {topics.map((t) => (
              <option key={t.maDe} value={t.maDe}>
                {t.tenBai} ({t.dangVan})
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="sub-label">Mã số học sinh:</label>
          <div className="search-input-wrapper">
            <input
              type="text"
              className="input-text"
              placeholder="Nhập mã HS (ví dụ: HS01, 05)..."
              value={filterMaHS}
              onChange={(e) => setFilterMaHS(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchSubmissions()}
            />
            <button
              type="button"
              className="btn-search-icon"
              onClick={fetchSubmissions}
            >
              🔍
            </button>
          </div>
        </div>

        <div className="filter-group">
          <label className="sub-label">Trạng thái:</label>
          <select
            className="input-select"
            value={filterTrangThai}
            onChange={(e) => setFilterTrangThai(e.target.value)}
          >
            <option value="tat_ca">Tất cả bài nộp</option>
            <option value="cho_duyet">🟡 Đang chờ duyệt</option>
            <option value="da_duyet">🟢 Đã duyệt bài</option>
          </select>
        </div>
      </div>

      {/* DANH SÁCH BÀI NỘP */}
      <div className="submissions-table-card">
        {isLoading && <p className="loading-text">⏳ Đang tải bài làm của học sinh...</p>}

        {!isLoading && submissions.length === 0 && (
          <div className="empty-state-box">
            <p>Không có bài nộp nào phù hợp với bộ lọc hiện tại.</p>
          </div>
        )}

        {submissions.length > 0 && (
          <div className="table-responsive">
            <table className="review-table">
              <thead>
                <tr>
                  <th>Mã HS</th>
                  <th>Đề bài</th>
                  <th>Thời gian nộp</th>
                  <th>Điểm AI</th>
                  <th>Điểm Cô chốt</th>
                  <th>Trạng thái</th>
                  <th className="text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => {
                  const hasGvScore = sub.diemGiaoVienChinh && Object.keys(sub.diemGiaoVienChinh).length > 0;
                  const gvTotal = hasGvScore
                    ? Object.values(sub.diemGiaoVienChinh).reduce((a, b) => a + Number(b), 0)
                    : sub.tongDiemAI;

                  return (
                    <tr key={sub.maBai}>
                      <td>
                        <strong className="student-code-badge">{sub.maHocSinh}</strong>
                        {sub.anhTrangVo && (
                          <span className="badge-photo-attached" title="Bài có kèm ảnh chụp trang vở">
                            📷
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="table-topic-title">{getTopicTitle(sub.maDe)}</div>
                        <span className="table-sub-id">{sub.maBai}</span>
                      </td>
                      <td>
                        <span className="time-badge">
                          {sub.thoiGian ? new Date(sub.thoiGian).toLocaleString('vi-VN') : ''}
                        </span>
                      </td>
                      <td>
                        <span className="score-ai">{sub.tongDiemAI}đ</span>
                      </td>
                      <td>
                        <strong className="score-final">{gvTotal}đ</strong>
                      </td>
                      <td>
                        <span className={`status-tag ${sub.trangThai}`}>
                          {sub.trangThai === 'da_duyet' ? '🟢 Đã duyệt' : '🟡 Chờ duyệt'}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="row-actions-group">
                          <button
                            type="button"
                            className="btn-table-action review"
                            onClick={() => handleOpenReview(sub)}
                          >
                            📝 Chấm & Duyệt
                          </button>
                          <button
                            type="button"
                            className="btn-table-action pdf"
                            onClick={() => handleOpenPrintPreview(sub)}
                            title="In phiếu nhận xét / Xuất PDF chuẩn tiếng Việt"
                          >
                            🖨️ Phiếu PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DUYỆT BÀI CHI TIẾT */}
      {selectedSub && (
        <div className="modal-backdrop" onClick={() => setSelectedSub(null)}>
          <div className="modal-card wide-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-icon">✍️</span>
              <div>
                <h3 className="modal-title">
                  Chấm & Duyệt Bài: Học Sinh <strong>{selectedSub.maHocSinh}</strong>
                </h3>
                <p className="modal-subtitle">Đề: {getTopicTitle(selectedSub.maDe)}</p>
              </div>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setSelectedSub(null)}
              >
                ✕
              </button>
            </div>

            <div className="review-modal-body">
              {/* Bài làm của học sinh (Hỗ trợ đối chiếu ảnh vở nếu có) */}
              {selectedSub.anhTrangVo ? (
                <div className="side-by-side-inspection-grid">
                  <div className="inspection-photo-pane">
                    <div className="pane-header">
                      <h4>📷 Ảnh chụp trang vở:</h4>
                      <a
                        href={selectedSub.anhTrangVo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-zoom-link"
                      >
                        🔍 Xem ảnh lớn
                      </a>
                    </div>
                    <div className="photo-preview-box">
                      <img
                        src={selectedSub.anhTrangVo}
                        alt="Ảnh trang vở"
                        className="notebook-inspect-img"
                      />
                    </div>
                  </div>

                  <div className="inspection-text-pane">
                    <h4>📖 Bài văn chép lại:</h4>
                    <div className="essay-scroll-box">
                      {selectedSub.baiLam}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="student-essay-preview">
                  <h4>📖 Bài văn của học sinh:</h4>
                  <div className="essay-scroll-box">
                    {selectedSub.baiLam}
                  </div>
                </div>
              )}

              {/* Bảng điểm tiêu chí để giáo viên sửa */}
              <div className="criteria-adjustment-box">
                <h4>⚖️ Điều chỉnh điểm từng tiêu chí:</h4>
                <table className="mini-criteria-table">
                  <thead>
                    <tr>
                      <th>Tiêu chí</th>
                      <th>Điểm AI</th>
                      <th>Cô cho điểm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(selectedSub.diemTieuChi || {}).map((key) => {
                      const aiScore = selectedSub.diemTieuChi[key];
                      const currentVal = editScores[key] !== undefined ? editScores[key] : aiScore;
                      return (
                        <tr key={key}>
                          <td><strong>{key}</strong></td>
                          <td className="ai-col">{aiScore}đ</td>
                          <td>
                            <input
                              type="number"
                              step="0.25"
                              min="0"
                              max="10"
                              className="input-score-adjust"
                              value={currentVal}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setEditScores({ ...editScores, [key]: val });
                              }}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Lời nhận xét của AI và của Cô giáo */}
              <div className="comment-adjustment-box">
                <div className="ai-feedback-summary">
                  <p><strong>🦉 AI khen ngợi:</strong> {selectedSub.khen}</p>
                  {selectedSub.goiY && selectedSub.goiY.length > 0 && (
                    <p><strong>💡 AI gợi ý:</strong> {selectedSub.goiY.join('; ')}</p>
                  )}
                  {selectedSub.loiChinhTa && selectedSub.loiChinhTa.length > 0 && (
                    <p><strong>✍️ Lỗi chính tả:</strong> {selectedSub.loiChinhTa.map(x => `${x.sai} ➔ ${x.dung}`).join(', ')}</p>
                  )}
                </div>

                <div className="teacher-comment-field">
                  <label className="field-label">Lời nhận xét của Thầy/Cô (Học sinh sẽ nhìn thấy sau khi duyệt):</label>
                  <textarea
                    className="input-textarea"
                    rows={4}
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    placeholder="Nhập lời nhận xét động viên, khích lệ hoặc góp ý cho em..."
                  />
                </div>
              </div>
            </div>

            <div className="modal-actions review-actions">
              <button
                type="button"
                className="btn-secondary-clean"
                onClick={() => setSelectedSub(null)}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className="btn-primary-big btn-save-draft"
                onClick={() => handleApproveSubmission('cho_duyet')}
                disabled={isSaving}
              >
                💾 Lưu chưa duyệt
              </button>
              <button
                type="button"
                className="btn-primary-big btn-approve-final"
                onClick={() => handleApproveSubmission('da_duyet')}
                disabled={isSaving}
              >
                ✅ Duyệt bài ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XUẤT PHIẾU NHẬN XÉT PDF CHUẨN TIẾNG VIỆT */}
      {printSub && (
        <div className="modal-backdrop print-modal-backdrop" onClick={() => setPrintSub(null)}>
          <div className="modal-card print-preview-card" onClick={(e) => e.stopPropagation()}>
            <div className="print-modal-header no-print">
              <h3>🖨️ Xem Trước Phiếu Nhận Xét (PDF Chuẩn Tiếng Việt)</h3>
              <div className="print-actions-top">
                <button
                  type="button"
                  className="btn-primary-big btn-trigger-print"
                  onClick={handlePrintDocument}
                >
                  🖨️ In / Lưu file PDF
                </button>
                <button
                  type="button"
                  className="btn-close-modal"
                  onClick={() => setPrintSub(null)}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* BẢN IN PHIẾU NHẬN XÉT CHUẨN TIẾNG VIỆT */}
            <div id="printable-voucher" className="printable-sheet">
              <div className="voucher-header">
                <div className="voucher-logo">🦉</div>
                <div className="voucher-header-text">
                  <h2 className="voucher-school">TRƯỜNG TIỂU HỌC VĂN HỌC TUỔI THƠ</h2>
                  <h1 className="voucher-title">PHIẾU NHẬN XÉT TẬP LÀM VĂN LỚP 5</h1>
                  <p className="voucher-sub">Chương trình Tiếng Việt 5 - Đánh giá vì sự tiến bộ của học sinh</p>
                </div>
              </div>

              <div className="voucher-divider"></div>

              <div className="voucher-meta-grid">
                <div><strong>Mã học sinh:</strong> {printSub.maHocSinh}</div>
                <div><strong>Thời gian nộp:</strong> {printSub.thoiGian ? new Date(printSub.thoiGian).toLocaleString('vi-VN') : ''}</div>
                <div className="grid-col-full"><strong>Đề bài:</strong> {getTopicTitle(printSub.maDe)}</div>
              </div>

              {/* Sao danh dự & Tổng điểm */}
              <div className="voucher-stars-score">
                <div className="voucher-stars">
                  {'★'.repeat(printSub.sao || 5)}
                  {'☆'.repeat(5 - (printSub.sao || 5))}
                </div>
                <div className="voucher-score-box">
                  Tổng điểm: <strong>
                    {printSub.diemGiaoVienChinh && Object.keys(printSub.diemGiaoVienChinh).length > 0
                      ? Object.values(printSub.diemGiaoVienChinh).reduce((a, b) => a + Number(b), 0)
                      : printSub.tongDiemAI} / 10đ
                  </strong>
                </div>
              </div>

              {/* Bảng điểm chi tiết tiêu chí */}
              <table className="voucher-criteria-table">
                <thead>
                  <tr>
                    <th>Tiêu chí đánh giá</th>
                    <th className="text-right">Điểm đạt</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(printSub.diemGiaoVienChinh && Object.keys(printSub.diemGiaoVienChinh).length > 0
                    ? printSub.diemGiaoVienChinh
                    : printSub.diemTieuChi || {}).map((k) => (
                    <tr key={k}>
                      <td>{k}</td>
                      <td className="text-right">
                        {(printSub.diemGiaoVienChinh && printSub.diemGiaoVienChinh[k] !== undefined
                          ? printSub.diemGiaoVienChinh[k]
                          : printSub.diemTieuChi[k])}đ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Lời khen & Nhận xét của Cô giáo */}
              <div className="voucher-feedback-box">
                <h4>🦉 Lời khen ngợi từ Cú Thông Thái:</h4>
                <p className="voucher-praise">"{printSub.khen}"</p>

                {printSub.goiY && printSub.goiY.length > 0 && (
                  <>
                    <h4>💡 Gợi ý để bài văn lấp lánh hơn:</h4>
                    <ul className="voucher-tips">
                      {printSub.goiY.map((tip, i) => <li key={i}>{tip}</li>)}
                    </ul>
                  </>
                )}

                {printSub.nhanXetGiaoVien && (
                  <div className="voucher-teacher-note">
                    <h4>👩‍🏫 Lời phê của Cô giáo:</h4>
                    <p className="voucher-teacher-comment">"{printSub.nhanXetGiaoVien}"</p>
                  </div>
                )}
              </div>

              {/* Chữ ký giáo viên */}
              <div className="voucher-signatures">
                <div className="sign-block">
                  <p>Học sinh</p>
                  <span className="sign-name">{printSub.maHocSinh}</span>
                </div>
                <div className="sign-block right">
                  <p>Giáo viên chấm bài</p>
                  <p className="sign-placeholder">(Ký và ghi rõ họ tên)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL IN HÀNG LOẠT TẤT CẢ PHIẾU NHẬN XÉT CẢ LỚP (BULK PRINT PDF) */}
      {isBulkPrintOpen && (
        <div className="modal-backdrop print-modal-backdrop" onClick={() => setIsBulkPrintOpen(false)}>
          <div className="modal-card print-preview-card bulk-preview-card" onClick={(e) => e.stopPropagation()}>
            <div className="print-modal-header no-print">
              <div>
                <h3>🖨️ In Gộp Phiếu Nhận Xét Cả Lớp ({submissions.filter(s => s.trangThai === 'da_duyet').length} bài đã duyệt)</h3>
                <p className="bulk-hint">Trình duyệt sẽ tự động ngắt mỗi học sinh thành một trang A4/A5 riêng biệt để Thầy/Cô in phát cho từng em.</p>
              </div>
              <div className="print-actions-top">
                <button
                  type="button"
                  className="btn-primary-big btn-trigger-print"
                  onClick={handlePrintDocument}
                >
                  🖨️ Bấm In / Xuất PDF Ngay
                </button>
                <button
                  type="button"
                  className="btn-close-modal"
                  onClick={() => setIsBulkPrintOpen(false)}
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="bulk-printable-pages-container">
              {submissions.filter(s => s.trangThai === 'da_duyet').length === 0 ? (
                <div className="empty-state-box no-print">
                  <p>Chưa có bài nào được duyệt. Thầy/Cô hãy chấm và duyệt bài của học sinh trước khi in hàng loạt nhé!</p>
                </div>
              ) : (
                submissions.filter(s => s.trangThai === 'da_duyet').map((subItem) => {
                  const gvScoreObj = subItem.diemGiaoVienChinh && Object.keys(subItem.diemGiaoVienChinh).length > 0
                    ? subItem.diemGiaoVienChinh
                    : subItem.diemTieuChi || {};
                  const total = Object.values(gvScoreObj).reduce((a, b) => a + Number(b), 0);

                  return (
                    <div key={subItem.maBai} className="printable-sheet bulk-page-sheet">
                      <div className="voucher-header">
                        <div className="voucher-logo">🦉</div>
                        <div className="voucher-header-text">
                          <h2 className="voucher-school">TRƯỜNG TIỂU HỌC VĂN HỌC TUỔI THƠ</h2>
                          <h1 className="voucher-title">PHIẾU NHẬN XÉT TẬP LÀM VĂN LỚP 5</h1>
                          <p className="voucher-sub">Chương trình Tiếng Việt 5 - Đánh giá vì sự tiến bộ của học sinh</p>
                        </div>
                      </div>

                      <div className="voucher-divider"></div>

                      <div className="voucher-meta-grid">
                        <div><strong>Mã học sinh:</strong> {subItem.maHocSinh}</div>
                        <div><strong>Thời gian nộp:</strong> {subItem.thoiGian ? new Date(subItem.thoiGian).toLocaleDateString('vi-VN') : ''}</div>
                        <div className="grid-col-full"><strong>Đề bài:</strong> {getTopicTitle(subItem.maDe)}</div>
                      </div>

                      <div className="voucher-stars-score">
                        <div className="voucher-stars">
                          {'★'.repeat(subItem.sao || 5)}
                          {'☆'.repeat(5 - (subItem.sao || 5))}
                        </div>
                        <div className="voucher-score-box">
                          Tổng điểm: <strong>{total.toFixed(1)} / 10đ</strong>
                        </div>
                      </div>

                      <table className="voucher-criteria-table">
                        <thead>
                          <tr>
                            <th>Tiêu chí đánh giá</th>
                            <th className="text-right">Điểm đạt</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.keys(gvScoreObj).map((critKey) => (
                            <tr key={critKey}>
                              <td>{critKey}</td>
                              <td className="text-right"><strong>{gvScoreObj[critKey]}đ</strong></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <div className="voucher-feedback-block">
                        {subItem.khen && (
                          <div className="voucher-praise">
                            <h4>🌸 Lời khen ngợi:</h4>
                            <p>{subItem.khen}</p>
                          </div>
                        )}

                        {subItem.nhanXetGiaoVien && (
                          <div className="voucher-teacher-note">
                            <h4>👩‍🏫 Lời phê của Cô giáo:</h4>
                            <p className="voucher-teacher-comment">"{subItem.nhanXetGiaoVien}"</p>
                          </div>
                        )}
                      </div>

                      <div className="voucher-signatures">
                        <div className="sign-block">
                          <p>Học sinh</p>
                          <span className="sign-name">{subItem.maHocSinh}</span>
                        </div>
                        <div className="sign-block right">
                          <p>Giáo viên chấm bài</p>
                          <p className="sign-placeholder">(Ký và ghi rõ họ tên)</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
