import { useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Card,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { createCourse } from "../../services/courseService";

const CreateCourse = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Other",
    level: "Beginner",
    thumbnail: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.title || !formData.description) {
      setError("Please provide title and description");
      setLoading(false);
      return;
    }

    try {
      await createCourse(formData);
      navigate("/instructor-dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow">
            <Card.Body className="p-4">
              <h2 className="mb-4">Create New Course</h2>
              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="title">
                  <Form.Label>Course Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    placeholder="Enter course title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="description">
                  <Form.Label>Course Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="description"
                    placeholder="Enter course description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="category">
                      <Form.Label>Category</Form.Label>
                      <Form.Select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                      >
                        <option value="Web Development">Web Development</option>
                        <option value="Data Science">Data Science</option>
                        <option value="Mobile Development">
                          Mobile Development
                        </option>
                        <option value="Design">Design</option>
                        <option value="Other">Other</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="level">
                      <Form.Label>Level</Form.Label>
                      <Form.Select
                        name="level"
                        value={formData.level}
                        onChange={handleChange}
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3" controlId="thumbnail">
                  <Form.Label>Thumbnail URL (Optional)</Form.Label>
                  <Form.Control
                    type="url"
                    name="thumbnail"
                    placeholder="Enter thumbnail image URL"
                    value={formData.thumbnail}
                    onChange={handleChange}
                  />
                  <Form.Text className="text-muted">
                    Provide a URL to an image for the course thumbnail
                  </Form.Text>
                </Form.Group>

                <div className="d-flex gap-2">
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Course"}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => navigate("/instructor-dashboard")}
                  >
                    Cancel
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateCourse;
