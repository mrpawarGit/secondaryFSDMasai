import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Button,
  Alert,
  Spinner,
  ListGroup,
  Badge,
} from "react-bootstrap";
import { getCourseById } from "../../services/courseService";
import { getLessonsByCourse, deleteLesson } from "../../services/lessonService";

const ManageLessons = () => {
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { courseId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    try {
      const [courseData, lessonsData] = await Promise.all([
        getCourseById(courseId),
        getLessonsByCourse(courseId),
      ]);
      setCourse(courseData);
      setLessons(lessonsData);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (lessonId) => {
    if (window.confirm("Are you sure you want to delete this lesson?")) {
      try {
        await deleteLesson(lessonId);
        setLessons(lessons.filter((lesson) => lesson._id !== lessonId));
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete lesson");
      }
    }
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading lessons...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Row className="mb-4">
        <Col>
          <Button
            variant="outline-secondary"
            onClick={() => navigate(`/courses/${courseId}`)}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to Course
          </Button>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <h2>{course?.title}</h2>
          <p className="text-muted">Manage course lessons</p>
        </Col>
        <Col xs="auto">
          <Button
            variant="primary"
            onClick={() => navigate(`/courses/${courseId}/lessons/add`)}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Add Lesson
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {lessons.length === 0 ? (
        <Alert variant="info">
          No lessons added yet. Click "Add Lesson" to create your first lesson!
        </Alert>
      ) : (
        <ListGroup>
          {lessons.map((lesson, index) => (
            <ListGroup.Item
              key={lesson._id}
              className="d-flex justify-content-between align-items-center"
            >
              <div className="d-flex align-items-center flex-grow-1">
                <Badge bg="secondary" className="me-3">
                  {index + 1}
                </Badge>
                <div>
                  <h5 className="mb-1">{lesson.title}</h5>
                  <small className="text-muted">
                    <i className="bi bi-clock me-1"></i>
                    {lesson.duration}
                  </small>
                </div>
              </div>
              <div className="d-flex gap-2">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => navigate(`/lessons/${lesson._id}`)}
                >
                  <i className="bi bi-eye"></i>
                </Button>
                <Button
                  variant="outline-warning"
                  size="sm"
                  onClick={() => navigate(`/lessons/${lesson._id}/edit`)}
                >
                  <i className="bi bi-pencil"></i>
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleDelete(lesson._id)}
                >
                  <i className="bi bi-trash"></i>
                </Button>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </Container>
  );
};

export default ManageLessons;
