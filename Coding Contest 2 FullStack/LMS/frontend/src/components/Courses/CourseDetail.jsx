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
  Accordion,
  Form,
  InputGroup,
  ProgressBar,
} from "react-bootstrap";
import {
  getCourseById,
  enrollInCourse,
  unenrollFromCourse,
} from "../../services/courseService";
import { getLessonsByCourse } from "../../services/lessonService";
import { getCourseProgress } from "../../services/progressService";
import { SocketContext } from "../../context/SocketContext";
import { AuthContext } from "../../context/AuthContext";
import ActivityFeed from "../Activities/ActivityFeed";

const CourseDetail = () => {
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [filteredLessons, setFilteredLessons] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, completed, incomplete

  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const { socket, joinCourse, leaveCourse } = useContext(SocketContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourse();
  }, [id]);

  useEffect(() => {
    if (socket && id) {
      joinCourse(id);

      socket.on("lesson-added", (newLesson) => {
        setLessons((prev) => [...prev, newLesson]);
      });

      socket.on("lesson-updated", (updatedLesson) => {
        setLessons((prev) =>
          prev.map((l) => (l._id === updatedLesson._id ? updatedLesson : l))
        );
      });

      socket.on("lesson-deleted", (lessonId) => {
        setLessons((prev) => prev.filter((l) => l._id !== lessonId));
      });

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

  // Apply search and filter when lessons, search, or filter changes
  useEffect(() => {
    applyFilters();
  }, [lessons, searchQuery, filterStatus, progress]);

  const fetchCourse = async () => {
    try {
      const courseData = await getCourseById(id);
      setCourse(courseData);

      const isEnrolled = courseData.students?.some(
        (student) => student._id === user?._id
      );
      const isInstructor = courseData.instructor?._id === user?._id;

      if (isEnrolled || isInstructor) {
        const lessonsData = await getLessonsByCourse(id);
        setLessons(lessonsData);

        // Fetch progress for students
        if (isEnrolled && user?.role === "student") {
          const progressData = await getCourseProgress(id);
          setProgress(progressData);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch course");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...lessons];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((lesson) =>
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply completion status filter
    if (filterStatus !== "all" && progress) {
      const completedIds = progress.completedLessons.map((l) =>
        typeof l === "string" ? l : l._id
      );

      if (filterStatus === "completed") {
        filtered = filtered.filter((lesson) =>
          completedIds.includes(lesson._id)
        );
      } else if (filterStatus === "incomplete") {
        filtered = filtered.filter(
          (lesson) => !completedIds.includes(lesson._id)
        );
      }
    }

    setFilteredLessons(filtered);
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
      setLessons([]);
      setProgress(null);
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

  const isLessonCompleted = (lessonId) => {
    if (!progress || !progress.completedLessons) return false;
    const completedIds = progress.completedLessons.map((l) =>
      typeof l === "string" ? l : l._id
    );
    return completedIds.includes(lessonId);
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

              {/* Progress Bar for Students */}
              {isEnrolled && user?.role === "student" && progress && (
                <div className="mb-4">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="fw-bold">Your Progress</span>
                    <span>
                      {progress.completedLessons.length} / {lessons.length}{" "}
                      lessons completed
                    </span>
                  </div>
                  <ProgressBar
                    now={progress.completionPercentage}
                    label={`${progress.completionPercentage}%`}
                    variant="success"
                    style={{ height: "25px" }}
                  />
                </div>
              )}

              <hr />

              <h4 className="mb-3">
                <i className="bi bi-play-circle me-2"></i>
                Course Content
              </h4>

              {canViewLessons ? (
                <>
                  {/* Search and Filter */}
                  {lessons.length > 0 && (
                    <Row className="mb-3">
                      <Col md={7}>
                        <InputGroup size="sm">
                          <InputGroup.Text>
                            <i className="bi bi-search"></i>
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            placeholder="Search lessons..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </InputGroup>
                      </Col>
                      {user?.role === "student" && (
                        <Col md={5}>
                          <Form.Select
                            size="sm"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                          >
                            <option value="all">All Lessons</option>
                            <option value="completed">Completed</option>
                            <option value="incomplete">Incomplete</option>
                          </Form.Select>
                        </Col>
                      )}
                    </Row>
                  )}

                  {filteredLessons.length > 0 ? (
                    <Accordion defaultActiveKey="0">
                      {filteredLessons.map((lesson, index) => (
                        <Accordion.Item
                          eventKey={index.toString()}
                          key={lesson._id}
                        >
                          <Accordion.Header>
                            <div className="d-flex align-items-center w-100">
                              {isLessonCompleted(lesson._id) ? (
                                <i className="bi bi-check-circle-fill text-success fs-5 me-3"></i>
                              ) : (
                                <Badge bg="secondary" className="me-3">
                                  {index + 1}
                                </Badge>
                              )}
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

                            {lesson.resources &&
                              lesson.resources.length > 0 && (
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
                      {searchQuery || filterStatus !== "all"
                        ? "No lessons match your search or filter criteria."
                        : "No lessons added yet."}
                      {isInstructor &&
                        !searchQuery &&
                        filterStatus === "all" && (
                          <span> Click "Manage Lessons" to add content.</span>
                        )}
                    </Alert>
                  )}
                </>
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
          {/* Course Information Card */}
          <Card
            className="shadow-sm mb-3"
            style={{ position: "sticky", top: "20px" }}
          >
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

              {user?.role === "student" && progress && (
                <>
                  <div className="mb-3">
                    <small className="text-muted d-block">Completed</small>
                    <strong className="text-success">
                      <i className="bi bi-check-circle me-2"></i>
                      {progress.completedLessons.length}
                    </strong>
                  </div>

                  <div className="mb-3">
                    <small className="text-muted d-block">Progress</small>
                    <strong className="text-primary">
                      {progress.completionPercentage}%
                    </strong>
                  </div>
                </>
              )}

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

          {/* Activity Feed - Only show if user can view lessons */}
          {canViewLessons && (
            <div style={{ position: "sticky", top: "20px" }}>
              <ActivityFeed courseId={id} />
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default CourseDetail;
