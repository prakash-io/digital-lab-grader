# Setup Instructions for VirTA Backend

## Quick Start

### 1. Install Backend Dependencies
```bash
cd /Users/prakash/Desktop/VirTA/virta-react/server
npm install
```

### 2. Start Backend Server
```bash
cd /Users/prakash/Desktop/VirTA/virta-react/server
npm run dev
```
Backend will run on `http://localhost:3001`

### 3. Start Frontend Server (in a new terminal)
```bash
cd /Users/prakash/Desktop/VirTA/virta-react
npm run dev
```
Frontend will run on `http://localhost:5173`

## What Was Created

### Backend Files
- `server/server.js` - Main Express server
- `server/routes/auth.js` - Authentication routes (signup, login, verify)
- `server/utils/users.js` - User data management (JSON file storage)
- `server/data/users.json` - User database (created automatically)

### Frontend Updates
- `src/context/AuthContext.jsx` - Authentication context for state management
- `src/services/authService.js` - API service for authentication
- `src/pages/Dashboard.jsx` - Protected dashboard page
- Updated `src/components/LoginSignupForm.jsx` - Connected to backend API
- Updated `src/App.jsx` - Added dashboard route and protected route
- Updated `src/main.jsx` - Added AuthProvider

## Features

✅ User registration (signup)
✅ User login
✅ JWT token authentication
✅ Password hashing (bcrypt)
✅ Protected routes
✅ Auto-redirect to dashboard after login/signup
✅ Error handling
✅ Loading states

## Testing

1. Go to `http://localhost:5173/signup`
2. Click "Register" to create a new account
3. Fill in username, email, and password (min 6 characters)
4. After successful registration, you'll be redirected to `/dashboard`
5. Logout and login again with your credentials

## API Endpoints

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token
- `GET /api/health` - Health check

## Notes

- User data is stored in `server/data/users.json`
- JWT tokens are stored in localStorage
- Tokens expire after 7 days
- Password minimum length: 6 characters
- The dashboard page is currently a simple page showing user info
- To redirect to your main dashboard project, update `src/pages/Dashboard.jsx`

## Troubleshooting

- **CORS errors**: Make sure backend is running on port 3001
- **Connection refused**: Check if backend server is running
- **Port already in use**: Change PORT in server/.env or server.js
- **Module not found**: Run `npm install` in the server directory

## Next Steps

1. Replace JSON storage with a proper database (PostgreSQL, MongoDB)
2. Add email verification
3. Add password reset functionality
4. Integrate with your main dashboard project
5. Add more security features (rate limiting, input validation)
6. Deploy to production

