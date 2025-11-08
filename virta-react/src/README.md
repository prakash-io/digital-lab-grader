# VirTA Frontend Source

Frontend React application for the VirTA Digital Lab Grader platform.

## Structure

```
src/
├── components/        # Reusable React components
│   ├── ui/           # UI components (sidebar, cards)
│   ├── LoginSignupForm.jsx
│   ├── NotificationButton.jsx
│   └── ThemeToggle.jsx
├── pages/            # Page components
│   ├── Dashboard.jsx
│   ├── InstructorDashboard.jsx
│   ├── CodeEditor.jsx
│   ├── StudentAssignments.jsx
│   ├── TeacherAssignments.jsx
│   ├── Leaderboard.jsx
│   ├── Profile.jsx
│   └── Store.jsx
├── context/          # React context providers
│   └── AuthContext.jsx
├── services/         # API service functions
│   ├── authService.js
│   ├── apiService.js
│   └── socketService.js
├── utils/            # Utility functions
│   └── avatars.js
└── App.jsx           # Main app component
```

## Key Components

### Pages

- **Dashboard** - Student dashboard with cards and navigation
- **InstructorDashboard** - Instructor dashboard with management tools
- **CodeEditor** - Code editor with syntax highlighting and test execution
- **StudentAssignments** - Student view of assignments
- **TeacherAssignments** - Teacher assignment management
- **Leaderboard** - Student rankings and statistics
- **Profile** - User profile management
- **Store** - Avatar shop with coin system

### Components

- **Sidebar** - Navigation sidebar with animations
- **Card Hover Effect** - Interactive card components
- **NotificationButton** - Real-time notification display
- **ThemeToggle** - Dark/light mode toggle
- **LoginSignupForm** - Authentication form

### Services

- **authService** - Authentication API calls
- **apiService** - General API service functions
- **socketService** - WebSocket connection management

## Features

- 🎨 Dark mode support
- 🔔 Real-time notifications
- 📱 Responsive design
- 🎭 Smooth animations
- 🎯 Role-based routing
- 🔐 Protected routes
- 💾 Local storage persistence

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Styling

- **Tailwind CSS** - Utility-first CSS framework
- **Custom CSS** - Component-specific styles
- **Dark Mode** - Full dark mode support

## State Management

- **React Context** - Authentication state
- **Local Storage** - User preferences and data
- **React Router** - Navigation state

## API Integration

All API calls are made through service functions:
- `authService` - Authentication
- `apiService` - Assignments, submissions, etc.
- `socketService` - WebSocket connections

## License

MIT License

