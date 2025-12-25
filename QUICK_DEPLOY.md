# 🚀 Quick Deploy Reference

## One-Command Build Test
```bash
npm run build:frontend
```

## Pre-Deployment Check
```bash
npm run deploy:check
# or
./pre-deploy-check.sh
```

## Install All Dependencies
```bash
npm run install:all
```

## Environment Variables Quick Reference

### Backend (finance-tracker-api)
```
NODE_ENV=production
PORT=5001
MONGO_URI=<from-mongodb-atlas>
JWT_SECRET=<auto-generate-or-set-strong-secret>
FRONTEND_URL=https://finance-tracker-frontend.onrender.com
```

### Frontend (finance-tracker-frontend)
```
VITE_API_URL=https://finance-tracker-api.onrender.com
```

## Render Blueprint Deploy (Easiest Method)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for production"
   git push origin main
   ```

2. **Deploy on Render**
   - Go to https://dashboard.render.com/
   - Click "New +" → "Blueprint"
   - Connect your GitHub repo
   - Render auto-detects `render.yaml`
   - Set environment variables
   - Click "Apply"

3. **Update Cross-References**
   - After both services deploy, update:
     - Backend's `FRONTEND_URL` with actual frontend URL
     - Frontend's `VITE_API_URL` with actual backend URL

## Health Check Endpoint
```
https://your-api-url.onrender.com/api/health
```
Should return: `{"status":"ok","message":"Server is running"}`

## Common Issues

### CORS Error
- Verify `FRONTEND_URL` in backend matches frontend URL exactly
- Check both services are deployed

### 502 Bad Gateway
- Wait 30-60 seconds (free tier cold start)
- Check backend logs on Render dashboard

### Database Connection Failed
- Verify MongoDB Atlas connection string
- Whitelist 0.0.0.0/0 in MongoDB Network Access

### Build Failed
- Check build logs
- Verify all dependencies in package.json
- Test build locally: `npm run build:frontend`

## Service URLs Format
- Backend: `https://finance-tracker-api.onrender.com`
- Frontend: `https://finance-tracker-frontend.onrender.com`

## Files Required for Render
- ✅ `render.yaml` - Deployment configuration
- ✅ `package.json` - Root dependencies and scripts
- ✅ `frontend/package.json` - Frontend dependencies
- ✅ `.gitignore` - Protect sensitive files
- ✅ `.env.render` - Environment variables template

## After Deployment
1. Test signup/login
2. Create a transaction
3. Add a debt
4. Check dashboard
5. Verify stats page

## Free Tier Limits
- ⏱️ Services spin down after 15 min inactive
- 🚀 First request takes 30-60 seconds
- ⏰ 750 hours/month per service
- 📦 100 GB bandwidth/month

## Resources
- 📖 Full Guide: [RENDER_DEPLOY.md](./RENDER_DEPLOY.md)
- 📝 Deployment Checklist: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
- 🔗 Render Docs: https://render.com/docs
