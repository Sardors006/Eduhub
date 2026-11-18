# EduHub — Zamonaviy Onlayn Ta’lim Platformasi

**EduHub** — Node.js (Express + MongoDB) backend hamda Next.js (App Router, sof JavaScript + Tailwind CSS) frontend qismlaridan iborat to‘liq o‘zbek tilidagi ta’lim platformasi.

## Tuzilishi

```text
eduhub/
├── backend/   # Express REST API, JWT + HttpOnly Refresh Cookie, RBAC, Rate Limiting (http://localhost:5000)
└── frontend/  # Next.js 15 (JavaScript), Tailwind CSS, Axios Silent Refresh Interceptors (http://localhost:3000)
```

## Asosiy imkoniyatlar

- **Xavfsiz ro‘yxatdan o‘tish va 6 xonali OTP tasdiqlash** (`POST /auth/register`, `POST /auth/verify`, `POST /auth/resend-code`)
- **JWT + HttpOnly Refresh Cookie sessiya boshqaruvi** (`15m` Access Token xotirada + `7d` Refresh Token HttpOnly kukida, `POST /auth/refresh`, `POST /auth/logout`)
- **Avtomatik Silent Token Refresh** — Axios interceptor 401 javobini ushlab, foydalanuvchiga sezdirmasdan yangi token oladi va so‘rovni qayta yuboradi
- **Xavfsizlik himoyalari** — `helmet`, qat’iy `cors`, kirish uchun 1 daqiqada 5 ta so‘rov cheklovi (`HTTP 429`), global rate-limit va `express-slow-down`
- **Rolga asoslangan kirish (RBAC)** — oddiy foydalanuvchi profili (`GET /profile`) va faqat administratorlar uchun boshqaruv paneli (`GET /admin/dashboard`)
- **Kurslar katalogi va CRUD studiyasi** — ommaviy qidiruv/filtr (`GET /courses`) hamda administratorlar uchun kurs yaratish, tahrirlash va o‘chirish (`POST`, `PUT`, `DELETE /courses`)

## Ishga tushirish

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
npm run seed
npm run dev
```

### 2. Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```

Brauzerda oching: `http://localhost:3000`

### Sinov hisoblari
- **Administrator:** `admin@eduhub.com` / `Admin123!`
- **Foydalanuvchi:** `student@eduhub.com` / `Student123!`
