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

// Get activities for a course
export const getCourseActivities = async (courseId, page = 1) => {
  const response = await axios.get(
    `${API_URL}/activities/course/${courseId}?page=${page}`,
    getAuthHeader()
  );
  return response.data;
};

// Get recent activities for student
export const getStudentActivities = async (limit = 10) => {
  const response = await axios.get(
    `${API_URL}/activities/student/recent?limit=${limit}`,
    getAuthHeader()
  );
  return response.data;
};

// Get recent activities for instructor
export const getInstructorActivities = async (limit = 10) => {
  const response = await axios.get(
    `${API_URL}/activities/instructor/recent?limit=${limit}`,
    getAuthHeader()
  );
  return response.data;
};
