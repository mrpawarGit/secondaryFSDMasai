import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Alert,
  Spinner,
  ListGroup,
} from "react-bootstrap";
import {
  getCourseById,
  enrollInCourse,
  unenrollFromCourse,
} from "../../services/courseService";
import { AuthContext } from "../../context/AuthContext";

const CourseDetail = () => {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const data = await getCourseById(id);
      setCourse(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch course");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setActionLoading(true);
    try {
      await enrollInCourse(id);
      fetchCourse();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to enroll");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnenroll = async () => {
    setActionLoading(true);
    try {
      await unenrollFromCourse(id);
      fetchCourse();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to unenroll");
    } finally {
      setActionLoading(false);
    }
  };

  const isEnrolled = course?.students?.some(
    (student) => student._id === user?._id
  );
  const isInstructor = course?.instructor?._id === user?._id;

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (!course) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">Course not found</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Img
              variant="top"
              src={course.thumbnail}
              style={{ maxHeight: "400px", objectFit: "cover" }}
            />
            <Card.Body>
              <div className="mb-3">
                <Badge bg="primary" className="me-2">
                  {course.category}
                </Badge>
                <Badge bg="secondary">{course.level}</Badge>
              </div>

              <h2>{course.title}</h2>
              <p className="text-muted mb-3">
                <i className="bi bi-person-fill me-2"></i>
                Instructor: {course.instructor?.name}
              </p>

              <Card.Text>{course.description}</Card.Text>

              <div className="mt-4">
                <h5>Course Content</h5>
                {course.lessons?.length > 0 ? (
                  <ListGroup>
                    {course.lessons.map((lesson, index) => (
                      <ListGroup.Item key={lesson._id}>
                        <i className="bi bi-play-circle me-2"></i>
                        Lesson {index + 1}: {lesson.title}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                ) : (
                  <Alert variant="info">No lessons added yet</Alert>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm sticky-top" style={{ top: "20px" }}>
            <Card.Body>
              <h5 className="mb-3">Course Information</h5>

              <div className="mb-3">
                <small className="text-muted d-block">Enrolled Students</small>
                <strong>{course.students?.length || 0}</strong>
              </div>

              <div className="mb-3">
                <small className="text-muted d-block">Total Lessons</small>
                <strong>{course.lessons?.length || 0}</strong>
              </div>

              <div className="mb-3">
                <small className="text-muted d-block">Level</small>
                <strong>{course.level}</strong>
              </div>

              <hr />

              {isInstructor ? (
                <>
                  <Button
                    variant="primary"
                    className="w-100 mb-2"
                    onClick={() => navigate(`/courses/${id}/edit`)}
                  >
                    Edit Course
                  </Button>
                  <Button
                    variant="outline-primary"
                    className="w-100"
                    onClick={() => navigate(`/courses/${id}/lessons`)}
                  >
                    Manage Lessons
                  </Button>
                </>
              ) : user?.role === "student" ? (
                isEnrolled ? (
                  <>
                    <Button variant="success" className="w-100 mb-2" disabled>
                      <i className="bi bi-check-circle me-2"></i>
                      Enrolled
                    </Button>
                    <Button
                      variant="outline-danger"
                      className="w-100"
                      onClick={handleUnenroll}
                      disabled={actionLoading}
                    >
                      {actionLoading ? "Processing..." : "Unenroll"}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="primary"
                    className="w-100"
                    onClick={handleEnroll}
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Processing..." : "Enroll Now"}
                  </Button>
                )
              ) : (
                <Button
                  variant="primary"
                  className="w-100"
                  onClick={() => navigate("/login")}
                >
                  Login to Enroll
                </Button>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CourseDetail;
