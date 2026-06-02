# 🚀 DEPLOYMENT CHECKLIST - Ready to Deploy!

✅ **Data Status**: All 114 documents imported to MongoDB Atlas
✅ **GitHub**: Code pushed to https://github.com/Halimmsbah/NovaFurniture
✅ **Database**: Connected and verified

---

## 📋 DEPLOYMENT STEPS (Do in order)

### **STEP 1️⃣: Deploy Backend on Render** (10 min)

1. Go to: https://render.com/dashboard
2. Click **"New"** → **"Web Service"**
3. Click **"Connect Repository"** → Select **NovaFurniture**
4. Fill in:
   - **Name**: `nova-backend`
   - **Environment**: Node
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: FREE ✓

5. **Add Environment Variables** (click "+ Add Environment Variable"):

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `MODE` | `production` |
| `JWT_KEY` | `your-secret-key-change-this-12345` |
| `MONGODB_URI` | `mongodb+srv://NovaFurniture:L689akoRfLglzMaZ@cluster0.7errxoi.mongodb.net/nova?retryWrites=true&w=majority` |
| `baseURL` | `https://nova-backend-xxxx.onrender.com/` *(update after deploy)* |
| `FRONTEND_ORIGIN` | `https://nova-frontend-xxxx.vercel.app` *(update after deploy)* |
| `EMAIL_NAME` | `Abdelhalim1143@gmail.com` |
| `EMAIL_PASS` | `jetd zbjs xjzu rdyt` |

6. Click **"Create Web Service"**
7. **WAIT 5-10 minutes** ⏳
8. When done, copy the URL (e.g., `https://nova-backend-xxxx.onrender.com`)
9. **Save this URL** - need it for Step 2

---

### **STEP 2️⃣: Deploy Frontend on Vercel** (10 min)

1. Go to: https://vercel.com/dashboard
2. Click **"Add New"** → **"Project"**
3. Click **"Import Git Repository"** → Select **NovaFurniture**
4. Fill in:
   - **Framework**: `Vite` ✓
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run frontend:build`
   - **Output Directory**: `frontend/dist`

5. **Add Environment Variable**:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `https://nova-backend-xxxx.onrender.com/api/v1`
     *(Replace with your Render URL from Step 1)*

6. Click **"Deploy"**
7. **WAIT 2-5 minutes** ⏳
8. When done, you'll get URL (e.g., `https://nova-frontend-xxxx.vercel.app`)
9. **Save this URL**

---

### **STEP 3️⃣: Connect Them Together** (2 min)

**Update Render Backend**:
1. Go to Render Dashboard → Your Service
2. Click **"Environment"**
3. Edit these variables:
   - `baseURL` = `https://nova-backend-xxxx.onrender.com/` *(your Render URL)*
   - `FRONTEND_ORIGIN` = `https://nova-frontend-xxxx.vercel.app` *(your Vercel URL)*
4. Changes auto-apply ✅

**Update Vercel Frontend** (if needed):
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Verify `VITE_API_BASE_URL` = `https://nova-backend-xxxx.onrender.com/api/v1`
3. Go to Deployments → Click latest → **"Redeploy"**

---

### **STEP 4️⃣: Test It Works** (5 min)

1. Open your Vercel URL in browser
2. Try:
   - ✅ See homepage
   - ✅ Click "Sign Up"
   - ✅ Login with existing account (49 users available)
   - ✅ Browse products (20 products loaded)
   - ✅ Add to cart
   - ✅ Check orders (5 existing orders)

---

## 📊 Your Data on MongoDB Atlas

```
Database: nova
Collections: 9
Documents: 114

- users: 49 ✓
- products: 20 ✓
- orders: 5 ✓
- carts: 6 ✓
- brands: 5 ✓
- categories: 7 ✓
- subcategories: 20 ✓
- coupons: 2 ✓
- reviews: 0 ✓
```

---

## 🎯 What You Have Ready

✅ GitHub: Code pushed  
✅ MongoDB Atlas: Database connected with all data  
✅ Backend: Ready to deploy  
✅ Frontend: Ready to deploy  
✅ Configuration: All files ready (vercel.json, render.yaml)  

---

## ⏱️ Total Time: ~30 minutes

```
5 min:  MongoDB Atlas setup (DONE ✅)
10 min: Backend deploy on Render
10 min: Frontend deploy on Vercel
2 min:  Connect them together
3 min:  Testing
────────
30 min: LIVE! 🚀
```

---

## 🔗 Important URLs After Deployment

You'll get:
- Frontend: `https://nova-frontend-xxxx.vercel.app`
- Backend API: `https://nova-backend-xxxx.onrender.com/api/v1`
- Swagger Docs: `https://nova-backend-xxxx.onrender.com/api-docs`

---

## 🆘 Issues?

- **Backend won't start**: Check logs in Render → Check env vars
- **Frontend API errors**: Verify VITE_API_BASE_URL is correct
- **Database connection error**: Check MONGODB_URI is copied correctly
- **CORS errors**: Verify FRONTEND_ORIGIN is set in backend

---

**👉 NEXT: Start with STEP 1 - Deploy on Render**

Go to https://render.com/dashboard and click "New" → "Web Service"
