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

// Create a new course (Instructor)
export const createCourse = async (courseData) => {
  const response = await axios.post(
    `${API_URL}/courses`,
    courseData,
    getAuthHeader()
  );
  return response.data;
};

// Get all courses (Public)
export const getAllCourses = async (page = 1, filters = {}) => {
  const params = new URLSearchParams({ page, ...filters });
  const response = await axios.get(`${API_URL}/courses?${params}`);
  return response.data;
};

// Get single course by ID (Public)
export const getCourseById = async (courseId) => {
  const response = await axios.get(`${API_URL}/courses/${courseId}`);
  return response.data;
};

// Update course (Instructor)
export const updateCourse = async (courseId, courseData) => {
  const response = await axios.put(
    `${API_URL}/courses/${courseId}`,
    courseData,
    getAuthHeader()
  );
  return response.data;
};

// Delete course (Instructor)
export const deleteCourse = async (courseId) => {
  const response = await axios.delete(
    `${API_URL}/courses/${courseId}`,
    getAuthHeader()
  );
  return response.data;
};

// Enroll in course (Student)
export const enrollInCourse = async (courseId) => {
  const response = await axios.post(
    `${API_URL}/courses/${courseId}/enroll`,
    {},
    getAuthHeader()
  );
  return response.data;
};

// Unenroll from course (Student)
export const unenrollFromCourse = async (courseId) => {
  const response = await axios.post(
    `${API_URL}/courses/${courseId}/unenroll`,
    {},
    getAuthHeader()
  );
  return response.data;
};

// Get instructor's courses
export const getInstructorCourses = async () => {
  const response = await axios.get(
    `${API_URL}/courses/instructor/my-courses`,
    getAuthHeader()
  );
  return response.data;
};

// Get student's enrolled courses
export const getEnrolledCourses = async () => {
  const response = await axios.get(
    `${API_URL}/courses/student/enrolled`,
    getAuthHeader()
  );
  return response.data;
};
