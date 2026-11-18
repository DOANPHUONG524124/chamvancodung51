import React, { useState, useEffect, useRef } from 'react';
import OwlMascot from './components/OwlMascot';
import TeacherLoginModal from './components/TeacherLoginModal';
import TeacherTopicManager from './components/TeacherTopicManager';
import TeacherRubricEditor from './components/TeacherRubricEditor';
import TeacherGradingReview from './components/TeacherGradingReview';
import TeacherPhotoGrading from './components/TeacherPhotoGrading';
import TeacherClassManager from './components/TeacherClassManager';
import StudentLookupModal from './components/StudentLookupModal';
import StudentLoginModal from './components/StudentLoginModal';

export default function App() {
  // Trạng thái Giáo viên (CHỈ lưu trong React State trong phiên làm việc, KHÔNG dùng localStorage)
  const [teacherToken, setTeacherToken] = useState(null);
  const [teacherTab, setTeacherTab] = useState('photo-grading'); // 'photo-grading' | 'review' | 'classes' | 'topics' | 'rubric'
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Trạng thái Học sinh đăng nhập
  const [currentStudent, setCurrentStudent] = useState(null); // { maHocSinh, hoVaTen, lop }
  const [isStudentLoginOpen, setIsStudentLoginOpen] = useState(false);

  // Trạng thái Tra cứu bài của học sinh
  const [isLookupModalOpen, setIsLookupModalOpen] = useState(false);

  // Danh sách đề bài đang mở cho học sinh
  const [openTopics, setOpenTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [rubrics, setRubrics] = useState({});
  const [showCriteriaDetail, setShowCriteriaDetail] = useState(false);

  // Thông tin bài làm của học sinh
  const [studentId, setStudentId] = useState('');
  const [essay, setEssay] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [studentPhoto, setStudentPhoto] = useState(null);
  const [isOcrReading, setIsOcrReading] = useState(false);
  const studentFileInputRef = useRef(null);

  // Trạng thái luồng làm bài: 'write' | 'loading' | 'submitted'
  const [status, setStatus] = useState('write');
  const [submittedResult, setSubmittedResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Số từ đã gõ
  const wordCount = essay.trim() ? essay.trim().split(/\s+/).length : 0;

  // Tải danh sách đề đang mở và Rubric khi khởi động
  const loadInitialData = async () => {
    try {
      // 1. Tải đề bài (học sinh chỉ nhận đề 'mo')
      const resTopics = await fetch('/api/de-bai');
      const dataTopics = await resTopics.json();
      if (dataTopics.topics && dataTopics.topics.length > 0) {
        setOpenTopics(dataTopics.topics);
        if (!selectedTopic) {
          setSelectedTopic(dataTopics.topics[0]);
          setCustomPrompt(dataTopics.topics[0].yeuCau);
        }
      }

      // 2. Tải rubric
      const resRubric = await fetch('/api/rubric');
      const dataRubric = await resRubric.json();
      if (dataRubric.rubrics) {
        setRubrics(dataRubric.rubrics);
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu ban đầu:', err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Khi chọn một đề bài khác
  const handleSelectTopic = (topic) => {
    setSelectedTopic(topic);
    setCustomPrompt(topic.yeuCau);
  };

  // Đăng nhập giáo viên thành công
  const handleLoginSuccess = (token) => {
    setTeacherToken(token);
    setTeacherTab('photo-grading');
  };

  // Đăng xuất chế độ giáo viên
  const handleLogoutTeacher = () => {
    setTeacherToken(null);
    loadInitialData();
  };

  // Học sinh đăng nhập thành công
  const handleStudentLoginSuccess = (student) => {
    setCurrentStudent(student);
    setStudentId(student.maHocSinh);
    setErrorMessage('');
  };

  // Học sinh đăng xuất
  const handleStudentLogout = () => {
    setCurrentStudent(null);
    setStudentId('');
  };

  // Xử lý nén ảnh trang vở của học sinh
  const handleStudentPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage('');
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
        const compressed = canvas.toDataURL('image/jpeg', 0.82);
        setStudentPhoto(compressed);
      };
      img.src = loadEvt.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveStudentPhoto = () => {
    setStudentPhoto(null);
    if (studentFileInputRef.current) studentFileInputRef.current.value = '';
  };

  // AI đọc chữ viết tay trên trang vở cho học sinh
  const handleStudentOcr = async () => {
    if (!studentPhoto) {
      setErrorMessage('Em hãy bấm chọn hoặc chụp ảnh trang vở trước nhé!');
      return;
    }

    setIsOcrReading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/doc-anh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: studentPhoto,
          mimeType: 'image/jpeg'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Cú chưa đọc được ảnh trang vở.');

      setEssay(data.text || '');
    } catch (err) {
      setErrorMessage(err.message || 'Không thể đọc ảnh lúc này. Em kiểm tra lại mạng nhé!');
    } finally {
      setIsOcrReading(false);
    }
  };

  // Điền bài mẫu để thử nghiệm nhanh không cần gõ phím
  const handleFillStudentSample = () => {
    setStudentId('HS07');
    setEssay(`Quê hương em có dòng sông Hồng đỏ nặng phù sa uốn lượn quanh làng. Mỗi buổi sáng sớm, khi sương mù còn lãng đãng bay trên mặt nước, từng tia nắng vàng ấm áp bắt đầu len lỏi qua từng rặng tre xanh. Tiếng chim hót ríu rít chuyền cành như bản nhạc chào đón ngày mới tươi vui. Dưới bến sông, các bác nông dân đang chuẩn bị quang gánh ra đồng chăm sóc lúa. Em rất tự hào và yêu quý cảnh sắc thiên nhiên bình dị, tươi đẹp của quê hương em.`);
    setErrorMessage('');
  };

  // Học sinh bấm nộp bài
  const handleSubmitEssay = async () => {
    if (!studentId.trim()) {
      setErrorMessage('Em hãy nhập Mã số của mình (ví dụ: HS01, 05...) trước khi nộp bài nhé!');
      return;
    }

    if (essay.trim().length < 30) {
      setErrorMessage('Bài văn còn hơi ngắn (dưới 30 ký tự). Em hãy viết thêm vài câu nữa để Cú đọc nhé!');
      return;
    }

    setErrorMessage('');
    setStatus('loading');

    try {
      const activeDangVan = selectedTopic?.dangVan || 'Văn miêu tả phong cảnh';
      const activeRubric = rubrics[activeDangVan];

      const payload = {
        maHocSinh: studentId.trim(),
        deBai: {
          maDe: selectedTopic?.maDe || 'DE-TU-DO',
          tenBai: selectedTopic?.tenBai || 'Đề bài tự do',
          dangVan: activeDangVan,
          yeuCau: customPrompt || selectedTopic?.yeuCau || '',
          doDai: selectedTopic?.doDai || '150-250 từ'
        },
        rubric: activeRubric,
        baiLam: essay.trim(),
        anhTrangVo: studentPhoto || null
      };

      const res = await fetch('/api/cham-van', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Có lỗi khi Cú đọc bài.');

      setSubmittedResult(data);
      setStatus('submitted');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setErrorMessage(err.message || 'Không thể gửi bài lúc này. Em kiểm tra mạng và thử lại nhé!');
      setStatus('write');
    }
  };

  // Viết bài mới
  const handleWriteAnother = () => {
    setEssay('');
    setStudentPhoto(null);
    if (studentFileInputRef.current) studentFileInputRef.current.value = '';
    setStatus('write');
    setSubmittedResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Rubric hiện tại tương ứng với dạng văn của đề đã chọn
  const activeRubric = selectedTopic
    ? rubrics[selectedTopic.dangVan] || rubrics['Tả phong cảnh']
    : null;

  return (
    <div className="app-container">
      {/* ================= HEADER CHUNG ================= */}
      <header className="app-header">
        <div className="mascot-badge">
          <OwlMascot
            state={status === 'loading' ? 'thinking' : teacherToken ? 'teacher' : 'welcome'}
            size={90}
          />
        </div>

        <div className="header-text">
          <h1 className="app-title">Cú Nhí Chấm Văn</h1>
          <p className="app-subtitle">
            Góc luyện viết tập làm văn lớp 5 với linh vật Cú Thông Thái 🦉✨
          </p>
        </div>

        <div className="header-actions-row">
          {currentStudent ? (
            <div className="student-profile-pill">
              <span className="student-greeting-text">
                🎒 <strong>{currentStudent.hoVaTen}</strong> ({currentStudent.lop})
              </span>
              <button
                type="button"
                className="btn-student-logout"
                onClick={handleStudentLogout}
                title="Đổi học sinh khác hoặc đăng xuất"
              >
                ✕ Thoát
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn-header-action student-login"
              onClick={() => setIsStudentLoginOpen(true)}
              title="Học sinh đăng nhập để tự động lưu bài theo danh sách lớp"
            >
              🎒 Học sinh đăng nhập
            </button>
          )}

          <button
            type="button"
            className="btn-header-action lookup"
            onClick={() => setIsLookupModalOpen(true)}
            title="Tra cứu bài văn đã nộp bằng Mã số học sinh"
          >
            🔍 Tra cứu bài của em
          </button>

          {teacherToken ? (
            <button
              type="button"
              className="btn-header-action teacher active"
              onClick={() => setTeacherTab('photo-grading')}
              title="Đang ở chế độ Thầy Cô"
            >
              👩‍🏫 Góc Thầy Cô
            </button>
          ) : (
            <button
              type="button"
              className="btn-header-action teacher"
              onClick={() => setIsLoginModalOpen(true)}
              title="Dành cho giáo viên đăng nhập quản lý"
            >
              🔒 Chế độ Thầy Cô
            </button>
          )}
        </div>
      </header>

      {/* ================= CHẾ ĐỘ THẦY CÔ (KHI ĐÃ ĐĂNG NHẬP) ================= */}
      {teacherToken && (
        <div className="teacher-section-wrapper">
          <nav className="teacher-navbar-card">
            <div className="teacher-nav-tabs">
              <button
                type="button"
                className={`teacher-tab-btn ${teacherTab === 'photo-grading' ? 'active' : ''}`}
                onClick={() => setTeacherTab('photo-grading')}
              >
                📷 Chấm từ ảnh vở
              </button>
              <button
                type="button"
                className={`teacher-tab-btn ${teacherTab === 'review' ? 'active' : ''}`}
                onClick={() => setTeacherTab('review')}
              >
                📊 Sổ theo dõi & Duyệt bài
              </button>
              <button
                type="button"
                className={`teacher-tab-btn ${teacherTab === 'classes' ? 'active' : ''}`}
                onClick={() => setTeacherTab('classes')}
              >
                🏫 Quản lý Lớp học
              </button>
              <button
                type="button"
                className={`teacher-tab-btn ${teacherTab === 'topics' ? 'active' : ''}`}
                onClick={() => setTeacherTab('topics')}
              >
                📚 Quản lý Đề bài
              </button>
              <button
                type="button"
                className={`teacher-tab-btn ${teacherTab === 'rubric' ? 'active' : ''}`}
                onClick={() => setTeacherTab('rubric')}
              >
                ⚖️ Tùy chỉnh Rubric
              </button>
            </div>

            <button
              type="button"
              className="btn-logout-teacher"
              onClick={handleLogoutTeacher}
              title="Đăng xuất chế độ Thầy Cô về góc Học sinh"
            >
              🚪 Đăng xuất (Về góc Học sinh)
            </button>
          </nav>

          <main className="content-card">
            {teacherTab === 'photo-grading' && (
              <TeacherPhotoGrading
                teacherToken={teacherToken}
                topics={openTopics}
                rubrics={rubrics}
                onSaved={loadInitialData}
              />
            )}

            {teacherTab === 'review' && (
              <TeacherGradingReview
                teacherToken={teacherToken}
                topics={openTopics}
              />
            )}

            {teacherTab === 'classes' && (
              <TeacherClassManager
                teacherToken={teacherToken}
                onClassesUpdated={loadInitialData}
              />
            )}

            {teacherTab === 'topics' && (
              <TeacherTopicManager
                teacherToken={teacherToken}
                onTopicsUpdated={loadInitialData}
              />
            )}

            {teacherTab === 'rubric' && (
              <TeacherRubricEditor
                teacherToken={teacherToken}
                onRubricsUpdated={loadInitialData}
              />
            )}
          </main>
        </div>
      )}

      {/* ================= CHẾ ĐỘ HỌC SINH (MẶC ĐỊNH KHI CHƯA BẬT GÓC GIÁO VIÊN) ================= */}
      {!teacherToken && status === 'write' && (
        <main className="content-card">
          {/* BƯỚC 1: CHỌN ĐỀ BÀI ĐANG MỞ */}
          <section className="flow-step">
            <div className="step-heading">
              <span className="step-num">1</span>
              <h2>Em hãy chọn một đề bài để luyện viết nhé:</h2>
            </div>

            {openTopics.length === 0 ? (
              <div className="empty-state-box">
                <p>Hiện tại chưa có đề bài nào đang mở. Em nhờ Cô giáo mở đề để luyện viết nhé!</p>
              </div>
            ) : (
              <div className="topic-chips" role="radiogroup" aria-label="Chọn đề bài">
                {openTopics.map((topic) => (
                  <button
                    key={topic.maDe}
                    type="button"
                    className={`topic-chip ${selectedTopic?.maDe === topic.maDe ? 'active' : ''}`}
                    onClick={() => handleSelectTopic(topic)}
                    role="radio"
                    aria-checked={selectedTopic?.maDe === topic.maDe}
                  >
                    <span className="chip-badge">📖 Tập {topic.tap}</span>
                    <span className="chip-title">{topic.tenBai}</span>
                  </button>
                ))}
              </div>
            )}

            {/* THÔNG TIN CHI TIẾT ĐỀ BÀI ĐÃ CHỌN */}
            {selectedTopic && (
              <div className="selected-topic-details-card">
                <div className="topic-tags-row">
                  <span className="badge-pill genre">Dạng văn: {selectedTopic.dangVan}</span>
                  {selectedTopic.chuDiem && (
                    <span className="badge-pill tap">Chủ điểm: {selectedTopic.chuDiem}</span>
                  )}
                  <span className="topic-length-tag">📏 Độ dài mong muốn: {selectedTopic.doDai}</span>
                </div>

                <div className="topic-box-container">
                  <label htmlFor="topic-custom" className="field-label">
                    Yêu cầu của đề bài:
                  </label>
                  <textarea
                    id="topic-custom"
                    className="input-textarea topic-textarea"
                    rows={2}
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Em có thể tùy chỉnh thêm cảnh đẹp quê mình..."
                  />
                </div>

                {/* XEM TIÊU CHÍ CHẤM ĐIỂM (RUBRIC) CỦA DẠNG VĂN NÀY */}
                {activeRubric && (
                  <div className="criteria-peek-wrapper">
                    <button
                      type="button"
                      className="btn-outline-toggle"
                      onClick={() => setShowCriteriaDetail(!showCriteriaDetail)}
                    >
                      {showCriteriaDetail ? '🙈 Ẩn tiêu chí chấm của Cú' : '💡 Xem các tiêu chí chấm bài dạng này'}
                    </button>

                    {showCriteriaDetail && (
                      <div className="outline-box">
                        <h3 className="outline-heading">🦉 Cú mách nước các tiêu chí em cần chú ý:</h3>
                        <ul className="outline-list">
                          {activeRubric.tieuChi?.map((c, i) => (
                            <li key={i}>
                              <strong>{c.label}:</strong> {c.desc}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* BƯỚC 2: NHẬP MÃ SỐ HỌC SINH & GÕ BÀI VĂN */}
          <section className="flow-step">
            <div className="step-heading">
              <span className="step-num">2</span>
              <h2>Em nhập mã số và gõ bài văn của mình vào đây nhé:</h2>
            </div>

            {currentStudent ? (
              <div className="student-logged-banner">
                <div className="logged-avatar">🦉</div>
                <div className="logged-text">
                  <div className="logged-name">Học sinh: <strong>{currentStudent.hoVaTen}</strong> ({currentStudent.lop})</div>
                  <div className="logged-id">Mã số: <strong>{currentStudent.maHocSinh}</strong> (Đã đăng nhập)</div>
                </div>
                <button
                  type="button"
                  className="btn-switch-student"
                  onClick={handleStudentLogout}
                  title="Đăng xuất để đổi học sinh khác"
                >
                  🔄 Đổi học sinh
                </button>
              </div>
            ) : (
              <div className="student-id-field-wrapper">
                <div className="label-with-login-link">
                  <label htmlFor="student-id-input" className="field-label">
                    Mã số học sinh của em (không cần ghi họ tên):
                  </label>
                  <button
                    type="button"
                    className="btn-link-login-student"
                    onClick={() => setIsStudentLoginOpen(true)}
                  >
                    🎒 Chọn tên từ danh sách Lớp ➔
                  </button>
                </div>
                <input
                  id="student-id-input"
                  type="text"
                  className="input-text student-id-input"
                  placeholder="Ví dụ: HS01, HS02, An..."
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  maxLength={20}
                />
                <span className="field-hint">💡 Em có thể gõ mã số hoặc bấm "Chọn tên từ danh sách Lớp" ở trên nhé.</span>
              </div>
            )}

            {/* TÙY CHỌN: CHỤP ẢNH TRANG VỞ HOẶC ĐIỀN BÀI MẪU */}
            <div className="student-photo-tool-card">
              <div className="photo-tool-header">
                <span className="tool-title">📸 Chụp ảnh trang vở kẻ ô ly của em:</span>
                <button
                  type="button"
                  className="btn-quick-sample"
                  onClick={handleFillStudentSample}
                  title="Điền sẵn một bài văn lớp 5 để em thử nghiệm nhanh"
                >
                  📝 Điền bài mẫu để thử
                </button>
              </div>

              <div className="photo-actions-row">
                <input
                  ref={studentFileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="native-file-input student-file-input"
                  onChange={handleStudentPhotoChange}
                />

                {studentPhoto && (
                  <button
                    type="button"
                    className="btn-student-ocr"
                    onClick={handleStudentOcr}
                    disabled={isOcrReading}
                  >
                    {isOcrReading ? '⏳ Cú đang đọc từng dòng chữ...' : '🤖 Cú đọc chữ từ ảnh vở giúp em'}
                  </button>
                )}
              </div>

              {studentPhoto && (
                <div className="student-photo-preview-wrap">
                  <div className="preview-thumb-box">
                    <img src={studentPhoto} alt="Trang vở của em" className="thumb-img" />
                  </div>
                  <button
                    type="button"
                    className="btn-remove-thumb"
                    onClick={handleRemoveStudentPhoto}
                  >
                    🗑️ Xóa ảnh
                  </button>
                </div>
              )}
            </div>

            <div className="essay-editor-wrapper">
              <div className="notebook-header">
                <span className="notebook-tag">📖 Trang vở tập làm văn</span>
                <span className={`word-counter ${wordCount >= 100 ? 'good' : ''}`}>
                  {wordCount} từ {wordCount < 60 ? '(Cần thêm ý)' : wordCount < 140 ? '(Đang viết tốt)' : '🌟 (Rất phong phú)'}
                </span>
              </div>

              <textarea
                id="essay-input"
                className="input-textarea essay-textarea"
                rows={13}
                value={essay}
                onChange={(e) => setEssay(e.target.value)}
                placeholder="Em bắt đầu viết bài văn của mình vào đây nhé... Em cũng có thể chụp ảnh trang vở rồi nhờ Cú đọc giúp chữ ở trên nha!"
              />
            </div>

            {errorMessage && (
              <div className="alert-box error" role="alert">
                ⚠️ {errorMessage}
              </div>
            )}

            <div className="action-buttons-group">
              <button
                type="button"
                className="btn-primary-big btn-submit"
                onClick={handleSubmitEssay}
                disabled={essay.trim().length === 0}
              >
                ✨ Nộp bài cho Cú chấm ngay!
              </button>
            </div>
          </section>
        </main>
      )}

      {/* ================= MÀN HÌNH CHỜ CHẤM (STATUS: LOADING) ================= */}
      {!teacherToken && status === 'loading' && (
        <main className="content-card loading-card">
          <OwlMascot state="thinking" size={160} />
          <h2 className="loading-title">Cú Thông Thái đang đọc bài của em...</h2>
          <p className="loading-subtitle">
            Cú đang chăm chú đọc từng câu văn theo đúng các tiêu chí của Cô giáo đề ra nè! Chờ Cú một chút nhé.
          </p>
          <div className="loading-dots">
            <span className="dot dot-1"></span>
            <span className="dot dot-2"></span>
            <span className="dot dot-3"></span>
          </div>
        </main>
      )}

      {/* ================= MÀN HÌNH NỘP BÀI THÀNH CÔNG (STATUS: SUBMITTED) ================= */}
      {!teacherToken && status === 'submitted' && (
        <main className="content-card result-card">
          <div className="submission-success-banner">
            <OwlMascot state="welcome" size={130} />
            <h2 className="success-heading">🎉 Nộp Bài Thành Công!</h2>
            <p className="success-desc">
              Cú Thông Thái đã đọc bài văn của em và chuyển bài vào sổ theo dõi cho <strong>Cô giáo duyệt</strong>.
            </p>
            <div className="student-id-receipt-pill">
              Mã số của em: <strong>{submittedResult?.maHocSinh || studentId}</strong>
            </div>
            <p className="success-note">
              Sau khi Cô giáo xem và duyệt xong, lời khen ngợi và sao danh dự sẽ xuất hiện trong mục <strong>"Tra cứu bài của em"</strong>!
            </p>
          </div>

          <div className="action-buttons-group result-actions">
            <button
              type="button"
              className="btn-primary-big btn-open-lookup"
              onClick={() => setIsLookupModalOpen(true)}
            >
              🔍 Mở ô Tra cứu bài của em ngay
            </button>
            <button
              type="button"
              className="btn-secondary-clean btn-new-essay"
              onClick={handleWriteAnother}
            >
              📝 Luyện viết thêm bài văn khác
            </button>
          </div>
        </main>
      )}

      {/* ================= MODAL ĐĂNG NHẬP GIÁO VIÊN ================= */}
      <TeacherLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* ================= MODAL TRA CỨU HỌC SINH ================= */}
      <StudentLookupModal
        isOpen={isLookupModalOpen}
        onClose={() => setIsLookupModalOpen(false)}
        topics={openTopics}
      />

      {/* ================= MODAL ĐĂNG NHẬP HỌC SINH ================= */}
      <StudentLoginModal
        isOpen={isStudentLoginOpen}
        onClose={() => setIsStudentLoginOpen(false)}
        onLoginSuccess={handleStudentLoginSuccess}
      />

      {/* ================= CHÂN TRANG ================= */}
      <footer className="app-footer no-print">
        <p>Cú Nhí đồng hành cùng Thầy Cô và các em học sinh lớp 5 luyện viết văn mỗi ngày 🦉🌸</p>
      </footer>
    </div>
  );
}
