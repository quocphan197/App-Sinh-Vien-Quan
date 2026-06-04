# Kiến trúc — Sinh Viên Quán

## Luồng runtime (production)

```
index.html  →  splash.js  →  app.html
app.html
    └── js/app.js          (monolith: data + state + UI + routing)
            ├── localStorage  (theme, svq_app_state)
            └── hash routes   (#/home, #/menu, …)
```

## Luồng mã nguồn (bảo trì)

| File | Vai trò |
|------|---------|
| `js/database.js` | Combos, món lẻ, voucher, thông báo, `VOUCHER_RULES`, `initialOrders` |
| `js/pricing.js` | `calcCartSubtotal`, `calcVoucherDiscount`, `calcOrderTotals` |
| `js/utils.js` | Audio, toast, confetti |
| `js/components/*.js` | Hàm `render*` từng màn (ES modules) |
| `js/app.js` | Bản gộp chạy thực tế — cập nhật song song khi đổi logic |

## State

- `state.cart` — `{ itemId: quantity }`
- `state.orders[]` — `{ id, itemName, items[], price, status, step? }`
- `state.appliedVoucherCode` — mã đang áp dụng
- Persist: `localStorage['svq_app_state']`

## Voucher

Xem `VOUCHER_RULES` trong `database.js` / đầu `app.js`. Mọi màn tính tiền gọi `calcOrderTotals(cart, code)`.

## Deploy

Static files only — Vercel/GitHub Pages không cần build step. Xem `README.md`.
