import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Alert,
  Spinner,
  Button,
  Card,
  Badge,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { getEnrolledCourses } from "../../services/courseService";
import DashboardActivities from "../Activities/DashboardActivities";

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
          <h2>My Learning Dashboard</h2>
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

      <Row>
        <Col lg={8}>
          {courses.length === 0 ? (
            <Alert variant="info">
              <h5>No enrolled courses yet!</h5>
              <p>
                Browse available courses and start your learning journey today.
              </p>
              <Button variant="primary" onClick={() => navigate("/courses")}>
                Explore Courses
              </Button>
            </Alert>
          ) : (
            <Row xs={1} md={2} className="g-4">
              {courses.map((course) => (
                <Col key={course._id}>
                  <Card className="h-100 shadow-sm">
                    <Card.Img
                      variant="top"
                      src={course.thumbnail}
                      style={{ height: "200px", objectFit: "cover" }}
                    />
                    <Card.Body className="d-flex flex-column">
                      <div className="mb-2">
                        <Badge bg="primary" className="me-2">
                          {course.category}
                        </Badge>
                        <Badge bg="secondary">{course.level}</Badge>
                      </div>

                      <Card.Title className="mb-2">{course.title}</Card.Title>
                      <Card.Text className="text-muted small flex-grow-1">
                        {course.description.substring(0, 100)}
                        {course.description.length > 100 && "..."}
                      </Card.Text>

                      <div className="mb-3">
                        <small className="text-muted">
                          <i className="bi bi-person-fill me-1"></i>
                          {course.instructor?.name}
                        </small>
                        <br />
                        <small className="text-muted">
                          <i className="bi bi-list-ul me-1"></i>
                          {course.lessons?.length || 0} lessons
                        </small>
                      </div>

                      <Button
                        variant="primary"
                        onClick={() => navigate(`/courses/${course._id}`)}
                        className="w-100"
                      >
                        <i className="bi bi-play-circle me-2"></i>
                        Continue Learning
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Col>

        <Col lg={4}>
          <div style={{ position: "sticky", top: "20px" }}>
            <DashboardActivities />
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default StudentDashboard;
