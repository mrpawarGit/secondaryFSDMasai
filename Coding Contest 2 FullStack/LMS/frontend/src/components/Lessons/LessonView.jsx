import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Spinner,
  ListGroup,
  Badge,
} from "react-bootstrap";
import { getLessonById } from "../../services/lessonService";
import { getLessonsByCourse } from "../../services/lessonService";
import { AuthContext } from "../../context/AuthContext";

const LessonView = () => {
  const [lesson, setLesson] = useState(null);
  const [allLessons, setAllLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);

  const { lessonId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      const data = await getLessonById(lessonId);
      setLesson(data);

      // Fetch all lessons from the course
      const lessonsData = await getLessonsByCourse(data.course._id);
      setAllLessons(lessonsData);

      // Check if lesson is completed
      if (user?.role === "student") {
        const completed = localStorage.getItem(`completed_${data.course._id}`);
        if (completed) {
          const completedArray = JSON.parse(completed);
          setIsCompleted(completedArray.includes(lessonId));
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch lesson");
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = () => {
    if (user?.role === "student" && lesson) {
      const storageKey = `completed_${lesson.course._id}`;
      const completed = localStorage.getItem(storageKey);
      let completedArray = completed ? JSON.parse(completed) : [];

      if (isCompleted) {
        // Remove from completed
        completedArray = completedArray.filter((id) => id !== lessonId);
      } else {
        // Add to completed
        completedArray.push(lessonId);
      }

      localStorage.setItem(storageKey, JSON.stringify(completedArray));
      setIsCompleted(!isCompleted);
    }
  };

  const getEmbedUrl = (url) => {
    // Convert YouTube watch URL to embed URL
    if (url.includes("youtube.com/watch")) {
      const videoId = url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // Convert YouTube short URL to embed URL
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // Convert Vimeo URL to embed URL
    if (url.includes("vimeo.com/")) {
      const videoId = url.split("vimeo.com/")[1];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  };

  const getCurrentLessonIndex = () => {
    return allLessons.findIndex((l) => l._id === lessonId);
  };

  const goToNextLesson = () => {
    const currentIndex = getCurrentLessonIndex();
    if (currentIndex < allLessons.length - 1) {
      navigate(`/lessons/${allLessons[currentIndex + 1]._id}`);
    }
  };

  const goToPreviousLesson = () => {
    const currentIndex = getCurrentLessonIndex();
    if (currentIndex > 0) {
      navigate(`/lessons/${allLessons[currentIndex - 1]._id}`);
    }
  };

  const currentIndex = getCurrentLessonIndex();
  const hasNext = currentIndex < allLessons.length - 1;
  const hasPrevious = currentIndex > 0;

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (!lesson) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">Lesson not found</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Row className="mb-3">
        <Col>
          <Button
            variant="outline-secondary"
            onClick={() => navigate(`/courses/${lesson.course._id}`)}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to Course
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Body className="p-0">
              {/* Video Player */}
              <div
                style={{
                  position: "relative",
                  paddingBottom: "56.25%",
                  height: 0,
                }}
              >
                <iframe
                  src={getEmbedUrl(lesson.videoUrl)}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                  }}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={lesson.title}
                ></iframe>
              </div>

              <div className="p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h2>{lesson.title}</h2>
                    <small className="text-muted">
                      <i className="bi bi-clock me-1"></i>
                      Duration: {lesson.duration}
                    </small>
                  </div>
                  {user?.role === "student" && (
                    <Badge
                      bg={isCompleted ? "success" : "secondary"}
                      className="fs-6"
                    >
                      {isCompleted ? (
                        <>
                          <i className="bi bi-check-circle me-1"></i>
                          Completed
                        </>
                      ) : (
                        "Not Completed"
                      )}
                    </Badge>
                  )}
                </div>

                <h5 className="mt-4">About this lesson</h5>
                <p>{lesson.description}</p>

                {lesson.resources && lesson.resources.length > 0 && (
                  <>
                    <h5 className="mt-4">Additional Resources</h5>
                    <ListGroup>
                      {lesson.resources.map((resource, index) => (
                        <ListGroup.Item key={index}>
                          <i className="bi bi-file-earmark-text me-2"></i>
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-decoration-none"
                          >
                            {resource.title}
                          </a>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </>
                )}

                {/* Navigation Buttons */}
                <div className="d-flex justify-content-between mt-4">
                  <Button
                    variant="outline-primary"
                    onClick={goToPreviousLesson}
                    disabled={!hasPrevious}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Previous Lesson
                  </Button>

                  {user?.role === "student" && (
                    <Button
                      variant={isCompleted ? "success" : "outline-success"}
                      onClick={toggleComplete}
                    >
                      {isCompleted ? (
                        <>
                          <i className="bi bi-check-circle-fill me-2"></i>
                          Mark as Incomplete
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Mark as Complete
                        </>
                      )}
                    </Button>
                  )}

                  <Button
                    variant="outline-primary"
                    onClick={goToNextLesson}
                    disabled={!hasNext}
                  >
                    Next Lesson
                    <i className="bi bi-arrow-right ms-2"></i>
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm sticky-top" style={{ top: "20px" }}>
            <Card.Header>
              <h6 className="mb-0">Course Lessons ({allLessons.length})</h6>
            </Card.Header>
            <ListGroup
              variant="flush"
              style={{ maxHeight: "500px", overflowY: "auto" }}
            >
              {allLessons.map((l, index) => {
                const completed =
                  user?.role === "student" &&
                  (() => {
                    const saved = localStorage.getItem(
                      `completed_${lesson.course._id}`
                    );
                    if (saved) {
                      return JSON.parse(saved).includes(l._id);
                    }
                    return false;
                  })();

                return (
                  <ListGroup.Item
                    key={l._id}
                    active={l._id === lessonId}
                    action
                    onClick={() => navigate(`/lessons/${l._id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="d-flex align-items-center">
                      <div className="me-2">
                        {completed ? (
                          <i className="bi bi-check-circle-fill text-success"></i>
                        ) : (
                          <Badge bg="secondary" pill>
                            {index + 1}
                          </Badge>
                        )}
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-bold">{l.title}</div>
                        <small>
                          <i className="bi bi-clock me-1"></i>
                          {l.duration}
                        </small>
                      </div>
                    </div>
                  </ListGroup.Item>
                );
              })}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LessonView;
