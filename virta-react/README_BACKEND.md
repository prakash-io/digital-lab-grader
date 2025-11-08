# VirTA React - Backend Integration

This document explains how to run the full-stack application with the backend server.

## Prerequisites

- Node.js (v18 or higher)
- npm

## Setup Instructions

### 1. Install Frontend Dependencies
```bash
cd /Users/prakash/Desktop/VirTA/virta-react
npm install
```

### 2. Install Backend Dependencies
```bash
cd /Users/prakash/Desktop/VirTA/virta-react/server
npm install
```

### 3. Start the Backend Server

In one terminal:
```bash
cd /Users/prakash/Desktop/VirTA/virta-react/server
npm run dev
```

The backend will run on `http://localhost:3001`

### 4. Start the Frontend Development Server

In another terminal:
```bash
cd /Users/prakash/Desktop/VirTA/virta-react
npm run dev
```

The frontend will run on `http://localhost:5173` (or the port shown in terminal)

## Features

- **Signup/Registration**: Users can create a new account with username, email, and password
- **Login**: Users can login with username and password
- **Dashboard**: Protected route that requires authentication
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Passwords are securely hashed using bcrypt
- **Auto Redirect**: After successful login/signup, users are redirected to the dashboard

## Project Structure

```
virta-react/
├── server/                 # Backend API
│   ├── routes/            # API routes
│   │   └── auth.js        # Authentication routes
│   ├── utils/             # Utility functions
│   │   └── users.js       # User data management
│   ├── data/              # Data storage
│   │   └── users.json     # User database (JSON file)
│   └── server.js          # Main server file
├── src/
│   ├── components/        # React components
│   │   └── LoginSignupForm.jsx
│   ├── pages/             # Page components
│   │   ├── Home.jsx
│   │   ├── Signup.jsx
│   │   └── Dashboard.jsx
│   ├── context/           # React context
│   │   └── AuthContext.jsx
│   ├── services/          # API services
│   │   └── authService.js
│   └── App.jsx
└── package.json
```

## API Endpoints

- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login with credentials
- `GET /api/auth/verify` - Verify JWT token
- `GET /api/health` - Health check

## Authentication Flow

1. User signs up or logs in through the frontend form
2. Frontend sends request to backend API
3. Backend validates credentials and returns JWT token
4. Frontend stores token in localStorage
5. User is redirected to dashboard
6. Protected routes check for valid token
7. If token is invalid or expired, user is redirected to signup page

## Testing

1. Start both servers (backend and frontend)
2. Navigate to `http://localhost:5173/signup`
3. Register a new account
4. You will be redirected to the dashboard
5. Logout and login again with your credentials

## Troubleshooting

- **CORS errors**: Make sure the backend server is running on port 3001
- **Connection refused**: Check if the backend server is running
- **Token expired**: Logout and login again
- **User already exists**: Try a different username or email

## Next Steps

- Replace JSON file storage with a proper database (PostgreSQL, MongoDB)
- Add email verification
- Add password reset functionality
- Add rate limiting
- Add input validation and sanitization
- Add logging
- Add unit tests
- Deploy to production

