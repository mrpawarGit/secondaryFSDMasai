import { useState, useEffect } from "react";
import { Container, Row, Col, Alert, Spinner, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { getEnrolledCourses } from "../../services/courseService";
import CourseCard from "./CourseCard";

const StudentDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      const data = await getEnrolledCourses();
      setCourses(data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch enrolled courses"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading your courses...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Row className="mb-4">
        <Col>
          <h2>My Enrolled Courses</h2>
          <p className="text-muted">Continue your learning journey</p>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={() => navigate("/courses")}>
            <i className="bi bi-search me-2"></i>
            Browse Courses
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {courses.length === 0 ? (
        <Alert variant="info">
          You haven't enrolled in any courses yet. Browse available courses to
          get started!
        </Alert>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {courses.map((course) => (
            <Col key={course._id}>
              <CourseCard course={course} isInstructor={false} />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default StudentDashboard;
