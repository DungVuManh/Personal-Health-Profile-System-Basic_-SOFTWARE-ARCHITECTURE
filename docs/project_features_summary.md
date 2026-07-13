# Tóm tắt Tổng quan Tính năng Dự án (Personal Health Profile System)

Tài liệu này tóm tắt toàn bộ các tính năng (Use Cases) của hệ thống **Hồ sơ sức khỏe cá nhân (Personal Health Profile System)** dựa trên tài liệu đặc tả yêu cầu srs.docx.

### Lưu ý về mặt đánh số Use Case
Tài liệu SRS có sự sai lệch nhỏ về mặt đánh số (Use Case ID) giữa **Danh sách Use Case tổng quát (Mục II. 2.2)** và **Thiết kế Chi tiết (Mục II. Detail Design)**. Bảng dưới đây sẽ làm rõ và đồng bộ cả hai phần này.

---

## 1. Danh sách Phân vai (Actors) trong Hệ thống

* **Patient (Bệnh nhân):** Người dùng cuối, theo dõi sức khỏe cá nhân, đặt lịch khám, xem kết quả, thanh toán và kết nối thiết bị IoT.
* **Doctor (Bác sĩ):** Người dùng chuyên môn, quản lý danh sách bệnh nhân, xem lịch sử y tế, ghi nhận chẩn đoán và kê đơn thuốc điện tử.
* **Admin (Quản trị viên):** Quản trị hệ thống, tài khoản, phân quyền, dữ liệu danh mục (Master Data) và giám sát logs.
* **Guest (Khách vãng lai):** Đăng ký tài khoản mới.
* **IoT/Wearable Device (Thiết bị đeo thông minh):** Tự động đồng bộ các chỉ số sinh tồn và phát cảnh báo thời gian thực.
* **AI Engine (Trí tuệ nhân tạo):** Gợi ý mã bệnh ICD-10 dựa trên mô tả lâm sàng.

---

## 2. Bảng Tổng quan Tính năng & Sử dụng (Use Cases)

| ID (Danh sách) | ID (Thiết kế) | Tên Use Case | Actor chính | Mô tả tính năng |
| :--- | :--- | :--- | :--- | :--- |
| **UC01** | UC01 | **Manage Profile** (Quản lý hồ sơ) | Patient | Cập nhật thông tin cá nhân, ảnh đại diện (avatar) và thông tin liên hệ khẩn cấp. |
| **UC02** | UC02 | **Book Appointment** (Đặt lịch khám) | Patient | Tìm kiếm bác sĩ/chuyên khoa và đặt lịch hẹn khám trực tuyến. |
| **UC03** | UC03 | **Reschedule Appointment** (Đổi/Hủy lịch) | Patient | Hủy lịch khám hoặc thay đổi giờ khám sang khung giờ trống khác của bác sĩ. |
| **UC04** | UC04 | **View Medical Records** (Xem hồ sơ y tế) | Patient | Xem lịch sử bệnh án, các đơn thuốc đã kê và các kết quả xét nghiệm (lab results). |
| **UC05** | UC05 | **View Health Dashboard** (Biểu đồ sức khỏe) | Patient | Theo dõi xu hướng sức khỏe (BMI, huyết áp, nhịp tim...) qua các biểu đồ trực quan. |
| **UC06** | UC06 | **Make QR Payment** (Thanh toán QR) | Patient | Quét mã QR động để thanh toán phí khám ngay sau khi đặt lịch thành công. |
| **UC07** | UC07 | **Manage User** (Quản lý người dùng) | Admin | Thêm, sửa, khóa (Lock/Deactivate) hoặc xóa tài khoản người dùng theo quy định. |
| **UC08** | - | **Manage Permission** (Quản lý phân quyền) | Admin | Gán quyền cho các nhóm vai trò, xử lý thăng cấp/phân quyền cho bác sĩ, nhân viên. |
| **UC09** | - | **Manage Master Data** (Quản lý dữ liệu danh mục) | Admin | Quản lý danh mục chuyên khoa (Specialty) và danh mục thuốc (Medicines). |
| **UC10** | - | **View Log** (Xem nhật ký bảo mật) | Admin | Giám sát lịch sử truy cập hồ sơ bệnh án, đơn thuốc, thay đổi kết quả (Audit Logs). |
| **UC11** | - | **Auth** (Xác thực người dùng) | Tất cả | Đăng nhập hệ thống bảo mật, chuyển hướng giao diện (Dashboard) theo vai trò. |
| **UC12** | UC11 | **Manage Profile/Specialty** (Hồ sơ bác sĩ) | Doctor | Bác sĩ cập nhật thông tin cá nhân, bằng cấp, chứng chỉ và các chuyên khoa đảm nhận. |
| **UC13** | UC12 | **View Patient List** (Xem danh sách bệnh nhân) | Doctor | Hiển thị danh sách bệnh nhân đã hẹn khám trong ngày hoặc đang điều trị. |
| **UC14** | UC13 | **View Patient Health History** (Xem lịch sử bệnh án) | Doctor | Xem lại bệnh án cũ, đơn thuốc trước đó và các chỉ số sức khỏe của bệnh nhân trước khi khám. |
| **UC15** | UC14 | **Add Clinical Notes/Diagnosis** (Nhập bệnh án) | Doctor | Ghi nhận triệu chứng, kết quả khám lâm sàng và chọn mã chẩn đoán chuẩn ICD-10. |
| **UC16** | - | **Issue E-Prescription** (Kê đơn thuốc điện tử) | Doctor | Tạo đơn thuốc kỹ thuật số (tên thuốc, liều lượng, tần suất, số lượng) cho bệnh nhân. |
| **UC17** | - | **Suggest ICD10** (Gợi ý mã ICD-10 bằng AI) | AI Engine | Phân tích mô tả lâm sàng bằng AI để gợi ý mã bệnh ICD-10 chính xác cho bác sĩ. |
| **UC18** | - | **Create Account** (Đăng ký tài khoản) | Guest | Người dùng mới đăng ký qua email/SĐT và xác thực OTP/link kích hoạt. |
| **UC19** | UC15 | **Sync Health Data** (Đồng bộ dữ liệu IoT) | IoT Device | Tự động truyền dữ liệu sức khỏe (nhịp tim, huyết áp, giấc ngủ) từ thiết bị vào hệ thống. |
| **UC20** | UC16 | **Trigger Health Alert** (Cảnh báo sức khỏe) | IoT Device | Theo dõi chỉ số sinh tồn thời gian thực và phát cảnh báo tức thì khi vượt ngưỡng nguy hiểm. |

---

## 3. Các Phân Hệ (Modules) Chính của Hệ thống

Dựa trên danh sách các Use Cases, hệ thống được chia làm 5 phân hệ lớn:

### 1. Phân hệ Bệnh nhân (Patient Portal)
* **Giao diện quản lý cá nhân:** Đổi avatar, thông tin liên hệ khẩn cấp.
* **Đặt lịch khám:** Bộ lọc tìm kiếm bác sĩ chuyên khoa, đặt giờ khám.
* **Hồ sơ cá nhân & Dashboard:** Trực quan hóa dữ liệu sinh tồn đo được và lịch sử bệnh án.
* **Thanh toán:** Tích hợp cổng thanh toán để hiển thị QR thanh toán tự động.

### 2. Phân hệ Bác sĩ (Doctor Portal)
* **Quản lý lịch khám:** Xem danh sách bệnh nhân đã đặt hẹn theo ngày.
* **Khám bệnh & Bệnh án điện tử (EHR):** Tra cứu hồ sơ cũ của bệnh nhân, nhập ghi chú lâm sàng, chọn chẩn đoán (ICD-10) và kê đơn thuốc.
* **Quản lý chuyên môn:** Cập nhật thông tin chuyên khoa, bằng cấp chuyên môn.

### 3. Phân hệ Quản trị (Admin Dashboard)
* **Quản lý tài khoản:** Cấp tài khoản mới cho bác sĩ/nhân viên, khóa/mở khóa tài khoản.
* **Quản lý danh mục:** Thêm mới chuyên khoa, quản lý danh sách thuốc.
* **Giám sát an ninh:** Theo dõi và lọc danh sách log truy cập dữ liệu y tế nhạy cảm.

### 4. Phân hệ IoT & Cảnh báo (IoT & Alerts Engine)
* **Gateway IoT:** API tiếp nhận dữ liệu định kỳ hoặc liên tục từ các thiết bị đeo thông minh.
* **Engine Cảnh báo:** Xử lý luồng dữ liệu thời gian thực, đối chiếu ngưỡng an toàn và bắn thông báo (Push Notification/SMS) nếu phát hiện bất thường (nhịp tim tăng cao đột ngột, phát hiện ngã).

### 5. Phân hệ Trí tuệ Nhân tạo (AI Integration)
* Phân tích văn bản mô tả triệu chứng và chẩn đoán lâm sàng của bác sĩ để đề xuất mã ICD-10 tương ứng nhằm tối ưu hóa quy trình làm việc của bác sĩ.
