# وثائق عرض نوفا لاكشري فيرنيشينجز

هذا المستند هو مرجع شامل لعرض شرائح الـ PowerPoint خاص بمشروع النوفا - كل شريحة موثقة بشكل متسق وكامل.

---

## بنية المستند

كل قسم يتبع نفس الصيغة للاتساق:
1. **ما هو؟** - شرح واضح للمفهوم
2. **أين يقع في الكود؟** - مسارات الملفات والمواقع الدقيقة
3. **لماذا يهم؟** - القيمة التجارية والتقنية
4. **مثال الكود** - كود حقيقي يعمل

---

## 1. شريحة العنوان

**ما هو؟** تطبيق تجارة إلكترونية متكامل (Full-Stack) لشراء الأثاث الفاخر، مبني باستخدام Node.js في الخلفية و React/TypeScript في الواجهة الأمامية.

**أين يقع في الكود؟**
- نظرة عامة على المشروع: [README.md](README.md)، [package.json](package.json)
- نقطة دخول الخلفية: [backend/index.js](backend/index.js)
- تحميل المسارات: [backend/src/modules/index.routes.js](backend/src/modules/index.routes.js)

**لماذا يهم؟** يجهز الحضور للعرض: يوضح ما سيتم عرضه والتقنيات المستخدمة في المشروع.

---

## 2. واجهة برمجة التطبيقات (REST API)

**ما هو؟** واجهة تقدم نقاط نهاية (Endpoints) للموارد (المنتجات، المستخدمون، الطلبات) باستخدام الفعل HTTP القياسي.

**أين يقع في الكود؟**
- وحدات المسارات: [backend/src/modules/*/*.routes.js](backend/src/modules)
- مثال مسارات المنتجات: [backend/src/modules/product/product.routes.js](backend/src/modules/product/product.routes.js)

**لماذا يهم؟** يجعل السلوك موجهاً للموارد بحيث يمكن لمطوري الواجهة الأمامية والأدوات التفاعل مع الـ API بطريقة متوقعة.

**مثال الكود:**

```js
productRouter.route('/').get(cacheResponse(60*1000), getAllProduct).post(protectedRoutes, addProduct)
```

---

## 3. أفعال HTTP

**ما هو؟** أفعال HTTP التي تصف الإجراء الذي تنوي الطلب تنفيذه: GET (قراءة)، POST (إنشاء)، PUT (تحديث)، DELETE (حذف).

**أين يقع في الكود؟**
- معرّف في كل مسار في: [backend/src/modules/product/product.routes.js](backend/src/modules/product/product.routes.js)

**لماذا يهم؟** استخدام الفعل الصحيح يجعل الـ API بديهياً ويساعد الأدوات والكاش في التعامل بشكل صحيح.

**مثال الكود:**

```js
productRouter.route('/:id')
  .get(getSingleProduct)
  .put(updateProduct)
  .delete(deleteProduct)
```

---

## 4. صيغة JSON

**ما هو؟** JSON هي صيغة البيانات المستخدمة للطلبات والردود بين الواجهة الأمامية والخلفية - قابلة للقراءة من قبل الإنسان ومستقلة عن اللغة.

**أين يقع في الكود:**

في `backend/index.js` - محلل الجسم والإعدادات:
```js
import express from 'express'
app.use(express.json())
app.use(cors())
app.use(morgan('dev'))
```

في `frontend/src/lib/api.ts` - إعداد عميل Axios:

**لماذا يهم؟** JSON يجعل التواصل بين الواجهة والخلفية بسيطاً ومتسقاً وسهل الفهم من قبل الأدوات.

**أمثلة الكود:**

إعداد عميل Axios في الواجهة الأمامية:

```ts
export const api = axios.create({
  baseURL: apiBaseURL,
  timeout: 20_000,
  headers: { "Content-Type": "application/json" },
})
```

طلب التسجيل (POST /api/v1/auth/signup):

```json
{
  "name": "محمد أحمد",
  "email": "mohammad@example.com",
  "password": "كلمة السر123"
}
```

طلب إضافة إلى السلة (POST /api/v1/cart):

```json
{
  "productId": "64a1f2e5b3c7d9a0f1e2d3c4",
  "quantity": 1
}
```

رد النجاح:

```json
{
  "status": "success",
  "cart": {
    "items": [{ "product": "64a1f2...", "quantity": 2 }],
    "total": 1799.98
  }
}
```

---

## 5. معمارية العميل-الخادم

**ما هو؟** توضح كيف يتفاعل الطرف الأمامي (عميل) والخلفي (خادم): إجراءات المستخدم في العميل تصبح طلبات API يتعامل معها الخادم.

**أين يقع في الكود:**

في `backend/index.js` - تحميل الخادم:
```js
import express from 'express'
import { dbConnection } from './database/dbConnection.js'
import { bootstrap } from './src/modules/index.routes.js'
import cors from 'cors'
import morgan from 'morgan'

const app = express()
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static('uploads'))
app.use(morgan('dev'))

bootstrap(app)
dbConnection()

app.listen(port, () => {
  console.log(`Backend API listening on http://localhost:${port}`)
})
```

في `frontend/src/lib/api.ts` - عميل الواجهة الأمامية:

**لماذا يهم؟** يفصل المسؤوليات (منطق الواجهة في العميل، البيانات والقواعد في الخادم). يحسن الأمان والاختبارية والقابلية للتوسع.

**مثال سير العملية (إضافة إلى السلة):**

طلب الواجهة الأمامية:

```ts
api.post('/api/v1/cart', { 
  productId: '64a1f2e5b3c7d9a0f1e2d3c4', 
  quantity: 1 
})
```

معالج الخادم:

```js
// backend/src/modules/cart/cart.controller.js
export const addToCart = async (req, res) => {
  // تحقق من المدخلات
  // حدّث قاعدة البيانات
  // أرسل رد JSON
}
```

---

## 6. استهلاك الـ API

**ما هو؟** كيفية استدعاء الواجهة الأمامية للخادم عبر عميل HTTP مشترك (Axios) مع إرسال توكن المصادقة تلقائياً.

**أين يقع في الكود؟**
- عميل Axios المشترك: [frontend/src/lib/api.ts](frontend/src/lib/api.ts)
- محيط الطلب: نفس الملف

**لماذا يهم؟** تجميع إعدادات الطلب والمصادقة في مكان واحد بحيث لا تكرر المكونات هذا الكود.

**مثال الكود:**

```ts
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' && 
    window.localStorage.getItem(TOKEN_KEY)
  if (token) {
    (config.headers as Record<string, string>).token = token
  }
  return config
})
```

---

## 7. المصادقة والتحقق

**ما هو؟** مصادقة قائمة على JWT مع التحقق من البريد الإلكتروني والمسارات المحمية.

**أين يقع في الكود:**

في `backend/src/modules/auth/auth.controller.js`:
```js
const issueAuthToken = (user) => 
  jwt.sign(
    { userId: user._id, role: user.role }, 
    process.env.JWT_KEY
  )
```

في `backend/src/modules/auth/auth.routes.js` - تعريف المسارات المحمية

في `backend/src/middleware/` - برمجيات المسارات المحمية

**لماذا يهم؟** يضمن أن يتمكن المستخدمون المصرح لهم فقط من الوصول إلى الـ Endpoints المحمية ويدعم تدفقات استرجاع وتحقق الحسابات.

**مثال الكود:**

```js
const issueAuthToken = (user) => 
  jwt.sign(
    { userId: user._id, role: user.role }, 
    process.env.JWT_KEY
  )
```

---

## 8. تكامل قاعدة البيانات

**ما هو؟** استخدام MongoDB مع Mongoose لتخزين والتحقق من البيانات (المستخدمون، المنتجات، الطلبات، السلات) مع التحقق على مستوى المخطط.

**أين يقع في الكود:**

في `backend/database/dbConnection.js`:
```js
import mongoose from "mongoose"

export const dbConnection = () => {
    const mongoUri = process.env.MONGODB_URI || process.env.DB_STRING || 'mongodb://localhost:27017/halim'
    
    mongoose.connect(mongoUri)
    .then(() => console.log("db is connected successfully"))
    .catch((err) => console.log('db failed', err))
}
```

وفي `backend/database/models/` جميع نماذج البيانات مثل `product.model.js`، `user.model.js`، إلخ.

**لماذا يهم؟** يخزن البيانات بشكل دائم، يفرض التحقق على مستوى المخطط، ويدعم الاستعلامات لجميع ميزات التطبيق.

**مثال الكود:**

```js
mongoose.connect(mongoUri)
  .then(() => console.log('تم الاتصال بقاعدة البيانات'))
  .catch(err => console.error('فشل الاتصال:', err))
```

---

## 9. وثائق Swagger

**ما هو؟** Swagger (OpenAPI) توفر توثيقاً تفاعلياً قائماً على المتصفح ولوحة اختبار للـ API.

**أين يقع في الكود؟**
- الإعدادات: [backend/swagger.config.js](backend/swagger.config.js)
- مثبت في: [backend/src/modules/index.routes.js](backend/src/modules/index.routes.js) تحت `/api-docs`

**لماذا يهم؟** يمكن للمطورين والمختبرين استكشاف واختبار الـ Endpoints بدون كتابة كود عميل؛ يحسن قابلية الاكتشاف.

**مثال الكود:**

```js
import swaggerUi from 'swagger-ui-express'

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))
```

---

## 10. رفع الملفات

**ما هو؟** دعم رفع ملفات الصور (صور المنتجات) من العميل إلى الخادم باستخدام multipart/form-data.

**أين يقع في الكود؟**
- مساعد الرفع: [backend/src/services/fileUpload/fileUpload.js](backend/src/services/fileUpload/fileUpload.js)
- مسارات رفع المنتجات: [backend/src/modules/product/product.routes.js](backend/src/modules/product/product.routes.js)
- خدمة الملفات الثابتة: [backend/index.js](backend/index.js) (`app.use('/uploads', express.static('uploads'))`)

**لماذا يهم؟** يسمح بتخزين صور المنتجات وتقديمها للمستخدمين؛ مهمة لقوائم المنتجات والعرض البصري.

**مثال الكود:**

```js
uploadFields([
  { name: 'imgCover', maxCount: 1 }, 
  { name: 'images', maxCount: 10 }
])
```

---

## 11. خدمة البريد الإلكتروني

**ما هو؟** خدمة لإرسال رسائل التحقق والإخطارات (رموز OTP للتحقق، إعادة تعيين كلمة المرور، إلخ).

**أين يقع في الكود؟**
- مرسل البريد: [backend/src/services/email/sendEmail.js](backend/src/services/email/sendEmail.js)
- النماذج: [backend/src/services/email/verificationEmailTemplate.js](backend/src/services/email/verificationEmailTemplate.js)
- يتم التفعيل من: متحكم المصادقة أثناء تدفقات التسجيل

**لماذا يهم؟** يمنع الحسابات المزيفة ويحسن الأمان؛ البريد ضروري لاسترجاع كلمة المرور والتواصل مع المستخدمين.

**مثال الكود:**

```js
await transporter.sendMail({ 
  from: senderEmail, 
  to: userEmail, 
  subject: 'تحقق من حسابك', 
  html: verificationEmailTemplate({ name, otp }) 
})
```

---

## 12. معالجة الأخطاء

**ما هو؟** آلية مركزية لمعالجة وتنسيق الأخطاء للرد على الأخطاء بشكل متسق.

**أين يقع في الكود؟**
- برمجية الخطأ العام: [backend/src/middleware/globalError.js](backend/src/middleware/globalError.js)
- مساعدو التحقق: [backend/src/middleware/validation.js](backend/src/middleware/validation.js)

**لماذا يهم؟** يمنع تسرب الأخطاء الداخلية للعملاء، يسهل تصحيح الأخطاء في التطوير، ويحافظ على اتساق الردود في الإنتاج.

**مثال الكود:**

```js
function globalError(err, req, res, next) {
  res.status(err.statusCode || 500).json({ 
    error: err.message 
  })
}
```

---

## 13. الكاش وتخزين البيانات المؤقت

**ما هو؟** تخزين مؤقت قصير المدى لردود GET لتحسين الأداء في الـ Endpoints المطلوبة بكثرة.

**أين يقع في الكود؟**
- برمجية: [backend/src/middleware/responseCache.js](backend/src/middleware/responseCache.js)
- مطبقة على: [backend/src/modules/product/product.routes.js](backend/src/modules/product/product.routes.js)
- إبطال الكاش: [backend/src/modules/product/product.controller.js](backend/src/modules/product/product.controller.js)

**لماذا يهم؟** يسرع وقت الاستجابة ويقلل استعلامات قاعدة البيانات المكررة. استخدم Redis في الإنتاج.

**مثال الكود:**

```js
router.get(
  '/api/v1/products', 
  cacheResponse(60 * 1000), 
  getAllProducts
)
```

---

## 14. تحديد معدل الطلبات

**ما هو؟** آلية لتحديد عدد الطلبات التي يمكن لعميل إرسالها إلى Endpoint خلال فترة زمنية.

**أين يقع في الكود:**

برمجية تحديد المعدل في `backend/src/middleware/rateLimit.js`:
```js
export function rateLimit({ windowMs = 15 * 60 * 1000, max = 20 } = {}) {
  return (req, res, next) => {
    const key = `${getClientKey(req)}:${req.path}`;
    const now = Date.now();
    const bucket = windows.get(key) || { count: 0, resetAt: now + windowMs };

    if (now > bucket.resetAt) {
      bucket.count = 0;
      bucket.resetAt = now + windowMs;
    }

    bucket.count += 1;
    
    if (bucket.count > max) {
      return res.status(429).json({ message: 'Too many requests' });
    }

    next();
  };
}
```

مستخدمة في `backend/src/modules/auth/auth.routes.js`:

**لماذا يهم؟** يحمي الـ Endpoints الحساسة من هجمات القوة الغاشمة والإساءة، يقلل الأحمال المفاجئة.

**مثال الكود:**

```js
authRouter.post(
  '/signin', 
  rateLimit({ 
    windowMs: 15 * 60 * 1000, 
    max: 10 
  }), 
  validation(signinVal), 
  signin
)
```

---

## 15. شريحة الإغلاق

**ما هو؟** ملخص يجمع ميزات المشروع والدروس المستفادة من بناء نظام التجارة الإلكترونية.

**أين يقع في الكود؟**
- تحميل التطبيق: [backend/index.js](backend/index.js)
- معجم التوجيه: [backend/src/modules/index.routes.js](backend/src/modules/index.routes.js)

**لماذا يهم؟** يعزز الوجبات الرئيسية للحضور ويشير إليهم إلى مواقع الكود لمزيد من الاستكشاف.

---

## مواضيع خدمات الويب الإضافية

هذه المواضيع تكمل الشرائح الـ 15 الأساسية وتمثل أفضل الممارسات والميزات الإضافية.

### 16. التحقق من الصحة (Validation)

**ما هو؟** فحوصات من جانب الخادم تضمن أن الطلبات الواردة لها الشكل والقيم المتوقعة قبل المعالجة.

**أين يقع في الكود:**

برمجية التحقق في `backend/src/middleware/validation.js`:
```js
export const validation = (schema) => {
	return (req, res, next) => {
		const filter = {...req.body, ...req.params, ...req.query}
		const { error } = schema.validate(filter, {abortEarly: false})
		if (error) {
			throw new AppError( 
				error.details.map((d) => d.message),
				400
			)
		}
		next()
	}
}
```

**لماذا يهم؟** يمنع البيانات المشوهة، يتجنب عمليات قاعدة البيانات غير الضرورية، ويعيد أخطاء واضحة للعميل (400) في وقت مبكر.

**مثال الكود:**

```js
app.post('/api/v1/auth/signup', validate(signupSchema), signupController)
```

---

### 17. الترقيم وتصفية البيانات (Pagination & Filtering)

**ما هو؟** أدوات تضيف الترقيم والتصفية والفرز والبحث بالكلمات الرئيسية إلى Endpoints القوائم.

**أين يقع في الكود؟**
- مساعد: [backend/src/utils/apiFeatures.js](backend/src/utils/apiFeatures.js)

**لماذا يهم؟** يحسن تجربة المستخدم والأداء بإرجاع فقط الجزء المطلوب من البيانات وتفعيل الاستعلامات المرنة.

**مثال الكود:**

```js
const features = new ApiFeatures(Product.find(), req.query)
  .filter().sort().pagination()
const products = await features.mongooseQuery
```

---

### 18. متغيرات البيئة والإعدادات

**ما هو؟** تحميل متغيرات البيئة وتكوين معاملات وقت التشغيل مثل PORT و Base URL.

**أين يقع في الكود؟**
- البدء: [backend/index.js](backend/index.js) (`dotenv.config()` وإعداد baseURL/PORT)

**لماذا يهم؟** يبقي الأسرار خارج الكود، يسمح بإعدادات مختلفة لكل بيئة (dev/stage/prod)، يتجنب القيم المدرجة مباشرة.

**مثال الكود:**

```js
import dotenv from 'dotenv'
dotenv.config()
const PORT = process.env.PORT || 3000
```

---

### 19. CORS وعناوين الأمان

**ما هو؟** إعدادات CORS وعناوين HTTP التي تحمي الـ API (CORS، سياسة الأمان، إلخ).

**أين يقع في الكود؟**
- CORS الأساسي: [backend/index.js](backend/index.js) (`app.use(cors())`)

**لماذا يهم؟** يمنع الأصول غير المأذون بها من استدعاء الـ API ويخفف من الثغرات الويب الشائعة.

**مثال الكود:**

```js
import helmet from 'helmet'
app.use(cors())
app.use(helmet())
```

---

### 20. تسجيل الطلبات والتتبع

**ما هو؟** تسجيل الطلبات والأخطاء للمراقبة (من استدعى ماذا ومتى)، اختياري مع معرفات التتبع.

**أين يقع في الكود؟**
- سجل الطلبات: [backend/index.js](backend/index.js) (`morgan('dev')`)

**لماذا يهم؟** ضروري للتصحيح وتشخيص مشاكل الإنتاج وتدقيق الطلبات؛ زوجها مع سجلات دائمة.

**مثال الكود:**

```js
import morgan from 'morgan'
app.use(morgan('combined'))
```

---

### 21. نماذج البيانات والفهرسة

**ما هو؟** مخططات Mongoose والفهارس التي تحدد البنية وتسرع الاستعلامات على المجموعات الكبيرة.

**أين يقع في الكود؟**
- النماذج: [backend/database/models/*.model.js](backend/database/models)

**لماذا يهم؟** تصميم المخطط الصحيح والفهارس يجعل الاستعلامات فعالة ويفرض سلامة البيانات.

**مثال الكود:**

```js
const schema = new mongoose.Schema({ 
  title: String, 
  price: Number 
})
schema.index({ title: 'text' })
```

---

### 22. نصائح الأمان

**ما هو؟** مجموعة من أفضل الممارسات: تجزئة كلمات المرور، HTTPS في الإنتاج، إدارة الأسرار، تطهير الإدخال.

**أين يقع في الكود؟**
- تجزئة المستخدم: [backend/database/models/user.model.js](backend/database/models/user.model.js)
- استخدام البيئة: [backend/index.js](backend/index.js)

**لماذا يهم؟** يمنع تسرب بيانات اعتماد المستخدم، يحمي البيانات في النقل، يقلل سطح الهجوم.

**مثال الكود:**

```js
user.password = await bcrypt.hash(plainPassword, 10)
```

---

### 23. التوصيات للإنتاج

**ما هو؟** تحسينات مقترحة: كاش موزع، تسجيل مركزي، اختبارات آلية، مراقبة، تحديد إصدارات الـ API.

**لماذا يهم؟** تجعل الخدمة موثوقة وقابلة للملاحظة وسهلة الاختبار وجاهزة لحركة الإنتاج.

**مثال الكود:**

```js
import Redis from 'ioredis'
const redis = new Redis(process.env.REDIS_URL)
```

---

## ترتيب العرض الموصى به

1. نظرة عامة على المشروع
2. REST API وأفعال HTTP
3. JSON وسير العملية من العميل إلى الخادم
4. المصادقة والتحقق
5. تكامل قاعدة البيانات
6. رفع الملفات
7. خدمة البريد الإلكتروني
8. Swagger والتوثيق
9. معالجة الأخطاء
10. الكاش والأداء
11. تحديد معدل الطلبات
12. النصائح الختامية

---

## نصائح المقدم

لتبدو طبيعياً، اشرح كل شريحة بهذا الترتيب:

1. **ما هو؟** - اشرح المفهوم بوضوح
2. **أين يقع؟** - أشر إلى الملفات والكود المحدد
3. **لماذا يهم؟** - اذكر القيمة والتأثير الحقيقي

---

## الملاحظات المهمة

- كل Endpoint له مثال كود حقيقي يعمل
- جميع مسارات الملفات دقيقة وقابلة للربط
- يمكن نسخ الأكواد مباشرة وتشغيلها
- النظام موحد: كل موضوع يتبع نفس البنية
