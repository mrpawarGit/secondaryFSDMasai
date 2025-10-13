import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  ListGroup,
  Badge,
  Alert,
  Spinner,
  ProgressBar,
} from "react-bootstrap";
import { getCourseById } from "../../services/courseService";
import { getLessonsByCourse } from "../../services/lessonService";

const StudentCourseView = () => {
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [completedLessons, setCompletedLessons] = useState([]);

  const { courseId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const [courseData, lessonsData] = await Promise.all([
        getCourseById(courseId),
        getLessonsByCourse(courseId),
      ]);
      setCourse(courseData);
      setLessons(lessonsData);

      // Load completed lessons from localStorage
      const saved = localStorage.getItem(`completed_${courseId}`);
      if (saved) {
        setCompletedLessons(JSON.parse(saved));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch course data");
    } finally {
      setLoading(false);
    }
  };

  const handleLessonClick = (lessonId) => {
    navigate(`/lessons/${lessonId}`);
  };

  const progress =
    lessons.length > 0
      ? Math.round((completedLessons.length / lessons.length) * 100)
      : 0;

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading course...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Img
              variant="top"
              src={course.thumbnail}
              style={{ maxHeight: "300px", objectFit: "cover" }}
            />
            <Card.Body>
              <div className="mb-3">
                <Badge bg="primary" className="me-2">
                  {course.category}
                </Badge>
                <Badge bg="secondary">{course.level}</Badge>
              </div>

              <h2>{course.title}</h2>
              <p className="text-muted">
                <i className="bi bi-person-fill me-2"></i>
                Instructor: {course.instructor?.name}
              </p>

              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span>Your Progress</span>
                  <span>
                    <strong>{completedLessons.length}</strong> /{" "}
                    {lessons.length} lessons completed
                  </span>
                </div>
                <ProgressBar
                  now={progress}
                  label={`${progress}%`}
                  variant="success"
                />
              </div>

              <p>{course.description}</p>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="bi bi-list-ul me-2"></i>
                Course Lessons
              </h5>
            </Card.Header>
            <ListGroup variant="flush">
              {lessons.length > 0 ? (
                lessons.map((lesson, index) => (
                  <ListGroup.Item
                    key={lesson._id}
                    className="d-flex align-items-center"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleLessonClick(lesson._id)}
                    action
                  >
                    <div className="me-3">
                      {completedLessons.includes(lesson._id) ? (
                        <i className="bi bi-check-circle-fill text-success fs-4"></i>
                      ) : (
                        <Badge bg="secondary" pill>
                          {index + 1}
                        </Badge>
                      )}
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-1">{lesson.title}</h6>
                      <small className="text-muted">
                        <i className="bi bi-clock me-1"></i>
                        {lesson.duration}
                      </small>
                    </div>
                    <i className="bi bi-play-circle fs-4 text-primary"></i>
                  </ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item>
                  <Alert variant="info" className="mb-0">
                    No lessons available yet
                  </Alert>
                </ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm sticky-top" style={{ top: "20px" }}>
            <Card.Body>
              <h5 className="mb-3">Course Stats</h5>

              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted">Progress</span>
                  <strong className="text-success">{progress}%</strong>
                </div>
                <ProgressBar now={progress} variant="success" />
              </div>

              <hr />

              <div className="mb-3">
                <small className="text-muted d-block">Total Lessons</small>
                <strong className="fs-5">{lessons.length}</strong>
              </div>

              <div className="mb-3">
                <small className="text-muted d-block">Completed</small>
                <strong className="fs-5 text-success">
                  {completedLessons.length}
                </strong>
              </div>

              <div className="mb-3">
                <small className="text-muted d-block">Remaining</small>
                <strong className="fs-5 text-warning">
                  {lessons.length - completedLessons.length}
                </strong>
              </div>

              <hr />

              <div className="mb-3">
                <small className="text-muted d-block">Students Enrolled</small>
                <strong>
                  <i className="bi bi-people-fill me-2"></i>
                  {course.students?.length || 0}
                </strong>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default StudentCourseView;
