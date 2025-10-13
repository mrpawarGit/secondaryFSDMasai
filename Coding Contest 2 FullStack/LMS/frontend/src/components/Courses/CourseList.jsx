import { useState, useEffect, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Alert,
  Spinner,
  InputGroup,
} from "react-bootstrap";
import { getAllCourses } from "../../services/courseService";
import { AuthContext } from "../../context/AuthContext";
import CourseCard from "./CourseCard";

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    level: "",
  });

  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchCourses();
  }, [filters]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await getAllCourses(1, filters);
      setCourses(data.courses);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  if (loading && courses.length === 0) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading courses...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <h2 className="mb-4">Browse Courses</h2>

      {/* Filters */}
      <Row className="mb-4">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>
              <i className="bi bi-search"></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              name="search"
              placeholder="Search courses..."
              value={filters.search}
              onChange={handleFilterChange}
            />
          </InputGroup>
        </Col>
        <Col md={3}>
          <Form.Select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
          >
            <option value="">All Categories</option>
            <option value="Web Development">Web Development</option>
            <option value="Data Science">Data Science</option>
            <option value="Mobile Development">Mobile Development</option>
            <option value="Design">Design</option>
            <option value="Other">Other</option>
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Select
            name="level"
            value={filters.level}
            onChange={handleFilterChange}
          >
            <option value="">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </Form.Select>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {courses.length === 0 ? (
        <Alert variant="info">No courses found matching your criteria.</Alert>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {courses.map((course) => (
            <Col key={course._id}>
              <CourseCard
                course={course}
                isInstructor={user?.role === "instructor"}
              />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default CourseList;
