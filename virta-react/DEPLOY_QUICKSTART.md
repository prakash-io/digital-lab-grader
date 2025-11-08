# Quick Deployment Guide - VirTA

## 🚀 Fastest Deployment (Vercel + Railway)

### Step 1: Deploy Backend (Railway) - 5 minutes

1. Go to [railway.app](https://railway.app) and sign up with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Click on the service → "Settings"
5. Set **Root Directory** to: `server`
6. Add Environment Variables:
   ```
   PORT=3001
   JWT_SECRET=your-secret-key-here (use: openssl rand -base64 32)
   NODE_ENV=production
   CORS_ORIGINS=https://your-app.vercel.app (update after frontend deploy)
   ```
7. Click "Generate Domain" to get your backend URL
8. Copy the URL (e.g., `https://virta-backend.railway.app`)

### Step 2: Deploy Frontend (Vercel) - 5 minutes

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variables:
   ```
   VITE_API_URL=https://your-backend.railway.app (from Step 1)
   VITE_SOCKET_URL=https://your-backend.railway.app (same as above)
   ```
6. Click "Deploy"
7. Copy your frontend URL (e.g., `https://virta.vercel.app`)

### Step 3: Update Backend CORS - 2 minutes

1. Go back to Railway dashboard
2. Update `CORS_ORIGINS` environment variable:
   ```
   CORS_ORIGINS=https://your-frontend.vercel.app
   ```
3. Railway will automatically redeploy

### Step 4: Test - 2 minutes

1. Visit your Vercel URL
2. Try signing up a new user
3. Test login
4. ✅ Done!

## 📝 Optional: Add Redis (for Auto-Grading)

1. In Railway, click "New" → "Database" → "Add Redis"
2. Copy the Redis URL
3. Add to environment variables: `REDIS_URL=redis://...`
4. Redeploy

## 🔧 Troubleshooting

**CORS Error?**
- Make sure `CORS_ORIGINS` in Railway matches your Vercel URL exactly
- No trailing slashes
- Use https://

**Socket.IO not connecting?**
- Verify `VITE_SOCKET_URL` matches backend URL
- Check browser console for errors

**API 404?**
- Ensure backend URL in Vercel env vars is correct
- Check Railway logs for errors

## 🎉 That's it!

Your app should now be live and accessible worldwide!

