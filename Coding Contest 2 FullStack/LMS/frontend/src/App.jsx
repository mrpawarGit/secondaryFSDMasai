import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import NavigationBar from "./components/Layout/Navbar";
import Footer from "./components/Layout/Footer";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import InstructorDashboard from "./components/Courses/InstructorDashboard";
import StudentDashboard from "./components/Courses/StudentDashboard";
import CreateCourse from "./components/Courses/CreateCourse";
import CourseList from "./components/Courses/CourseList";
import CourseDetail from "./components/Courses/CourseDetail";
import ManageLessons from "./components/Lessons/ManageLessons";
import AddLesson from "./components/Lessons/AddLesson";
import EditLesson from "./components/Lessons/EditLesson";
import LessonView from "./components/Lessons/LessonView";
import NotificationToast from "./components/Common/NotificationToast";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./App.css";

const Home = () => (
  <div className="container mt-5 text-center">
    <div className="row justify-content-center">
      <div className="col-md-8">
        <h1 className="display-4 mb-4">Welcome to Collaborative LMS</h1>
        <p className="lead mb-4">
          A real-time learning management system connecting instructors and
          students for interactive, collaborative learning experiences.
        </p>
        <div className="d-flex gap-3 justify-content-center mb-5">
          <a href="/courses" className="btn btn-primary btn-lg">
            <i className="bi bi-collection me-2"></i>
            Browse Courses
          </a>
          <a href="/signup" className="btn btn-outline-primary btn-lg">
            <i className="bi bi-person-plus me-2"></i>
            Get Started
          </a>
        </div>

        <div className="row text-start mt-5">
          <div className="col-md-4 mb-4">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body">
                <div className="mb-3">
                  <i className="bi bi-lightning-charge-fill text-primary fs-1"></i>
                </div>
                <h5 className="card-title">Real-Time Collaboration</h5>
                <p className="card-text">
                  Engage with live updates, instant notifications, and real-time
                  discussions.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body">
                <div className="mb-3">
                  <i className="bi bi-graph-up-arrow text-success fs-1"></i>
                </div>
                <h5 className="card-title">Track Your Progress</h5>
                <p className="card-text">
                  Monitor completion rates, view progress bars, and achieve your
                  learning goals.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body">
                <div className="mb-3">
                  <i className="bi bi-chat-dots-fill text-info fs-1"></i>
                </div>
                <h5 className="card-title">Interactive Learning</h5>
                <p className="card-text">
                  Ask questions, share insights, and learn together through
                  threaded discussions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="d-flex flex-column min-vh-100">
            <NavigationBar />
            <NotificationToast />

            <main className="flex-fill">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/courses" element={<CourseList />} />
                <Route path="/courses/:id" element={<CourseDetail />} />

                {/* Instructor Routes */}
                <Route
                  path="/instructor-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["instructor"]}>
                      <InstructorDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/courses/create"
                  element={
                    <ProtectedRoute allowedRoles={["instructor"]}>
                      <CreateCourse />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/courses/:courseId/lessons"
                  element={
                    <ProtectedRoute allowedRoles={["instructor"]}>
                      <ManageLessons />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/courses/:courseId/lessons/add"
                  element={
                    <ProtectedRoute allowedRoles={["instructor"]}>
                      <AddLesson />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/lessons/:lessonId/edit"
                  element={
                    <ProtectedRoute allowedRoles={["instructor"]}>
                      <EditLesson />
                    </ProtectedRoute>
                  }
                />

                {/* Student Routes */}
                <Route
                  path="/student-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["student"]}>
                      <StudentDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Shared Protected Routes */}
                <Route
                  path="/lessons/:lessonId"
                  element={
                    <ProtectedRoute allowedRoles={["instructor", "student"]}>
                      <LessonView />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>

            <Footer />
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
