# راهنمای نصب YShop Drink

<div dir="rtl">

## پیش‌نیازها

برای اجرای این پروژه به موارد زیر نیاز دارید:

- **Node.js** نسخه 18 یا بالاتر ([دانلود](https://nodejs.org/))
- **Bun** (پیشنهادی) یا npm/yarn/pnpm
- سیستم‌عامل: Windows, macOS یا Linux

## روش ۱: نصب با Bun (پیشنهادی)

```bash
# 1. استخراج فایل ZIP
unzip yshop-drink.zip
cd yshop-drink

# 2. نصب Bun (اگر ندارید)
curl -fsSL https://bun.sh/install | bash

# 3. نصب وابستگی‌ها
bun install

# 4. راه‌اندازی دیتابیس
bun run db:push

# 5. ایجاد داده‌های نمونه
bun run seed

# 6. اجرای پروژه
bun run dev
```

## روش ۲: نصب با npm

```bash
# 1. استخراج فایل ZIP
unzip yshop-drink.zip
cd yshop-drink

# 2. نصب وابستگی‌ها
npm install

# 3. راه‌اندازی دیتابیس
npx prisma db push --accept-data-loss

# 4. ایجاد داده‌های نمونه
npx tsx scripts/seed.ts

# 5. اجرای پروژه
npm run dev
```

## روش ۳: نصب سریع (با اسکریپت setup)

```bash
# در Linux/macOS
unzip yshop-drink.zip
cd yshop-drink
bash scripts/setup.sh
bun run dev
```

## دسترسی به پروژه

پس از اجرای سرور توسعه، به آدرس زیر بروید:

```
http://localhost:3000
```

## داده‌های نمونه

پس از اجرای اسکریپت seed، ۴ tenant نمونه ایجاد می‌شود:

| Tenant | شعب | محصولات |
|--------|-----|---------|
| گروه کافه‌های تهران | ۳ | ۲۰ |
| رستوران‌های زنجیره‌ای شیلا | ۲ | ۱۶ |
| کافه آرت‌هاوس | ۱ | ۸ |

هر tenant شامل:
- ۸ میز در هر شعبه
- ۱۲ مشتری نمونه
- ~۳۰۰ سفارش در ۳۰ روز گذشته
- ۱-۲ کوپن تخفیف

## اجرای Production

برای production:

```bash
# Build پروژه
bun run build

# اجرای production
bun run start
```

⚠️ **توجه:** برای production حتماً:
- دیتابیس را به PostgreSQL یا MySQL تغییر دهید
- فایل `.env` را با مقادیر واقعی پر کنید
- احراز هویت واقعی اضافه کنید
- HTTPS فعال کنید

## تغییر دیتابیس به PostgreSQL

1. فایل `prisma/schema.prisma` را ویرایش کنید:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. فایل `.env` را ویرایش کنید:

```
DATABASE_URL="postgresql://user:password@localhost:5432/yshop_drink?schema=public"
```

3. دستورات زیر را اجرا کنید:

```bash
bun run db:push
bun run seed
```

## خطاهای متداول

### خطای "Cannot find module '@prisma/client'"

```bash
bun run db:generate
```

### خطای "DATABASE_URL must be set"

فایل `.env` را از روی `.env.example` کپی کنید:

```bash
cp .env.example .env
```

### خطای "Port 3000 is already in use"

```bash
# با پورت دیگر اجرا کنید
bun run dev -- -p 3001
```

## پشتیبانی

اگر مشکلی پیش آمد:
1. لاگ سرور را بررسی کنید (`dev.log`)
2. مطمئن شوید Node.js 18+ نصب است
3. `node_modules` و `.next` را حذف و دوباره نصب کنید

</div>
