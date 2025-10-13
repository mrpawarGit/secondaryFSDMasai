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
import {
  getLessonById,
  getLessonsByCourse,
} from "../../services/lessonService";
import {
  getCourseProgress,
  markLessonComplete,
  markLessonIncomplete,
} from "../../services/progressService";
import { AuthContext } from "../../context/AuthContext";
import CommentSection from "../Comments/CommentSection";

const LessonView = () => {
  const [lesson, setLesson] = useState(null);
  const [allLessons, setAllLessons] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [completionLoading, setCompletionLoading] = useState(false);

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

      // Fetch progress for students
      if (user?.role === "student") {
        const progressData = await getCourseProgress(data.course._id);
        setProgress(progressData);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch lesson");
    } finally {
      setLoading(false);
    }
  };

  const isLessonCompleted = () => {
    if (!progress || !progress.completedLessons) return false;
    const completedIds = progress.completedLessons.map((l) =>
      typeof l === "string" ? l : l._id
    );
    return completedIds.includes(lessonId);
  };

  const toggleComplete = async () => {
    if (user?.role !== "student" || !lesson) return;

    setCompletionLoading(true);
    try {
      if (isLessonCompleted()) {
        const updatedProgress = await markLessonIncomplete(lessonId);
        setProgress(updatedProgress);
      } else {
        const updatedProgress = await markLessonComplete(lessonId);
        setProgress(updatedProgress);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update progress");
    } finally {
      setCompletionLoading(false);
    }
  };

  const getEmbedUrl = (url) => {
    if (url.includes("youtube.com/watch")) {
      const videoId = url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
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

  const isLessonCompletedById = (id) => {
    if (!progress || !progress.completedLessons) return false;
    const completedIds = progress.completedLessons.map((l) =>
      typeof l === "string" ? l : l._id
    );
    return completedIds.includes(id);
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

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

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
                      bg={isLessonCompleted() ? "success" : "secondary"}
                      className="fs-6"
                    >
                      {isLessonCompleted() ? (
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
                      variant={
                        isLessonCompleted() ? "success" : "outline-success"
                      }
                      onClick={toggleComplete}
                      disabled={completionLoading}
                    >
                      {completionLoading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            className="me-2"
                          />
                          Updating...
                        </>
                      ) : isLessonCompleted() ? (
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

          {/* Comment Section */}
          <CommentSection
            lessonId={lessonId}
            courseInstructorId={
              lesson?.course?.instructor?._id || lesson?.course?.instructor
            }
          />
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm sticky-top" style={{ top: "20px" }}>
            <Card.Header>
              <h6 className="mb-0">
                Course Lessons ({allLessons.length})
                {progress && (
                  <Badge bg="success" className="ms-2">
                    {progress.completedLessons.length} completed
                  </Badge>
                )}
              </h6>
            </Card.Header>
            <ListGroup
              variant="flush"
              style={{ maxHeight: "500px", overflowY: "auto" }}
            >
              {allLessons.map((l, index) => {
                const completed = isLessonCompletedById(l._id);

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
