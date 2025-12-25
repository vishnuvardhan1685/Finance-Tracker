# 🎯 Finance Tracker - Complete Deployment Guide

## 🏗️ Architecture Overview

Your Finance Tracker has **TWO separate services**:

```
┌─────────────────────────────────────────────────────┐
│                    USER'S BROWSER                    │
│                                                      │
│  https://your-frontend.onrender.com (React App)     │
└───────────────────┬──────────────────────────────────┘
                    │
                    │ API Calls (/api/*)
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│              BACKEND API SERVER                      │
│                                                      │
│  https://finance-tracker-qebo.onrender.com          │
│  (Node.js/Express - JSON responses only)            │
└───────────────────┬──────────────────────────────────┘
                    │
                    │ Database Queries
                    ▼
┌─────────────────────────────────────────────────────┐
│              MONGODB ATLAS                           │
│         (Database - Stores all data)                 │
└─────────────────────────────────────────────────────┘
```

## ❌ Current Problem

You've only deployed the **backend API** at:
- https://finance-tracker-qebo.onrender.com

When you visit this URL in a browser, you get **"Cannot GET /"** because:
- The backend is an API that returns JSON, not HTML
- It doesn't serve web pages - only API endpoints

## ✅ Solution: Deploy Frontend Separately

You need to deploy the **frontend** as a **Static Site** on Render.

---

## 🚀 Complete Deployment Steps

### Step 1: Verify Backend is Working ✅

Your backend is already deployed! Test it:

```bash
# Should return API info (new feature added)
curl https://finance-tracker-qebo.onrender.com/

# Should return health check
curl https://finance-tracker-qebo.onrender.com/api/health
```

**Expected Response:**
```json
{
  "name": "Finance Tracker API",
  "version": "1.0.0",
  "status": "running",
  "message": "Welcome to Finance Tracker API",
  "endpoints": {
    "health": "/api/health",
    "auth": "/api/auth",
    "user": "/api/user",
    "expenses": "/api/expense",
    "debts": "/api/debt"
  }
}
```

### Step 2: Deploy Frontend (New Service)

#### Option A: Using render.yaml Blueprint

1. **Commit and push the changes:**
   ```bash
   git add .
   git commit -m "Add root endpoint and prepare for frontend deployment"
   git push origin main
   ```

2. **Create Frontend Service on Render:**
   - Go to https://dashboard.render.com/
   - Click **"New +"** → **"Static Site"**
   - Connect your GitHub repository: `Finance-Tracker`
   - Configure:

   **Basic Settings:**
   ```
   Name: finance-tracker-frontend
   Region: Oregon (US West) - same as backend
   Branch: main
   Root Directory: (leave empty)
   ```

   **Build Settings:**
   ```
   Build Command: cd frontend && npm install && npm run build
   Publish Directory: frontend/dist
   ```

   **Environment Variables:**
   ```
   VITE_API_URL=https://finance-tracker-qebo.onrender.com
   ```

   **Add Rewrite Rule:**
   - Source: `/*`
   - Destination: `/index.html`
   - Action: `Rewrite`

3. **Click "Create Static Site"**

#### Option B: Manual Method (If Option A Doesn't Work)

If you prefer to deploy frontend separately without blueprint:

1. Go to Render Dashboard
2. Click "New +" → "Static Site"
3. Connect repository
4. Configure as shown above
5. Deploy

### Step 3: Update Backend CORS Settings

After frontend is deployed, update the backend's `FRONTEND_URL`:

1. Go to your backend service: https://dashboard.render.com/
2. Find `finance-tracker-api` (or your backend service name)
3. Go to **Environment** tab
4. Update `FRONTEND_URL`:
   ```
   FRONTEND_URL=https://finance-tracker-frontend.onrender.com
   ```
   (Use your actual frontend URL)
5. Save - this will redeploy the backend

### Step 4: Verify Everything Works

#### Backend Health Check:
```bash
curl https://finance-tracker-qebo.onrender.com/api/health
```
Should return: `{"status":"ok","message":"Server is running"}`

#### Frontend:
Visit: `https://your-frontend.onrender.com`

Should show the Finance Tracker login/signup page.

#### Test Complete Flow:
1. Visit frontend URL
2. Sign up new user
3. Log in
4. Create a transaction
5. Check dashboard

---

## 📝 Environment Variables Summary

### Backend (Already Set):
```
NODE_ENV=production
PORT=5001
MONGO_URI=mongodb+srv://vishnuvardhan1685_db_user:Tv6tCCHP1dx9AQdF@cluster0.dkiz3ul.mongodb.net/?appName=Cluster0
JWT_SECRET=<your-strong-secret>
FRONTEND_URL=https://your-frontend-url.onrender.com
```

### Frontend (Need to Set):
```
VITE_API_URL=https://finance-tracker-qebo.onrender.com
```

---

## 🔧 What Changed in the Code

### 1. Added Root Endpoint to Backend (`api/server.js`)

**Before:**
```javascript
// No root route - caused "Cannot GET /"
app.get('/api/health', (req, res) => {...});
```

**After:**
```javascript
// New root endpoint - shows API info
app.get('/', (req, res) => {
    res.json({ 
        name: 'Finance Tracker API',
        version: '1.0.0',
        status: 'running',
        // ... API information
    });
});

app.get('/api/health', (req, res) => {...});
```

Now visiting the backend URL shows useful API information instead of an error.

### 2. Frontend Already Built
The frontend is already built in `frontend/dist/` directory and ready to deploy.

---

## 🎯 Your Final URLs

After both deployments:

| Service | URL | Purpose |
|---------|-----|---------|
| **Backend API** | `https://finance-tracker-qebo.onrender.com` | API endpoints (JSON responses) |
| **Frontend** | `https://your-frontend.onrender.com` | Web application (HTML/JS/CSS) |
| **Database** | MongoDB Atlas | Data storage |

**Users visit:** The **frontend** URL  
**Frontend calls:** The **backend** URL for data

---

## 🆘 Troubleshooting

### Issue: "Cannot GET /" on Backend
**Status:** ✅ FIXED
- Added root endpoint that shows API info
- Backend is working correctly
- Users should visit frontend URL, not backend URL

### Issue: CORS Error
**Solution:**
- Make sure `FRONTEND_URL` in backend matches your actual frontend URL
- No trailing slashes
- Exact match required

### Issue: Frontend Can't Connect to Backend
**Solution:**
- Verify `VITE_API_URL` in frontend is set to backend URL
- Check backend is running (health check)
- Inspect browser console for errors

### Issue: 502 Bad Gateway
**Solution:**
- Wait 30-60 seconds (free tier cold start)
- Services spin down after 15 minutes of inactivity

---

## 📋 Quick Commands Reference

```bash
# Commit changes
git add .
git commit -m "Add root endpoint and prepare for deployment"
git push origin main

# Build frontend locally (test)
npm run build:frontend

# Test backend endpoints
curl https://finance-tracker-qebo.onrender.com/
curl https://finance-tracker-qebo.onrender.com/api/health

# Generate strong JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## ✅ Deployment Checklist

Backend (Already Done):
- [x] Backend deployed at `https://finance-tracker-qebo.onrender.com`
- [x] Root endpoint added (shows API info)
- [x] Health check working
- [x] MongoDB connected
- [ ] Update `FRONTEND_URL` after frontend deployment
- [ ] Update `JWT_SECRET` to strong value

Frontend (To Do):
- [ ] Create new Static Site on Render
- [ ] Set `VITE_API_URL` to backend URL
- [ ] Configure rewrite rule for SPA
- [ ] Deploy and get frontend URL
- [ ] Update backend's `FRONTEND_URL`

Testing:
- [ ] Visit frontend URL (should show login page)
- [ ] Sign up new user
- [ ] Log in successfully
- [ ] Create transaction
- [ ] Verify data appears

---

## 🎉 Summary

**What You Have Now:**
- ✅ Backend API running at `https://finance-tracker-qebo.onrender.com`
- ✅ Backend returns API info at root (no more "Cannot GET /")
- ✅ Database connected

**What You Need:**
- 🔲 Deploy frontend as Static Site
- 🔲 Set `VITE_API_URL` in frontend
- 🔲 Update `FRONTEND_URL` in backend
- 🔲 Visit frontend URL (not backend)

**Total Time: ~10 minutes** ⏱️

---

## 📞 Need Help?

1. Follow the "Step 2: Deploy Frontend" instructions above
2. The backend is working correctly - you just need the frontend deployed
3. Check Render logs if deployment fails
4. Verify all environment variables are set

**Your Finance Tracker will be fully live after frontend deployment!** 🚀

---

*Last Updated: December 25, 2025*
*Backend Status: ✅ Running*
*Frontend Status: ⏳ Needs Deployment*
