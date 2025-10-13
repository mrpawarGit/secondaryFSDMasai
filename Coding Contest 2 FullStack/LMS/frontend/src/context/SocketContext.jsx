import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "./AuthContext";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      // Create socket connection
      const newSocket = io(import.meta.env.VITE_API_URL.replace("/api", ""), {
        auth: {
          token: user.token,
        },
      });

      newSocket.on("connect", () => {
        console.log("Socket connected:", newSocket.id);
      });

      newSocket.on("disconnect", () => {
        console.log("Socket disconnected");
      });

      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        newSocket.close();
      };
    } else {
      // Disconnect socket if user logs out
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [user]);

  const joinCourse = (courseId) => {
    if (socket) {
      socket.emit("join-course", courseId);
    }
  };

  const leaveCourse = (courseId) => {
    if (socket) {
      socket.emit("leave-course", courseId);
    }
  };

  const joinLesson = (lessonId) => {
    if (socket) {
      socket.emit("join-lesson", lessonId);
    }
  };

  const leaveLesson = (lessonId) => {
    if (socket) {
      socket.emit("leave-lesson", lessonId);
    }
  };

  const value = {
    socket,
    joinCourse,
    leaveCourse,
    joinLesson,
    leaveLesson,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
