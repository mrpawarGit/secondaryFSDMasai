# Collaborative Learning Management System (LMS)

A full-stack real-time Learning Management System built with the MERN stack, enabling instructors and students to collaborate in interactive courses with live updates.

## 🚀 Features

### Authentication & Authorization

- JWT-based secure authentication
- Role-based access control (Instructor & Student)
- Password encryption with bcrypt
- Protected routes and API endpoints

### Course Management (Coming Soon)

- Instructors can create and manage multiple courses
- Add/edit/delete lessons with video content
- Invite students via email or username
- Course enrollment system

### Real-Time Features (Coming Soon)

- Live lesson updates with Socket.IO
- Real-time comment system
- Activity feed for course actions
- Instant notifications

### Lesson Management (Coming Soon)

- Video lessons with descriptions and resources
- Progress tracking for students
- Mark lessons as complete
- Drag-and-drop lesson reordering

### Additional Features (Coming Soon)

- Threaded comments and discussions
- Search and filter lessons
- Progress bars and analytics
- Pagination for better performance

## 🛠️ Tech Stack

### Frontend

- **React.js** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Bootstrap 5** - CSS framework
- **React Bootstrap** - Bootstrap components for React
- **Axios** - HTTP client
- **Context API** - State management

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **Socket.IO** - Real-time communication
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js**
- **npm**
- **MongoDB**
- **Git**

## 🔧 Installation & Setup

### 1. Clone the Repository

```
git clone <repo-url>
cd collaborative-lms
```

### 2. Backend Setup

```
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env file with your configurations
# PORT=5000
# MONGO_URI=mongodb://localhost:27017/collaborative-lms
# JWT_SECRET=your_jwt_secret_key
# JWT_EXPIRE=7d
```

### 3. Frontend Setup

```
# Navigate to frontend folder
cd ../frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env file
# VITE_API_URL=http://localhost:5000/api
```

### 4. Start MongoDB

```
# Make sure MongoDB is running
mongod
```

### 5. Run the Application

**Terminal 1 - Backend:**

```
cd backend
npm run dev
```

**Terminal 2 - Frontend:**

```
cd frontend
npm run dev
```

The application will be available at:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

## 📁 Project Structure

```
collaborative-lms/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Authentication & authorization
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── utils/           # Helper functions
│   ├── .env             # Environment variables
│   ├── server.js        # Entry point
│   └── package.json
├── frontend/
│   ├── public/          # Static files
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── context/     # Context API
│   │   ├── services/    # API services
│   │   ├── App.jsx      # Main component
│   │   └── main.jsx     # Entry point
│   ├── .env             # Environment variables
│   ├── vite.config.js   # Vite configuration
│   └── package.json
└── README.md
```

## 🔐 API Endpoints

### Authentication

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (Protected)

### Courses (Coming Soon)

- `POST /api/courses` - Create course (Instructor only)
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get single course
- `PUT /api/courses/:id` - Update course (Instructor only)
- `DELETE /api/courses/:id` - Delete course (Instructor only)

### Lessons (Coming Soon)

- `POST /api/courses/:courseId/lessons` - Add lesson
- `GET /api/courses/:courseId/lessons` - Get all lessons
- `PUT /api/lessons/:id` - Update lesson
- `DELETE /api/lessons/:id` - Delete lesson

## 👥 User Roles

### Instructor

- Create, edit, and delete courses
- Upload lessons with video content
- Manage students in their courses
- Delete inappropriate comments
- View analytics and progress

### Student

- Enroll in courses
- View lessons and mark as complete
- Comment on lessons
- Track learning progress
- Search and filter content

## 🧪 Testing

### Test User Credentials

**Instructor Account:**

```
Email: instructor@test.com
Password: password123
```

**Student Account:**

```
Email: student@test.com
Password: password123
```

### API Testing with Postman

1. Set environment variables
2. Test authentication endpoints
3. Test protected routes with JWT token

## 🚧 Development Roadmap

- [x] Project setup and structure
- [x] Authentication & Authorization
- [ ] Course Management
- [ ] Lesson Management
- [ ] Real-time features with Socket.IO
- [ ] Comment system
- [ ] Search and filtering
- [ ] Progress tracking
- [ ] Activity feed
- [ ] File uploads
- [ ] Email notifications
- [ ] Video integration
- [ ] Analytics dashboard

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

Your Name - [GitHub Profile](https://github.com/mrpawarGit)

## 🙏 Acknowledgments

- Masai School for the project requirements
- MERN Stack community
- Bootstrap team
- Socket.IO documentation

## 📧 Contact

For any queries or support, please contact:

- Email: your.email@example.com
- GitHub: [@mrpawarGit](https://github.com/mrpawarGit)

## 🐛 Known Issues

- None at the moment

## 📌 Notes

- This project is built as part of an evaluation assignment
- AI tools were used for assistance in specific parts (authentication, socket setup)
- The project demonstrates integration of multiple complex functionalities

---
