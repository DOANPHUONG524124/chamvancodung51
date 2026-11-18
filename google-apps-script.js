/**
 * =========================================================================
 * GOOGLE APPS SCRIPT WEB APP - HỆ THỐNG CHẤM VĂN LỚP 5 (GIAI ĐOẠN 2)
 * =========================================================================
 * Mã nguồn này dán vào Google Apps Script gắn với một Google Spreadsheet.
 * Quản lý 3 Sheet: "De", "Rubric", "BaiNop".
 * 
 * BẢO MẬT: Chỉ chấp nhận request có bí mật secret khớp với SHEETS_SECRET.
 * =========================================================================
 */

// Đổi khóa bí mật này hoặc cài đặt trong Script Properties (File -> Project Settings)
var DEFAULT_SECRET = "cu_nhi_cham_van_secret_2026";

function getSecret() {
  var prop = PropertiesService.getScriptProperties().getProperty("SHEETS_SECRET");
  return prop || DEFAULT_SECRET;
}

/**
 * Khởi tạo 3 sheet với các tiêu đề chuẩn nếu chưa có
 */
function setupSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Sheet "De"
  var sheetDe = ss.getSheetByName("De");
  if (!sheetDe) {
    sheetDe = ss.insertSheet("De");
    sheetDe.appendRow([
      "maDe", "tap", "chuDiem", "tenBai", "dangVan", "yeuCau", "doDai", "trangThai", "ngayTao"
    ]);
    sheetDe.getRange(1, 1, 1, 9).setFontWeight("bold").setBackground("#c7e3fa");
    
    // Thêm đề bài mẫu mặc định
    sheetDe.appendRow([
      "DE-01", 1, "Việt Nam - Quê hương em", "Cảnh bình minh tươi đẹp", "Tả phong cảnh",
      "Em hãy viết bài văn miêu tả cảnh mặt trời mọc vào một buổi sớm mai trên quê hương em (hoặc trên bãi biển, cánh đồng).",
      "150-250 từ", "mo", new Date().toISOString()
    ]);
    sheetDe.appendRow([
      "DE-02", 1, "Mái ấm gia đình", "Người bà kính yêu", "Tả người",
      "Em hãy tả một người thân trong gia đình mà em luôn yêu quý và kính trọng.",
      "150-250 từ", "mo", new Date().toISOString()
    ]);
  }

  // 2. Sheet "Rubric"
  var sheetRubric = ss.getSheetByName("Rubric");
  if (!sheetRubric) {
    sheetRubric = ss.insertSheet("Rubric");
    sheetRubric.appendRow(["dangVan", "tieuChiJson", "tongDiemMax", "ngayCapNhat"]);
    sheetRubric.getRange(1, 1, 1, 4).setFontWeight("bold").setBackground("#bbf0d0");

    // Khởi tạo 7 bộ Rubric chuẩn theo chương trình Tiếng Việt lớp 5
    var defaultRubrics = [
      {
        dangVan: "Kể chuyện sáng tạo",
        tongDiemMax: 10,
        tieuChi: [
          { key: "noiDung", label: "Cốt truyện & sự việc", desc: "Viết tiếp câu chuyện, góc nhìn mới, chi tiết hội thoại sáng tạo", max: 3.0 },
          { key: "boCuc", label: "Bố cục mạch lạc", desc: "Diễn biến hợp lý (mở đầu, cao trào, tháo gỡ nút thắt)", max: 2.0 },
          { key: "dungTu", label: "Lời kể sinh động", desc: "Kết hợp đối thoại, độc thoại nội tâm, từ ngữ gợi cảm", max: 2.0 },
          { key: "chinhTa", label: "Chính tả & dấu câu", desc: "Dùng đúng dấu ngoặc kép, gạch đầu dòng thoại, đúng chính tả", max: 1.5 },
          { key: "sangTao", label: "Ý nghĩa & cảm xúc", desc: "Nét kể độc đáo, bất ngờ, gửi gắm bài học ý nghĩa sâu sắc", max: 1.5 }
        ]
      },
      {
        dangVan: "Văn miêu tả phong cảnh",
        tongDiemMax: 10,
        tieuChi: [
          { key: "noiDung", label: "Đúng yêu cầu đề, đủ ý", desc: "Tả cảnh thiên nhiên/quê hương theo trình tự hợp lý (bao quát đến chi tiết)", max: 3.0 },
          { key: "boCuc", label: "Bố cục 3 phần", desc: "Mở bài, thân bài, kết bài mạch lạc, chuyển ý mượt mà", max: 2.0 },
          { key: "dungTu", label: "Dùng từ, đặt câu, tu từ", desc: "Từ gợi cảm, biện pháp so sánh, nhân hóa sinh động", max: 2.0 },
          { key: "chinhTa", label: "Chính tả & dấu câu", desc: "Viết đúng chính tả tiếng Việt, ngắt câu và chấm câu chuẩn", max: 1.5 },
          { key: "sangTao", label: "Sáng tạo, cảm xúc", desc: "Cảm xúc chân thật, góc nhìn hồn nhiên, tình yêu thiên nhiên", max: 1.5 }
        ]
      },
      {
        dangVan: "Văn tả người",
        tongDiemMax: 10,
        tieuChi: [
          { key: "noiDung", label: "Đúng yêu cầu, đủ ý", desc: "Tả người thân, thầy cô kết hợp ngoại hình với tính tình, hoạt động", max: 3.0 },
          { key: "boCuc", label: "Bố cục 3 phần", desc: "Đủ 3 phần Mở bài - Thân bài - Kết bài rõ ràng, tự nhiên", max: 2.0 },
          { key: "dungTu", label: "Dùng từ gợi tả, chi tiết", desc: "Từ ngữ biểu cảm, hình ảnh so sánh độc đáo, giàu hình ảnh", max: 2.0 },
          { key: "chinhTa", label: "Chính tả & dấu câu", desc: "Viết hoa đúng tên riêng, chấm câu và ngắt đoạn chuẩn", max: 1.5 },
          { key: "sangTao", label: "Tình cảm chân thành", desc: "Bộc lộ tình cảm sâu sắc, kỷ niệm ấm áp, xúc động", max: 1.5 }
        ]
      },
      {
        dangVan: "Viết đoạn văn / bài văn biểu cảm, nêu cảm xúc",
        tongDiemMax: 10,
        tieuChi: [
          { key: "noiDung", label: "Cảm xúc & suy nghĩ", desc: "Thể hiện rõ cảm xúc về bài thơ, câu chuyện, sự việc hoặc nhân vật", max: 3.5 },
          { key: "boCuc", label: "Bố cục đoạn/bài", desc: "Mở đầu, phát triển cảm xúc và kết luận ấn tượng, liền mạch", max: 2.0 },
          { key: "dungTu", label: "Dùng từ biểu cảm", desc: "Từ ngữ bộc lộ cảm xúc tinh tế, câu văn giàu nhịp điệu", max: 2.0 },
          { key: "chinhTa", label: "Chính tả & dấu câu", desc: "Viết đúng quy tắc chính tả, dùng dấu câu chuẩn xác", max: 1.5 },
          { key: "sangTao", label: "Liên hệ chân thành", desc: "Có sự liên hệ bản thân tự nhiên, rung cảm chân thực", max: 1.0 }
        ]
      },
      {
        dangVan: "Viết đoạn văn giới thiệu",
        tongDiemMax: 10,
        tieuChi: [
          { key: "noiDung", label: "Thông tin giới thiệu", desc: "Giới thiệu rõ nhân vật trong sách, phim hoạt hình hoặc câu chuyện đã đọc", max: 3.5 },
          { key: "boCuc", label: "Cấu trúc đoạn văn", desc: "Câu mở đoạn, các câu phát triển và câu kết đoạn mạch lạc", max: 2.0 },
          { key: "dungTu", label: "Lời văn lưu loát", desc: "Từ ngữ giới thiệu sinh động, hấp dẫn, lôi cuốn người đọc", max: 2.0 },
          { key: "chinhTa", label: "Chính tả & trình bày", desc: "Trình bày sạch đẹp, đúng chính tả, viết hoa tên riêng chuẩn", max: 1.5 },
          { key: "sangTao", label: "Cảm nhận riêng", desc: "Bày tỏ lý do yêu thích nhân vật độc đáo, thú vị", max: 1.0 }
        ]
      },
      {
        dangVan: "Viết báo cáo công việc và chương trình hoạt động",
        tongDiemMax: 10,
        tieuChi: [
          { key: "noiDung", label: "Nội dung kế hoạch/báo cáo", desc: "Đầy đủ mục đích, thời gian, địa điểm, thành phần, phân công công việc", max: 3.5 },
          { key: "boCuc", label: "Thể thức văn bản", desc: "Đúng mẫu chương trình hoạt động/báo cáo của lớp hoặc Đội thiếu niên", max: 2.5 },
          { key: "dungTu", label: "Ngôn ngữ chính xác", desc: "Diễn đạt ngắn gọn, số liệu rõ ràng, phân công mạch lạc", max: 2.0 },
          { key: "chinhTa", label: "Trình bày & dấu câu", desc: "Trình bày khoa học, rõ ràng các đề mục, chuẩn chính tả", max: 2.0 }
        ]
      },
      {
        dangVan: "Viết đoạn văn nêu ý kiến",
        tongDiemMax: 10,
        tieuChi: [
          { key: "noiDung", label: "Ý kiến & quan điểm", desc: "Nêu rõ ý kiến tán thành hoặc phản đối về vấn đề gần gũi với học sinh", max: 3.5 },
          { key: "boCuc", label: "Lập luận mạch lạc", desc: "Nêu ý kiến ➔ Đưa ra 2-3 lý lẽ và dẫn chứng ➔ Khẳng định lại ý kiến", max: 2.0 },
          { key: "dungTu", label: "Từ ngữ thuyết phục", desc: "Đặt câu gãy gọn, có sức thuyết phục, chuyển ý tự nhiên", max: 2.0 },
          { key: "chinhTa", label: "Chính tả & dấu câu", desc: "Viết đúng chính tả, ngắt câu và dùng dấu câu chính xác", max: 1.5 },
          { key: "sangTao", label: "Dẫn chứng sinh động", desc: "Dẫn chứng thực tế từ đời sống học đường, góc nhìn tích cực", max: 1.0 }
        ]
      }
    ];

    for (var i = 0; i < defaultRubrics.length; i++) {
      var r = defaultRubrics[i];
      sheetRubric.appendRow([
        r.dangVan, JSON.stringify(r.tieuChi), r.tongDiemMax, new Date().toISOString()
      ]);
    }
  }

  // 3. Sheet "BaiNop"
  var sheetBai = ss.getSheetByName("BaiNop");
  if (!sheetBai) {
    sheetBai = ss.insertSheet("BaiNop");
    sheetBai.appendRow([
      "maBai", "thoiGian", "maHocSinh", "maDe", "baiLam",
      "diemTieuChiJson", "tongDiemAI", "khen", "goiYJson", "loiChinhTaJson",
      "diemGiaoVienChinhJson", "nhanXetGiaoVien", "trangThai"
    ]);
    sheetBai.getRange(1, 1, 1, 13).setFontWeight("bold").setBackground("#fde89c");
  }

  // 4. Sheet "HocSinh"
  var sheetHS = ss.getSheetByName("HocSinh");
  if (!sheetHS) {
    sheetHS = ss.insertSheet("HocSinh");
    sheetHS.appendRow(["maHocSinh", "hoVaTen", "lop", "maPin", "ngayTao"]);
    sheetHS.getRange(1, 1, 1, 5).setFontWeight("bold").setBackground("#ffd8a8");

    // Khởi tạo một số học sinh mẫu
    var sampleStudents = [
      ["HS01", "Nguyễn Minh An", "Lớp 5A1", "1234", new Date().toISOString()],
      ["HS02", "Trần Bảo Châu", "Lớp 5A1", "2015", new Date().toISOString()],
      ["HS03", "Lê Hoàng Dũng", "Lớp 5A1", "1111", new Date().toISOString()],
      ["HS04", "Phạm Hương Giang", "Lớp 5A1", "2222", new Date().toISOString()],
      ["HS05", "Vũ Đức Nam", "Lớp 5A1", "3333", new Date().toISOString()]
    ];
    for (var i = 0; i < sampleStudents.length; i++) {
      sheetHS.appendRow(sampleStudents[i]);
    }
  }
}

/**
 * Xử lý POST request từ Vercel Backend
 */
function doPost(e) {
  try {
    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    // 1. Kiểm tra khóa bí mật SHEETS_SECRET
    var clientSecret = data.secret || (e.parameter && e.parameter.secret);
    if (clientSecret !== getSecret()) {
      return jsonResponse({ success: false, error: "Bí mật SHEETS_SECRET không hợp lệ." }, 403);
    }

    var action = data.action || "";
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    switch (action) {
      // ===== ĐỀ BÀI =====
      case "list_topics": {
        var sheet = ss.getSheetByName("De");
        if (!sheet) { setupSheets(); sheet = ss.getSheetByName("De"); }
        var rows = sheet.getDataRange().getValues();
        var topics = [];
        for (var i = 1; i < rows.length; i++) {
          var r = rows[i];
          if (r[0]) {
            topics.push({
              maDe: String(r[0]),
              tap: Number(r[1]) || 1,
              chuDiem: String(r[2] || ""),
              tenBai: String(r[3] || ""),
              dangVan: String(r[4] || ""),
              yeuCau: String(r[5] || ""),
              doDai: String(r[6] || ""),
              trangThai: String(r[7] || "mo"),
              ngayTao: String(r[8] || "")
            });
          }
        }
        return jsonResponse({ success: true, topics: topics });
      }

      case "save_topic": {
        var sheet = ss.getSheetByName("De");
        if (!sheet) { setupSheets(); sheet = ss.getSheetByName("De"); }
        var t = data.topic;
        if (!t || !t.tenBai) return jsonResponse({ success: false, error: "Thiếu dữ liệu đề bài." }, 400);

        var maDe = t.maDe || ("DE-" + Utilities.formatDate(new Date(), "GMT+7", "yyyyMMdd-HHmmss"));
        var rows = sheet.getDataRange().getValues();
        var foundRow = -1;
        for (var i = 1; i < rows.length; i++) {
          if (String(rows[i][0]) === String(maDe)) { foundRow = i + 1; break; }
        }

        var rowData = [
          maDe, Number(t.tap) || 1, t.chuDiem || "", t.tenBai, t.dangVan || "Tả phong cảnh",
          t.yeuCau || "", t.doDai || "150-250 từ", t.trangThai || "mo", t.ngayTao || new Date().toISOString()
        ];

        if (foundRow > 0) {
          sheet.getRange(foundRow, 1, 1, 9).setValues([rowData]);
        } else {
          sheet.appendRow(rowData);
        }
        return jsonResponse({ success: true, maDe: maDe, message: "Lưu đề bài thành công!" });
      }

      case "delete_topic": {
        var sheet = ss.getSheetByName("De");
        if (!sheet) return jsonResponse({ success: false, error: "Chưa có sheet De." }, 404);
        var targetMaDe = String(data.maDe || "");
        var rows = sheet.getDataRange().getValues();
        for (var i = 1; i < rows.length; i++) {
          if (String(rows[i][0]) === targetMaDe) {
            sheet.deleteRow(i + 1);
            return jsonResponse({ success: true, message: "Đã xóa đề thành công." });
          }
        }
        return jsonResponse({ success: false, error: "Không tìm thấy đề để xóa." }, 404);
      }

      // ===== RUBRIC =====
      case "get_rubrics": {
        var sheet = ss.getSheetByName("Rubric");
        if (!sheet) { setupSheets(); sheet = ss.getSheetByName("Rubric"); }
        var rows = sheet.getDataRange().getValues();
        var rubrics = {};
        for (var i = 1; i < rows.length; i++) {
          var dangVan = String(rows[i][0] || "");
          if (dangVan) {
            var tieuChi = [];
            try { tieuChi = JSON.parse(rows[i][1]); } catch(e){}
            rubrics[dangVan] = {
              dangVan: dangVan,
              tieuChi: tieuChi,
              tongDiemMax: Number(rows[i][2]) || 10,
              ngayCapNhat: String(rows[i][3] || "")
            };
          }
        }
        return jsonResponse({ success: true, rubrics: rubrics });
      }

      case "save_rubric": {
        var sheet = ss.getSheetByName("Rubric");
        if (!sheet) { setupSheets(); sheet = ss.getSheetByName("Rubric"); }
        var rub = data.rubric;
        if (!rub || !rub.dangVan || !Array.isArray(rub.tieuChi)) {
          return jsonResponse({ success: false, error: "Dữ liệu rubric không hợp lệ." }, 400);
        }
        var rows = sheet.getDataRange().getValues();
        var foundRow = -1;
        for (var i = 1; i < rows.length; i++) {
          if (String(rows[i][0]).toLowerCase() === String(rub.dangVan).toLowerCase()) {
            foundRow = i + 1; break;
          }
        }
        var rowData = [
          rub.dangVan, JSON.stringify(rub.tieuChi), Number(rub.tongDiemMax) || 10, new Date().toISOString()
        ];
        if (foundRow > 0) {
          sheet.getRange(foundRow, 1, 1, 4).setValues([rowData]);
        } else {
          sheet.appendRow(rowData);
        }
        return jsonResponse({ success: true, message: "Lưu rubric thành công!" });
      }

      // ===== BÀI NỘP =====
      case "submit_essay": {
        var sheet = ss.getSheetByName("BaiNop");
        if (!sheet) { setupSheets(); sheet = ss.getSheetByName("BaiNop"); }
        var sub = data.submission;
        if (!sub || !sub.baiLam) return jsonResponse({ success: false, error: "Thiếu bài làm." }, 400);

        var maBai = sub.maBai || ("BN-" + Utilities.formatDate(new Date(), "GMT+7", "yyyyMMdd-HHmmss") + "-" + Math.floor(Math.random()*1000));
        var rowData = [
          maBai,
          sub.thoiGian || new Date().toISOString(),
          String(sub.maHocSinh || "HS-ANON"),
          String(sub.maDe || ""),
          String(sub.baiLam || ""),
          JSON.stringify(sub.diemTieuChi || {}),
          Number(sub.tongDiemAI) || 0,
          String(sub.khen || ""),
          JSON.stringify(sub.goiY || []),
          JSON.stringify(sub.loiChinhTa || []),
          JSON.stringify(sub.diemGiaoVienChinh || {}),
          String(sub.nhanXetGiaoVien || ""),
          String(sub.trangThai || "cho_duyet")
        ];
        sheet.appendRow(rowData);
        return jsonResponse({ success: true, maBai: maBai, message: "Lưu bài nộp thành công!" });
      }

      case "list_submissions": {
        var sheet = ss.getSheetByName("BaiNop");
        if (!sheet) { setupSheets(); sheet = ss.getSheetByName("BaiNop"); }
        var rows = sheet.getDataRange().getValues();
        var filterDe = data.filterMaDe ? String(data.filterMaDe) : "";
        var filterHS = data.filterMaHS ? String(data.filterMaHS).toLowerCase() : "";
        var filterTrangThai = data.filterTrangThai ? String(data.filterTrangThai) : "";

        var list = [];
        for (var i = 1; i < rows.length; i++) {
          var r = rows[i];
          if (!r[0]) continue;
          var maBai = String(r[0]);
          var maHocSinh = String(r[2] || "");
          var maDe = String(r[3] || "");
          var trangThai = String(r[12] || "cho_duyet");

          if (filterDe && maDe !== filterDe) continue;
          if (filterHS && maHocSinh.toLowerCase().indexOf(filterHS) === -1) continue;
          if (filterTrangThai && filterTrangThai !== "tat_ca" && trangThai !== filterTrangThai) continue;

          var diemTieuChi = {}; try { diemTieuChi = JSON.parse(r[5]); } catch(e){}
          var goiY = []; try { goiY = JSON.parse(r[8]); } catch(e){}
          var loiChinhTa = []; try { loiChinhTa = JSON.parse(r[9]); } catch(e){}
          var diemGiaoVienChinh = {}; try { diemGiaoVienChinh = JSON.parse(r[10]); } catch(e){}

          list.push({
            maBai: maBai,
            thoiGian: String(r[1] || ""),
            maHocSinh: maHocSinh,
            maDe: maDe,
            baiLam: String(r[4] || ""),
            diemTieuChi: diemTieuChi,
            tongDiemAI: Number(r[6]) || 0,
            khen: String(r[7] || ""),
            goiY: goiY,
            loiChinhTa: loiChinhTa,
            diemGiaoVienChinh: diemGiaoVienChinh,
            nhanXetGiaoVien: String(r[11] || ""),
            trangThai: trangThai
          });
        }
        return jsonResponse({ success: true, submissions: list });
      }

      case "update_submission": {
        var sheet = ss.getSheetByName("BaiNop");
        if (!sheet) return jsonResponse({ success: false, error: "Chưa có sheet BaiNop." }, 404);
        var targetMaBai = String(data.maBai || "");
        var rows = sheet.getDataRange().getValues();
        for (var i = 1; i < rows.length; i++) {
          if (String(rows[i][0]) === targetMaBai) {
            var rowIdx = i + 1;
            if (data.diemGiaoVienChinh) {
              sheet.getRange(rowIdx, 11).setValue(JSON.stringify(data.diemGiaoVienChinh));
            }
            if (typeof data.nhanXetGiaoVien === "string") {
              sheet.getRange(rowIdx, 12).setValue(data.nhanXetGiaoVien);
            }
            if (data.trangThai) {
              sheet.getRange(rowIdx, 13).setValue(data.trangThai);
            }
            return jsonResponse({ success: true, message: "Cập nhật bài nộp thành công!" });
          }
        }
        return jsonResponse({ success: false, error: "Không tìm thấy bài nộp có mã " + targetMaBai }, 404);
      }

      case "get_student_submission": {
        var sheet = ss.getSheetByName("BaiNop");
        if (!sheet) return jsonResponse({ success: true, submissions: [] });
        var rows = sheet.getDataRange().getValues();
        var targetHS = String(data.maHocSinh || "").trim().toLowerCase();
        var results = [];
        for (var i = 1; i < rows.length; i++) {
          var r = rows[i];
          if (String(r[2] || "").trim().toLowerCase() === targetHS) {
            var trangThai = String(r[12] || "cho_duyet");
            var item = {
              maBai: String(r[0]),
              thoiGian: String(r[1] || ""),
              maHocSinh: String(r[2]),
              maDe: String(r[3]),
              trangThai: trangThai
            };
            // CHỈ TRẢ VỀ LỜI KHEN, GỢI Ý, SAO NẾU ĐÃ DUYỆT!
            if (trangThai === "da_duyet") {
              item.khen = String(r[7] || "");
              try { item.goiY = JSON.parse(r[8]); } catch(e){ item.goiY = []; }
              try { item.loiChinhTa = JSON.parse(r[9]); } catch(e){ item.loiChinhTa = []; }
              item.nhanXetGiaoVien = String(r[11] || "");
              
              // Tính số sao từ điểm giáo viên chỉnh hoặc điểm AI
              var diemGV = {}; try { diemGV = JSON.parse(r[10]); } catch(e){}
              var tongDiem = Number(r[6]) || 0;
              var keys = Object.keys(diemGV);
              if (keys.length > 0) {
                tongDiem = keys.reduce(function(acc, k){ return acc + (Number(diemGV[k]) || 0); }, 0);
              }
              item.sao = Math.max(1, Math.min(5, Math.round(tongDiem / 2)));
            }
            results.push(item);
          }
        }
        return jsonResponse({ success: true, submissions: results });
      }

      // ===== HỌC SINH & LỚP HỌC =====
      case "list_students": {
        var sheet = ss.getSheetByName("HocSinh");
        if (!sheet) { setupSheets(); sheet = ss.getSheetByName("HocSinh"); }
        var rows = sheet.getDataRange().getValues();
        var students = [];
        var filterLop = String(data.lop || "").trim();

        for (var i = 1; i < rows.length; i++) {
          var r = rows[i];
          if (r[0]) {
            var itemLop = String(r[2] || "Lớp 5A1");
            if (!filterLop || filterLop === "tat_ca" || itemLop === filterLop) {
              students.push({
                maHocSinh: String(r[0]),
                hoVaTen: String(r[1] || ""),
                lop: itemLop,
                maPin: String(r[3] || "1234"),
                ngayTao: String(r[4] || "")
              });
            }
          }
        }
        return jsonResponse({ success: true, students: students });
      }

      case "import_students": {
        var sheet = ss.getSheetByName("HocSinh");
        if (!sheet) { setupSheets(); sheet = ss.getSheetByName("HocSinh"); }
        var studentsList = data.students || [];
        var rows = sheet.getDataRange().getValues();
        var count = 0;

        for (var i = 0; i < studentsList.length; i++) {
          var s = studentsList[i];
          if (!s.maHocSinh || !s.hoVaTen) continue;

          var maHS = String(s.maHocSinh).trim();
          var foundRow = -1;
          for (var j = 1; j < rows.length; j++) {
            if (String(rows[j][0]).trim().toLowerCase() === maHS.toLowerCase()) {
              foundRow = j + 1;
              break;
            }
          }

          var rowData = [
            maHS,
            String(s.hoVaTen).trim(),
            String(s.lop || "Lớp 5A1").trim(),
            String(s.maPin || "1234").trim(),
            s.ngayTao || new Date().toISOString()
          ];

          if (foundRow > 0) {
            sheet.getRange(foundRow, 1, 1, 5).setValues([rowData]);
          } else {
            sheet.appendRow(rowData);
          }
          count++;
        }
        return jsonResponse({ success: true, count: count, message: "Đã lưu " + count + " học sinh vào bảng tính." });
      }

      case "verify_student_login": {
        var sheet = ss.getSheetByName("HocSinh");
        if (!sheet) { setupSheets(); sheet = ss.getSheetByName("HocSinh"); }
        var rows = sheet.getDataRange().getValues();
        var targetLop = String(data.lop || "").trim();
        var targetHS = String(data.maHocSinh || "").trim().toLowerCase();
        var targetPin = String(data.maPin || "").trim();

        for (var i = 1; i < rows.length; i++) {
          var r = rows[i];
          var rowLop = String(r[2] || "").trim();
          var rowMa = String(r[0] || "").trim().toLowerCase();
          var rowTen = String(r[1] || "").trim().toLowerCase();
          var rowPin = String(r[3] || "").trim();

          if (rowLop === targetLop && (rowMa === targetHS || rowTen === targetHS)) {
            if (rowPin === targetPin) {
              return jsonResponse({
                success: true,
                student: {
                  maHocSinh: String(r[0]),
                  hoVaTen: String(r[1]),
                  lop: String(r[2])
                }
              });
            } else {
              return jsonResponse({ success: false, error: "Mã PIN không đúng." });
            }
          }
        }
        return jsonResponse({ success: false, error: "Không tìm thấy học sinh trong lớp." });
      }

      case "delete_student": {
        var sheet = ss.getSheetByName("HocSinh");
        if (!sheet) return jsonResponse({ success: true, message: "Đã xóa." });
        var rows = sheet.getDataRange().getValues();
        var targetHS = String(data.maHocSinh || "").trim().toLowerCase();

        for (var i = 1; i < rows.length; i++) {
          if (String(rows[i][0] || "").trim().toLowerCase() === targetHS) {
            sheet.deleteRow(i + 1);
            return jsonResponse({ success: true, message: "Đã xóa học sinh " + data.maHocSinh });
          }
        }
        return jsonResponse({ success: true, message: "Không tìm thấy để xóa." });
      }

      default:
        return jsonResponse({ success: false, error: "Action không hợp lệ: " + action }, 400);
    }
  } catch (err) {
    return jsonResponse({ success: false, error: "Lỗi Server Google Apps Script: " + err.toString() }, 500);
  }
}

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || "";
  if (action === "ping") {
    return jsonResponse({ success: true, message: "Apps Script Web App đang hoạt động tốt!" });
  }
  return jsonResponse({
    success: true,
    message: "Google Apps Script Web App cho Cú Nhí Chấm Văn sẵn sàng. Vui lòng gửi POST request kèm secret."
  });
}

function jsonResponse(data, status) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
