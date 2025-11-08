# Fix Vercel + Railway Deployment Issues

## Problem
Frontend deployed to Vercel is showing CORS errors because:
1. Environment variables in Vercel are not set correctly
2. Backend CORS configuration in Railway doesn't include the Vercel URL

## Solution

### Step 1: Get Your Railway Backend URL

1. Go to your Railway dashboard: https://railway.app
2. Select your backend service
3. Click on the service
4. In the "Settings" tab, find "Generate Domain" or check "Networking" tab
5. Copy the public URL (e.g., `https://virta-backend-production.up.railway.app`)

### Step 2: Update Vercel Environment Variables

1. Go to your Vercel dashboard: https://vercel.com
2. Select your project (`digital-lab-grader`)
3. Go to "Settings" → "Environment Variables"
4. Add/Update these variables:

```
VITE_API_URL=https://your-actual-railway-url.railway.app
VITE_SOCKET_URL=https://your-actual-railway-url.railway.app
```

**Important:** Replace `your-actual-railway-url.railway.app` with your actual Railway backend URL (no trailing slash)

5. Click "Save"
6. Go to "Deployments" tab
7. Click the three dots (⋯) on the latest deployment
8. Click "Redeploy" to apply the new environment variables

### Step 3: Update Railway CORS Configuration

1. Go to your Railway dashboard: https://railway.app
2. Select your backend service
3. Go to "Variables" tab
4. Update the `CORS_ORIGINS` variable:

```
CORS_ORIGINS=https://digital-lab-grader.vercel.app
```

**Important:** 
- Use your actual Vercel URL (https://digital-lab-grader.vercel.app)
- No trailing slash
- If you have multiple origins, separate them with commas: `https://digital-lab-grader.vercel.app,https://another-domain.com`

5. Railway will automatically redeploy with the new environment variable

### Step 4: Verify the Fix

1. Wait for both Vercel and Railway to finish redeploying
2. Visit your Vercel site: https://digital-lab-grader.vercel.app/signup
3. Try to sign up or log in
4. Check browser console - CORS errors should be gone

## Common Issues

### Issue: Still seeing "your-backend.railway.app" in errors
**Solution:** The Vercel environment variables weren't applied. Make sure to:
- Save the environment variables in Vercel
- Redeploy the Vercel application
- Clear browser cache and hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Issue: CORS error persists after updating Railway
**Solution:** 
- Make sure the `CORS_ORIGINS` variable in Railway exactly matches your Vercel URL
- Check for typos or extra spaces
- Wait for Railway to finish redeploying (can take 1-2 minutes)
- Verify the Railway service is running (check logs)

### Issue: Backend URL not working
**Solution:**
- Verify your Railway backend is running and accessible
- Test the backend URL directly: `https://your-backend-url.railway.app/api/health`
- Should return: `{"status":"ok","message":"VirTA Backend API is running"}`

## Quick Checklist

- [ ] Got Railway backend URL
- [ ] Updated Vercel environment variables (VITE_API_URL, VITE_SOCKET_URL)
- [ ] Redeployed Vercel application
- [ ] Updated Railway CORS_ORIGINS with Vercel URL
- [ ] Verified Railway redeployed
- [ ] Tested signup/login functionality
- [ ] No CORS errors in browser console

## Need Help?

1. Check Railway logs for backend errors
2. Check Vercel deployment logs for build errors
3. Verify environment variables are set correctly in both platforms
4. Test backend health endpoint directly
5. Check browser network tab for actual requests being made

