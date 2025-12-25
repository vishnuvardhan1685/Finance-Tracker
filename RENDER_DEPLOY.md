# 🚀 Render Deployment Guide - Finance Tracker

This guide will help you deploy your Finance Tracker application to Render with both backend API and frontend.

## 📋 Pre-Deployment Checklist

- [x] Code cleaned and production-ready
- [x] `.gitignore` files created
- [x] Environment variables documented
- [x] `render.yaml` configuration created
- [x] Build scripts verified
- [ ] MongoDB Atlas account created
- [ ] GitHub repository ready
- [ ] Render account created

## 🗄️ Step 1: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster (M0 Sandbox)
3. Create a database user with password
4. Whitelist all IP addresses (0.0.0.0/0) for Render access
5. Get your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/finance-tracker?retryWrites=true&w=majority
   ```

## 📦 Step 2: Prepare GitHub Repository

1. Initialize git (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Production ready"
   ```

2. Create a new repository on GitHub:
   - Repository name: `finance-tracker`
   - Visibility: Public or Private

3. Push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/finance-tracker.git
   git branch -M main
   git push -u origin main
   ```

## 🎯 Step 3: Deploy to Render

### Option A: Using render.yaml (Recommended - Blueprint Deploy)

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will auto-detect the `render.yaml` file
5. Set the following environment variables:

   **For `finance-tracker-api`:**
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Will be auto-generated (or set your own strong secret)
   - `FRONTEND_URL`: Your frontend URL (e.g., `https://finance-tracker-frontend.onrender.com`)

   **For `finance-tracker-frontend`:**
   - `VITE_API_URL`: Your backend URL (e.g., `https://finance-tracker-api.onrender.com`)

6. Click **"Apply"** to deploy both services

### Option B: Manual Deploy (Alternative)

#### Deploy Backend:
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `finance-tracker-api`
   - **Region**: Oregon (or closest to you)
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=5001
   MONGO_URI=<your-mongodb-connection-string>
   JWT_SECRET=<generate-a-strong-random-string>
   FRONTEND_URL=<will-add-after-frontend-deploy>
   ```

#### Deploy Frontend:
1. Click **"New +"** → **"Static Site"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `finance-tracker-frontend`
   - **Region**: Oregon (or closest to you)
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
   - **Plan**: Free

4. Add Environment Variable:
   ```
   VITE_API_URL=https://finance-tracker-api.onrender.com
   ```

5. Add Rewrite Rule:
   - Source: `/*`
   - Destination: `/index.html`
   - Action: `Rewrite`

## 🔗 Step 4: Update CORS Settings

After both services are deployed, update the backend's `FRONTEND_URL` environment variable with your actual frontend URL:

1. Go to your backend service on Render
2. Navigate to **Environment** tab
3. Update `FRONTEND_URL` to your frontend URL (e.g., `https://finance-tracker-frontend.onrender.com`)
4. Save changes (this will trigger a redeploy)

## ✅ Step 5: Verify Deployment

### Backend Health Check:
```
https://your-api-url.onrender.com/api/health
```
Should return: `{"status":"ok","message":"Server is running"}`

### Frontend:
1. Visit your frontend URL
2. Try to sign up a new user
3. Log in
4. Create a transaction
5. Check dashboard and stats pages

### Test Checklist:
- [ ] Backend API responds to health check
- [ ] Frontend loads without errors
- [ ] User signup works
- [ ] User login works
- [ ] Can create/edit/delete transactions
- [ ] Can create/mark debts as paid
- [ ] Dashboard shows correct data
- [ ] Stats page displays charts
- [ ] Year filters work dynamically

## 🎉 Your URLs

After deployment, you'll have:
- **Backend API**: `https://finance-tracker-api.onrender.com`
- **Frontend**: `https://finance-tracker-frontend.onrender.com`

## 📝 Important Notes

### Free Tier Limitations:
- Services spin down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds
- 750 hours/month of runtime per service
- Limited bandwidth and build minutes

### Custom Domain (Optional):
1. Purchase a domain (e.g., from Namecheap, GoDaddy)
2. In Render dashboard, go to your service
3. Click **Settings** → **Custom Domain**
4. Add your domain and configure DNS records

### Environment Variables Security:
- Never commit `.env` files
- Use Render's environment variable management
- JWT_SECRET should be at least 32 characters
- Keep MongoDB credentials secure

## 🔧 Troubleshooting

### Build Fails:
- Check build logs in Render dashboard
- Verify all dependencies are in `package.json`
- Ensure Node version compatibility

### CORS Errors:
- Verify `FRONTEND_URL` in backend matches actual frontend URL
- Check CORS configuration in `api/server.js`
- Ensure `withCredentials: true` in axios config

### Database Connection Fails:
- Verify MongoDB connection string format
- Check MongoDB Atlas network access (whitelist 0.0.0.0/0)
- Ensure database user has correct permissions

### Frontend Can't Reach Backend:
- Verify `VITE_API_URL` is set correctly
- Check that backend is running (health check)
- Inspect browser console for errors

## 🔄 Updating Your Deployment

To update your deployed application:

1. Make changes locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin main
   ```
3. Render will automatically detect the push and redeploy

## 📊 Monitoring

- View logs in Render dashboard
- Set up alerts for service downtime
- Monitor database usage in MongoDB Atlas
- Check browser console for frontend errors

## 🆘 Support Resources

- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Documentation](https://www.mongodb.com/docs/atlas/)
- [Project README](./README.md)

---

**Congratulations! Your Finance Tracker is now live! 🎉**
