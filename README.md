# 🍜 Quán Mì Cay - Spicy Noodle Shop (2D Casual Cooking Game)

Browser game 2D quản lý nhà hàng mì cay phong cách Cozy Cartoon Cooking Game được xây dựng hoàn chỉnh bằng **HTML5**, **JavaScript (ES Modules)**, **Phaser 3** và **Vite**.

---

## 🎮 Các tính năng chính

1. **Vòng lặp Gameplay hoàn chỉnh (Game Loop)**:
   - **Khách hàng bước vào**: Tự động tìm bàn trống, hiển thị bong bóng order kèm hình minh họa tô mì 2D và độ cay.
   - **Thanh kiên nhẫn & Biểu cảm (Mood System)**:
     - `> 70%`: Khách vui vẻ 😊 (nhận 100% tiền thưởng).
     - `40% – 70%`: Khách trung tính / sốt ruột.
     - `15% – 40%`: Khách mất kiên nhẫn 😠 (tiền thưởng giảm dần).
     - `0%`: Khách tức giận bỏ đi, không nhận được tiền.
   - **Khu vực nguyên liệu 2D (Ingredients)**:
     - Mì, Tôm, Mực, Cá, Đùi gà, Bò Mỹ, Rau, Nấm, Xúc xích, Trứng, Nước dùng, Gia vị cay.
     - Hộp nguyên liệu có hình minh họa 2D vẽ bằng code, hiệu ứng click bay vào khay chuẩn bị.
   - **Bếp nấu & Hiệu ứng (Cooking Station)**:
     - Nồi nấu, bếp lửa, bong bóng sôi, khói bốc lên theo tiến độ nấu.
     - Thanh tiến độ `ĐANG NẤU... %`.
   - **Giao món & Nhận tiền (Serving & Money System)**:
     - Click trực tiếp vào khách hoặc bấm `GIAO MÓN`.
     - Nút `🗑 ĐỔ ĐI` để dọn món nếu nấu sai hoặc khách đã bỏ đi.
     - Hiệu ứng đồng xu bay lên cùng số tiền thưởng.
   - **Sổ tay công thức (Recipe Book)**: Bấm nút `📖 CÔNG THỨC` bất kỳ lúc nào để tra cứu nguyên liệu của từng món trong màn.

2. **Hệ thống 10 màn chơi (10 Levels Progression)**:
   - Màn 1: *Khởi Nghiệp* (Có hướng dẫn Tutorial trực quan)
   - Màn 2: *Quán Nhỏ*
   - Màn 3: *Giờ Cao Điểm*
   - Màn 4: *Khách Đông*
   - Màn 5: *Thử Thách Hải Sản*
   - Màn 6: *Bếp Bận Rộn*
   - Màn 7: *Tốc Độ Cao*
   - Màn 8: *Siêu Đông Khách*
   - Màn 9: *Thử Thách Đặc Biệt*
   - Màn 10: *Ông Chủ Mì Cay*

3. **Hệ thống lưu trữ & Đánh giá (Save & Stars)**:
   - Đánh giá từ 1 đến 3 sao theo doanh thu đạt được.
   - Mở khóa màn mới khi hoàn thành màn trước.
   - Lưu tiến trình, high score và cài đặt vào `LocalStorage`.
   - Chức năng **Xóa tiến trình (Reset Progress)** trong phần Cài đặt.

4. **Hệ thống Âm thanh & Nhạc (Audio System)**:
   - Tổng hợp âm thanh bằng **Web Audio API** (Click, lấy nguyên liệu, nấu, hoàn thành, tiền thưởng, khách rời đi, thắng/thua).
   - Tùy chọn BẬT / TẮT âm thanh và nhạc trong menu Cài đặt.

5. **Chế độ Debug (Debug Mode - Phím `D`)**:
   - Nhấn phím `D` trong màn chơi để bật/tắt bảng thông số:
     - FPS
     - Level hiện tại
     - Doanh thu / Mục tiêu
     - Số lượng khách chờ / Đã phục vụ
     - Danh sách order
     - Trạng thái nấu

---

## 🚀 Hướng dẫn cài đặt & Khởi chạy

### Yêu cầu:
- [Node.js](https://nodejs.org/) (khuyến nghị phiên bản 18+ hoặc 20+)

### Cài đặt dependencies:
```bash
npm install
```

### Chạy chế độ Development (Local Server):
```bash
npm run dev
```
Trình duyệt sẽ tự động mở tại địa chỉ `http://localhost:3000`.

### Build phiên bản Production:
```bash
npm run build
```
Kết quả build tối ưu sẽ nằm trong thư mục `dist/`.

---

## 📁 Cấu trúc thư mục

```
spicy-noodle-shop/
├── index.html               # Trang HTML chính & loading screen
├── package.json             # Khai báo dependency và script Vite
├── vite.config.js           # Cấu hình Vite & chunking Phaser
└── src/
    ├── main.js              # Entry point & cấu hình Phaser 3
    ├── data/
    │   ├── config.js        # Cấu hình kích thước, layout, ghế ngồi
    │   ├── dishes.js        # Dữ liệu món ăn, công thức, giá tiền
    │   ├── ingredients.js   # Dữ liệu nguyên liệu & màu sắc
    │   └── levels.js        # Dữ liệu 10 màn chơi
    ├── scenes/
    │   ├── BootScene.js         # Scene khởi động & nạp tài nguyên
    │   ├── MainMenuScene.js     # Màn hình chính & hiệu ứng quán mì
    │   ├── LevelSelectScene.js  # Màn hình chọn 10 màn chơi
    │   ├── GameScene.js         # Màn chơi chính (toàn bộ gameplay loop)
    │   ├── ResultScene.js       # Màn hình kết quả (Sao, Doanh thu, Thống kê)
    │   └── SettingsScene.js     # Cài đặt âm thanh & xóa tiến trình
    ├── systems/
    │   ├── AudioSystem.js   # Quản lý âm thanh Web Audio API
    │   ├── MoneySystem.js   # Tính toán tiền thưởng theo độ hài lòng
    │   └── SaveSystem.js    # Quản lý lưu trữ LocalStorage
    └── utils/
        └── DrawingUtils.js  # Bộ vẽ minh họa 2D procedural (tô mì, khách, bếp...)
```

