import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Get auth header with token
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

// Add a lesson to a course (Instructor)
export const addLesson = async (courseId, lessonData) => {
  const response = await axios.post(
    `${API_URL}/courses/${courseId}/lessons`,
    lessonData,
    getAuthHeader()
  );
  return response.data;
};

// Get all lessons for a course
export const getLessonsByCourse = async (courseId) => {
  const response = await axios.get(`${API_URL}/courses/${courseId}/lessons`);
  return response.data;
};

// Get single lesson by ID
export const getLessonById = async (lessonId) => {
  const response = await axios.get(
    `${API_URL}/lessons/${lessonId}`,
    getAuthHeader()
  );
  return response.data;
};

// Update lesson (Instructor)
export const updateLesson = async (lessonId, lessonData) => {
  const response = await axios.put(
    `${API_URL}/lessons/${lessonId}`,
    lessonData,
    getAuthHeader()
  );
  return response.data;
};

// Delete lesson (Instructor)
export const deleteLesson = async (lessonId) => {
  const response = await axios.delete(
    `${API_URL}/lessons/${lessonId}`,
    getAuthHeader()
  );
  return response.data;
};

// Reorder lessons (Instructor)
export const reorderLessons = async (courseId, lessonIds) => {
  const response = await axios.put(
    `${API_URL}/courses/${courseId}/lessons/reorder`,
    { lessonIds },
    getAuthHeader()
  );
  return response.data;
};
