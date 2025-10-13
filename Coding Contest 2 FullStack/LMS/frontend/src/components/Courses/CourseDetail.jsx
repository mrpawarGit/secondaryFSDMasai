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
  Accordion,
} from "react-bootstrap";
import {
  getCourseById,
  enrollInCourse,
  unenrollFromCourse,
} from "../../services/courseService";
import { getLessonsByCourse } from "../../services/lessonService";
import { AuthContext } from "../../context/AuthContext";
import { SocketContext } from "../../context/SocketContext";

const CourseDetail = () => {
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const { socket, joinCourse, leaveCourse } = useContext(SocketContext);

  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourse();

    if (socket && id) {
      joinCourse(id);

      // Listen for lesson added
      socket.on("lesson-added", (newLesson) => {
        setLessons((prev) => [...prev, newLesson]);
      });

      // Listen for lesson updated
      socket.on("lesson-updated", (updatedLesson) => {
        setLessons((prev) =>
          prev.map((l) => (l._id === updatedLesson._id ? updatedLesson : l))
        );
      });

      // Listen for lesson deleted
      socket.on("lesson-deleted", (lessonId) => {
        setLessons((prev) => prev.filter((l) => l._id !== lessonId));
      });

      // Listen for lessons reordered
      socket.on("lessons-reordered", (reorderedLessons) => {
        setLessons(reorderedLessons);
      });
    }

    return () => {
      if (socket && id) {
        leaveCourse(id);
        socket.off("lesson-added");
        socket.off("lesson-updated");
        socket.off("lesson-deleted");
        socket.off("lessons-reordered");
      }
    };
  }, [id, socket]);

  const fetchCourse = async () => {
    try {
      const courseData = await getCourseById(id);
      setCourse(courseData);

      // If user is enrolled or is the instructor, fetch lessons
      const isEnrolled = courseData.students?.some(
        (student) => student._id === user?._id
      );
      const isInstructor = courseData.instructor?._id === user?._id;

      if (isEnrolled || isInstructor) {
        const lessonsData = await getLessonsByCourse(id);
        setLessons(lessonsData);
      }
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
      fetchCourse(); // Refresh to show lessons
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
      setLessons([]); // Clear lessons
      fetchCourse();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to unenroll");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLessonClick = (lessonId) => {
    navigate(`/lessons/${lessonId}`);
  };

  const isEnrolled = course?.students?.some(
    (student) => student._id === user?._id
  );
  const isInstructor = course?.instructor?._id === user?._id;
  const canViewLessons = isEnrolled || isInstructor;

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
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

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

              <Card.Text className="mb-4">{course.description}</Card.Text>

              <hr />

              <h4 className="mb-3">
                <i className="bi bi-play-circle me-2"></i>
                Course Content
              </h4>

              {canViewLessons ? (
                lessons.length > 0 ? (
                  <Accordion defaultActiveKey="0">
                    {lessons.map((lesson, index) => (
                      <Accordion.Item
                        eventKey={index.toString()}
                        key={lesson._id}
                      >
                        <Accordion.Header>
                          <div className="d-flex align-items-center w-100">
                            <Badge bg="secondary" className="me-3">
                              {index + 1}
                            </Badge>
                            <div className="flex-grow-1">
                              <strong>{lesson.title}</strong>
                              <br />
                              <small className="text-muted">
                                <i className="bi bi-clock me-1"></i>
                                {lesson.duration}
                              </small>
                            </div>
                          </div>
                        </Accordion.Header>
                        <Accordion.Body>
                          <p className="mb-3">{lesson.description}</p>

                          {lesson.resources && lesson.resources.length > 0 && (
                            <div className="mb-3">
                              <strong>Resources:</strong>
                              <ul className="list-unstyled mt-2">
                                {lesson.resources.map((resource, idx) => (
                                  <li key={idx}>
                                    <i className="bi bi-file-earmark-text me-2"></i>
                                    <a
                                      href={resource.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      {resource.title}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleLessonClick(lesson._id)}
                          >
                            <i className="bi bi-play-fill me-2"></i>
                            Watch Lesson
                          </Button>
                        </Accordion.Body>
                      </Accordion.Item>
                    ))}
                  </Accordion>
                ) : (
                  <Alert variant="info">
                    <i className="bi bi-info-circle me-2"></i>
                    No lessons added yet.{" "}
                    {isInstructor && 'Click "Manage Lessons" to add content.'}
                  </Alert>
                )
              ) : (
                <Alert variant="warning">
                  <i className="bi bi-lock-fill me-2"></i>
                  Enroll in this course to view lessons
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm sticky-top" style={{ top: "20px" }}>
            <Card.Body>
              <h5 className="mb-3">Course Information</h5>

              <div className="mb-3">
                <small className="text-muted d-block">Enrolled Students</small>
                <strong>
                  <i className="bi bi-people-fill me-2"></i>
                  {course.students?.length || 0}
                </strong>
              </div>

              <div className="mb-3">
                <small className="text-muted d-block">Total Lessons</small>
                <strong>
                  <i className="bi bi-play-circle me-2"></i>
                  {lessons.length || 0}
                </strong>
              </div>

              <div className="mb-3">
                <small className="text-muted d-block">Level</small>
                <strong>
                  <i className="bi bi-bar-chart me-2"></i>
                  {course.level}
                </strong>
              </div>

              <div className="mb-3">
                <small className="text-muted d-block">Category</small>
                <strong>
                  <i className="bi bi-tag me-2"></i>
                  {course.category}
                </strong>
              </div>

              <hr />

              {isInstructor ? (
                <>
                  <Button
                    variant="primary"
                    className="w-100 mb-2"
                    onClick={() => navigate(`/courses/${id}/edit`)}
                  >
                    <i className="bi bi-pencil me-2"></i>
                    Edit Course
                  </Button>
                  <Button
                    variant="outline-primary"
                    className="w-100"
                    onClick={() => navigate(`/courses/${id}/lessons`)}
                  >
                    <i className="bi bi-list-ul me-2"></i>
                    Manage Lessons
                  </Button>
                </>
              ) : user?.role === "student" ? (
                isEnrolled ? (
                  <>
                    <Alert variant="success" className="mb-3">
                      <i className="bi bi-check-circle me-2"></i>
                      You are enrolled in this course
                    </Alert>
                    <Button
                      variant="outline-danger"
                      className="w-100"
                      onClick={handleUnenroll}
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            className="me-2"
                          />
                          Processing...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-x-circle me-2"></i>
                          Unenroll from Course
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="primary"
                    className="w-100"
                    onClick={handleEnroll}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          className="me-2"
                        />
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-book me-2"></i>
                        Enroll Now
                      </>
                    )}
                  </Button>
                )
              ) : (
                <Button
                  variant="primary"
                  className="w-100"
                  onClick={() => navigate("/login")}
                >
                  <i className="bi bi-box-arrow-in-right me-2"></i>
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
