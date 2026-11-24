HƯỚNG DẪN CÀI FILE FONT GỐC (SPLANDOR & BASKERVILLE DISPLAY PT)
===============================================================

Vì Splandor (SVN-Splandor / EFCO Splandor) và Baskerville Display PT là 2 bộ font
thương mại không có sẵn trên Google Fonts, website hiện đang cấu hình:
1. Tự ưu tiên dùng đúng "Splandor" & "Baskerville Display PT" nếu có sẵn.
2. Fallback mượt sang cặp Google Fonts chuẩn tiếng Việt gần nhất: Yeseva One + Prata / Brygada 1918.

Nếu bạn đã có sẵn file font (.woff2, .otf hoặc .ttf) trên máy:
- Chép 2 file vào thư mục này với tên:
    SVN-Splandor.otf (hoặc .woff2 / .ttf)
    BaskervilleDisplayPT.ttf (hoặc .woff2 / .otf)
- Mở file `css/styles.css` (dòng 15–30) và bỏ dấu ghi chú `/* ... */` ở 2 dòng `src: url(...)`
  là mọi điện thoại khi mở link qua Zalo/Messenger sẽ hiển thị đúng 100% 2 font gốc của bạn!
