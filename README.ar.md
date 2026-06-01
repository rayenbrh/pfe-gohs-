# Inova Ride — دليل التثبيت والتشغيل

> منصة حجز وتأجير السيارات — واجهة أمامية (Next.js) + خادم API (Express + MongoDB)

---

## المحتويات

1. [المتطلبات](#المتطلبات)
2. [هيكل المشروع](#هيكل-المشروع)
3. [التثبيت](#التثبيت)
4. [إعداد المتغيرات البيئية](#إعداد-المتغيرات-البيئية)
5. [تشغيل MongoDB](#تشغيل-mongodb)
6. [تهيئة قاعدة البيانات (Seed)](#تهيئة-قاعدة-البيانات-seed)
7. [تشغيل المشروع](#تشغيل-المشروع)
8. [الروابط الافتراضية](#الروابط-الافتراضية)
9. [حسابات الدخول الافتراضية](#حسابات-الدخول-الافتراضية)
10. [أوامر مفيدة](#أوامر-مفيدة)
11. [حل المشاكل الشائعة](#حل-المشاكل-الشائعة)

---

## المتطلبات

قبل البدء، تأكد من تثبيت البرامج التالية على جهازك:

| البرنامج | الإصدار المطلوب | الرابط |
|----------|-----------------|--------|
| **Node.js** | 20 أو أحدث | https://nodejs.org |
| **npm** | يأتي مع Node.js | — |
| **MongoDB** | 6 أو أحدث (محلي أو Atlas) | https://www.mongodb.com |

للتحقق من الإصدارات:

```bash
node -v
npm -v
```

---

## هيكل المشروع

```
pfe-gohs-/
├── frontend/          # تطبيق Next.js 14 (الواجهة)
├── backend/           # خادم Express + MongoDB (API)
├── package.json       # أوامر المشروع الرئيسية (monorepo)
└── README.ar.md       # هذا الملف
```

---

## التثبيت

### 1. استنساخ المستودع

```bash
git clone <رابط-المستودع>
cd pfe-gohs-
```

### 2. تثبيت جميع الحزم

من **المجلد الجذري** للمشروع، نفّذ:

```bash
npm install
```

> هذا الأمر يثبّت حزم **frontend** و **backend** معاً (npm workspaces).

---

## إعداد المتغيرات البيئية

### الخادم الخلفي (Backend)

1. انسخ ملف المثال:

```bash
cp backend/.env.example backend/.env
```

2. عدّل الملف `backend/.env` حسب بيئتك. **الحد الأدنى للتشغيل المحلي:**

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
API_URL=http://localhost:5000

MONGODB_URI=mongodb://localhost:27017/inova-ride

JWT_SECRET=ضع_هنا_سراً_عشوائياً_طويلاً_64_حرفاً_على_الأقل
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=سر_تحديث_منفصل_طويل
JWT_REFRESH_EXPIRES_IN=30d
```

> **ملاحظة:** Cloudinary و SMTP و Konnect اختيارية للتطوير المحلي. يمكن تركها فارغة.

### الواجهة الأمامية (Frontend)

أنشئ أو تحقق من وجود الملف `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_TELEMETRY_DISABLED=1
```

---

## تشغيل MongoDB

### خيار أ — MongoDB محلي

```bash
# Windows (إذا كان MongoDB مثبتاً كخدمة)
net start MongoDB

# macOS (Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### خيار ب — MongoDB Atlas (سحابي)

1. أنشئ cluster مجاني على https://cloud.mongodb.com
2. انسخ رابط الاتصال (Connection String)
3. ضعه في `MONGODB_URI` داخل `backend/.env`:

```env
MONGODB_URI=mongodb+srv://المستخدم:كلمة_المرور@cluster.mongodb.net/inova-ride
```

---

## تهيئة قاعدة البيانات (Seed)

يُنشئ سكربت التهيئة **بيئة تجريبية كاملة** — حسابات، وكالة، أسطول، عملاء، حجوزات، فواتير وعقود.

> **تأكد أن MongoDB يعمل** قبل تنفيذ الأمر.

### التهيئة الأولى (آمنة — لا يحذف البيانات الموجودة)

```bash
npm run seed
```

### إعادة التهيئة من الصفر (يحذف بيانات الوكالة ويعيد إنشاءها)

```bash
npm run seed:fresh
```

### ما الذي يُنشأ؟

| العنصر | العدد | التفاصيل |
|--------|-------|----------|
| Super Admin | 1 | قاعدة البيانات الرئيسية |
| وكالة | 1 | Inova Ride Tunisie (`inova-ride`) |
| موظفون | 3 | مدير + 2 موظفين |
| عملاء | 10 | بيانات تونسية/دولية واقعية |
| مركبات | 16 | VW, Skoda, Seat, Hyundai i20, Toyota Hilux, utilitaires |
| سجلات صيانة | ~47 | تاريخ صيانة لكل مركبة |
| حجوزات | 27 | مكتملة، نشطة، قادمة، ملغاة |
| فواتير + عقود | 20 | للحجوزات المكتملة |

### حسابات الدخول بعد التهيئة

| الدور | البريد | كلمة المرور | رابط الدخول |
|-------|--------|-------------|-------------|
| Super Admin | `superadmin@inovaride.com` | `SuperAdmin123!` | `/api/superadmin/auth/login` |
| مدير الوكالة | `admin@inovaride.com` | `Admin123!` | `/fr/agency/inova-ride/auth/login` |
| موظف | `agent@inovaride.com` | `Agent123!` | `/fr/agency/inova-ride/auth/login` |
| عميل (مثال) | `mohamed.gharbi@gmail.com` | `Client123!` | `/fr/agency/inova-ride/auth/register` |

### الأسطول المُهيّأ

- **Volkswagen** : Polo, Golf, Passat, Tiguan
- **Skoda** : Fabia, Octavia, Superb
- **Seat** : Ibiza, Leon, Ateca
- **Hyundai** : i20
- **Toyota** : Hilux Double Cab
- **Utilitaires** : Mercedes Sprinter, Ford Transit, Renault Master, Peugeot Boxer

### تخصيص بيانات التهيئة (اختياري)

```env
SA_EMAIL=superadmin@inovaride.com
SA_PASSWORD=SuperAdmin123!
SEED_FRESH=true
```

---

## تشغيل المشروع

### تشغيل الواجهة والخادم معاً (موصى به)

من المجلد الجذري:

```bash
npm run dev
```

| الخدمة | الرابط |
|--------|--------|
| الواجهة الأمامية | http://localhost:3000 |
| API الخلفي | http://localhost:5000 |
| توثيق Swagger | http://localhost:5000/api-docs |

### تشغيل كل جزء على حدة

```bash
# الخادم الخلفي فقط
npm run dev:backend

# الواجهة الأمامية فقط
npm run dev:frontend
```

### بناء المشروع للإنتاج

```bash
npm run build
```

ثم:

```bash
# تشغيل الخادم الخلفي
npm run start -w backend

# تشغيل الواجهة الأمامية
npm run start -w frontend
```

---

## الروابط الافتراضية

| الصفحة | الرابط |
|--------|--------|
| الصفحة الرئيسية | http://localhost:3000/ar/landing |
| أسطول السيارات | http://localhost:3000/ar/fleet |
| الحجز | http://localhost:3000/ar/booking |
| تسجيل الدخول (Admin) | http://localhost:3000/ar/auth/login |
| لوحة التحكم | http://localhost:3000/ar/admin/dashboard |

> يدعم المشروع العربية (`/ar`) والفرنسية (`/fr`) والإنجليزية (`/en`).

---

## حسابات الدخول الافتراضية

بعد `npm run seed` أو `npm run seed:fresh` — راجع قسم التهيئة أعلاه للقائمة الكاملة.

| الدور | البريد | كلمة المرور |
|-------|--------|-------------|
| Super Admin | `superadmin@inovaride.com` | `SuperAdmin123!` |
| مدير الوكالة | `admin@inovaride.com` | `Admin123!` |
| موظف | `agent@inovaride.com` | `Agent123!` |
| عميل | `mohamed.gharbi@gmail.com` | `Client123!` |

> **تحذير:** غيّر كلمات المرور في بيئة الإنتاج ولا تستخدم هذه القيم الافتراضية.

---

## أوامر مفيدة

| الأمر | الوصف |
|-------|--------|
| `npm run dev` | تشغيل frontend + backend معاً |
| `npm run seed` | تهيئة حسابات الموظفين |
| `npm run build` | بناء المشروع بالكامل |
| `npm run type-check` | فحص أنواع TypeScript |
| `npm run dev:backend` | تشغيل API فقط |
| `npm run dev:frontend` | تشغيل Next.js فقط |

### أوامر اختبار الخادم الخلفي (اختياري)

```bash
npm run test:auth -w backend
npm run test:vehicles -w backend
npm run test:reservations -w backend
```

---

## حل المشاكل الشائعة

### ❌ `EADDRINUSE` — المنفذ 3000 أو 5000 مستخدم

```bash
# Windows — إيقاف العملية على المنفذ 3000
netstat -ano | findstr :3000
taskkill /PID <رقم_العملية> /F

# أو غيّر المنفذ في frontend/package.json
```

### ❌ فشل الاتصال بـ MongoDB

- تأكد أن MongoDB يعمل: `mongosh` أو MongoDB Compass
- تحقق من صحة `MONGODB_URI` في `backend/.env`
- إذا استخدمت Atlas، أضف IP جهازك إلى قائمة السماح (Network Access)

### ❌ الواجهة لا تتصل بالـ API

- تحقق من `NEXT_PUBLIC_API_URL=http://localhost:5000` في `frontend/.env.local`
- تأكد أن الخادم الخلفي يعمل على المنفذ 5000
- تحقق من `FRONTEND_URL=http://localhost:3000` في `backend/.env`

### ❌ خطأ `tslib` أو `nprogress` مع Turbopack

```bash
cd frontend
npm run postinstall
```

أو أعد التثبيت من الجذر:

```bash
npm install
```

### ❌ `npm run seed` يفشل

1. MongoDB غير مشغّل → شغّل MongoDB أولاً
2. `MONGODB_URI` خاطئ → راجع ملف `.env`
3. خطأ في JWT_SECRET → تأكد أنه موجود وطويل بما فيه الكفاية

---

## ملخص سريع (Quick Start)

```bash
# 1. تثبيت الحزم
npm install

# 2. إعداد البيئة
cp backend/.env.example backend/.env
# عدّل backend/.env و frontend/.env.local

# 3. تشغيل MongoDB (محلي أو Atlas)

# 4. تهيئة قاعدة البيانات
npm run seed

# 5. تشغيل المشروع
npm run dev
```

ثم افتح: **http://localhost:3000/ar/landing**

---

## الدعم

للمزيد من التفاصيل التقنية، راجع:

- `backend/.env.example` — جميع متغيرات البيئة
- `backend/src/scripts/seed.ts` — منطق التهيئة
- http://localhost:5000/api-docs — توثيق API (Swagger)

---

**Inova Ride** — مشروع PFE · Node.js · Next.js · MongoDB
