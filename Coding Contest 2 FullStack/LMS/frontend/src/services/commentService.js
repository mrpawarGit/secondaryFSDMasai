import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeader = () => {
  const userInfo = localStorage.getItem("userInfo");
  if (userInfo) {
    const { token } = JSON.parse(userInfo);
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }
  return {};
};

// Add comment to a lesson
export const addComment = async (lessonId, message, parentCommentId = null) => {
  const response = await axios.post(
    `${API_URL}/lessons/${lessonId}/comments`,
    { message, parentCommentId },
    getAuthHeader()
  );
  return response.data;
};

// Get all comments for a lesson
export const getCommentsByLesson = async (lessonId) => {
  const response = await axios.get(
    `${API_URL}/lessons/${lessonId}/comments`,
    getAuthHeader()
  );
  return response.data;
};

// Delete a comment
export const deleteComment = async (commentId) => {
  const response = await axios.delete(
    `${API_URL}/comments/${commentId}`,
    getAuthHeader()
  );
  return response.data;
};

// Update a comment
export const updateComment = async (commentId, message) => {
  const response = await axios.put(
    `${API_URL}/comments/${commentId}`,
    { message },
    getAuthHeader()
  );
  return response.data;
};
