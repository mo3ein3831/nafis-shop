# نفیس — فروشگاه کالای خواب گلپایگان 🛏️

## 🚀 راه‌اندازی سریع

```bash
git clone https://github.com/mo3ein3831/nafis-shop.git
cd "nafis-shop/premium-bedding-e-commerce-storefront(7)"
npm install
cp .env.example .env   # ← مقادیر واقعی رو توی .env بنویس
npx drizzle-kit push
npm run dev
```

حالا برو `http://localhost:3000`

---

## 🔐 متغیرهای محیطی (.env)

DATABASE_URL  = آدرس PostgreSQL
JWT_SECRET    = یه رشته تصادفی طولانی
ADMIN_USERNAME / ADMIN_PASSWORD = لاگین پنل ادمین
NEXT_PUBLIC_SITE_URL = http://localhost:3000

## 👑 پنل ادمین
`http://localhost:3000/admin`

بعد از اولین ران → `http://localhost:3000/api/seed` برای لود دیتای دمو

## 📊 آمار
۱۱ صفحه | ۱۵ API | ۱۵ کامپوننت | ۵۸ فایل TS | ۰ خطا
