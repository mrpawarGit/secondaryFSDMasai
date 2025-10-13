import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import NavigationBar from "./components/Layout/Navbar";
import Footer from "./components/Layout/Footer";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./App.css";

// Temporary dashboard components
const InstructorDashboard = () => (
  <div className="container mt-5">
    <h2>Instructor Dashboard</h2>
    <p>
      Welcome to the instructor dashboard. Course management features coming
      soon!
    </p>
  </div>
);

const StudentDashboard = () => (
  <div className="container mt-5">
    <h2>Student Dashboard</h2>
    <p>Welcome to the student dashboard. Enrolled courses will appear here!</p>
  </div>
);

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
              <Route
                path="/instructor-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["instructor"]}>
                    <InstructorDashboard />
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
