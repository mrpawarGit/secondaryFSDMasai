import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Card,
} from "react-bootstrap";
import { addLesson } from "../../services/lessonService";

const AddLesson = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    duration: "",
    resources: [],
  });
  const [resourceInput, setResourceInput] = useState({ title: "", url: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { courseId } = useParams();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleResourceChange = (e) => {
    setResourceInput({ ...resourceInput, [e.target.name]: e.target.value });
  };

  const addResource = () => {
    if (resourceInput.title && resourceInput.url) {
      setFormData({
        ...formData,
        resources: [...formData.resources, resourceInput],
      });
      setResourceInput({ title: "", url: "" });
    }
  };

  const removeResource = (index) => {
    setFormData({
      ...formData,
      resources: formData.resources.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.title || !formData.description || !formData.videoUrl) {
      setError("Please provide title, description, and video URL");
      setLoading(false);
      return;
    }

    try {
      await addLesson(courseId, formData);
      navigate(`/courses/${courseId}/lessons`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add lesson");
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
              <h2 className="mb-4">Add New Lesson</h2>
              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="title">
                  <Form.Label>Lesson Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    placeholder="Enter lesson title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="description">
                  <Form.Label>Lesson Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="description"
                    placeholder="Enter lesson description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="videoUrl">
                  <Form.Label>Video URL</Form.Label>
                  <Form.Control
                    type="url"
                    name="videoUrl"
                    placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                    value={formData.videoUrl}
                    onChange={handleChange}
                    required
                  />
                  <Form.Text className="text-muted">
                    Provide a direct link to the video or embed URL
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3" controlId="duration">
                  <Form.Label>Duration (Optional)</Form.Label>
                  <Form.Control
                    type="text"
                    name="duration"
                    placeholder="e.g., 15:30"
                    value={formData.duration}
                    onChange={handleChange}
                  />
                  <Form.Text className="text-muted">
                    Format: MM:SS or HH:MM:SS
                  </Form.Text>
                </Form.Group>

                <hr />

                <h5 className="mb-3">Additional Resources</h5>

                <Row className="mb-3">
                  <Col md={5}>
                    <Form.Control
                      type="text"
                      name="title"
                      placeholder="Resource title"
                      value={resourceInput.title}
                      onChange={handleResourceChange}
                    />
                  </Col>
                  <Col md={5}>
                    <Form.Control
                      type="url"
                      name="url"
                      placeholder="Resource URL"
                      value={resourceInput.url}
                      onChange={handleResourceChange}
                    />
                  </Col>
                  <Col md={2}>
                    <Button
                      variant="outline-primary"
                      onClick={addResource}
                      className="w-100"
                    >
                      <i className="bi bi-plus"></i>
                    </Button>
                  </Col>
                </Row>

                {formData.resources.length > 0 && (
                  <div className="mb-3">
                    <strong>Resources:</strong>
                    <ul className="list-group mt-2">
                      {formData.resources.map((resource, index) => (
                        <li
                          key={index}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          <div>
                            <strong>{resource.title}</strong>
                            <br />
                            <small className="text-muted">{resource.url}</small>
                          </div>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => removeResource(index)}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <hr />

                <div className="d-flex gap-2">
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? "Adding..." : "Add Lesson"}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/courses/${courseId}/lessons`)}
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

export default AddLesson;
