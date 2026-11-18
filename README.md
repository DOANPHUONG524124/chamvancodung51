# 🦉 Cú Nhí Chấm Văn Lớp 5 - GIAI ĐOẠN 2

Ứng dụng web React (Vite) cao cấp hỗ trợ học sinh lớp 5 luyện viết văn và nhận đánh giá từ **Cú Thông Thái** kết hợp sự đồng hành của **Cô giáo**, lưu trữ toàn bộ dữ liệu vào **Google Sheets** qua **Google Apps Script Web App**.

---

## 🌟 TÍNH NĂNG NỔI BẬT GIAI ĐOẠN 2

### 1. Phân quyền & Đăng nhập Giáo viên bảo mật phía Server
- Đăng nhập bảo mật qua endpoint `/api/login` xác thực mật khẩu từ biến môi trường `TEACHER_PASSWORD`.
- Cơ chế cấp **Token phiên HMAC** (hạn dùng 8 tiếng) ký bằng chữ ký số bảo mật.
- **Không dùng `localStorage` hay `sessionStorage`:** Token và trạng thái chỉ lưu trong bộ nhớ React State, đảm bảo tính riêng tư tuyệt đối khi dùng chung thiết bị tại trường học.

### 2. Trang Quản lý Đề bài linh hoạt (Chỉ Giáo viên)
- Thêm, sửa, xóa và bật/tắt đóng/mở đề bài theo kế hoạch dạy học thực tế.
- Mỗi đề gồm đầy đủ: Tập (Tập 1 hoặc 2), Tên chủ điểm, Tên bài, Dạng văn, Yêu cầu đề bài, Độ dài mong muốn (số từ/số câu) và Trạng thái (đang mở/đã đóng).
- **Học sinh chỉ thấy các đề "đang mở"** để làm bài.

### 3. Hỗ trợ đầy đủ 7 Dạng văn Tiếng Việt Lớp 5 & Rubric chuẩn 10 điểm
- Tích hợp trọn vẹn 7 dạng bài tập làm văn chuẩn chương trình Tiếng Việt lớp 5 mới:
  1. **Kể chuyện sáng tạo:** Viết tiếp câu chuyện, góc nhìn khác, thêm chi tiết hội thoại sáng tạo.
  2. **Văn miêu tả phong cảnh:** Tả cảnh thiên nhiên, quê hương, trường học theo trình tự hợp lý (bao quát đến chi tiết).
  3. **Văn tả người:** Tả người thân, thầy cô, bạn bè kết hợp ngoại hình với tính tình và hoạt động.
  4. **Viết đoạn văn / bài văn biểu cảm, nêu cảm xúc:** Bộc lộ cảm nghĩ về bài thơ, câu chuyện, sự việc.
  5. **Viết đoạn văn giới thiệu:** Giới thiệu nhân vật trong sách, trong phim hoạt hình hoặc câu chuyện đã đọc.
  6. **Viết báo cáo công việc và chương trình hoạt động:** Lập báo cáo thống kê, chương trình hoạt động của lớp/Đội.
  7. **Viết đoạn văn nêu ý kiến:** Nêu ý kiến tán thành/phản đối về vấn đề gần gũi với học sinh.
- Mỗi dạng văn có bộ tiêu chí riêng với tổng thang điểm chuẩn 10. Thầy/Cô có thể tùy biến thêm bớt tiêu chí; hệ thống sẽ tự động xác thực tổng điểm bằng 10 trước khi lưu.

### 4. Chấm bài từ ảnh chụp trang vở (Gemini Multimodal Vision OCR)
- **Học sinh:** Có thể chụp ảnh trang vở kẻ ô ly từ điện thoại hoặc tải ảnh lên. Bấm *"🤖 Cú đọc chữ từ ảnh vở giúp em"*, AI sẽ tự động đọc chữ viết tay và điền vào ô làm bài, kèm nút *"📝 Điền bài mẫu để thử"* để thử nghiệm nhanh 1 chạm.
- **Giao diện Thầy Cô ("📷 Chấm từ ảnh vở"):**
  - Màn hình chuyên dụng chuẩn sư phạm: Tải ảnh trang vở ➔ AI đọc chữ viết tay ➔ Phân tích số tiếng, số câu, lỗi chính tả ➔ Thầy Cô chấm điểm từng tiêu chí bằng dropdown ➔ Gợi ý nhận xét ➔ Duyệt và lưu vào sổ theo dõi.
  - Phục vụ đối chiếu trực quan song song (Side-by-side) giữa ảnh chụp trang vở gốc và văn bản chép lại.
- **API `api/doc-anh.js`:** Sử dụng Gemini Flash-Lite Multimodal Vision với độ chính xác cao đối với chữ viết tay tiếng Việt của học sinh tiểu học trên giấy kẻ ô ly.

### 5. Quản lý Lớp học & Đăng nhập Học sinh (Chuẩn lứa tuổi Tiểu học)
- **Học sinh tự đăng nhập nộp bài:**
  - Thiết kế 3 bước siêu đơn giản: Chọn Lớp ➔ Chọn Tên của em từ danh sách ➔ Nhập mã PIN 4 số.
  - Không cần email hay mật khẩu phức tạp; sau khi đăng nhập, hệ thống tự động gắn Mã số và Họ tên vào bài làm.
- **Giáo viên quản lý danh sách lớp ("🏫 Quản lý Lớp học"):**
  - Tải lên danh sách học sinh từ file Excel/CSV chuẩn UTF-8 hoặc thêm/sửa từng em.
  - Tải file mẫu CSV (`Mau_Danh_Sach_Lop_5.csv`) với 1 click.
  - In phiếu cấp mã PIN cả lớp để cắt phát tận tay cho học sinh dán vào góc vở.

### 6. Nâng cấp API Chấm văn (`api/cham-van.js`)
- Nhận diện: Mã số học sinh (`maHocSinh`), Thông tin đề bài, Rubric động của dạng văn đó và Bài làm.
- Prompt AI sinh động theo tiêu chí của Rubric, gọi Gemini Flash-Lite một lần duy nhất với nhiệt độ thấp.
- Cơ chế **Retry thông minh (Exponential Backoff)**: Tự động thử lại khi gặp lỗi 429 (quá tải quota).
- Làm sạch và kiểm tra điểm số (clamp score) không vượt trần tiêu chí.
- Tự động lưu bài nộp vào sheet `BaiNop` với trạng thái ban đầu `"cho_duyet"`.

### 7. Màn hình Duyệt bài & Xuất Phiếu Nhận Xét (PDF Chuẩn Tiếng Việt)
- Bộ lọc đa chiều: Lọc theo đề bài, mã học sinh và trạng thái (Tất cả / Chờ duyệt / Đã duyệt).
- Giáo viên xem bài văn, điểm gợi ý của AI, nhận xét của AI.
- Giáo viên có quyền **điều chỉnh điểm từng tiêu chí** và sửa lời phê sư phạm trước khi bấm **"Duyệt bài"**.
- **Chỉ bài đã duyệt** học sinh mới tra cứu được sao, lời khen và gợi ý.
- **Xuất phiếu nhận xét cá nhân:** Tải/in từng phiếu nhận xét trang trọng có đủ họ tên học sinh, sao danh dự và lời phê.
- **In hàng loạt tất cả phiếu nhận xét cả lớp (Bulk PDF):** Trình duyệt tự động gom tất cả bài đã duyệt thành 1 tập tài liệu liên tục với ngắt trang A4 (`page-break-after: always`), giúp Thầy/Cô in 1 lần là có đủ phiếu phát cho từng em.
- **Xuất bảng tổng hợp cả lớp:** File CSV có mã hóa UTF-8 BOM, mở trực tiếp trên Microsoft Excel hiển thị tiếng Việt hoàn hảo.

---

## ⚙️ DANH SÁCH BIẾN MÔI TRƯỜNG CẦN CÀI ĐẶT TRÊN VERCEL

| Tên biến | Bắt buộc | Ý nghĩa & Giá trị mẫu |
| :--- | :---: | :--- |
| `GEMINI_API_KEY` | **Có** | API key lấy từ [Google AI Studio](https://aistudio.google.com/) (dạng `AIzaSy...`) |
| `TEACHER_PASSWORD` | **Có** | Mật khẩu để Thầy/Cô đăng nhập quản lý (ví dụ: `giaovien2026`) |
| `TEACHER_SESSION_SECRET` | Khuyên dùng | Khóa bí mật dùng để ký token phiên (ví dụ: `chuoi_bi_mat_ngau_nhien_123`) |
| `APPS_SCRIPT_URL` | Khi kết nối Sheet | Đường link Web App của Google Apps Script (dạng `https://script.google.com/macros/s/.../exec`) |
| `SHEETS_SECRET` | Khi kết nối Sheet | Khóa bí mật đồng bộ giữa Vercel và Google Apps Script (ví dụ: `cu_nhi_cham_van_secret_2026`) |

---

## 📑 HƯỚNG DẪN KẾT NỐI GOOGLE SHEETS QUA APPS SCRIPT

### Bước 1: Tạo Google Sheet mới
1. Mở [Google Sheets](https://sheets.new) tạo một bảng tính mới, đặt tên: `He_Thong_Cham_Van_Lop_5`.

### Bước 2: Dán mã Google Apps Script
1. Trên thanh menu Google Sheets, chọn **Tiện ích mở rộng (Extensions)** ➔ **Apps Script**.
2. Xóa hết mã có sẵn trong file `Code.gs`.
3. Mở file [google-apps-script.js](file:///c:/Users/PHUONG/Desktop/THU%20DUNG/cham-van/google-apps-script.js) trong dự án này, sao chép toàn bộ nội dung và dán vào `Code.gs`.
4. (Tùy chọn) Chỉnh sửa biến `DEFAULT_SECRET` trong mã hoặc vào **Project Settings (Cài đặt dự án)** ➔ Thêm Script Property `SHEETS_SECRET` với giá trị bí mật của bạn.
5. Nhấn biểu tượng **Lưu (Save)**.
6. Tại thanh menu hàm, chọn hàm `setupSheets` và bấm **Chạy (Run)** một lần để tự động khởi tạo 3 sheet: `De`, `Rubric`, `BaiNop` với các cột chuẩn và đề bài mẫu!

### Bước 3: Triển khai thành Web App
1. Nhấn nút **Triển khai (Deploy)** ở góc phải trên ➔ Chọn **Quản lý bản triển khai mới (New deployment)**.
2. Nhấn biểu tượng bánh răng ⚙️ bên cạnh mục "Chọn loại" ➔ Chọn **Ứng dụng web (Web app)**.
3. Cấu hình triển khai:
   - **Mô tả:** `Cham van lop 5 API v2`
   - **Thực thi dưới dạng (Execute as):** `Tôi (Me)`
   - **Ai có quyền truy cập (Who has access):** `Bất kỳ ai (Anyone)` *(Rất quan trọng để Vercel serverless function có thể gọi)*
4. Nhấn **Triển khai (Deploy)**. Google sẽ yêu cầu cấp quyền truy cập bảng tính (Authorize Access) ➔ Chọn tài khoản của bạn ➔ Bấm **Nâng cao (Advanced)** ➔ Chọn **Đi tới dự án (Go to project - Unsafe)** ➔ Chọn **Cho phép (Allow)**.
5. Sao chép đường dẫn **URL ứng dụng web** (dạng `https://script.google.com/macros/s/AKfycb.../exec`).

---

## 🚀 HƯỚNG DẪN DEPLOY LẠI LÊN VERCEL

1. Mở trang quản trị [Vercel Dashboard](https://vercel.com/) ➔ Chọn dự án của bạn.
2. Vào mục **Settings** ➔ **Environment Variables**:
   - Thêm `TEACHER_PASSWORD`: mật khẩu của bạn (ví dụ: `giaovien123`).
   - Thêm `TEACHER_SESSION_SECRET`: chuỗi ký tự ngẫu nhiên.
   - Thêm `APPS_SCRIPT_URL`: link Web App vừa lấy ở Bước 3.
   - Thêm `SHEETS_SECRET`: khớp với secret trong Apps Script.
   - Đảm bảo `GEMINI_API_KEY` đã được cài đặt.
3. Đẩy code mới lên GitHub:
   ```bash
   git add .
   git commit -m "Nang cap Giai doan 2: Quan ly de, Rubric, Duyet bai, Google Sheets"
   git push origin main
   ```
4. Vercel sẽ tự động build và triển khai phiên bản Giai đoạn 2 chỉ trong 1 phút!

---

## 🧪 KỊCH BẢN KIỂM THỬ TỪNG CHỨC NĂNG

1. **Kiểm tra Học sinh làm bài:**
   - Chọn một đề bài đang mở (ví dụ: Tập 1 - Cảnh bình minh trên quê hương).
   - Nhập mã học sinh `HS05`.
   - Gõ bài văn mẫu (>30 từ), bấm **Nộp bài cho Cú**.
   - Màn hình thông báo nộp thành công và bài được chuyển sang trạng thái chờ duyệt.

2. **Kiểm tra Giáo viên Quản lý đề & Chỉnh Rubric:**
   - Bấm nút **"🔒 Chế độ Thầy Cô"** góc phải trên, nhập mật khẩu `giaovien123`.
   - Vào tab **"Quản lý Đề bài"**: Bấm "Thêm đề bài mới", nhập đề Tập 2 và lưu. Đề mới xuất hiện ngay trên danh sách.
   - Thử bấm "Khóa đề" để ẩn khỏi học sinh.
   - Vào tab **"Tùy chỉnh Rubric"**: Thử thay đổi điểm tiêu chí sao cho tổng khác 10 ➔ hệ thống báo lỗi đỏ. Cân đối lại tổng tròn 10 ➔ Lưu thành công.

3. **Kiểm tra Duyệt bài & Xuất PDF / Excel:**
   - Vào tab **"Duyệt bài & Chấm điểm"**: Tìm bài của học sinh `HS05` vừa nộp.
   - Bấm **"Chấm & Duyệt"**: Xem bài làm, điều chỉnh điểm theo từng tiêu chí, sửa lời phê và bấm **"Duyệt bài ngay"**.
   - Bấm nút **"🖨️ Phiếu PDF"**: Màn hình xem trước phiếu nhận xét chuẩn tiếng Việt với dấu câu hoàn chỉnh. Bấm "In / Lưu PDF" để xuất file PDF.
   - Bấm nút **"📊 Xuất bảng điểm cả lớp (CSV/Excel)"**: Tải ngay file CSV UTF-8 mở sắc nét trên Microsoft Excel.

4. **Kiểm tra Học sinh tra cứu bài đã duyệt:**
   - Bấm "Đăng xuất" khỏi chế độ Thầy Cô.
   - Bấm nút **"🔍 Tra cứu bài của em"** trên header.
   - Nhập mã `HS05` ➔ Kết quả bài làm đã duyệt hiện ra rực rỡ với đầy đủ số sao, lời khen của Cú, mẹo chính tả và lời nhắn của Cô giáo (hoàn toàn không lộ con số điểm gây áp lực)!
