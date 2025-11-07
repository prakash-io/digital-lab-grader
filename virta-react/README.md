# VirTA React App

A plain React application (no Next.js) with HTML, CSS, and JavaScript.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Structure

- `src/App.jsx` - Main app component
- `src/components/` - React components
  - `AnimatedEnterButton.jsx` - Two-finger swipe login cards
  - `BackgroundRippleEffect.jsx` - Interactive background grid
  - `HeroHighlight.jsx` - Hero section with highlight effect
  - `HoverBorderGradient.jsx` - Gradient border button component
- `src/lib/utils.js` - Utility functions
- `src/index.css` - Global styles with Tailwind
- `src/App.css` - App-specific styles

## Features

- Two-finger swipe up gesture detection (mobile & trackpad)
- Blurred backdrop with animated login cards
- Interactive background ripple effect
- Hero highlight animation
- No Next.js dependencies - pure React with Vite
