# Contributing to VirTA

Thank you for your interest in contributing to VirTA! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/digital-lab-grader.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Commit your changes: `git commit -m 'Add some feature'`
6. Push to the branch: `git push origin feature/your-feature-name`
7. Open a Pull Request

## Development Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Git

### Installation
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### Running the Application
```bash
# Start backend (terminal 1)
cd server
npm run dev

# Start frontend (terminal 2)
npm run dev
```

## Code Style

- Use ESLint for code linting
- Follow React best practices
- Use meaningful variable and function names
- Add comments for complex logic
- Keep components small and focused

## Commit Messages

Follow conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

## Pull Request Process

1. Update README.md if needed
2. Add tests if applicable
3. Ensure all tests pass
4. Update documentation
5. Request review from maintainers

## Reporting Bugs

Use GitHub Issues to report bugs. Include:
- Description of the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Environment details (OS, Node version, etc.)

## Suggesting Features

Use GitHub Issues to suggest features. Include:
- Description of the feature
- Use case
- Potential implementation approach

## Questions?

Feel free to open an issue for any questions or concerns.

Thank you for contributing! 🎉

