# 🛍️ SHOPDEE — Nền Tảng Trải Nghiệm Mua Sắm Ảo Cho Gen Z Việt Nam
> **Virtual E-Commerce Experience Platform** • Production-Ready MVP  
> Built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS**, **MongoDB & Mongoose**.

---

## 🌟 Giới Thiệu (Overview)

**SHOPDEE** là sàn thương mại điện tử mô phỏng ảo đầu tiên tại Việt Nam được thiết kế riêng cho thế hệ Gen Z. Dự án giải quyết trọn vẹn hiện tượng **"Wishlist Therapy"** (nghiện lướt giỏ hàng lúc nửa đêm) bằng cách trao cho người dùng một môi trường mua sắm chân thực 100%, tích hợp đầy đủ tính năng của Shopee/Lazada nhưng với **0% rủi ro tài chính**.

Mọi đơn hàng, số dư tài khoản và quá trình vận chuyển đều là giả lập trong sandbox minh bạch, kết hợp hệ thống **Gamification đa tầng (10 cấp độ danh vọng, huy hiệu, nhiệm vụ hàng ngày)** và tính năng **"Khoe Đơn Triệu View"** để tối ưu hóa tính lan tỏa xã hội.

---

## 💎 Các Trụ Cột Tính Năng Cốt Lõi (Key Features)

### 1. 🛒 Trải Nghiệm Mua Sắm Chuẩn Sàn E-Commerce
- **Catalog Phong Phú:** 106+ sản phẩm thời trang, phụ kiện, tech decor hot trend chia theo 10 danh mục (Y2K, Streetwear, Aesthetic, Blindbox, Tech Decor...).
- **Tìm Kiếm & Bộ Lọc Nâng Cao:** Lọc đa chiều theo danh mục, khoảng giá, Flash Sale, Trending với đồng bộ hóa URL Params mượt mà.
- **Chi Tiết Sản Phẩm Chuẩn Shopee:** Bộ chọn phân loại (Size, Màu sắc), hiển thị tỷ lệ giảm giá, mô tả thông số kỹ thuật, đánh giá khách hàng (Review) cộng điểm +50 XP.
- **Giỏ Hàng Kép (Dual-State Cart):** Khách vãng lai (Guest) lưu trữ giỏ hàng trong `localStorage`, tự động gộp (merge) đồng bộ vào MongoDB khi đăng nhập.
- **Kiểm Định Giá Phía Server (Server-Side Price Protection):** Máy chủ tự động tính toán lại đơn giá từng món từ Database và xác thực voucher độc lập, tuyệt đối không tin tưởng số tiền từ client gửi lên.

### 2. 🛡️ Cơ Chế Mô Phỏng Minh Bạch (Simulation Sandbox)
- **100% Tiền Ảo (`VIRTUAL_VND`):** Cấp sẵn **5.000.000₫** ảo ngay khi tạo tài khoản.
- **Điểm Danh Mỗi Ngày:** Nhận thêm **+100.000₫** và **+20 XP** mỗi 24 giờ.
- **Nạp Thêm Miễn Phí:** Nút nạp nhanh **+2.000.000₫** không giới hạn để tiếp tục trải nghiệm.
- **Cảnh Báo Minh Bạch (Simulation Notice Banner):** Xuất hiện rõ ràng tại Header, Giỏ hàng, Checkout và Chi tiết đơn hàng xác nhận không thu tiền thật và không giao hàng vật lý.
- **Cổng Thanh Toán Mô Phỏng (`SimulationPaymentService`):** Kiến trúc tách biệt (Interface `IPaymentService`) mô phỏng độ trễ mạng thực tế (500ms) và cấp mã giao dịch `SIM_TX_...`, sẵn sàng thay thế bằng VNPay/Momo khi cần.

### 3. 🎮 Gamification & Bậc Danh Vọng (10 Tiers)
| Cấp Độ | Danh Hiệu | Điểm XP Yêu Cầu |
| :--- | :--- | :--- |
| **Lv 1** | Tập Sự SHOPDEE | 0 XP |
| **Lv 2** | Newbie Chốt Đơn | 100 XP |
| **Lv 3** | Tín Đồ Shopping | 250 XP |
| **Lv 4** | Thợ Săn Deal | 500 XP |
| **Lv 5** | Fashionista | 900 XP |
| **Lv 6** | Trendsetter | 1,400 XP |
| **Lv 7** | Bậc Thầy Chốt Đơn | 2,000 XP |
| **Lv 8** | Chiến Thần Mua Sắm | 2,800 XP |
| **Lv 9** | Đại Gia Ảo | 3,800 XP |
| **Lv 10** | VIP Huyền Thoại | 5,000+ XP |

- **Hệ Thống 7 Huy Hiệu Độc Quyền:** *Đại Gia SHOPDEE, Thợ Săn Deal, Tay Chơi Đêm, Tín Đồ Review, Chiến Thần Khoe Đơn, Đơn Hàng Đầu Tiên, Khách Quen 7 Ngày*.
- **Nhiệm Vụ Hàng Ngày (Daily Quests):** Xem 5 sản phẩm (+30 XP), Áp voucher chốt đơn (+60 XP), Khoe đơn lên Story (+50 XP).

### 4. 🚀 Lan Tỏa Xã Hội — Khoe Đơn Triệu View ("Bragging" Cards)
- **Tạo Card Khoe Đơn Tự Động:** Chuyển đổi đơn hàng thành thẻ đồ họa đẹp mắt hiển thị danh hiệu, tổng tiết kiệm và danh sách món đồ.
- **Chia Sẻ 1 Chạm:** Tạo đường dẫn công khai `/share/order/[shareId]` với bộ đếm lượt xem và tích hợp nút chia sẻ lên Facebook, Zalo, Story.

### 5. 👑 Bảng Điều Khiển Quản Trị Toàn Diện (Admin Dashboard)
- **Báo Cáo Tổng Quan (KPIs):** Doanh thu ảo (Virtual GMV), Tổng số đơn, Tỷ lệ chuyển đổi (Conversion Rate), Tỷ lệ bỏ giỏ (Cart Abandonment Rate), Lượt khoe đơn.
- **Biểu Đồ Phễu Mua Sắm (5-Step Funnel):** Đo lường từ Khám phá → Thêm giỏ → Bắt đầu Checkout → Chốt đơn → Khoe đơn.
- **Quản Lý Sản Phẩm (CRUD):** Thêm mới, chỉnh sửa giá, số lượng tồn kho, kích hoạt Flash Sale tức thì.
- **Quản Lý Đơn Hàng:** Chuyển đổi trạng thái mô phỏng (`PLACED` → `CONFIRMED` → `PREPARING` → `READY_FOR_SIMULATED_DELIVERY` → `COMPLETED`) kèm thông báo tự động cho khách.
- **Quản Lý Người Dùng:** Phân quyền Admin, Khóa/Mở khóa tài khoản, Reset XP, Điều chỉnh số dư ví ảo.
- **Quản Lý Voucher & Nhiệm Vụ:** Tạo mã giảm giá %, giảm tiền cố định và quản lý phần thưởng nhiệm vụ.

---

## 🏗️ Kiến Trúc Hệ Thống (System Architecture)

```
                       ┌───────────────────────────────┐
                       │     CLIENT (Browser / App)    │
                       │ Next.js 15 + React 19 + State │
                       └───────────────┬───────────────┘
                                       │ HTTP / JSON
                                       ▼
                       ┌───────────────────────────────┐
                       │       NEXT.JS API ROUTES      │
                       │   (Serverless Edge & Node)    │
                       └───────┬───────────────┬───────┘
                               │               │
            ┌──────────────────┴──┐         ┌──┴──────────────────┐
            │   Core Services     │         │ Security & Helpers  │
            ├─────────────────────┤         ├─────────────────────┤
            │ • PaymentService    │         │ • Price Protection  │
            │ • GamificationEngine│         │ • Auth & JWT Session│
            │ • Recommendation    │         │ • Zod Validation    │
            │ • AnalyticsService  │         └─────────────────────┘
            └──────────┬──────────┘
                       │ Mongoose ODM
                       ▼
         ┌───────────────────────────┐
         │     MONGODB DATABASE      │
         │ (Products, Orders, Users, │
         │  Vouchers, Badges, Quests)│
         └───────────────────────────┘
```

---

## ⚡ Hướng Dẫn Cài Đặt & Chạy Ứng Dụng (Quick Start)

### Yêu Cầu Môi Trường
- **Node.js:** v18.18+ hoặc v20+
- **MongoDB:** v6.0+ (Khuyên dùng local MongoDB chạy cổng `27017`)
- **Package Manager:** npm hoặc pnpm

### 1. Cài đặt Dependencies
```bash
cd "D:\12 - Code\EcomFinal"
npm install
```

### 2. Cấu hình File Môi Trường (`.env`)
File `.env` đã được cấu hình sẵn sàng:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/shopdee
JWT_SECRET=shopdee_super_secret_jwt_key_2026_genz_shopdee
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Khởi Chạy Database & Seed Dữ Liệu Mẫu
Chạy script seed tự động nạp 10 danh mục, 106 sản phẩm hot trend, 5 voucher, 7 huy hiệu, 10 thử thách và tài khoản demo:
```bash
npm run seed
```

### 4. Chạy Bộ Kiểm Thử Tự Động (Automated Test Suite)
Chạy bộ 37 bài kiểm thử tích hợp kiểm tra toàn bộ logic tính giá server-side, voucher, gamification và ví ảo:
```bash
npm test
```

### 5. Khởi Chạy Máy Chủ Phát Triển (Development Server)
```bash
npm run dev
```
Truy cập ứng dụng tại: **[http://localhost:3000](http://localhost:3000)**

---

## 🔑 Tài Khoản Trải Nghiệm Demo (Demo Credentials)

| Vai Trò | Email Đăng Nhập | Mật Khẩu | Đặc Quyền |
| :--- | :--- | :--- | :--- |
| **Quản Trị Viên (Admin)** | `admin@shopdee.local` | `ChangeMe123!` | Truy cập toàn bộ `/admin` Dashboard, quản lý kho, duyệt đơn, tạo voucher |
| **Người Dùng Mẫu (Demo User)**| `user@shopdee.local` | `User123!` | 5.000.000₫ Ví SHOPDEE, Level 3 (Tín Đồ Shopping), 4 huy hiệu |

> **Mẹo:** Trên trang Đăng nhập (`/login`), có sẵn **2 nút 1-click** để tự động điền tài khoản Admin và Demo User mà không cần nhập tay!

---

## 📁 Cấu Trúc Thư Mục Dự Án (Project Structure)

```
EcomFinal/
├── scripts/
│   ├── seed.mjs                 # Script nạp 106 sản phẩm, voucher, nhiệm vụ, tài khoản
│   └── test-runner.mjs          # Bộ kiểm thử tích hợp 37 test cases tự động
├── src/
│   ├── app/
│   │   ├── (auth)/login & register
│   │   ├── admin/               # Admin Dashboard (Overview, Products, Orders, Users, Vouchers, Challenges, Analytics)
│   │   ├── api/                 # 25+ RESTful API Endpoints (Auth, Cart, Orders, Payment, Stats...)
│   │   ├── cart & checkout/     # Luồng giỏ hàng và thanh toán mô phỏng
│   │   ├── orders/ & order/     # Theo dõi vận đơn thời gian thực & màn hình chúc mừng
│   │   ├── products/ & category/# Danh mục sản phẩm & bộ lọc đa chiều
│   │   ├── profile & rewards/   # Cấp độ danh vọng, huy hiệu, ví ảo & điểm danh hàng ngày
│   │   ├── share/order/         # Trang Khoe Đơn lan tỏa xã hội công khai
│   │   └── simulation/about...  # Trang minh bạch cơ chế mô phỏng & điều khoản
│   ├── components/              # 15+ Reusable UI Components (Navbar, CartDrawer, Modals, Cards...)
│   ├── lib/                     # Database client, auth JWT, gamification logic, utils
│   ├── models/                  # 12 Mongoose Data Models
│   ├── services/                # PaymentService, AnalyticsService, RecommendationService
│   └── store/                   # Zustand stores (useAuthStore, useCartStore, useToastStore...)
└── README.md
```

---

## 🔒 Cam Kết Bảo Mật & Minh Bạch (Transparency & Security)

1. **Không Thu Thập Thẻ Thật:** Không yêu cầu số thẻ ngân hàng, tài khoản thanh toán hay thông tin tài chính nhạy cảm.
2. **Server Price Calculation:** Bất kỳ giá trị đơn hàng nào bị can thiệp ở phía client đều bị server bác bỏ và ghi đè bằng đơn giá thực tế từ Database.
3. **Mô Phỏng Rõ Ràng:** Mọi giao diện đều có thông báo minh bạch rằng sản phẩm và giao dịch mang tính chất trải nghiệm ảo giải trí.

---
*Phát triển với niềm đam mê dành cho thế hệ Gen Z Việt Nam ❤️*
