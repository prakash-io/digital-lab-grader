# 🏆 VirTA - Hackathon Submission

## Project Overview

**VirTA (Virtual Teaching Assistant)** is an automated lab grading system designed for universities to streamline coding assignments, evaluate student submissions, and manage academic workflows.

## 🎯 Problem Statement

Universities struggle with:
- Manual grading of coding assignments (time-consuming)
- Lack of real-time feedback for students
- Difficulty in managing large numbers of assignments
- Inconsistent grading standards
- Limited scalability for coding assessments

## 💡 Solution

VirTA provides:
- **Automated Code Grading** - AI-powered auto-grading with complexity analysis
- **Real-time Feedback** - Instant results and notifications
- **Scalable Platform** - Handle hundreds of students simultaneously
- **Fair Grading** - Consistent evaluation based on correctness, efficiency, and code quality
- **User-friendly Interface** - Separate portals for students and instructors

## 🚀 Key Features

### For Students
- View and submit coding assignments
- Run public tests before submission
- Get instant feedback on code
- Check leaderboard rankings
- Manage profile and avatars
- Receive real-time notifications

### For Instructors
- Create and manage coding assignments
- Configure test cases (public and hidden)
- Set time and memory limits
- View student leaderboard
- Make announcements
- Track assignment statistics

### Auto-Grading System
- **Correctness (0-6 points)** - Based on test case pass rates
- **Efficiency (0-3 points)** - Algorithm complexity analysis
- **Code Quality (0-1 points)** - Static analysis
- **Total Score** - Out of 10 points with detailed feedback

## 🛠 Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Framer Motion
- Socket.IO Client

### Backend
- Node.js
- Express.js
- Socket.IO
- BullMQ (Job Queue)
- Redis
- Piston API (Code Execution)

## 📊 Project Statistics

- **Lines of Code**: 10,000+
- **Components**: 20+
- **Pages**: 10+
- **API Endpoints**: 15+
- **Test Cases**: Support for unlimited test cases
- **Languages Supported**: Python, JavaScript, Java, C++, C

## 🎨 Demo Features

1. **Student Portal**
   - Interactive dashboard with cards
   - Code editor with syntax highlighting
   - Real-time submission tracking
   - Leaderboard with statistics

2. **Instructor Portal**
   - Assignment creation and management
   - Student overview and leaderboard
   - Announcement system
   - Grade management

3. **Auto-Grading**
   - Asynchronous job processing
   - Detailed scoring breakdown
   - Feedback and suggestions
   - Performance analysis

## 🏃 Quick Start

```bash
# Clone repository
git clone https://github.com/prakash-io/digital-lab-grader.git
cd digital-lab-grader/virta-react

# Install dependencies
npm install
cd server && npm install && cd ..

# Start backend
cd server
npm run dev

# Start frontend (in new terminal)
npm run dev
```

## 📱 Screenshots

### Student Dashboard
- Interactive cards for assignments
- Real-time notifications
- Profile management

### Code Editor
- Syntax highlighting
- Test case execution
- Auto-grading results

### Instructor Dashboard
- Assignment management
- Student leaderboard
- Announcement system

## 🎯 Future Enhancements

- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Email notifications
- [ ] Plagiarism detection
- [ ] Advanced code analysis
- [ ] Mobile app
- [ ] Multi-language support expansion
- [ ] Video tutorials
- [ ] Analytics dashboard

## 👥 Team

- **Developer**: Prakash Kumar
- **Repository**: [https://github.com/prakash-io/digital-lab-grader](https://github.com/prakash-io/digital-lab-grader)

## 📝 Documentation

- [Main README](./README.md)
- [Backend Documentation](./server/README.md)
- [Frontend Documentation](./src/README.md)
- [Contributing Guide](./CONTRIBUTING.md)

## 🏆 Hackathon Highlights

- ✅ Fully functional full-stack application
- ✅ Real-time features with WebSocket
- ✅ Auto-grading system with job queue
- ✅ Role-based access control
- ✅ Comprehensive documentation
- ✅ Production-ready code structure
- ✅ Dark mode support
- ✅ Responsive design

## 📞 Contact

- **GitHub**: [prakash-io](https://github.com/prakash-io)
- **Repository**: [digital-lab-grader](https://github.com/prakash-io/digital-lab-grader)

---

**Built with ❤️ for Hackathon 2025**

