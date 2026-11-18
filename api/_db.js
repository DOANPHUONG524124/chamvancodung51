/**
 * Module kết nối dữ liệu: Google Sheets (qua Google Apps Script Web App)
 * Hỗ trợ đầy đủ 7 dạng bài tập làm văn chuẩn chương trình Tiếng Việt lớp 5 mới
 */

// Bộ Rubric mặc định cho 7 dạng văn lớp 5
export const DEFAULT_RUBRICS = {
  'Kể chuyện sáng tạo': {
    dangVan: 'Kể chuyện sáng tạo',
    tongDiemMax: 10,
    tieuChi: [
      { key: 'noiDung', label: 'Cốt truyện & sự việc', desc: 'Viết tiếp câu chuyện, góc nhìn mới, chi tiết hội thoại sáng tạo', max: 3.0 },
      { key: 'boCuc', label: 'Bố cục mạch lạc', desc: 'Diễn biến hợp lý (mở đầu, cao trào, tháo gỡ nút thắt)', max: 2.0 },
      { key: 'dungTu', label: 'Lời kể sinh động', desc: 'Kết hợp đối thoại, độc thoại nội tâm, từ ngữ gợi cảm', max: 2.0 },
      { key: 'chinhTa', label: 'Chính tả & dấu câu', desc: 'Dùng đúng dấu ngoặc kép, gạch đầu dòng thoại, đúng chính tả', max: 1.5 },
      { key: 'sangTao', label: 'Ý nghĩa & cảm xúc', desc: 'Nét kể độc đáo, bất ngờ, gửi gắm bài học ý nghĩa sâu sắc', max: 1.5 }
    ]
  },
  'Văn miêu tả phong cảnh': {
    dangVan: 'Văn miêu tả phong cảnh',
    tongDiemMax: 10,
    tieuChi: [
      { key: 'noiDung', label: 'Đúng yêu cầu đề, đủ ý', desc: 'Tả cảnh thiên nhiên/quê hương/trường học theo trình tự hợp lý (bao quát đến chi tiết)', max: 3.0 },
      { key: 'boCuc', label: 'Bố cục 3 phần', desc: 'Mở bài, thân bài, kết bài mạch lạc, chuyển ý mượt mà', max: 2.0 },
      { key: 'dungTu', label: 'Dùng từ, đặt câu, tu từ', desc: 'Từ gợi cảm, biện pháp so sánh, nhân hóa sinh động', max: 2.0 },
      { key: 'chinhTa', label: 'Chính tả & dấu câu', desc: 'Viết đúng chính tả tiếng Việt, ngắt câu và chấm câu chuẩn', max: 1.5 },
      { key: 'sangTao', label: 'Sáng tạo, cảm xúc', desc: 'Cảm xúc chân thật, góc nhìn hồn nhiên, tình yêu thiên nhiên', max: 1.5 }
    ]
  },
  'Văn tả người': {
    dangVan: 'Văn tả người',
    tongDiemMax: 10,
    tieuChi: [
      { key: 'noiDung', label: 'Đúng yêu cầu, đủ ý', desc: 'Tả người thân, thầy cô, bạn bè kết hợp ngoại hình và tính tình, hoạt động', max: 3.0 },
      { key: 'boCuc', label: 'Bố cục 3 phần', desc: 'Đủ 3 phần Mở bài - Thân bài - Kết bài rõ ràng, tự nhiên', max: 2.0 },
      { key: 'dungTu', label: 'Dùng từ gợi tả, chi tiết', desc: 'Từ ngữ biểu cảm, hình ảnh so sánh độc đáo, giàu hình ảnh', max: 2.0 },
      { key: 'chinhTa', label: 'Chính tả & dấu câu', desc: 'Viết hoa đúng tên riêng, chấm câu và ngắt đoạn chuẩn', max: 1.5 },
      { key: 'sangTao', label: 'Tình cảm chân thành', desc: 'Bộc lộ tình cảm sâu sắc, kỷ niệm ấm áp, xúc động', max: 1.5 }
    ]
  },
  'Viết đoạn văn / bài văn biểu cảm, nêu cảm xúc': {
    dangVan: 'Viết đoạn văn / bài văn biểu cảm, nêu cảm xúc',
    tongDiemMax: 10,
    tieuChi: [
      { key: 'noiDung', label: 'Cảm xúc & suy nghĩ', desc: 'Thể hiện rõ cảm xúc về bài thơ, câu chuyện, sự việc hoặc nhân vật', max: 3.5 },
      { key: 'boCuc', label: 'Bố cục đoạn/bài', desc: 'Mở đầu, phát triển cảm xúc và kết luận ấn tượng, liền mạch', max: 2.0 },
      { key: 'dungTu', label: 'Dùng từ biểu cảm', desc: 'Từ ngữ bộc lộ cảm xúc tinh tế, câu văn giàu nhịp điệu', max: 2.0 },
      { key: 'chinhTa', label: 'Chính tả & dấu câu', desc: 'Viết đúng quy tắc chính tả, dùng dấu câu chuẩn xác', max: 1.5 },
      { key: 'sangTao', label: 'Liên hệ chân thành', desc: 'Có sự liên hệ bản thân tự nhiên, rung cảm chân thực', max: 1.0 }
    ]
  },
  'Viết đoạn văn giới thiệu': {
    dangVan: 'Viết đoạn văn giới thiệu',
    tongDiemMax: 10,
    tieuChi: [
      { key: 'noiDung', label: 'Thông tin giới thiệu', desc: 'Giới thiệu rõ nhân vật trong sách, phim hoạt hình hoặc câu chuyện đã đọc', max: 3.5 },
      { key: 'boCuc', label: 'Cấu trúc đoạn văn', desc: 'Câu mở đoạn, các câu phát triển và câu kết đoạn mạch lạc', max: 2.0 },
      { key: 'dungTu', label: 'Lời văn lưu loát', desc: 'Từ ngữ giới thiệu sinh động, hấp dẫn, lôi cuốn người đọc', max: 2.0 },
      { key: 'chinhTa', label: 'Chính tả & trình bày', desc: 'Trình bày sạch đẹp, đúng chính tả, viết hoa tên riêng chuẩn', max: 1.5 },
      { key: 'sangTao', label: 'Cảm nhận riêng', desc: 'Bày tỏ lý do yêu thích nhân vật độc đáo, thú vị', max: 1.0 }
    ]
  },
  'Viết báo cáo công việc và chương trình hoạt động': {
    dangVan: 'Viết báo cáo công việc và chương trình hoạt động',
    tongDiemMax: 10,
    tieuChi: [
      { key: 'noiDung', label: 'Nội dung kế hoạch/báo cáo', desc: 'Đầy đủ mục đích, thời gian, địa điểm, thành phần, phân công công việc', max: 3.5 },
      { key: 'boCuc', label: 'Thể thức văn bản', desc: 'Đúng mẫu chương trình hoạt động/báo cáo của lớp hoặc Đội thiếu niên', max: 2.5 },
      { key: 'dungTu', label: 'Ngôn ngữ chính xác', desc: 'Diễn đạt ngắn gọn, số liệu rõ ràng, phân công mạch lạc', max: 2.0 },
      { key: 'chinhTa', label: 'Trình bày & dấu câu', desc: 'Trình bày khoa học, rõ ràng các đề mục, chuẩn chính tả', max: 2.0 }
    ]
  },
  'Viết đoạn văn nêu ý kiến': {
    dangVan: 'Viết đoạn văn nêu ý kiến',
    tongDiemMax: 10,
    tieuChi: [
      { key: 'noiDung', label: 'Ý kiến & quan điểm', desc: 'Nêu rõ ý kiến tán thành hoặc phản đối về vấn đề gần gũi với học sinh', max: 3.5 },
      { key: 'boCuc', label: 'Lập luận mạch lạc', desc: 'Nêu ý kiến ➔ Đưa ra 2-3 lý lẽ và dẫn chứng ➔ Khẳng định lại ý kiến', max: 2.0 },
      { key: 'dungTu', label: 'Từ ngữ thuyết phục', desc: 'Đặt câu gãy gọn, có sức thuyết phục, chuyển ý tự nhiên', max: 2.0 },
      { key: 'chinhTa', label: 'Chính tả & dấu câu', desc: 'Viết đúng chính tả, ngắt câu và dùng dấu câu chính xác', max: 1.5 },
      { key: 'sangTao', label: 'Dẫn chứng sinh động', desc: 'Dẫn chứng thực tế từ đời sống học đường, góc nhìn tích cực', max: 1.0 }
    ]
  }
};

// Dữ liệu mẫu ban đầu cho danh sách đề bài theo các dạng mới
let memoryTopics = [
  {
    maDe: 'DE-01',
    tap: 1,
    chuDiem: 'Việt Nam - Quê hương em',
    tenBai: 'Cảnh bình minh trên quê hương',
    dangVan: 'Văn miêu tả phong cảnh',
    yeuCau: 'Em hãy viết bài văn miêu tả cảnh mặt trời mọc vào một buổi sớm mai trên quê hương em (hoặc bãi biển, cánh đồng) theo trình tự từ bao quát đến chi tiết.',
    doDai: '150-250 từ',
    trangThai: 'mo',
    ngayTao: new Date().toISOString()
  },
  {
    maDe: 'DE-02',
    tap: 1,
    chuDiem: 'Mái ấm gia đình',
    tenBai: 'Người bà kính yêu của em',
    dangVan: 'Văn tả người',
    yeuCau: 'Em hãy tả một người thân trong gia đình (ông, bà, bố, mẹ) kết hợp tả ngoại hình với tính tình và hoạt động thường ngày.',
    doDai: '150-250 từ',
    trangThai: 'mo',
    ngayTao: new Date().toISOString()
  },
  {
    maDe: 'DE-03',
    tap: 1,
    chuDiem: 'Thế giới tuổi thơ',
    tenBai: 'Kể tiếp câu chuyện Rùa và Thỏ',
    dangVan: 'Kể chuyện sáng tạo',
    yeuCau: 'Em hãy viết tiếp hoặc kể lại câu chuyện Rùa và Thỏ theo góc nhìn của chú Rùa chăm chỉ, sáng tạo thêm chi tiết đối thoại thú vị.',
    doDai: '15-20 câu',
    trangThai: 'mo',
    ngayTao: new Date().toISOString()
  },
  {
    maDe: 'DE-04',
    tap: 2,
    chuDiem: 'Vẻ đẹp cuộc sống',
    tenBai: 'Cảm xúc về một bài thơ em yêu thích',
    dangVan: 'Viết đoạn văn / bài văn biểu cảm, nêu cảm xúc',
    yeuCau: 'Viết đoạn văn nêu cảm nghĩ và rung động sâu sắc của em sau khi đọc một bài thơ ca ngợi tình cảm thầy trò hoặc quê hương.',
    doDai: '7-10 câu',
    trangThai: 'mo',
    ngayTao: new Date().toISOString()
  },
  {
    maDe: 'DE-05',
    tap: 2,
    chuDiem: 'Bạn của tuổi thơ',
    tenBai: 'Giới thiệu nhân vật Doremon',
    dangVan: 'Viết đoạn văn giới thiệu',
    yeuCau: 'Viết đoạn văn giới thiệu một nhân vật trong sách hoặc phim hoạt hình mà em vô cùng yêu thích (ngoại hình, tính cách, việc làm tốt).',
    doDai: '7-10 câu',
    trangThai: 'mo',
    ngayTao: new Date().toISOString()
  },
  {
    maDe: 'DE-06',
    tap: 2,
    chuDiem: 'Hành động của chúng em',
    tenBai: 'Chương trình Ngày hội đọc sách của lớp',
    dangVan: 'Viết báo cáo công việc và chương trình hoạt động',
    yeuCau: 'Lập chương trình hoạt động cho "Ngày hội đọc sách" của lớp em (mục đích, thời gian, địa điểm, phân công chuẩn bị và tiến trình).',
    doDai: '1 trang vở',
    trangThai: 'mo',
    ngayTao: new Date().toISOString()
  },
  {
    maDe: 'DE-07',
    tap: 2,
    chuDiem: 'Vấn đề học đường',
    tenBai: 'Ý kiến về việc sử dụng điện thoại thông minh',
    dangVan: 'Viết đoạn văn nêu ý kiến',
    yeuCau: 'Viết đoạn văn nêu ý kiến của em về việc học sinh tiểu học sử dụng điện thoại thông minh để học tập và giải trí.',
    doDai: '8-12 câu',
    trangThai: 'mo',
    ngayTao: new Date().toISOString()
  }
];

let memoryRubrics = JSON.parse(JSON.stringify(DEFAULT_RUBRICS));
let memorySubmissions = [];

/**
 * Gọi Google Apps Script Web App nếu có cài đặt APPS_SCRIPT_URL
 */
async function callAppsScript(action, payload = {}) {
  const url = process.env.APPS_SCRIPT_URL;
  const secret = process.env.SHEETS_SECRET || 'cu_nhi_cham_van_secret_2026';

  if (!url) {
    return null; // Không có URL, chuyển sang dùng memory store
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        secret,
        ...payload
      })
    });

    if (!response.ok) {
      console.warn(`Apps Script HTTP Error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Lỗi khi gọi Google Apps Script Web App:', err);
    return null;
  }
}

// ===== API ĐỀ BÀI =====

export async function getTopics() {
  const remote = await callAppsScript('list_topics');
  if (remote && remote.success && Array.isArray(remote.topics) && remote.topics.length > 0) {
    return remote.topics;
  }
  return memoryTopics;
}

export async function saveTopic(topicData) {
  const remote = await callAppsScript('save_topic', { topic: topicData });
  if (remote && remote.success) {
    return remote;
  }

  const maDe = topicData.maDe || `DE-${Date.now()}`;
  const idx = memoryTopics.findIndex(t => t.maDe === maDe);
  const updated = {
    ...topicData,
    maDe,
    ngayTao: topicData.ngayTao || new Date().toISOString()
  };

  if (idx >= 0) {
    memoryTopics[idx] = updated;
  } else {
    memoryTopics.unshift(updated);
  }

  return { success: true, maDe, message: 'Đã lưu đề bài thành công.' };
}

export async function deleteTopic(maDe) {
  const remote = await callAppsScript('delete_topic', { maDe });
  if (remote && remote.success) {
    return remote;
  }

  memoryTopics = memoryTopics.filter(t => t.maDe !== maDe);
  return { success: true, message: 'Đã xóa đề bài thành công.' };
}

// ===== API RUBRIC =====

export async function getRubrics() {
  const remote = await callAppsScript('get_rubrics');
  if (remote && remote.success && remote.rubrics && Object.keys(remote.rubrics).length > 0) {
    return { ...DEFAULT_RUBRICS, ...remote.rubrics };
  }
  return memoryRubrics;
}

export async function saveRubric(rubricData) {
  const remote = await callAppsScript('save_rubric', { rubric: rubricData });
  if (remote && remote.success) {
    return remote;
  }

  if (rubricData && rubricData.dangVan) {
    memoryRubrics[rubricData.dangVan] = {
      ...rubricData,
      ngayCapNhat: new Date().toISOString()
    };
  }
  return { success: true, message: 'Đã lưu rubric thành công.' };
}

// ===== API BÀI NỘP =====

export async function saveSubmission(submissionData) {
  const remote = await callAppsScript('submit_essay', { submission: submissionData });
  if (remote && remote.success) {
    return remote;
  }

  const maBai = submissionData.maBai || `BN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const item = {
    ...submissionData,
    maBai,
    thoiGian: submissionData.thoiGian || new Date().toISOString(),
    trangThai: submissionData.trangThai || 'cho_duyet'
  };

  memorySubmissions.unshift(item);
  return { success: true, maBai, message: 'Đã lưu bài nộp.' };
}

export async function getSubmissions(filter = {}) {
  const remote = await callAppsScript('list_submissions', filter);
  if (remote && remote.success && Array.isArray(remote.submissions)) {
    return remote.submissions;
  }

  return memorySubmissions.filter(sub => {
    if (filter.filterMaDe && sub.maDe !== filter.filterMaDe) return false;
    if (filter.filterMaHS && !sub.maHocSinh.toLowerCase().includes(filter.filterMaHS.toLowerCase())) return false;
    if (filter.filterTrangThai && filter.filterTrangThai !== 'tat_ca' && sub.trangThai !== filter.filterTrangThai) return false;
    return true;
  });
}

export async function updateSubmission(updateData) {
  const remote = await callAppsScript('update_submission', updateData);
  if (remote && remote.success) {
    return remote;
  }

  const targetMaBai = updateData.maBai;
  const idx = memorySubmissions.findIndex(s => s.maBai === targetMaBai);
  if (idx >= 0) {
    if (updateData.diemGiaoVienChinh) {
      memorySubmissions[idx].diemGiaoVienChinh = updateData.diemGiaoVienChinh;
    }
    if (typeof updateData.nhanXetGiaoVien === 'string') {
      memorySubmissions[idx].nhanXetGiaoVien = updateData.nhanXetGiaoVien;
    }
    if (updateData.trangThai) {
      memorySubmissions[idx].trangThai = updateData.trangThai;
    }
    return { success: true, message: 'Cập nhật bài nộp thành công.' };
  }
  return { success: false, error: 'Không tìm thấy bài nộp để cập nhật.' };
}

export async function getStudentSubmissions(maHocSinh) {
  const remote = await callAppsScript('get_student_submission', { maHocSinh });
  if (remote && remote.success && Array.isArray(remote.submissions)) {
    return remote.submissions;
  }

  const cleanHS = String(maHocSinh || '').trim().toLowerCase();
  return memorySubmissions
    .filter(s => String(s.maHocSinh || '').trim().toLowerCase() === cleanHS)
    .map(s => {
      const isApproved = s.trangThai === 'da_duyet';
      const item = {
        maBai: s.maBai,
        thoiGian: s.thoiGian,
        maHocSinh: s.maHocSinh,
        maDe: s.maDe,
        trangThai: s.trangThai,
        anhTrangVo: s.anhTrangVo || null
      };

      if (isApproved) {
        item.khen = s.khen;
        item.goiY = s.goiY || [];
        item.loiChinhTa = s.loiChinhTa || [];
        item.nhanXetGiaoVien = s.nhanXetGiaoVien || '';
        
        const gvScores = s.diemGiaoVienChinh && Object.keys(s.diemGiaoVienChinh).length > 0
          ? s.diemGiaoVienChinh
          : s.diemTieuChi || {};
        
        const tong = Object.keys(gvScores).reduce((acc, k) => acc + (Number(gvScores[k]) || 0), 0);
        item.sao = Math.max(1, Math.min(5, Math.round(tong / 2)));
      }
      return item;
    });
}

// ===== API HỌC SINH & LỚP HỌC =====

let memoryStudents = [
  { maHocSinh: 'HS01', hoVaTen: 'Nguyễn Minh An', lop: 'Lớp 5A1', maPin: '1234', ngayTao: new Date().toISOString() },
  { maHocSinh: 'HS02', hoVaTen: 'Trần Bảo Châu', lop: 'Lớp 5A1', maPin: '2015', ngayTao: new Date().toISOString() },
  { maHocSinh: 'HS03', hoVaTen: 'Lê Hoàng Dũng', lop: 'Lớp 5A1', maPin: '1111', ngayTao: new Date().toISOString() },
  { maHocSinh: 'HS04', hoVaTen: 'Phạm Hương Giang', lop: 'Lớp 5A1', maPin: '2222', ngayTao: new Date().toISOString() },
  { maHocSinh: 'HS05', hoVaTen: 'Vũ Đức Nam', lop: 'Lớp 5A1', maPin: '3333', ngayTao: new Date().toISOString() },
  { maHocSinh: 'HS06', hoVaTen: 'Đỗ Thùy Linh', lop: 'Lớp 5A2', maPin: '1234', ngayTao: new Date().toISOString() },
  { maHocSinh: 'HS07', hoVaTen: 'Bùi Tuấn Kiệt', lop: 'Lớp 5A2', maPin: '2015', ngayTao: new Date().toISOString() },
  { maHocSinh: 'HS08', hoVaTen: 'Hoàng Mai Phương', lop: 'Lớp 5A2', maPin: '8888', ngayTao: new Date().toISOString() }
];

export async function getStudents(filter = {}, isTeacher = false) {
  const remote = await callAppsScript('list_students', filter);
  let list = (remote && remote.success && Array.isArray(remote.students))
    ? remote.students
    : memoryStudents;

  if (filter.lop && filter.lop !== 'tat_ca') {
    list = list.filter(s => s.lop === filter.lop);
  }

  // Lấy danh sách các lớp duy nhất
  const classes = Array.from(new Set(memoryStudents.map(s => s.lop || 'Lớp 5A1'))).sort();

  if (isTeacher) {
    return { success: true, students: list, classes };
  }

  // Đối với học sinh: Ẩn mã PIN vì lý do bảo mật
  const publicStudents = list.map(s => ({
    maHocSinh: s.maHocSinh,
    hoVaTen: s.hoVaTen,
    lop: s.lop
  }));

  return { success: true, students: publicStudents, classes };
}

export async function verifyStudentLogin({ lop, maHocSinh, maPin }) {
  const cleanLop = String(lop || '').trim();
  const cleanHS = String(maHocSinh || '').trim().toLowerCase();
  const cleanPin = String(maPin || '').trim();

  const remote = await callAppsScript('verify_student_login', { lop: cleanLop, maHocSinh: cleanHS, maPin: cleanPin });
  if (remote && remote.success && remote.student) {
    return remote;
  }

  const found = memoryStudents.find(s => 
    s.lop === cleanLop && 
    (s.maHocSinh.toLowerCase() === cleanHS || s.hoVaTen.toLowerCase() === cleanHS)
  );

  if (!found) {
    return { success: false, error: 'Không tìm thấy học sinh này trong lớp đã chọn.' };
  }

  if (String(found.maPin).trim() !== cleanPin) {
    return { success: false, error: 'Mã PIN chưa chính xác (Em kiểm tra lại với Cô giáo nhé).' };
  }

  return {
    success: true,
    student: {
      maHocSinh: found.maHocSinh,
      hoVaTen: found.hoVaTen,
      lop: found.lop
    }
  };
}

export async function importStudents(studentsList = []) {
  const remote = await callAppsScript('import_students', { students: studentsList });
  if (remote && remote.success) {
    return remote;
  }

  let count = 0;
  for (const s of studentsList) {
    if (!s.maHocSinh || !s.hoVaTen) continue;
    const idx = memoryStudents.findIndex(item => item.maHocSinh.toLowerCase() === s.maHocSinh.toLowerCase());
    const studentItem = {
      maHocSinh: String(s.maHocSinh).trim(),
      hoVaTen: String(s.hoVaTen).trim(),
      lop: String(s.lop || 'Lớp 5A1').trim(),
      maPin: String(s.maPin || '1234').trim(),
      ngayTao: s.ngayTao || new Date().toISOString()
    };

    if (idx >= 0) {
      memoryStudents[idx] = studentItem;
    } else {
      memoryStudents.push(studentItem);
    }
    count++;
  }

  return { success: true, count, message: `Đã nhập thành công ${count} học sinh vào danh sách lớp.` };
}

export async function deleteStudent(maHocSinh) {
  const cleanHS = String(maHocSinh || '').trim().toLowerCase();
  const remote = await callAppsScript('delete_student', { maHocSinh: cleanHS });
  if (remote && remote.success) {
    return remote;
  }

  memoryStudents = memoryStudents.filter(s => s.maHocSinh.toLowerCase() !== cleanHS);
  return { success: true, message: 'Đã xóa học sinh khỏi danh sách.' };
}
