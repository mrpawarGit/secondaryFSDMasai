const express = require("express");
const router = express.Router();
const {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  unenrollFromCourse,
  getInstructorCourses,
  getEnrolledCourses,
} = require("../controllers/courseController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// Public routes
router.get("/", getAllCourses);
router.get("/:id", getCourseById);

// Instructor routes
router.post("/", protect, authorize("instructor"), createCourse);
router.put("/:id", protect, authorize("instructor"), updateCourse);
router.delete("/:id", protect, authorize("instructor"), deleteCourse);
router.get(
  "/instructor/my-courses",
  protect,
  authorize("instructor"),
  getInstructorCourses
);

// Student routes
router.post("/:id/enroll", protect, authorize("student"), enrollInCourse);
router.post("/:id/unenroll", protect, authorize("student"), unenrollFromCourse);
router.get(
  "/student/enrolled",
  protect,
  authorize("student"),
  getEnrolledCourses
);

module.exports = router;
