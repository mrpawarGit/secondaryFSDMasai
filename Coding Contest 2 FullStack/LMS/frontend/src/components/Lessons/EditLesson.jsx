import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Card,
  Spinner,
} from "react-bootstrap";
import { getLessonById, updateLesson } from "../../services/lessonService";

const EditLesson = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    duration: "",
    resources: [],
  });
  const [resourceInput, setResourceInput] = useState({ title: "", url: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { lessonId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      const data = await getLessonById(lessonId);
      setFormData({
        title: data.title,
        description: data.description,
        videoUrl: data.videoUrl,
        duration: data.duration,
        resources: data.resources || [],
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch lesson");
    } finally {
      setLoading(false);
    }
  };

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
    setSubmitting(true);

    try {
      await updateLesson(lessonId, formData);
      navigate(-1); // Go back to previous page
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update lesson");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow">
            <Card.Body className="p-4">
              <h2 className="mb-4">Edit Lesson</h2>
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
                    placeholder="Enter video URL"
                    value={formData.videoUrl}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="duration">
                  <Form.Label>Duration</Form.Label>
                  <Form.Control
                    type="text"
                    name="duration"
                    placeholder="e.g., 15:30"
                    value={formData.duration}
                    onChange={handleChange}
                  />
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
                  <Button variant="primary" type="submit" disabled={submitting}>
                    {submitting ? "Updating..." : "Update Lesson"}
                  </Button>
                  <Button variant="secondary" onClick={() => navigate(-1)}>
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

export default EditLesson;
