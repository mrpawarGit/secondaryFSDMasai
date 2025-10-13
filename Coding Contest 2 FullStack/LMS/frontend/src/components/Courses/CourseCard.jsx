import { Card, Button, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const CourseCard = ({ course, isInstructor, onDelete }) => {
  const navigate = useNavigate();

  const handleViewCourse = () => {
    navigate(`/courses/${course._id}`);
  };

  return (
    <Card className="h-100 shadow-sm">
      <Card.Img
        variant="top"
        src={course.thumbnail}
        style={{ height: "200px", objectFit: "cover" }}
      />
      <Card.Body className="d-flex flex-column">
        <div className="mb-2">
          <Badge bg="primary" className="me-2">
            {course.category}
          </Badge>
          <Badge bg="secondary">{course.level}</Badge>
        </div>

        <Card.Title className="mb-2">{course.title}</Card.Title>
        <Card.Text className="text-muted small flex-grow-1">
          {course.description.substring(0, 100)}
          {course.description.length > 100 && "..."}
        </Card.Text>

        <div className="mb-3">
          <small className="text-muted">
            <i className="bi bi-person-fill me-1"></i>
            {course.instructor?.name || "Unknown"}
          </small>
          <br />
          <small className="text-muted">
            <i className="bi bi-people-fill me-1"></i>
            {course.students?.length || 0} students enrolled
          </small>
        </div>

        <div className="d-flex gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={handleViewCourse}
            className="flex-grow-1"
          >
            View Course
          </Button>
          {isInstructor && (
            <>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => navigate(`/courses/${course._id}/edit`)}
              >
                <i className="bi bi-pencil"></i>
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => onDelete(course._id)}
              >
                <i className="bi bi-trash"></i>
              </Button>
            </>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default CourseCard;
