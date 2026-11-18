import React, { useState, useEffect, useRef } from 'react';

export default function TeacherClassManager({ teacherToken, onClassesUpdated }) {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState(['Lớp 5A1', 'Lớp 5A2']);
  const [selectedClass, setSelectedClass] = useState('tat_ca');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form thêm / sửa học sinh thủ công
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formStudent, setFormStudent] = useState({
    maHocSinh: '',
    hoVaTen: '',
    lop: 'Lớp 5A1',
    maPin: '1234'
  });

  const fileInputRef = useRef(null);

  // Tải danh sách học sinh từ server
  const fetchStudents = async () => {
    setIsLoading(true);
    setError('');
    try {
      const url = selectedClass !== 'tat_ca'
        ? `/api/hoc-sinh?lop=${encodeURIComponent(selectedClass)}`
        : '/api/hoc-sinh';

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${teacherToken}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi tải danh sách học sinh');

      setStudents(data.students || []);
      if (data.classes && data.classes.length > 0) {
        setClasses(data.classes);
      }
      if (onClassesUpdated) onClassesUpdated();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (teacherToken) fetchStudents();
  }, [teacherToken, selectedClass]);

  // Tải file CSV mẫu chuẩn UTF-8
  const handleDownloadSampleCSV = () => {
    const csvHeader = 'maHocSinh,hoVaTen,lop,maPin\n';
    const sampleRows = [
      'HS01,Nguyễn Minh An,Lớp 5A1,1234',
      'HS02,Trần Bảo Châu,Lớp 5A1,2015',
      'HS03,Lê Hoàng Dũng,Lớp 5A1,1111',
      'HS04,Phạm Hương Giang,Lớp 5A1,2222',
      'HS05,Vũ Đức Nam,Lớp 5A1,3333',
      'HS06,Đỗ Thùy Linh,Lớp 5A2,1234',
      'HS07,Bùi Tuấn Kiệt,Lớp 5A2,2015'
    ].join('\n');

    // Thêm UTF-8 BOM (\uFEFF) để Excel hiển thị tiếng Việt không bị lỗi font
    const blob = new Blob(['\uFEFF' + csvHeader + sampleRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Mau_Danh_Sach_Lop_5.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Upload file CSV từ máy tính
  const handleUploadCSV = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccessMsg('');
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const text = evt.target.result;
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        if (lines.length < 2) {
          throw new Error('File CSV phải có ít nhất 1 dòng tiêu đề và 1 dòng học sinh.');
        }

        const parsedStudents = [];
        // Bỏ qua dòng tiêu đề
        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split(',').map(p => p.trim().replace(/^"|"$/g, ''));
          if (parts.length >= 2 && parts[0] && parts[1]) {
            parsedStudents.push({
              maHocSinh: parts[0],
              hoVaTen: parts[1],
              lop: parts[2] || (selectedClass !== 'tat_ca' ? selectedClass : 'Lớp 5A1'),
              maPin: parts[3] || '1234'
            });
          }
        }

        if (parsedStudents.length === 0) {
          throw new Error('Không tìm thấy học sinh hợp lệ trong file CSV.');
        }

        setIsLoading(true);
        const res = await fetch('/api/hoc-sinh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${teacherToken}`
          },
          body: JSON.stringify({
            action: 'import',
            students: parsedStudents
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Lỗi khi nhập danh sách học sinh.');

        setSuccessMsg(`🎉 ${data.message || `Đã tải lên thành công ${parsedStudents.length} học sinh!`}`);
        await fetchStudents();
      } catch (err) {
        setError(err.message || 'Lỗi đọc file CSV.');
      } finally {
        setIsLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsText(file, 'utf-8');
  };

  // Lưu học sinh mới
  const handleSaveStudent = async (e) => {
    e.preventDefault();
    if (!formStudent.maHocSinh.trim() || !formStudent.hoVaTen.trim()) {
      setError('Vui lòng nhập Mã học sinh và Họ và tên.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/hoc-sinh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacherToken}`
        },
        body: JSON.stringify({
          action: 'save',
          ...formStudent
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi lưu học sinh.');

      setSuccessMsg(`Đã lưu học sinh ${formStudent.hoVaTen} (${formStudent.maHocSinh}) thành công!`);
      setIsAddModalOpen(false);
      setFormStudent({
        maHocSinh: '',
        hoVaTen: '',
        lop: selectedClass !== 'tat_ca' ? selectedClass : 'Lớp 5A1',
        maPin: '1234'
      });
      await fetchStudents();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Xóa học sinh
  const handleDeleteStudent = async (maHocSinh, hoVaTen) => {
    if (!window.confirm(`Thầy/Cô có chắc chắn muốn xóa học sinh ${hoVaTen} (${maHocSinh}) khỏi danh sách?`)) {
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/hoc-sinh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacherToken}`
        },
        body: JSON.stringify({
          action: 'delete',
          maHocSinh
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi xóa học sinh');

      setSuccessMsg(`Đã xóa học sinh ${hoVaTen} (${maHocSinh}).`);
      await fetchStudents();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // In danh sách cấp mã PIN cho cả lớp
  const handlePrintSlips = () => {
    window.print();
  };

  return (
    <div className="class-manager-wrapper">
      {/* THANH ĐIỀU HƯỚNG VÀ NÚT TÁC VỤ */}
      <div className="class-manager-toolbar no-print">
        <div className="toolbar-left">
          <label htmlFor="filter-class" className="toolbar-label">
            🏫 Lớp học:
          </label>
          <select
            id="filter-class"
            className="input-select class-filter-select"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="tat_ca">Tất cả các lớp ({students.length} học sinh)</option>
            {classes.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="toolbar-right">
          <button
            type="button"
            className="btn-toolbar-action sample"
            onClick={handleDownloadSampleCSV}
            title="Tải file mẫu Excel/CSV có sẵn tiêu đề chuẩn"
          >
            📥 Tải file mẫu CSV
          </button>

          <label className="btn-toolbar-action upload" title="Tải danh sách học sinh từ máy tính">
            📂 Tải lên danh sách (CSV)
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={handleUploadCSV}
            />
          </label>

          <button
            type="button"
            className="btn-toolbar-action add"
            onClick={() => {
              setFormStudent({
                maHocSinh: `HS${String(students.length + 1).padStart(2, '0')}`,
                hoVaTen: '',
                lop: selectedClass !== 'tat_ca' ? selectedClass : 'Lớp 5A1',
                maPin: '1234'
              });
              setIsAddModalOpen(true);
            }}
          >
            ➕ Thêm học sinh
          </button>

          <button
            type="button"
            className="btn-toolbar-action print"
            onClick={handlePrintSlips}
            title="In phiếu cấp mã PIN cho học sinh dán vào góc vở"
          >
            🖨️ In thẻ PIN cả lớp
          </button>
        </div>
      </div>

      {/* THÔNG BÁO LỖI / THÀNH CÔNG */}
      {error && <div className="alert-box error no-print" role="alert">⚠️ {error}</div>}
      {successMsg && <div className="alert-box success no-print" role="alert">✨ {successMsg}</div>}

      {/* BẢNG DANH SÁCH HỌC SINH */}
      <div className="class-roster-card">
        <div className="roster-header">
          <h3 className="roster-title">
            Danh Sách Học Sinh {selectedClass !== 'tat_ca' ? `- ${selectedClass}` : ''}
          </h3>
          <span className="roster-badge">{students.length} học sinh</span>
        </div>

        {students.length === 0 ? (
          <div className="empty-roster-box">
            <p>Chưa có học sinh nào trong lớp. Thầy/Cô bấm <strong>"Tải lên danh sách (CSV)"</strong> hoặc <strong>"Thêm học sinh"</strong> nhé!</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="roster-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>STT</th>
                  <th>Mã số HS</th>
                  <th>Họ và Tên</th>
                  <th>Lớp</th>
                  <th>Mã PIN đăng nhập</th>
                  <th className="no-print" style={{ width: '120px', textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, idx) => (
                  <tr key={s.maHocSinh}>
                    <td className="text-center">{idx + 1}</td>
                    <td>
                      <span className="student-code-badge">{s.maHocSinh}</span>
                    </td>
                    <td>
                      <strong className="student-name-text">{s.hoVaTen}</strong>
                    </td>
                    <td>
                      <span className="class-pill">{s.lop || 'Lớp 5A1'}</span>
                    </td>
                    <td>
                      <span className="pin-badge" title="Mã PIN 4 số của học sinh">
                        🔑 {s.maPin || '1234'}
                      </span>
                    </td>
                    <td className="no-print text-center">
                      <button
                        type="button"
                        className="btn-delete-student"
                        onClick={() => handleDeleteStudent(s.maHocSinh, s.hoVaTen)}
                        title="Xóa học sinh này"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* GIAO DIỆN IN THẺ PIN PHÁT TẬN TAY HỌC SINH (CHỈ HIỂN THỊ KHI BẤM IN) */}
      <div className="print-slips-container print-only">
        <h2 className="print-slips-title">PHIẾU ĐĂNG NHẬP "CÚ NHÍ CHẤM VĂN" - {selectedClass !== 'tat_ca' ? selectedClass : 'KHỐI 5'}</h2>
        <p className="print-slips-desc">Học sinh bảo quản phiếu này để tự đăng nhập nộp bài và xem lời khen của Cô giáo 🦉</p>
        <div className="slips-grid">
          {students.map((s) => (
            <div key={s.maHocSinh} className="student-slip-item">
              <div className="slip-mascot">🦉</div>
              <div className="slip-info">
                <div className="slip-name">{s.hoVaTen}</div>
                <div className="slip-meta">
                  Lớp: <strong>{s.lop}</strong> • Mã HS: <strong>{s.maHocSinh}</strong>
                </div>
                <div className="slip-pin">
                  Mã PIN: <strong>{s.maPin}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL THÊM HỌC SINH THỦ CÔNG */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-icon">👤</span>
              <h3 className="modal-title">Thêm Học Sinh Mới</h3>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setIsAddModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="form-add-student">
              <div className="form-group">
                <label className="field-label" htmlFor="inp-ma-hs">
                  Mã số học sinh:
                </label>
                <input
                  id="inp-ma-hs"
                  type="text"
                  className="input-text"
                  value={formStudent.maHocSinh}
                  onChange={(e) => setFormStudent({ ...formStudent, maHocSinh: e.target.value })}
                  placeholder="Ví dụ: HS01, 5A-12..."
                  required
                />
              </div>

              <div className="form-group">
                <label className="field-label" htmlFor="inp-ten-hs">
                  Họ và tên học sinh:
                </label>
                <input
                  id="inp-ten-hs"
                  type="text"
                  className="input-text"
                  value={formStudent.hoVaTen}
                  onChange={(e) => setFormStudent({ ...formStudent, hoVaTen: e.target.value })}
                  placeholder="Ví dụ: Nguyễn Minh An..."
                  required
                />
              </div>

              <div className="form-row-2col">
                <div className="form-group">
                  <label className="field-label" htmlFor="inp-lop-hs">
                    Lớp:
                  </label>
                  <input
                    id="inp-lop-hs"
                    type="text"
                    className="input-text"
                    value={formStudent.lop}
                    onChange={(e) => setFormStudent({ ...formStudent, lop: e.target.value })}
                    placeholder="Lớp 5A1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="field-label" htmlFor="inp-pin-hs">
                    Mã PIN đăng nhập:
                  </label>
                  <input
                    id="inp-pin-hs"
                    type="text"
                    className="input-text"
                    maxLength={6}
                    value={formStudent.maPin}
                    onChange={(e) => setFormStudent({ ...formStudent, maPin: e.target.value })}
                    placeholder="1234"
                    required
                  />
                </div>
              </div>

              <div className="modal-actions-row">
                <button
                  type="button"
                  className="btn-secondary-clean"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary-big"
                  disabled={isLoading}
                >
                  {isLoading ? 'Đang lưu...' : 'Lưu học sinh'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
