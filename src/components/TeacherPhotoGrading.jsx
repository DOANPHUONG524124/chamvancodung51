import React, { useState, useEffect, useRef } from 'react';
import { DEFAULT_RUBRICS } from '../../api/_db.js';

// Các dạng bài tập làm văn chuẩn chương trình lớp 5
export const GENRES = [
  'Kể chuyện sáng tạo',
  'Văn miêu tả phong cảnh',
  'Văn tả người',
  'Viết đoạn văn / bài văn biểu cảm, nêu cảm xúc',
  'Viết đoạn văn giới thiệu',
  'Viết báo cáo công việc và chương trình hoạt động',
  'Viết đoạn văn nêu ý kiến'
];

// Danh sách bài mẫu lớp 5 chuẩn để giáo viên thử nghiệm 1 chạm
const SAMPLE_ESSAYS = [
  {
    title: 'Cảnh đẹp quê hương em lúc bình minh',
    genre: 'Văn miêu tả phong cảnh',
    studentId: 'HS05',
    text: `Quê hương em là một làng chài ven biển thanh bình. Mỗi buổi sớm mai, khi ông mặt trời từ từ nhô lên khỏi mặt biển như một quả cầu lửa khổng lồ rực rỡ, cả không gian như bừng tỉnh sau giấc ngủ dài. 

Những tia nắng sớm màu hồng nhạt rọi xuống mặt nước lung linh, sóng biển vỗ rì rào vào bờ cát trắng mịn như bài ca chào ngày mới. Xa xa, từng đoàn thuyền đánh cá no nê tôm cá đang giương buồm trở về bến. Tiếng cười nói của các bác ngư dân rộn rã khắp một góc trời. 

Em rất yêu bãi biển quê em, nơi chan chứa tình làng nghĩa xóm và vẻ đẹp thiên nhiên kì vĩ.`
  },
  {
    title: 'Người bà kính yêu của em',
    genre: 'Văn tả người',
    studentId: 'HS12',
    text: `Trong gia đình, người em yêu thương và gắn bó nhất là bà ngoại. Năm nay bà đã ngoài bảy mươi tuổi, mái tóc bà bạc trắng như những sợi cước, nhưng đôi mắt bà vẫn ánh lên vẻ hiền từ và ấm áp lạ kì.

Bà có dáng người nhỏ nhắn, lưng đã hơi còng vì bao năm tháng vất vả nuôi mẹ em khôn lớn. Đôi bàn tay chai sần của bà luôn thoăn thoắt quạt mát cho em mỗi trưa hè và nấu những món canh rau tập tàng thơm phức. Mỗi tối trước khi đi ngủ, bà thường kể cho em nghe những câu chuyện cổ tích ngày xưa. Giọng bà trầm ấm, ngọt ngào đưa em vào giấc ngủ êm đềm.

Em mong bà luôn mạnh khỏe và sống thật lâu bên con cháu.`
  },
  {
    title: 'Kể tiếp câu chuyện Rùa và Thỏ',
    genre: 'Kể chuyện sáng tạo',
    studentId: 'HS08',
    text: `Sau thất bại bất ngờ ở cuộc đua đầu tiên, Thỏ vô cùng ân hận vì thói kiêu ngạo của mình. Một buổi sáng mùa thu, Thỏ tìm đến nhà Rùa và xin được cùng thi chạy lại một lần nữa. Rùa vui vẻ nhận lời: "Được chứ bạn Thỏ ơi, chúng mình thi đua để cùng rèn luyện sức khỏe nhé!".

Lần này, Thỏ không dám la cà hái hoa bắt bướm nữa. Chú cắm đầu chạy thật nhanh về phía trước. Nhưng khi gần đến đích, Thỏ nhìn thấy một chú chim non bị rơi khỏi tổ đang kêu chíp chíp bên bụi gai. Thỏ khựng lại, trong lòng phân vân giữa việc về đích để thắng hay dừng lại cứu chú chim nhỏ. Cuối cùng, Thỏ chọn dừng lại nâng niu chú chim đặt về tổ an toàn.

Lúc ấy Rùa cũng vừa tới nơi. Thấy việc làm tốt bụng của Thỏ, Rùa tươi cười nắm tay Thỏ: "Hôm nay cả hai chúng ta đều là người chiến thắng!".`
  }
];

export default function TeacherPhotoGrading({ teacherToken, topics = [], rubrics = {}, onSaved }) {
  // 1. Thông tin bài làm học sinh
  const [studentId, setStudentId] = useState('HS01');
  const [selectedGenre, setSelectedGenre] = useState('Văn miêu tả phong cảnh');
  const [topicTitle, setTopicTitle] = useState('Cảnh bình minh trên quê hương em');
  const [examDate, setExamDate] = useState(() => new Date().toISOString().slice(0, 10));

  // 2. Ảnh trang vở học sinh
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const fileInputRef = useRef(null);

  // 3. Bài viết chép lại
  const [essayText, setEssayText] = useState('');
  const [showOcrDetails, setShowOcrDetails] = useState(false);

  // 4. Trạng thái phân tích & chấm điểm
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // 5. Điểm số giáo viên chấm theo từng tiêu chí
  const [scores, setScores] = useState({});
  const [teacherComment, setTeacherComment] = useState('');

  // 6. Trạng thái hệ thống
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Lấy bộ rubric hiện hành theo dạng văn đang chọn
  const activeRubric = rubrics[selectedGenre] || DEFAULT_RUBRICS[selectedGenre] || DEFAULT_RUBRICS['Văn miêu tả phong cảnh'];
  const criteriaList = activeRubric?.tieuChi || [];

  // Tính số tiếng/từ và số câu
  const wordCount = essayText.trim() ? essayText.trim().split(/\s+/).length : 0;
  const sentenceCount = essayText.trim() ? essayText.split(/[.!?]+/).filter(Boolean).length : 0;

  // Khởi tạo điểm mặc định khi đổi dạng văn hoặc có rubric mới
  useEffect(() => {
    const initialScores = {};
    for (const c of criteriaList) {
      if (scores[c.key] === undefined) {
        initialScores[c.key] = '';
      } else {
        initialScores[c.key] = scores[c.key];
      }
    }
    setScores(initialScores);
  }, [selectedGenre]);

  // Nén ảnh qua HTML Canvas (giảm độ phân giải xuống max 1600px để gửi serverless nhanh chóng)
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const maxDim = 1600;
        let w = img.width;
        let h = img.height;

        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);

        setImagePreview(compressedDataUrl);
        setImageBase64(compressedDataUrl);
      };
      img.src = loadEvt.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Xóa ảnh đã chọn
  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // AI đọc chữ viết tay từ ảnh chụp trang vở
  const handleRunOcr = async () => {
    if (!imageBase64) {
      setErrorMsg('Thầy/Cô vui lòng tải ảnh hoặc chụp ảnh trang vở trước khi bấm AI đọc chữ.');
      return;
    }

    setIsOcrLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/doc-anh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageBase64,
          mimeType: 'image/jpeg'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi đọc chữ trong ảnh');

      setEssayText(data.text || '');
      setSuccessMsg(`🦉 Cú đã đọc xong trang vở (${data.wordCount || 0} từ)! Thầy Cô có thể kiểm tra và chỉnh lại nếu cần.`);
    } catch (err) {
      setErrorMsg(err.message || 'Không thể đọc ảnh lúc này. Thầy Cô vui lòng kiểm tra kết nối.');
    } finally {
      setIsOcrLoading(false);
    }
  };

  // Điền bài mẫu để thử nghiệm nhanh
  const handleFillSample = () => {
    const randomSample = SAMPLE_ESSAYS[Math.floor(Math.random() * SAMPLE_ESSAYS.length)];
    setTopicTitle(randomSample.title);
    setSelectedGenre(randomSample.genre);
    setStudentId(randomSample.studentId);
    setEssayText(randomSample.text);
    setAnalysisResult(null);
    setErrorMsg('');
    setSuccessMsg('Đã điền bài văn mẫu lớp 5! Thầy/Cô bấm "Phân tích bài viết" để xem AI gợi ý nhé.');
  };

  // Phân tích bài viết bằng Gemini theo Rubric
  const handleAnalyzeEssay = async () => {
    if (!essayText.trim() || essayText.trim().length < 25) {
      setErrorMsg('Bài viết còn quá ngắn (dưới 25 ký tự). Vui lòng nhập thêm nội dung để phân tích.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload = {
        maHocSinh: studentId.trim() || 'HS-01',
        deBai: {
          maDe: 'DE-PHOTO',
          tenBai: topicTitle.trim() || 'Bài viết từ ảnh vở',
          dangVan: selectedGenre,
          yeuCau: topicTitle.trim(),
          doDai: '150-250 từ'
        },
        rubric: activeRubric,
        baiLam: essayText.trim(),
        anhTrangVo: imageBase64 || null
      };

      const res = await fetch('/api/cham-van', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi phân tích bài viết');

      setAnalysisResult(data);

      // Điền điểm AI gợi ý vào các ô điểm
      if (data.diem) {
        setScores({ ...data.diem });
      }

      // Gợi ý nhận xét cho giáo viên
      if (data.nhanXetGiaoVien) {
        setTeacherComment(data.nhanXetGiaoVien);
      } else if (data.khen) {
        setTeacherComment(data.khen);
      }

      setSuccessMsg('Máy đã phân tích xong! Thầy Cô hãy xem các gợi ý và chấm điểm theo tiêu chí bên phải.');
    } catch (err) {
      setErrorMsg(err.message || 'Không thể phân tích bài lúc này.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Tự động điền nhận xét sư phạm gợi ý từ AI
  const handleSuggestComment = () => {
    if (!analysisResult) {
      setErrorMsg('Thầy/Cô hãy bấm "Phân tích bài viết" trước để máy tạo gợi ý nhận xét.');
      return;
    }
    const combined = [
      analysisResult.khen,
      analysisResult.goiY?.length ? `Góp ý: ${analysisResult.goiY.join('; ')}` : '',
      analysisResult.nhanXetGiaoVien
    ].filter(Boolean).join('\n\n');

    setTeacherComment(combined);
    setSuccessMsg('Đã điền gợi ý nhận xét sư phạm vào ô nhận xét!');
  };

  // Tính tổng điểm giáo viên đã chấm
  const totalTeacherScore = Object.values(scores).reduce((acc, val) => {
    const num = parseFloat(val);
    return acc + (isNaN(num) ? 0 : num);
  }, 0);

  // Đếm số tiêu chí chưa chấm
  const unratedCount = criteriaList.filter(c => scores[c.key] === '' || scores[c.key] === undefined).length;

  // Duyệt và lưu vào sổ (vào danh sách BaiNop chính thức)
  const handleApproveAndSave = async (status = 'da_duyet') => {
    if (!essayText.trim()) {
      setErrorMsg('Vui lòng nhập bài viết của học sinh trước khi lưu.');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // Lưu qua API /api/bai-nop
      const cleanScores = {};
      for (const c of criteriaList) {
        cleanScores[c.key] = parseFloat(scores[c.key]) || 0;
      }

      // Tạo bài nộp mới hoàn chỉnh với trạng thái duyệt
      const payload = {
        maBai: `BN-ANH-${Date.now()}`,
        thoiGian: examDate ? new Date(examDate).toISOString() : new Date().toISOString(),
        maHocSinh: studentId.trim() || 'HS01',
        maDe: 'DE-ANH',
        baiLam: essayText.trim(),
        anhTrangVo: imageBase64 || null,
        diemTieuChi: analysisResult?.diem || cleanScores,
        tongDiemAI: analysisResult?.tongDiem || totalTeacherScore,
        khen: analysisResult?.khen || 'Bài viết cố gắng, bám sát yêu cầu đề.',
        goiY: analysisResult?.goiY || [],
        loiChinhTa: analysisResult?.loiChinhTa || [],
        diemGiaoVienChinh: cleanScores,
        nhanXetGiaoVien: teacherComment.trim() || 'Cô đã xem và duyệt bài viết.',
        trangThai: status
      };

      const res = await fetch('/api/bai-nop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacherToken}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi lưu bài vào sổ');

      setSuccessMsg(`🎉 Đã ${status === 'da_duyet' ? 'duyệt và lưu' : 'lưu nháp'} bài viết của học sinh ${studentId} vào sổ theo dõi thành công!`);

      if (onSaved) onSaved();
    } catch (err) {
      setErrorMsg(err.message || 'Lỗi khi lưu bài vào sổ.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="photo-grading-container">
      {/* ================= BREADCRUMB / BƯỚC THỰC HIỆN ================= */}
      <div className="photo-grading-steps-bar">
        <div className={`step-badge active`}>
          <span className="step-circle">1</span>
          <span>Chụp ảnh vở</span>
        </div>
        <span className="step-arrow">➔</span>
        <div className={`step-badge ${essayText ? 'active' : ''}`}>
          <span className="step-circle">2</span>
          <span>Gõ lại hoặc dán bài chép</span>
        </div>
        <span className="step-arrow">➔</span>
        <div className={`step-badge ${analysisResult ? 'active' : ''}`}>
          <span className="step-circle">3</span>
          <span>Máy phân tích, gợi ý</span>
        </div>
        <span className="step-arrow">➔</span>
        <div className={`step-badge ${totalTeacherScore > 0 ? 'active' : ''}`}>
          <span className="step-circle">4</span>
          <span>Giáo viên chấm và duyệt</span>
        </div>
      </div>

      {/* THÔNG BÁO LỖI / THÀNH CÔNG */}
      {errorMsg && <div className="alert-box error" role="alert">⚠️ {errorMsg}</div>}
      {successMsg && <div className="alert-box success" role="alert">✨ {successMsg}</div>}

      {/* ================= GIAO DIỆN CHÍNH 2 CỘT ================= */}
      <div className="photo-grading-layout">
        {/* CỘT TRÁI: BÀI LÀM CỦA HỌC SINH */}
        <div className="grading-col student-work-col">
          <div className="col-header-banner">
            <h3>📖 Bài làm của học sinh</h3>
          </div>

          <div className="col-content-body">
            {/* HỌC SINH */}
            <div className="form-group">
              <label className="field-label" htmlFor="student-id-select">
                Học sinh:
              </label>
              <div className="input-with-hint-row">
                <input
                  id="student-id-select"
                  type="text"
                  className="input-text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="Mã số học sinh (VD: HS01, HS02, An...)"
                  maxLength={20}
                />
              </div>
            </div>

            {/* DẠNG VĂN & ĐỀ BÀI */}
            <div className="form-row-2col">
              <div className="form-group">
                <label className="field-label" htmlFor="genre-select">
                  Dạng bài tập làm văn:
                </label>
                <select
                  id="genre-select"
                  className="input-select"
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                >
                  {GENRES.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="field-label" htmlFor="exam-date">
                  Ngày chấm:
                </label>
                <input
                  id="exam-date"
                  type="date"
                  className="input-text"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="field-label" htmlFor="topic-title">
                Đề bài, tên bài viết:
              </label>
              <input
                id="topic-title"
                type="text"
                className="input-text"
                value={topicTitle}
                onChange={(e) => setTopicTitle(e.target.value)}
                placeholder="Ví dụ: Cảnh bình minh trên quê hương em..."
              />
            </div>

            {/* ẢNH TRANG VỞ */}
            <div className="form-group photo-upload-box">
              <label className="field-label">
                📷 Ảnh trang vở (chụp từ điện thoại hoặc tải ảnh lên để đối chiếu):
              </label>
              
              <div className="file-input-wrapper">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="native-file-input"
                  onChange={handleFileChange}
                />
              </div>

              {imagePreview && (
                <div className="image-preview-card">
                  <div className="image-thumbnail-container">
                    <img src={imagePreview} alt="Ảnh trang vở học sinh" className="preview-img" />
                  </div>
                  <div className="image-actions-row">
                    <button
                      type="button"
                      className="btn-link-action remove"
                      onClick={handleRemoveImage}
                    >
                      🗑️ Xóa ảnh
                    </button>
                    <a
                      href={imagePreview}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-link-action view"
                    >
                      🔍 Phóng to ảnh
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* NÚT AI ĐỌC CHỮ TRONG ẢNH */}
            <div className="ai-ocr-toggle-box">
              <button
                type="button"
                className="btn-ocr-trigger"
                onClick={() => setShowOcrDetails(!showOcrDetails)}
              >
                {showOcrDetails ? '▼ Đóng trợ lý AI đọc ảnh' : '▶ Muốn AI đọc giúp chữ trong ảnh?'}
              </button>

              {showOcrDetails && (
                <div className="ai-ocr-panel">
                  <p className="ocr-note">
                    🦉 Cú Thông Thái sẽ dùng Gemini Multimodal Vision để đọc chữ viết tay trên trang vở kẻ ô ly của học sinh và tự động điền vào khung bên dưới.
                  </p>
                  <button
                    type="button"
                    className="btn-call-ocr"
                    onClick={handleRunOcr}
                    disabled={!imageBase64 || isOcrLoading}
                  >
                    {isOcrLoading ? '⏳ Đang đọc chữ viết tay trên vở...' : '🤖 Cú đọc chữ từ ảnh vở ngay'}
                  </button>
                </div>
              )}
            </div>

            {/* Ô GÕ LẠI BÀI VIẾT */}
            <div className="form-group">
              <div className="label-with-counter-row">
                <label className="field-label" htmlFor="essay-transcribe">
                  Bài viết chép lại (giữ nguyên cả lỗi sai của em, gõ liền mạch):
                </label>
                <span className="live-stats-tag">
                  {wordCount} từ • {sentenceCount} câu
                </span>
              </div>

              <textarea
                id="essay-transcribe"
                className="input-textarea notebook-style"
                rows={11}
                value={essayText}
                onChange={(e) => setEssayText(e.target.value)}
                placeholder="Gõ lại bài viết trong ảnh, hoặc dán bản AI đã chép lại vào đây..."
              />
            </div>

            {/* NÚT PHÂN TÍCH VÀ ĐIỀN BÀI MẪU */}
            <div className="grading-action-buttons-row">
              <button
                type="button"
                className="btn-primary-action analyze"
                onClick={handleAnalyzeEssay}
                disabled={isAnalyzing || !essayText.trim()}
              >
                {isAnalyzing ? '⏳ Đang phân tích...' : '🔍 Phân tích bài viết'}
              </button>

              <button
                type="button"
                className="btn-secondary-action sample"
                onClick={handleFillSample}
                title="Điền sẵn một bài văn lớp 5 để kiểm tra chức năng ngay tức thì"
              >
                📝 Điền bài mẫu để thử
              </button>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: MÁY PHÂN TÍCH & GIÁO VIÊN CHẤM */}
        <div className="grading-col teacher-scoring-col">
          <div className="col-header-banner">
            <h3>🤖 Máy phân tích (chỉ gợi ý)</h3>
          </div>

          <div className="col-content-body">
            {/* KẾT QUẢ PHÂN TÍCH TỪ MÁY */}
            {!analysisResult ? (
              <div className="empty-analysis-box">
                <p>
                  Bấm <strong>"Phân tích bài viết"</strong> để xem số tiếng, số câu, lời khen, gợi ý sửa và phát hiện lỗi chính tả tự động.
                </p>
              </div>
            ) : (
              <div className="analysis-summary-card">
                <div className="metrics-row">
                  <span className="metric-chip">📝 <strong>{wordCount}</strong> tiếng/từ</span>
                  <span className="metric-chip">✍️ <strong>{sentenceCount}</strong> câu</span>
                  <span className="metric-chip highlight">🌟 AI đánh giá: <strong>{analysisResult.tongDiem}</strong>/10đ</span>
                </div>

                {analysisResult.khen && (
                  <div className="ai-praise-box">
                    <span className="box-tag">🌸 Lời khen từ Cú:</span>
                    <p>{analysisResult.khen}</p>
                  </div>
                )}

                {analysisResult.goiY && analysisResult.goiY.length > 0 && (
                  <div className="ai-suggestions-box">
                    <span className="box-tag">💡 Gợi ý cải thiện:</span>
                    <ul>
                      {analysisResult.goiY.map((g, idx) => (
                        <li key={idx}>{g}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysisResult.loiChinhTa && analysisResult.loiChinhTa.length > 0 && (
                  <div className="ai-spelling-box">
                    <span className="box-tag">⚠️ Lỗi chính tả & dùng từ phát hiện:</span>
                    <table className="mini-spelling-table">
                      <thead>
                        <tr>
                          <th>Từ viết sai</th>
                          <th>Nên sửa thành</th>
                          <th>Lý do</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analysisResult.loiChinhTa.map((item, idx) => (
                          <tr key={idx}>
                            <td className="wrong-word">{item.sai}</td>
                            <td className="correct-word">{item.dung}</td>
                            <td className="reason-word">{item.lyDo || 'Đúng quy tắc'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* CHẤM THEO TIÊU CHÍ */}
            <div className="criteria-scoring-section">
              <div className="criteria-section-header">
                <h4>⚖️ Chấm theo tiêu chí ({selectedGenre})</h4>
                <span className="unrated-counter">
                  {unratedCount > 0 ? `Còn ${unratedCount} tiêu chí chưa chấm` : '✅ Đã chấm đủ tiêu chí'}
                </span>
              </div>

              <div className="criteria-items-list">
                {criteriaList.map((c) => {
                  const max = c.max;
                  // Tạo danh sách các mức điểm 0, 0.5, 1.0 ... max
                  const stepOptions = [];
                  for (let val = 0; val <= max + 0.001; val += 0.5) {
                    stepOptions.push(Math.round(val * 10) / 10);
                  }

                  const currentScore = scores[c.key] !== undefined ? scores[c.key] : '';

                  return (
                    <div key={c.key} className="criterion-grading-card">
                      <div className="criterion-info">
                        <div className="criterion-title-row">
                          <span className="criterion-label">{c.label}</span>
                          <span className="criterion-max-badge">Tối đa {c.max}đ</span>
                        </div>
                        <p className="criterion-desc">{c.desc}</p>
                      </div>

                      <div className="criterion-input-box">
                        <select
                          className="score-select"
                          value={currentScore}
                          onChange={(e) => {
                            const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                            setScores((prev) => ({ ...prev, [c.key]: val }));
                          }}
                        >
                          <option value="">--</option>
                          {stepOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt} đ
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* TỔNG ĐIỂM GIÁO VIÊN CHẤM */}
              <div className="teacher-total-score-banner">
                <span>Tổng điểm Thầy/Cô chấm:</span>
                <span className="score-number">{totalTeacherScore.toFixed(1)} / 10</span>
              </div>
            </div>

            {/* NHẬN XÉT GỬI HỌC SINH / PHỤ HUYNH */}
            <div className="form-group teacher-comment-group">
              <div className="label-with-action-row">
                <label className="field-label" htmlFor="teacher-final-comment">
                  Nhận xét gửi học sinh, phụ huynh:
                </label>
                <button
                  type="button"
                  className="btn-suggest-comment"
                  onClick={handleSuggestComment}
                >
                  💡 Gợi ý nhận xét
                </button>
              </div>

              <textarea
                id="teacher-final-comment"
                className="input-textarea"
                rows={4}
                value={teacherComment}
                onChange={(e) => setTeacherComment(e.target.value)}
                placeholder="Nhập lời khen, động viên và góp ý của Thầy/Cô gửi tới em học sinh..."
              />
            </div>

            {/* NÚT LƯU NHÁP & DUYỆT VÀ LƯU VÀO SỔ */}
            <div className="final-action-buttons-row">
              <button
                type="button"
                className="btn-draft-save"
                onClick={() => handleApproveAndSave('cho_duyet')}
                disabled={isSaving}
              >
                💾 Lưu nháp
              </button>

              <button
                type="button"
                className="btn-approve-and-record"
                onClick={() => handleApproveAndSave('da_duyet')}
                disabled={isSaving}
              >
                {isSaving ? '⏳ Đang lưu vào sổ...' : '✅ Duyệt và lưu vào sổ'}
              </button>
            </div>

            <p className="grading-footer-caption">
              🔒 Bài chỉ tính vào sổ khi giáo viên bấm Duyệt. Máy không tự quyết định điểm.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
