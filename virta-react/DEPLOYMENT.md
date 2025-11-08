# Deployment Guide for VirTA

This guide covers deploying the VirTA application (frontend + backend) to various platforms.

## Project Structure

- **Frontend**: React + Vite application in the root directory
- **Backend**: Node.js/Express server in the `server/` directory

## Prerequisites

1. Node.js 18+ installed
2. Git repository pushed to GitHub
3. Accounts on deployment platforms:
   - **Frontend**: Vercel, Netlify, or similar
   - **Backend**: Railway, Render, Heroku, or similar
   - **Redis** (Optional): Railway, Render, or Upstash (for auto-grading feature)

## Deployment Options

### Option 1: Vercel (Frontend) + Railway (Backend) - Recommended

#### Frontend Deployment (Vercel)

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Deploy via Vercel Dashboard**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure:
     - **Framework Preset**: Vite
     - **Root Directory**: `./` (root)
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Install Command**: `npm install`

3. **Environment Variables**:
   - `VITE_API_URL`: Your backend API URL (e.g., `https://your-backend.railway.app`)
   - `VITE_SOCKET_URL`: Your backend Socket.IO URL (same as API URL)

4. **Deploy**: Click "Deploy"

#### Backend Deployment (Railway)

1. **Create Railway Account**:
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure Service**:
   - **Root Directory**: `server`
   - **Start Command**: `npm start`
   - **Build Command**: `npm install`

4. **Environment Variables**:
   - `PORT`: `3001` (Railway will auto-assign, but keep this)
   - `JWT_SECRET`: Generate a strong secret (e.g., use `openssl rand -base64 32`)
   - `NODE_ENV`: `production`
   - `CORS_ORIGINS`: Your Vercel frontend URL (e.g., `https://your-app.vercel.app`)
   - `REDIS_URL`: (Optional) Redis connection string if using Redis

5. **Add Redis** (Optional for auto-grading):
   - Click "New" → "Database" → "Add Redis"
   - Copy the `REDIS_URL` and add it to environment variables

6. **Deploy**: Railway will automatically deploy

7. **Get Backend URL**:
   - Copy the generated URL (e.g., `https://your-backend.railway.app`)
   - Update frontend environment variables with this URL

### Option 2: Netlify (Frontend) + Render (Backend)

#### Frontend Deployment (Netlify)

1. **Deploy via Netlify Dashboard**:
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository

2. **Build Settings**:
   - **Base directory**: `./` (root)
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

3. **Environment Variables**:
   - `VITE_API_URL`: Your backend API URL
   - `VITE_SOCKET_URL`: Your backend Socket.IO URL

4. **Deploy**: Click "Deploy site"

#### Backend Deployment (Render)

1. **Create Render Account**:
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

3. **Configure Service**:
   - **Name**: `virta-backend`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

4. **Environment Variables**:
   - `PORT`: `3001`
   - `JWT_SECRET`: Generate a strong secret
   - `NODE_ENV`: `production`
   - `CORS_ORIGINS`: Your Netlify frontend URL
   - `REDIS_URL`: (Optional) Redis connection string

5. **Add Redis** (Optional):
   - Click "New +" → "Redis"
   - Copy the `Internal Redis URL` to environment variables

6. **Deploy**: Render will automatically deploy

### Option 3: Full Stack on Render

1. **Frontend**:
   - Create a "Static Site" service
   - Connect GitHub repository
   - Build command: `npm run build`
   - Publish directory: `dist`

2. **Backend**:
   - Follow the backend deployment steps above

## Environment Variables Setup

### Frontend (.env or Platform Environment Variables)

```env
VITE_API_URL=https://your-backend-url.com
VITE_SOCKET_URL=https://your-backend-url.com
```

### Backend (.env or Platform Environment Variables)

```env
PORT=3001
JWT_SECRET=your-strong-secret-key-here
NODE_ENV=production
CORS_ORIGINS=https://your-frontend-url.com
REDIS_URL=redis://your-redis-url (optional)
```

## Post-Deployment Checklist

1. ✅ **Frontend deployed and accessible**
2. ✅ **Backend deployed and accessible**
3. ✅ **Environment variables configured**
4. ✅ **CORS origins updated in backend**
5. ✅ **Frontend API URL updated**
6. ✅ **Test authentication (signup/login)**
7. ✅ **Test assignment creation (teacher)**
8. ✅ **Test code submission (student)**
9. ✅ **Test Socket.IO connections (real-time features)**
10. ✅ **Test Redis (if using auto-grading)**

## Testing Deployment

1. **Test Frontend**:
   - Visit your frontend URL
   - Try signing up a new user
   - Try logging in

2. **Test Backend API**:
   - Visit `https://your-backend-url.com/api/health`
   - Should return `{ status: "ok" }`

3. **Test Socket.IO**:
   - Open browser console on frontend
   - Check for Socket.IO connection logs
   - Test real-time features (announcements, notifications)

## Troubleshooting

### CORS Errors
- Ensure `CORS_ORIGINS` in backend includes your frontend URL
- Check that frontend URL doesn't have trailing slashes
- Verify both URLs use the same protocol (https)

### Socket.IO Connection Issues
- Ensure Socket.IO URL matches backend URL
- Check that backend allows your frontend origin
- Verify WebSocket support on your hosting platform

### Redis Connection Issues
- Redis is optional - auto-grading will use synchronous fallback
- If using Redis, verify connection string format
- Check Redis service is running and accessible

### Build Errors
- Ensure Node.js version matches locally (18+)
- Check all dependencies are in `package.json`
- Verify build commands are correct

## Production Best Practices

1. **Security**:
   - Use strong `JWT_SECRET` (generate with `openssl rand -base64 32`)
   - Enable HTTPS only
   - Set proper CORS origins (no wildcards)
   - Use environment variables for all secrets

2. **Performance**:
   - Enable compression on backend
   - Use CDN for frontend assets
   - Enable caching headers
   - Monitor Redis usage (if applicable)

3. **Monitoring**:
   - Set up error tracking (Sentry, etc.)
   - Monitor API response times
   - Set up uptime monitoring
   - Log important events

## Quick Deploy Commands

### Local Testing

```bash
# Backend
cd server
npm install
npm start

# Frontend (in another terminal)
npm install
npm run build
npm run preview
```

### Production Build

```bash
# Build frontend
npm run build

# Start backend
cd server
npm start
```

## Support

For issues or questions, please refer to:
- [README.md](./README.md) - Project overview
- [TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md) - Technical details
- [WORKFLOW_EXPLANATION.md](./WORKFLOW_EXPLANATION.md) - Workflow explanation

