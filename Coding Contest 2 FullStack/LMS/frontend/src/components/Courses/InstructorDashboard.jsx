import { useState, useEffect } from "react";
import { Container, Row, Col, Button, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  getInstructorCourses,
  deleteCourse,
} from "../../services/courseService";
import CourseCard from "./CourseCard";

const InstructorDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await getInstructorCourses();
      setCourses(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        await deleteCourse(courseId);
        setCourses(courses.filter((course) => course._id !== courseId));
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete course");
      }
    }
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading courses...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Row className="mb-4">
        <Col>
          <h2>My Courses</h2>
          <p className="text-muted">Manage your courses and lessons</p>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={() => navigate("/courses/create")}>
            <i className="bi bi-plus-circle me-2"></i>
            Create New Course
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {courses.length === 0 ? (
        <Alert variant="info">
          You haven't created any courses yet. Click "Create New Course" to get
          started!
        </Alert>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {courses.map((course) => (
            <Col key={course._id}>
              <CourseCard
                course={course}
                isInstructor={true}
                onDelete={handleDelete}
              />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default InstructorDashboard;
