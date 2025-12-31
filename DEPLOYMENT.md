# Hướng dẫn Deploy lên GitHub và Vercel

Ứng dụng của bạn đã hoàn thiện! Dưới đây là các bước để đưa nó lên internet để mọi người cùng sử dụng.

## Phần 1: Đẩy code lên GitHub

Để đưa code từ máy tính lên GitHub, bạn cần thực hiện các bước sau trong Terminal (tại thư mục dự án):

1.  **Khởi tạo kho chứa (nếu chưa làm)**:
    ```bash
    git init
    ```
    *Lệnh này tạo một kho chứa Git ngay trong máy tính của bạn.*

2.  **Lưu toàn bộ thay đổi**:
    ```bash
    git add .
    git commit -m "Phiên bản đầu tiên"
    ```
    *Lệnh này đóng gói toàn bộ file hiện tại vào một "phiên bản" (commit).*

3.  **Kết nối và đổi tên nhánh**:
    ```bash
    git branch -M main
    ```
    *Đổi tên nhánh chính thành `main` (chuẩn quốc tế).*

4.  **Liên kết với GitHub**:
    *   Vào [GitHub](https://github.com), tạo một Repository mới (chọn Public).
    *   Copy đường link repository (ví dụ: `https://github.com/USERNAME/TEN-REPO.git`).
    *   Chạy lệnh sau (thay link của bạn vào):
    ```bash
    git remote add origin https://github.com/USERNAME/TEN-REPO.git
    ```

5.  **Đẩy code lên**:
    ```bash
    git push -u origin main
    ```
    *Lệnh này sẽ chính thức đưa code của bạn lên GitHub.*

---
**💡 Cập nhật code sau này:**
Mỗi khi bạn sửa code và muốn cập nhật lên GitHub, chỉ cần chạy 3 lệnh này:
```bash
git add .
git commit -m "Mô tả bạn đã sửa cái gì"
git push
```

## Phần 2: Deploy lên Vercel

Vercel là nơi tuyệt vời để host các web app tĩnh như của bạn miễn phí và cực nhanh.

1.  **Đăng nhập Vercel**: 
    *   Truy cập [vercel.com](https://vercel.com)
    *   Chọn **Sign Up** (hoặc Login).
    *   Chọn **Continue with GitHub** để đăng nhập bằng tài khoản GitHub của bạn.

2.  **Import Project**:
    *   Sau khi đăng nhập, bấm nút **Add New...** -> **Project**.
    *   Ở mục **Import Git Repository**, bạn sẽ thấy danh sách các repo trên GitHub của mình.
    *   Tìm repo bạn vừa tạo và bấm nút **Import**.

3.  **Cấu hình & Deploy**:
    *   Bạn không cần chỉnh sửa gì cả (để mặc định).
    *   Bấm nút **Deploy**.

4.  **Hoàn tất**:
    *   Đợi khoảng 1 phút. Khi màn hình hiện pháo hoa chúc mừng là xong! 
    *   Bấm vào hình ảnh hoặc nút **Visit** để xem trang web của bạn đã online.
    *   Bạn có thể copy đường link (ví dụ: `fin-calculation.vercel.app`) gửi cho bạn bè.
