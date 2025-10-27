import { useState, useEffect, useContext } from "react";
import { Card, ListGroup, Badge, Spinner, Alert } from "react-bootstrap";
import { SocketContext } from "../../context/SocketContext";
import { getCourseActivities } from "../../services/activityService";

const ActivityFeed = ({ courseId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { socket } = useContext(SocketContext);

  useEffect(() => {
    if (courseId) {
      fetchActivities();
    }
  }, [courseId]);

  useEffect(() => {
    if (socket && courseId) {
      // Listen for new activities
      socket.on("new-activity", (activity) => {
        setActivities((prev) => [activity, ...prev].slice(0, 20)); // Keep only latest 20
      });

      return () => {
        socket.off("new-activity");
      };
    }
  }, [socket, courseId]);

  const fetchActivities = async () => {
    try {
      const data = await getCourseActivities(courseId, 1);
      setActivities(data.activities);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch activities");
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (action) => {
    const icons = {
      lesson_added: "bi-plus-circle text-success",
      lesson_updated: "bi-pencil text-info",
      lesson_deleted: "bi-trash text-danger",
      lesson_reordered: "bi-arrow-down-up text-warning",
      comment_added: "bi-chat-left-text text-primary",
      comment_deleted: "bi-chat-left-text text-danger",
      student_enrolled: "bi-person-plus text-success",
      student_unenrolled: "bi-person-dash text-warning",
      course_updated: "bi-book text-info",
    };
    return icons[action] || "bi-circle text-secondary";
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Card>
        <Card.Body className="text-center">
          <Spinner animation="border" size="sm" variant="primary" />
          <p className="mt-2 mb-0">Loading activities...</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header className="bg-light">
        <h6 className="mb-0">
          <i className="bi bi-activity me-2"></i>
          Recent Activity
          <Badge bg="primary" pill className="ms-2">
            {activities.length}
          </Badge>
        </h6>
      </Card.Header>
      <Card.Body className="p-0">
        {error && (
          <Alert variant="danger" className="m-3 mb-0">
            {error}
          </Alert>
        )}
        {activities.length === 0 ? (
          <div className="text-center p-4 text-muted">
            <i className="bi bi-inbox fs-1"></i>
            <p className="mt-2 mb-0">No recent activity</p>
          </div>
        ) : (
          <ListGroup
            variant="flush"
            style={{ maxHeight: "400px", overflowY: "auto" }}
          >
            {activities.map((activity) => (
              <ListGroup.Item key={activity._id} className="py-3">
                <div className="d-flex align-items-start">
                  <div className="me-3">
                    <i
                      className={`bi ${getActivityIcon(activity.action)} fs-4`}
                    ></i>
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <strong className="text-dark">
                        {activity.actor?.name}
                      </strong>
                      <small className="text-muted">
                        {formatTimestamp(activity.createdAt)}
                      </small>
                    </div>
                    <p className="mb-0 text-muted small">
                      {activity.description}
                    </p>
                    {activity.actor?.role === "instructor" && (
                      <Badge bg="primary" className="mt-1">
                        Instructor
                      </Badge>
                    )}
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card.Body>
    </Card>
  );
};

export default ActivityFeed;
