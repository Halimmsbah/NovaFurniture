# Nova Luxury Furnishings - Deployment Guide

This guide covers deploying both the frontend (Vercel) and backend (Render.com) of the Nova Luxury Furnishings application.

## Quick Links
- GitHub Repository: https://github.com/Halimmsbah/NovaFurniture
- Frontend Deploy: Vercel
- Backend Deploy: Render.com
- Database: MongoDB Atlas (cloud-hosted)

---

## 📋 Prerequisites

Before deployment, you need:

1. **GitHub Account** (Already done ✓)
2. **Vercel Account** (Free): https://vercel.com
3. **Render.com Account** (Free tier): https://render.com
4. **MongoDB Atlas Account** (Free tier): https://www.mongodb.com/cloud/atlas

---

## 🚀 Step 1: Setup MongoDB Atlas (Cloud Database)

Since the backend needs a database, use MongoDB Atlas:

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up (free tier available)
3. Create a new project and cluster
4. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/dbname`
5. Keep this string safe - you'll need it for both deployments

---

## 🎨 Step 2: Deploy Frontend on Vercel

### Option A: Using Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Click **"Add New"** → **"Project"**
3. Select **"Import Git Repository"**
4. Connect your GitHub account
5. Find and select **"NovaFurniture"** repository
6. Configure:
   - **Framework Preset**: Vite ✓
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run frontend:build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `npm install`

7. **Add Environment Variables**:
   - Click "Environment Variables"
   - Add: `VITE_API_BASE_URL` = `https://your-backend-url.onrender.com/api/v1`
     (You'll get this URL after deploying the backend)
   - Click "Deploy"

### Option B: Using Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## 🔧 Step 3: Deploy Backend on Render.com

### Using Render.com Dashboard

1. Go to https://render.com/dashboard
2. Click **"New"** → **"Web Service"**
3. Select **"Connect a GitHub repository"**
4. Find and select **"NovaFurniture"**
5. Configure:
   - **Name**: nova-luxury-furnishings-backend
   - **Environment**: Node
   - **Region**: Choose closest to you
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free tier works for testing

6. **Add Environment Variables** (critical):
   ```
   NODE_ENV = production
   PORT = 3000
   MODE = production
   JWT_KEY = your-secret-key-here (change this!)
   MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/nova
   baseURL = https://your-backend-url.onrender.com/
   FRONTEND_ORIGIN = https://your-frontend-url.vercel.app
   EMAIL_NAME = your-email@gmail.com
   EMAIL_PASS = your-app-password
   STRIPE_SECRET = (optional)
   STRIPE_WEBHOOK_SECRET = (optional)
   ```

7. Click **"Create Web Service"** and wait for deployment (5-10 minutes)

**Note**: Free tier services on Render spin down after 15 minutes of inactivity. Use paid tier for production.

---

## 🔗 Step 4: Connect Frontend & Backend

After both are deployed:

1. **Get your Backend URL** from Render dashboard (ends in `.onrender.com`)
2. **Update Frontend Environment Variables** in Vercel:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Update `VITE_API_BASE_URL` to: `https://your-backend-url.onrender.com/api/v1`
   - Redeploy: Go to Deployments → Click latest → "Redeploy"

3. **Update Backend Environment Variables** in Render:
   - Go to Render Dashboard → Your Service → Environment
   - Update `FRONTEND_ORIGIN` to: `https://your-frontend-url.vercel.app`
   - Service will auto-redeploy

---

## 📝 Environment Variables Reference

### Frontend (.env)
```
VITE_API_BASE_URL=https://your-backend-url.onrender.com/api/v1
```

### Backend (.env)
```
PORT=3000
NODE_ENV=production
MODE=production
JWT_KEY=your-secret-key
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nova
baseURL=https://your-backend-url.onrender.com/
FRONTEND_ORIGIN=https://your-frontend-url.vercel.app
EMAIL_NAME=your-email@gmail.com
EMAIL_PASS=app-password
STRIPE_SECRET=
STRIPE_WEBHOOK_SECRET=
```

---

## 🧪 Testing After Deployment

1. Visit your Vercel frontend URL
2. Try signing up or logging in
3. Test product browsing, cart, checkout
4. Check browser console for errors (F12)
5. Check Render logs for backend errors

---

## 🛠️ Troubleshooting

### Frontend not loading
- Check `VITE_API_BASE_URL` in Vercel env vars
- Redeploy frontend after updating env vars

### API calls failing (CORS error)
- Check `FRONTEND_ORIGIN` in backend env vars
- Ensure backend is running: Visit `https://your-backend-url.onrender.com/api/v1/`

### Database connection error
- Verify `MONGODB_URI` is correct
- Whitelist your IP in MongoDB Atlas

### Backend won't start
- Check Render logs for error messages
- Verify all required env variables are set
- Ensure Node version is 20+

---

## 📊 Scaling for Production

Current setup is for **development/testing**. For production:

1. **Frontend**: Use Vercel Pro for faster builds
2. **Backend**: Use Render.com **Paid Plan** (free tier stops after 15 min inactivity)
3. **Database**: Upgrade MongoDB Atlas plan
4. **Storage**: Use Cloudinary (already configured) for image uploads
5. **Email**: Switch to SendGrid or similar for reliable email
6. **SSL/HTTPS**: Automatic with Vercel and Render

---

## 🔄 Continuous Deployment

- **Automatic**: Every push to `main` branch auto-deploys
- **Manual**: Re-deploy from Vercel/Render dashboard
- **Rollback**: Use deployment history to revert

---

## 📞 Support

For issues:
- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- MongoDB Atlas: https://docs.atlas.mongodb.com

---

**Last Updated**: June 2, 2026
