# ☕ YShop Drink — سیستم مدیریت چندمستاجری کافه و رستوران

<div dir="rtl">

یک پلتفرم SaaS کامل برای مدیریت کافه، رستوران و فست‌فود با پشتیبانی از چندمستاجری (multi-tenant). این پروژه بر اساس معماری پروژه متن‌باز [yshop-drink](https://github.com/guchengwuyue/yshop-drink) طراحی شده و با Next.js 16 پیاده‌سازی شده است.

## ✨ ویژگی‌های اصلی

### 🏢 معماری Multi-Tenant (چندمستاجری)
- پشتیبانی کامل از چند tenant (مستاجر) روی یک پلتفرم
- ایزولاسیون کامل داده‌های هر tenant
- هر tenant می‌تواند چندین شعبه داشته باشد
- پلن‌های SaaS (پایه / حرفه‌ای / سازمانی)
- مدیریت کامل tenantها توسط super-admin

### 📊 داشبورد مدیریتی
- نمودار روند درآمد روزانه (۳۰ روز گذشته)
- تفکیک نوع سفارش (داخل سالن / بیرون‌بر / تحویل حضوری)
- پرفروش‌ترین محصولات
- تفکیک روش‌های پرداخت
- کارت‌های آماری خلاصه

### 🛒 مدیریت سفارشات
- سه نوع سفارش: dinein / takeout / pickup
- workflow کامل: پرداخت → آماده‌سازی → تکمیل
- فیلتر بر اساس وضعیت و نوع سفارش
- مودال جزئیات با اطلاعات کامل
- کد تأیید (verify code) و شماره تحویل (pickup number)

### 🍔 مدیریت منو و محصولات
- دسته‌بندی محصولات
- برچسب‌های محصول (داغ / جدید / برتر / پیشنهاد ویژه)
- مدیریت قیمت، هزینه، موجودی
- ویرایشگر کامل محصول
- **👁️ پیش‌نمایش منو از دید مشتری** — شبیه‌ساز موبایل

### 🏪 مدیریت شعب
- اطلاعات کامل شعبه (آدرس، lat/lng، ساعت کاری)
- شعاع ارسال، حداقل سفارش، هزینه ارسال
- اعلامیه شعبه
- **آمار تفصیلی هر شعبه** (نمودار ۱۴ روزه، تفکیک نوع/وضعیت سفارش)
- **QR کد منوی شعبه** با امکان دانلود

### 🪑 مدیریت میزها
- ۳ وضعیت: آزاد / اشغال / رزرو شده
- گروه‌بندی بر اساس شعبه
- QR کد اختصاصی هر میز

### 👥 مدیریت مشتریان
- موجودی حساب، امتیاز (integral)
- سطح VIP
- تاریخچه عضویت

### 🎫 مدیریت کوپن‌ها
- ۳ نوع کوپن: عمومی / تحویل حضوری / بیرون‌بر
- حداقل سفارش و مبلغ تخفیف
- نرخ دریافت

### 📈 گزارش‌ها و تحلیل
- KPIها (میانگین ارزش سفارش، نرخ تکمیل، نرخ لغو، رشد هفتگی)
- نمودار روند درآمد و سفارش
- ۱۰ محصول برتر
- بازه‌های قابل تنظیم (۷/۱۴/۳۰ روز)

### 🛠️ مدیریت Tenantها (Super Admin)
- **جستجوی پیشرفته** (نام، مخاطب، تلفن، دامنه)
- **فیلتر وضعیت** (همه / فعال / غیرفعال / منقضی)
- **مرتب‌سازی** (تاریخ ایجاد، نام، درآمد، سفارش‌ها، شعب، انقضا)
- **دو حالت نمایش** Grid و List
- **ایجاد tenant جدید** با داده‌های نمونه
- **ویرایش کامل** tenant
- **تمدید حساب** (بر اساس روز یا تاریخ مشخص)
- **بک‌آپ‌گیری** (دانلود JSON کامل)
- **بازیابی** از بک‌آپ (جایگزینی یا ادغام)
- **فعال/غیرفعال کردن** tenant
- **حذف کامل** tenant با تمام داده‌های مربوطه

### 🎨 ویژگی‌های فنی
- پشتیبانی کامل RTL و اعداد فارسی
- حالت تاریک/روشن (Dark/Light)
- طراحی Responsive
- اعتبارسنجی فرم‌ها
- اعلان‌های Toast

## 🛠 تکنولوژی‌ها

| لایه | تکنولوژی |
|------|----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Database | Prisma ORM + SQLite |
| Charts | Recharts |
| State | Zustand |
| Icons | Lucide React |
| QR Code | qrcode.react |

## 📦 نصب و راه‌اندازی

### پیش‌نیازها
- Node.js 18+ 
- Bun (پیشنهادی) یا npm/yarn/pnpm

### مراحل نصب

```bash
# 1. استخراج فایل ZIP
unzip yshop-drink.zip
cd yshop-drink

# 2. نصب وابستگی‌ها
bun install
# یا
npm install

# 3. کپی فایل env
cp .env.example .env

# 4. راه‌اندازی دیتابیس
bun run db:push
# یا
npx prisma db push --accept-data-loss

# 5. اجرای اسکریپت seed (داده‌های نمونه)
bun run seed
# یا
npx tsx scripts/seed.ts

# 6. اجرای سرور توسعه
bun run dev
# یا
npm run dev
```

سپس به آدرس `http://localhost:3000` بروید.

### حساب‌های پیش‌فرض

پس از اجرای seed، ۳ tenant نمونه ایجاد می‌شود:
- **گروه کافه‌های تهران** (۳ شعبه، ۲۰ محصول)
- **رستوران‌های زنجیره‌ای شیلا** (۲ شعبه، ۱۶ محصول)
- **کافه آرت‌هاوس** (۱ شعبه، ۸ محصول)

## 🚀 اجرای Production

```bash
# Build
bun run build

# Start
bun run start
```

## 📁 ساختار پروژه

```
yshop-drink/
├── prisma/
│   └── schema.prisma          # مدل‌های دیتابیس (11 مدل)
├── scripts/
│   └── seed.ts                # اسکریپت داده‌های نمونه
├── src/
│   ├── app/
│   │   ├── api/               # API routes (10 endpoint)
│   │   │   ├── dashboard/
│   │   │   ├── orders/
│   │   │   ├── products/
│   │   │   ├── stores/
│   │   │   │   └── [id]/
│   │   │   │       └── stats/
│   │   │   ├── tables/
│   │   │   ├── customers/
│   │   │   ├── coupons/
│   │   │   ├── tenants/
│   │   │   │   └── [id]/
│   │   │   │       ├── backup/
│   │   │   │       ├── restore/
│   │   │   │       └── seed/
│   │   │   └── users/
│   │   ├── layout.tsx
│   │   └── page.tsx           # صفحه اصلی (SPA)
│   ├── components/
│   │   ├── app/
│   │   │   ├── sidebar.tsx
│   │   │   ├── topbar.tsx
│   │   │   └── tenant-selector.tsx
│   │   ├── modules/
│   │   │   ├── dashboard.tsx
│   │   │   ├── orders.tsx
│   │   │   ├── menu.tsx
│   │   │   ├── stores.tsx
│   │   │   ├── tables.tsx
│   │   │   ├── customers.tsx
│   │   │   ├── coupons.tsx
│   │   │   ├── reports.tsx
│   │   │   ├── tenants.tsx
│   │   │   ├── settings.tsx
│   │   │   └── customer-menu-preview.tsx
│   │   └── ui/                # کامپوننت‌های shadcn/ui
│   └── lib/
│       ├── db.ts              # Prisma client
│       ├── format.ts          # فرمت‌بندی فارسی
│       ├── store.ts           # Zustand store
│       └── utils.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── prisma/schema.prisma
└── README.md
```

## 🗄 مدل‌های دیتابیس

| مدل | توضیح |
|-----|--------|
| Tenant | مستاجر پلتفرم (کافه/رستوران) |
| TenantPackage | پلن SaaS (پایه/حرفه‌ای/سازمانی) |
| User | کاربران پنل مدیریت هر tenant |
| Store | شعب هر tenant |
| RestaurantTable | میزهای هر شعبه |
| Category | دسته‌بندی محصولات |
| Product | محصولات منو |
| Order | سفارشات |
| OrderItem | اقلام هر سفارش |
| Customer | مشتریان نهایی |
| Coupon | کوپن‌های تخفیف |

## 📋 API Endpoints

| Method | Endpoint | توضیح |
|--------|----------|--------|
| GET | `/api/dashboard` | آمار داشبورد |
| GET | `/api/orders` | لیست سفارشات |
| PATCH | `/api/orders` | به‌روزرسانی وضعیت سفارش |
| GET/POST/PATCH/DELETE | `/api/products` | CRUD محصولات |
| GET/POST/PATCH/DELETE | `/api/stores` | CRUD شعب |
| GET | `/api/stores/[id]/stats` | آمار تفصیلی شعبه |
| GET/POST/PATCH/DELETE | `/api/tables` | CRUD میزها |
| GET | `/api/customers` | لیست مشتریان |
| GET | `/api/coupons` | لیست کوپن‌ها |
| GET/POST/PATCH/DELETE | `/api/tenants` | CRUD tenantها (Super Admin) |
| GET | `/api/tenants/[id]/backup` | بک‌آپ tenant |
| POST | `/api/tenants/[id]/restore` | بازیابی tenant |
| POST | `/api/tenants/[id]/seed` | ایجاد داده‌های نمونه |
| GET | `/api/users` | لیست کاربران |

## 🔐 نکات امنیتی

⚠️ **هشدار:** این یک نسخه دمو است و برای production نیاز به موارد زیر دارد:

- احراز هویت واقعی (NextAuth.js)
- رمزنگاری passwords (bcrypt)
- اعتبارسنجی ورودی‌ها (zod)
- محدودیت rate-limiting
- HTTPS و امنیت headers
- پشتیبان‌گیری منظم دیتابیس
- استفاده از PostgreSQL به جای SQLite

## 📜 لایسنس

MIT License — بر اساس پروژه متن‌باز [yshop-drink](https://github.com/guchengwuyue/yshop-drink)

## 🤝 مشارکت

Pull Request ها welcomed است!

---

ساخته شده با ❤️ بر اساس معماری yshop-drink

</div>
