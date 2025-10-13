import { useState, useEffect, useContext } from "react";
import { Toast, ToastContainer } from "react-bootstrap";
import { SocketContext } from "../../context/SocketContext";

const NotificationToast = () => {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("info");
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    if (socket) {
      socket.on("lesson-added", () => {
        showNotification("New lesson added!", "success");
      });

      socket.on("lesson-updated", () => {
        showNotification("Lesson updated!", "info");
      });

      socket.on("lesson-deleted", () => {
        showNotification("Lesson removed", "warning");
      });

      return () => {
        socket.off("lesson-added");
        socket.off("lesson-updated");
        socket.off("lesson-deleted");
      };
    }
  }, [socket]);

  const showNotification = (msg, type = "info") => {
    setMessage(msg);
    setVariant(type);
    setShow(true);
  };

  return (
    <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
      <Toast
        show={show}
        onClose={() => setShow(false)}
        delay={3000}
        autohide
        bg={variant}
      >
        <Toast.Header>
          <strong className="me-auto">
            <i className="bi bi-bell me-2"></i>
            Notification
          </strong>
        </Toast.Header>
        <Toast.Body className="text-white">{message}</Toast.Body>
      </Toast>
    </ToastContainer>
  );
};

export default NotificationToast;
