# Nova Luxury Furnishings Presentation Documentation

This document is a slide-by-slide reference you can paste into PowerPoint and use while explaining the project.

## Presentation Structure

Each section follows the same format for consistency:
1. **What it is** - Clear explanation of the concept
2. **Where it lives in the code** - Direct file paths and locations
3. **Why it matters** - Business/technical value
4. **Code example** - Working code snippet

---

## 1. Title Slide

**What it is:** A full-stack e‑commerce application for luxury furniture shopping, built with Node.js backend and React/TypeScript frontend.

**Where it lives in the code:**
- Project overview: [README.md](README.md), [package.json](package.json)
- Backend entrypoint: [backend/index.js](backend/index.js)
- Route bootstrap: [backend/src/modules/index.routes.js](backend/src/modules/index.routes.js)

**Why it matters:** Sets context for the audience: shows what will be demonstrated and the tech stack used.

---

## 2. REST API

**What it is:** The REST API exposes endpoints for resources (products, users, orders) using standard HTTP verbs for predictable, resource-oriented interactions.

**Where it lives in the code:**
- Route modules: [backend/src/modules/*/*.routes.js](backend/src/modules)
- Product routes example: [backend/src/modules/product/product.routes.js](backend/src/modules/product/product.routes.js)

**Why it matters:** Organizes backend behavior around resources so frontend developers and tools can interact predictably with the API.

**Code example:**

```js
productRouter.route('/').get(cacheResponse(60*1000), getAllProduct).post(protectedRoutes, addProduct)
```

---

## 3. HTTP Methods

**What it is:** HTTP methods describe the action a request intends: GET (read), POST (create), PUT (update), DELETE (remove).

**Where it lives in the code:**
- Defined per route in: [backend/src/modules/product/product.routes.js](backend/src/modules/product/product.routes.js)

**Why it matters:** Using the correct method makes APIs intuitive and helps tools and caches behave correctly.

**Code example:**

```js
productRouter.route('/:id')
  .get(getSingleProduct)
  .put(updateProduct)
  .delete(deleteProduct)
```

## 4. JSON

1) What it is

- JSON is the data format used for requests and responses between frontend and backend.

2) Where it lives in the code

- Body parser enabled: [backend/index.js](backend/index.js) (`app.use(express.json())`).
- Frontend client config: [frontend/src/lib/api.ts](frontend/src/lib/api.ts).

3) Why it matters

- JSON is human-readable and language-agnostic, making frontend-backend communication simple and consistent.

Example snippets (copyable):

Frontend client setup:

```ts
export const api = axios.create({
  baseURL: apiBaseURL,
  timeout: 20_000,
  headers: { "Content-Type": "application/json" },
})
```

Add-to-cart frontend example:

```jsx
function AddToCartButton({ productId }) {
  const handleClick = () => api.post('/api/v1/cart', { productId, quantity: 1 })
    .then(res => console.log('Added', res.data))
    .catch(console.error)
  return <button onClick={handleClick}>Add to cart</button>
}
```

Response example:

```json
{
  "status": "success",
  "cart": { "items": [ { "product": "64a1f2...", "quantity": 2 } ], "total": 1799.98 }
}
```

JSON Request Examples (ready-to-copy):

- Signup (POST /api/v1/auth/signup)

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123"
}
```

- Signin (POST /api/v1/auth/signin)

```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

- Create product (POST /api/v1/products) — JSON fields (images sent via multipart separately)

```json
{
  "title": "Oak Dining Table",
  "description": "Solid oak dining table, seats 6",
  "price": 899.99,
  "priceAfterDiscount": 799.99,
  "stock": 12,
  "category": "64a1f2e5b3c7d9a0f1e2d3c4",
  "subcategory": "64a1f2e5b3c7d9a0f1e2d3c5",
  "brand": "64a1f2e5b3c7d9a0f1e2d3c6"
}
```

- Update user (PUT /api/v1/users/:id)

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```



## 5. Client-Server Architecture

1) What it is

- Describes how the frontend (client) and backend (server) interact: user actions on the client become API requests handled by the server.

2) Where it lives in the code

- Frontend API client: [frontend/src/lib/api.ts](frontend/src/lib/api.ts)
- Backend app bootstrap: [backend/index.js](backend/index.js)
- Database layer: [backend/database/](backend/database)

3) Why it matters

- Keeps responsibilities separated: UI logic in the client, data and business rules on the server. This improves security, testability, and scalability.

Add-to-cart flow (concrete example showing the three steps):

1) What the feature is

- The user clicks "Add to cart" to place a product in their shopping cart.

2) Where it lives in the code

- Frontend: component calls `api.post('/api/v1/cart', ...)` using the shared client.
- Backend: request handled in `backend/src/modules/cart/cart.controller.js` which updates the DB.

3) Why it matters

- Shows a full round-trip: user action → network request → database change → UI update. Demonstrates how pieces work together.

Frontend request example:

```ts
api.post('/api/v1/cart', { productId: '64a1f2e5b3c7d9a0f1e2d3c4', quantity: 1 })
```

Backend handler (where DB update happens):

```js
// backend/src/modules/cart/cart.controller.js
export const addToCart = async (req, res) => {
  // validate, update DB, return JSON
}
```

## 6. API Consumption

1) What it is

- How the frontend calls the backend via a shared HTTP client (Axios) and attaches auth tokens automatically.

2) Where it lives in the code

- Shared Axios client: [frontend/src/lib/api.ts](frontend/src/lib/api.ts)
- Request interceptor that adds `token` header: same file.

3) Why it matters

- Centralizes request configuration and auth handling so components don't repeat this code.

Example:

```ts
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' && window.localStorage.getItem(TOKEN_KEY)
  if (token) (config.headers as Record<string, string>).token = token
  return config
})
```

## 7. Authentication

1) What it is

- JWT-based authentication with email verification and protected routes.

2) Where it lives in the code

- Auth logic: [backend/src/modules/auth/auth.controller.js](backend/src/modules/auth/auth.controller.js)
- Auth routes: [backend/src/modules/auth/auth.routes.js](backend/src/modules/auth/auth.routes.js)
- Token verification middleware: where `protectedRoutes` is implemented.

3) Why it matters

- Ensures only authenticated users can access protected endpoints and supports account recovery and verification flows.

Example (issue token):

```js
const issueAuthToken = (user) => jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_KEY)
```

## 8. Database Integration

1) What it is

- The app uses MongoDB with Mongoose to store and validate data (users, products, orders, carts).

2) Where it lives in the code

- DB connection: [backend/database/dbConnection.js](backend/database/dbConnection.js)
- Models: [backend/database/models/*.model.js](backend/database/models)

3) Why it matters

- Stores persistent data, enforces schema-level validation, and supports queries for the application features.

Example (connect):

```js
mongoose.connect(mongoUri).then(() => console.log('db connected'))
```

## 9. Swagger Documentation

1) What it is

- Swagger (OpenAPI) provides interactive documentation and a testing UI for the API.

2) Where it lives in the code

- Configuration: [backend/swagger.config.js](backend/swagger.config.js)
- Mounted UI: [backend/src/modules/index.routes.js](backend/src/modules/index.routes.js) under `/api-docs`.

3) Why it matters

- Lets developers and testers explore and try endpoints without writing client code; improves discoverability.

Example mount:

```js
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))
```

## 10. File Uploads

1) What it is

- Support for uploading image files (product images) from client to server.

2) Where it lives in the code

- Upload helper: [backend/src/services/fileUpload/fileUpload.js](backend/src/services/fileUpload/fileUpload.js)
- Product upload routes: [backend/src/modules/product/product.routes.js](backend/src/modules/product/product.routes.js)
- Static serve: [backend/index.js](backend/index.js) (`app.use('/uploads', express.static('uploads'))`).

3) Why it matters

- Allows product images to be stored and served to users; important for product listings and visual presentation.

Example usage:

```js
uploadFields([{ name: 'imgCover', maxCount: 1 }, { name: 'images', maxCount: 10 }])
```

## 11. Email Service

1) What it is

- Service used to send verification and notification emails to users (signup verification OTP, password reset, etc.).

2) Where it lives in the code

- Sender helper: [backend/src/services/email/sendEmail.js](backend/src/services/email/sendEmail.js)
- Templates: [backend/src/services/email/verificationEmailTemplate.js](backend/src/services/email/verificationEmailTemplate.js)
- Triggered from auth controller during signup flows.

3) Why it matters

- Email verification prevents fake accounts and improves security; emails are also needed for password recovery and communication.

Example:

```js
await transporter.sendMail({ from: senderEmail, to: email, subject: 'Verify', html: verificationEmailTemplate({ name, otp }) })
```

## 12. Error Handling

1) What it is

- Centralized error handling and validation mechanism to format and respond to errors consistently.

2) Where it lives in the code

- Global error middleware: [backend/src/middleware/globalError.js](backend/src/middleware/globalError.js)
- Validation helpers: [backend/src/middleware/validation.js](backend/src/middleware/validation.js)

3) Why it matters

- Prevents leaking internal errors to clients, makes debugging easier in development, and keeps responses consistent in production.

Example (simplified):

```js
res.status(err.statusCode || 500).json({ error: err.message })
```

## 13. Caching

1) What it is

- Short-term in-memory caching for GET responses to improve performance on frequently requested endpoints.

2) Where it lives in the code

- Middleware: [backend/src/middleware/responseCache.js](backend/src/middleware/responseCache.js)
- Applied to product routes: [backend/src/modules/product/product.routes.js](backend/src/modules/product/product.routes.js)
- Invalidation in product controller: [backend/src/modules/product/product.controller.js](backend/src/modules/product/product.controller.js)

3) Why it matters

- Speeds up response times and reduces repeated DB queries for the same data. For production, a shared cache (Redis) is recommended.

Example usage:

```js
.get(cacheResponse(60 * 1000), getAllProduct)
```

## 14. Rate Limiting

1) What it is

- A mechanism to limit how many requests a client can make to an endpoint within a time window.

2) Where it lives in the code

- Middleware: [backend/src/middleware/rateLimit.js](backend/src/middleware/rateLimit.js)
- Applied on auth routes: [backend/src/modules/auth/auth.routes.js](backend/src/modules/auth/auth.routes.js)

3) Why it matters

- Protects sensitive endpoints from brute-force and abuse and reduces load spikes.

Example:

```js
authRouter.post('/signin', rateLimit({ windowMs: 15*60*1000, max: 10 }), validation(signinVal), signin)
```

## 15. Closing Slide

1) What it is

- A summary slide that recaps the project features and lessons.

2) Where it lives in the code

- App bootstrap and routing aggregator: [backend/index.js](backend/index.js), [backend/src/modules/index.routes.js](backend/src/modules/index.routes.js)

3) Why it matters

- Reinforces the main takeaways for the audience and points them to code locations for follow-up.

## Recommended Talking Order

1. Project overview
2. REST API and HTTP methods
3. JSON and client-server flow
4. Authentication
5. Database integration
6. File uploads
7. Email service
8. Swagger
9. Error handling
10. Caching
11. Rate limiting
12. Final summary

## Short Presenter Tip

If you want to sound natural, explain each slide in this order:

1. What the feature is.
2. Where it lives in the code.
3. Why it matters in a real project.

## Additional Web Services Topics

- **Validation:** بلوكات التحقق من صحة المدخلات قبل التعامل مع الداتا — [backend/src/middleware/validation.js](backend/src/middleware/validation.js).
- **Centralized Error Handling:** كيف نرجع أخطاء موحدة وآمنة للمستهلكين — [backend/src/middleware/globalError.js](backend/src/middleware/globalError.js).
- **Pagination / Filtering / Search:** نمط للـ API يدعم صفحات وفلترة وفرز (تحسين أداء وUX للـ list endpoints) — [backend/src/utils/apiFeatures.js](backend/src/utils/apiFeatures.js).
- **Environment & Configuration:** قراءة متغيرات البيئة وتهيئة الـ baseURL/PORT — [backend/index.js](backend/index.js) (dotenv usage).
- **CORS & Security Headers:** تفعيل CORS موجود فعلاً في bootstrap — [backend/index.js](backend/index.js); لاحقاً ممكن تذكر إضافة `helmet`, rate-limiting مركزي, input sanitization.
- **Logging & Request Tracing:** تسجيل الطلبات (morgan) موجود في الـ server bootstrap — [backend/index.js](backend/index.js). مهم لِـ debugging وobservability.
- **File Uploads:** التعامل مع ملفات الوسائط عبر Multer وطرق حفظ الأسماء في DB — [backend/src/services/fileUpload/fileUpload.js](backend/src/services/fileUpload/fileUpload.js).
- **Email Service (Notifications):** إرسال OTP ورسائل النظام — [backend/src/services/email/sendEmail.js](backend/src/services/email/sendEmail.js).
- **API Documentation (Swagger/OpenAPI):** واجهة تفاعلية لتجربة الوثائق — [backend/swagger.config.js](backend/swagger.config.js) و `/api-docs`.
- **Caching (read-side):** تحسّن أداء القراءة عبر كاش مؤقت — [backend/src/middleware/responseCache.js](backend/src/middleware/responseCache.js).
- **Rate Limiting (abuse protection):** حماية نقاط الدخول الحساسة (auth) — [backend/src/middleware/rateLimit.js](backend/src/middleware/rateLimit.js).
- **Data Models & Indexing:** مواضع الـ schemas والحقول المهمة (مثال: Product/User) — [backend/database/models/product.model.js](backend/database/models/product.model.js), [backend/database/models/user.model.js](backend/database/models/user.model.js).
- **Seed / Utility Scripts:** أدوات لتعبئة الداتا أو إصلاحها (مفيدة لعرض بيئة dev) — [backend/scripts/seed-demo.mjs](backend/scripts/seed-demo.mjs), [backend/scripts/upsert-admin.mjs](backend/scripts/upsert-admin.mjs).
- **Security Practices to mention:** password hashing (check user model), HTTPS in production, secret management (env), input-sanitization / rate limits / CORS policies — see [backend/database/models/user.model.js](backend/database/models/user.model.js) for hashing.
- **What’s missing / good-to-add for a production web service:** distributed cache (Redis), centralized logging/tracing, automated tests / CI, monitoring (Prometheus / Sentry), API versioning. يمكن أذكرها كـ "recommendations".

---

Added this summary of topics for Web Services to the end of the document as requested.

## Short Code Snippets (2–8 lines each)

Below are tiny, copyable examples for each additional topic to use in slides or demos.

### Validation
```js
// middleware use example
app.post('/api/v1/auth/signup', validate(signupSchema), signupController)
```

### Centralized Error Handling
```js
function globalError(err, req, res, next) {
  res.status(err.statusCode || 500).json({ error: err.message })
}
```

### Pagination / Filtering / Search
```js
const features = new ApiFeatures(Product.find(), req.query)
  .filter().sort().pagination()
const products = await features.mongooseQuery
```

### Environment & Configuration
```js
import dotenv from 'dotenv'
dotenv.config()
const PORT = process.env.PORT || 3000
```

### CORS & Security Headers
```js
import helmet from 'helmet'
app.use(cors())
app.use(helmet())
```

### Logging & Request Tracing
```js
import morgan from 'morgan'
app.use(morgan('combined'))
```

### File Uploads
```js
const upload = fileUpload().fields([{ name: 'images', maxCount: 10 }])
router.post('/api/v1/products', upload, createProduct)
```

### Email Service (Notifications)
```js
await transporter.sendMail({ to: user.email, subject: 'Verify', html: template })
```

### API Documentation (Swagger/OpenAPI)
```js
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))
```

### Caching (read-side)
```js
// apply to GET route
router.get('/api/v1/products', cacheResponse(60_000), getAllProducts)
```

### Rate Limiting (abuse protection)
```js
router.post('/api/v1/auth/signin', rateLimit({ windowMs: 15*60*1000, max: 10 }), signin)
```

### Data Models & Indexing
```js
const schema = new mongoose.Schema({ title: String, price: Number })
schema.index({ title: 'text' })
```

### Seed / Utility Scripts
```sh
# run demo seed
node backend/scripts/seed-demo.mjs
```

### Security Practices (examples)
```js
// hash password
user.password = await bcrypt.hash(plainPassword, 10)
```

### Recommendations (infra snippets)
```js
// Redis client (example)
import Redis from 'ioredis'
const redis = new Redis(process.env.REDIS_URL)
```


## Expanded Web Services Topics (detailed)

### Validation
1) What it is
- Server-side checks that ensure incoming requests have the expected shape and values before processing.
2) Where it lives in the code
- Middleware: [backend/src/middleware/validation.js](backend/src/middleware/validation.js).
3) Why it matters
- Prevents malformed data, avoids unnecessary DB operations, and returns clear client errors (400) early.

### Centralized Error Handling
1) What it is
- A single middleware that formats and sends errors to clients in a consistent, safe way.
2) Where it lives in the code
- Global handler: [backend/src/middleware/globalError.js](backend/src/middleware/globalError.js).
3) Why it matters
- Keeps error responses predictable, hides internals in production, and simplifies debugging in development.

### Pagination / Filtering / Search
1) What it is
- Utilities that add paging, filtering, sorting, and keyword search to list endpoints.
2) Where it lives in the code
- Helper: [backend/src/utils/apiFeatures.js](backend/src/utils/apiFeatures.js); used by list controllers.
3) Why it matters
- Improves UX and performance by returning only the requested slice of data and enabling flexible queries.

### Environment & Configuration
1) What it is
- Loading environment variables and configuring runtime parameters like PORT and base URL.
2) Where it lives in the code
- Bootstrap: [backend/index.js](backend/index.js) (`dotenv.config()` and baseURL/PORT setup).
3) Why it matters
- Keeps secrets out of code, allows different configs per environment (dev/stage/prod), and avoids hard-coded values.

### CORS & Security Headers
1) What it is
- Cross-origin settings and HTTP headers that protect the API (CORS, Content Security Policy, etc.).
2) Where it lives in the code
- Basic CORS: [backend/index.js](backend/index.js) (`app.use(cors())`). Consider adding `helmet` and input sanitizers.
3) Why it matters
- Prevents unauthorized origins from calling the API and mitigates common web vulnerabilities.

### Logging & Request Tracing
1) What it is
- Recording requests and errors for observability (who called what and when), optionally with tracing ids.
2) Where it lives in the code
- Request logger: [backend/index.js](backend/index.js) (`morgan('dev')`).
3) Why it matters
- Essential for debugging, diagnosing production issues, and auditing requests; pair with persistent logs in prod.

### File Uploads
1) What it is
- Handling multipart/form-data uploads and storing file metadata (filename, path) in the DB.
2) Where it lives in the code
- Upload helper: [backend/src/services/fileUpload/fileUpload.js](backend/src/services/fileUpload/fileUpload.js) and product routes.
3) Why it matters
- Enables product images and media; must validate file types/sizes and secure upload paths.

### Email Service (Notifications)
1) What it is
- Sending transactional and verification emails (OTP, password reset, notifications).
2) Where it lives in the code
- Email helper: [backend/src/services/email/sendEmail.js](backend/src/services/email/sendEmail.js) and templates folder.
3) Why it matters
- Verifies accounts, supports password recovery, and is a core channel for user communication.

### API Documentation (Swagger/OpenAPI)
1) What it is
- Interactive, machine-readable documentation that developers can use to explore endpoints.
2) Where it lives in the code
- Config: [backend/swagger.config.js](backend/swagger.config.js) and mounted at `/api-docs`.
3) Why it matters
- Speeds onboarding for integrators and makes manual testing accessible without client code.

### Caching (read-side)
1) What it is
- Short-term caching of GET responses to speed repeated reads (demo-level in-memory cache present).
2) Where it lives in the code
- Middleware: [backend/src/middleware/responseCache.js](backend/src/middleware/responseCache.js).
3) Why it matters
- Reduces DB load and latency for frequently requested endpoints; replace with Redis for production.

### Rate Limiting (abuse protection)
1) What it is
- Limits the number of requests a client can make to an endpoint within a time window.
2) Where it lives in the code
- Middleware: [backend/src/middleware/rateLimit.js](backend/src/middleware/rateLimit.js); applied to auth routes.
3) Why it matters
- Protects against brute-force attacks and reduces accidental or malicious overload.

### Data Models & Indexing
1) What it is
- Mongoose schemas and indexes that define structure and speed up queries for large collections.
2) Where it lives in the code
- Models: [backend/database/models/*.model.js](backend/database/models) (e.g., product.model.js, user.model.js).
3) Why it matters
- Proper schema design and indexes make queries efficient and enforce data integrity.

### Seed / Utility Scripts
1) What it is
- Scripts used to seed demo data, fix duplicates, or create admin accounts in dev environments.
2) Where it lives in the code
- Scripts: [backend/scripts/seed-demo.mjs](backend/scripts/seed-demo.mjs), [backend/scripts/upsert-admin.mjs](backend/scripts/upsert-admin.mjs).
3) Why it matters
- Makes demos and local testing reproducible and speeds development onboarding.

### Security Practices to mention
1) What it is
- Collection of best practices: password hashing, HTTPS, secret management, input sanitization.
2) Where it lives in the code
- Check user hashing in [backend/database/models/user.model.js](backend/database/models/user.model.js); environment usage in [backend/index.js](backend/index.js).
3) Why it matters
- Prevents credential leaks, protects data in transit, and reduces attack surface.

### Recommendations (missing / good-to-add)
1) What it is
- Suggested production improvements: distributed cache, centralized logging/tracing, CI/tests, monitoring, API versioning.
2) Where to add them
- Infrastructure & CI: deploy scripts, monitoring agents, Redis, Sentry/Prometheus integrations (out of repo scope).
3) Why it matters
- These changes make the service reliable, observable, testable, and ready for production traffic.
