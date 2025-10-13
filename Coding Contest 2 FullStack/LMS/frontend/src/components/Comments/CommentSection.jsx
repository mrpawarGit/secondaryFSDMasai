import { useState, useEffect, useContext } from "react";
import { Card, Form, Button, Alert, Badge } from "react-bootstrap";
import { SocketContext } from "../../context/SocketContext";
import { AuthContext } from "../../context/AuthContext";
import {
  addComment,
  getCommentsByLesson,
  deleteComment,
  updateComment,
} from "../../services/commentService";

const CommentSection = ({ lessonId, courseInstructorId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [replyToName, setReplyToName] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [editMessage, setEditMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { socket, joinLesson, leaveLesson } = useContext(SocketContext);
  const { user } = useContext(AuthContext);

  // Get the actual user ID - it might be stored as _id or id in the user object
  const getCurrentUserId = () => {
    if (!user) return null;
    return user._id || user.id;
  };

  useEffect(() => {
    if (lessonId) {
      fetchComments();
      if (socket) {
        joinLesson(lessonId);
      }
    }

    return () => {
      if (socket && lessonId) {
        leaveLesson(lessonId);
      }
    };
  }, [lessonId, socket]);

  useEffect(() => {
    if (socket) {
      // Listen for new comments
      socket.on("new-comment", (comment) => {
        setComments((prev) => {
          // If it's a reply, find parent and add to replies
          if (comment.parentComment) {
            return prev.map((c) =>
              c._id === comment.parentComment
                ? { ...c, replies: [...(c.replies || []), comment] }
                : c
            );
          }
          // Otherwise add as top-level comment
          return [comment, ...prev];
        });
      });

      // Listen for deleted comments
      socket.on("delete-comment", (commentId) => {
        setComments((prev) => {
          // Remove from top-level comments
          const filtered = prev.filter((c) => c._id !== commentId);
          // Remove from replies
          return filtered.map((c) => ({
            ...c,
            replies: c.replies?.filter((r) => r._id !== commentId) || [],
          }));
        });
      });

      // Listen for updated comments
      socket.on("update-comment", (updatedComment) => {
        setComments((prev) =>
          prev.map((c) => {
            if (c._id === updatedComment._id) {
              return updatedComment;
            }
            // Update in replies
            if (c.replies) {
              return {
                ...c,
                replies: c.replies.map((r) =>
                  r._id === updatedComment._id ? updatedComment : r
                ),
              };
            }
            return c;
          })
        );
      });

      return () => {
        socket.off("new-comment");
        socket.off("delete-comment");
        socket.off("update-comment");
      };
    }
  }, [socket]);

  const fetchComments = async () => {
    try {
      const data = await getCommentsByLesson(lessonId);
      setComments(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch comments");
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    setError("");

    try {
      await addComment(lessonId, newComment, replyTo);
      setNewComment("");
      setReplyTo(null);
      setReplyToName("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add comment");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;

    try {
      await deleteComment(commentId);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete comment");
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editMessage.trim()) return;

    try {
      await updateComment(commentId, editMessage);
      setEditingComment(null);
      setEditMessage("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update comment");
    }
  };

  const startEdit = (comment) => {
    setEditingComment(comment._id);
    setEditMessage(comment.message);
  };

  const cancelEdit = () => {
    setEditingComment(null);
    setEditMessage("");
  };

  const startReply = (comment) => {
    setReplyTo(comment._id);
    setReplyToName(comment.user?.name);
  };

  const cancelReply = () => {
    setReplyTo(null);
    setReplyToName("");
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

  // Calculate total comments including replies
  const getTotalComments = () => {
    let total = comments.length;
    comments.forEach((comment) => {
      if (comment.replies && comment.replies.length > 0) {
        total += comment.replies.length;
      }
    });
    return total;
  };

  // Check if current user can delete a comment
  const canDeleteComment = (comment) => {
    if (!user || !comment || !comment.user) return false;

    const currentUserId = getCurrentUserId();
    if (!currentUserId) return false;

    const commentUserId = comment.user._id || comment.user.id;

    // User can delete their own comment
    const isOwner = String(commentUserId) === String(currentUserId);

    // Instructor can delete any comment in their course
    const isInstructor = String(currentUserId) === String(courseInstructorId);

    return isOwner || isInstructor;
  };

  // Check if current user can edit a comment
  const canEditComment = (comment) => {
    if (!user || !comment || !comment.user) return false;

    const currentUserId = getCurrentUserId();
    if (!currentUserId) return false;

    const commentUserId = comment.user._id || comment.user.id;

    // Only the comment owner can edit
    const isOwner = String(commentUserId) === String(currentUserId);

    return isOwner;
  };

  const CommentItem = ({ comment, isReply = false }) => {
    const showEdit = canEditComment(comment);
    const showDelete = canDeleteComment(comment);

    return (
      <div className={`${isReply ? "ms-4 mt-2 border-start ps-3" : ""}`}>
        <div className="d-flex align-items-start mb-2">
          <div className="flex-grow-1">
            <div className="d-flex align-items-center mb-1">
              <strong className="me-2">{comment.user?.name}</strong>
              {comment.user?.role === "instructor" && (
                <Badge bg="primary" className="me-2">
                  Instructor
                </Badge>
              )}
              <small className="text-muted">
                {formatTimestamp(comment.createdAt)}
              </small>
              {comment.createdAt !== comment.updatedAt && (
                <small className="text-muted ms-2">(edited)</small>
              )}
            </div>

            {editingComment === comment._id ? (
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleEditComment(comment._id);
                }}
              >
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={editMessage}
                  onChange={(e) => setEditMessage(e.target.value)}
                  className="mb-2"
                  autoFocus
                />
                <div className="d-flex gap-2">
                  <Button size="sm" variant="primary" type="submit">
                    <i className="bi bi-check-lg me-1"></i>
                    Save
                  </Button>
                  <Button size="sm" variant="secondary" onClick={cancelEdit}>
                    <i className="bi bi-x-lg me-1"></i>
                    Cancel
                  </Button>
                </div>
              </Form>
            ) : (
              <>
                <p className="mb-2">{comment.message}</p>
                <div className="d-flex gap-3">
                  {!isReply && (
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 text-decoration-none"
                      onClick={() => startReply(comment)}
                    >
                      <i className="bi bi-reply me-1"></i>
                      Reply
                    </Button>
                  )}

                  {/* Only show Edit if user is comment owner */}
                  {showEdit && (
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 text-decoration-none"
                      onClick={() => startEdit(comment)}
                    >
                      <i className="bi bi-pencil me-1"></i>
                      Edit
                    </Button>
                  )}

                  {/* Show Delete if user is comment owner OR course instructor */}
                  {showDelete && (
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 text-decoration-none text-danger"
                      onClick={() => handleDeleteComment(comment._id)}
                    >
                      <i className="bi bi-trash me-1"></i>
                      Delete
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Render replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3">
            {comment.replies.map((reply) => (
              <CommentItem key={reply._id} comment={reply} isReply={true} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="mt-4">
      <Card.Header className="bg-light">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="bi bi-chat-left-text me-2"></i>
            Discussion
          </h5>
          <Badge bg="primary" pill>
            {getTotalComments()}{" "}
            {getTotalComments() === 1 ? "comment" : "comments"}
          </Badge>
        </div>
      </Card.Header>
      <Card.Body>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* Add Comment Form */}
        <Form onSubmit={handleAddComment} className="mb-4">
          {replyTo && (
            <Alert
              variant="info"
              dismissible
              onClose={cancelReply}
              className="py-2"
            >
              <small>
                <i className="bi bi-reply me-1"></i>
                Replying to <strong>{replyToName}</strong>
              </small>
            </Alert>
          )}
          <Form.Group className="mb-2">
            <Form.Control
              as="textarea"
              rows={3}
              placeholder={
                replyTo
                  ? `Reply to ${replyToName}...`
                  : "Add a comment to the discussion..."
              }
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={loading}
            />
          </Form.Group>
          <div className="d-flex gap-2">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={loading || !newComment.trim()}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Posting...
                </>
              ) : (
                <>
                  <i className="bi bi-send me-1"></i>
                  {replyTo ? "Post Reply" : "Post Comment"}
                </>
              )}
            </Button>
            {replyTo && (
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={cancelReply}
              >
                Cancel Reply
              </Button>
            )}
          </div>
        </Form>

        <hr />

        {/* Comments List */}
        {comments.length === 0 ? (
          <Alert variant="info" className="mb-0 text-center">
            <i className="bi bi-chat-dots me-2"></i>
            No comments yet. Be the first to start the discussion!
          </Alert>
        ) : (
          <div>
            {comments.map((comment) => (
              <div
                key={comment._id}
                className="border-bottom pb-3 mb-3 last:border-0"
              >
                <CommentItem comment={comment} />
              </div>
            ))}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default CommentSection;
