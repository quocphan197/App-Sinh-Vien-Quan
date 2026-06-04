# Sinh Viên Quán

SPA đặt món **mobile-first** cho sinh viên: trang chủ, thực đơn, voucher, «Quán chọn giúp», giỏ hàng, thanh toán, đơn hàng và thông báo. Giao diện Material 3 + Tailwind CSS.

## Tính năng

- Điều hướng hash (`#/home`, `#/menu`, `#/cart`, …) — chạy tốt trên static host
- Voucher thống nhất: `KHOINGHI5K`, `TRATACFREE`, `CUOITUAN50`, `GIAM10`, `SINHVIEN15`
- Lưu giỏ hàng & đơn hàng trong `localStorage`
- Dark mode, toast, confetti, âm thanh UI (Web Audio API)
- Không cần build — deploy thẳng file tĩnh

## Luồng mở app

1. **`index.html`** — Splash (3 giây) → Onboarding → nút **Bắt đầu ngay** / **Đăng nhập**
2. **`app.html`** — SPA chính (menu, giỏ, voucher, …)

Lần sau khi đã bấm «Bắt đầu», mở `/` sẽ chuyển thẳng tới `app.html`. Xem lại splash: `/?splash=1`

## Cấu trúc thư mục

```
sinh-vien-quan/
├── index.html          # Splash + onboarding (entry)
├── app.html            # SPA chính
├── favicon.svg
├── css/app.css         # Custom styles & animations
├── js/
│   ├── app.js          # ★ Production bundle (được index.html load)
│   ├── database.js     # Dữ liệu mock + VOUCHER_RULES
│   ├── pricing.js      # Logic tính giá / voucher (ES module)
│   ├── utils.js        # Toast, audio, confetti (ES module)
│   └── components/     # Màn hình tách module (tham chiếu / tương lai bundler)
├── vercel.json         # Cấu hình Vercel
├── package.json        # Script chạy local
└── .github/workflows/  # CI kiểm tra cú pháp
```

> **Lưu ý:** `index.html` chỉ nạp `js/app.js` (monolith gộp sẵn để tránh lỗi CORS khi mở `file://`). Các file `components/*.js` và `pricing.js` đồng bộ logic với `app.js` cho bảo trì hoặc khi chuyển sang build ES modules.

## Chạy local

**Yêu cầu:** Node.js 18+ (chỉ để chạy server tĩnh, không bắt buộc cài dependency).

```bash
# Clone repo
git clone https://github.com/<user>/sinh-vien-quan.git
cd sinh-vien-quan

# Cách 1: npm script (khuyến nghị — HTTP, đủ clipboard & font CDN)
npm run dev
# Mở http://localhost:3000  (splash)
# App trực tiếp: http://localhost:3000/app.html

# Cách 2: Python
python -m http.server 3000

# Cách 3: VS Code Live Server — mở thư mục gốc
```

Kiểm tra cú pháp:

```bash
npm run validate
```

## Triển khai lên Vercel

### Cách A — Import GitHub (khuyến nghị)

1. Đẩy repo lên GitHub (xem mục dưới).
2. Vào [vercel.com](https://vercel.com) → **Add New Project** → chọn repo.
3. Cấu hình mặc định:
   - **Framework Preset:** Other
   - **Build Command:** *(để trống)*
   - **Output Directory:** `.` (root)
4. **Deploy** — `vercel.json` đã cấu hình rewrite SPA và cache cho `/js`, `/css`.

### Cách B — Vercel CLI

```bash
npm i -g vercel
vercel
# Production: vercel --prod
```

### CDN bên ngoài (cần mạng)

- Tailwind CSS CDN
- Google Fonts (Be Vietnam Pro, Anton, Inter, Material Symbols)

Ảnh món ăn dùng URL `i.ibb.co` — đảm bảo host ảnh còn hoạt động hoặc thay bằng ảnh của bạn.

## Đẩy lên GitHub

```bash
cd sinh-vien-quan
git init
git add .
git commit -m "Initial release: Sinh Viên Quán SPA"
git branch -M main
git remote add origin https://github.com/<username>/sinh-vien-quan.git
git push -u origin main
```

Sau khi push, bật GitHub Actions (workflow `CI` sẽ chạy `npm run validate`).

## Biến môi trường

Không bắt buộc. Ứng dụng pure frontend, không có API key trong repo.

## Giấy phép

[MIT](LICENSE)
