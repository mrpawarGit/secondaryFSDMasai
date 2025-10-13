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

// Mark lesson as complete
export const markLessonComplete = async (lessonId) => {
  const response = await axios.post(
    `${API_URL}/progress/lesson/${lessonId}/complete`,
    {},
    getAuthHeader()
  );
  return response.data;
};

// Mark lesson as incomplete
export const markLessonIncomplete = async (lessonId) => {
  const response = await axios.post(
    `${API_URL}/progress/lesson/${lessonId}/incomplete`,
    {},
    getAuthHeader()
  );
  return response.data;
};

// Get course progress
export const getCourseProgress = async (courseId) => {
  const response = await axios.get(
    `${API_URL}/progress/course/${courseId}`,
    getAuthHeader()
  );
  return response.data;
};

// Get all student progress
export const getStudentProgress = async () => {
  const response = await axios.get(
    `${API_URL}/progress/student/my-progress`,
    getAuthHeader()
  );
  return response.data;
};
