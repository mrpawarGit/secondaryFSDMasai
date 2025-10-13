import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
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
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./App.css";

const Home = () => (
  <div className="container mt-5 text-center">
    <h1>Welcome to Collaborative LMS</h1>
    <p className="lead">
      A real-time learning management system for instructors and students
    </p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100">
          <NavigationBar />

          <main className="flex-fill">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/courses" element={<CourseList />} />
              <Route path="/courses/:id" element={<CourseDetail />} />

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
                path="/student-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
