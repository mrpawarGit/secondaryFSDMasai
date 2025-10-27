const express = require("express");
const router = express.Router();
const {
  getCourseActivities,
  getStudentActivities,
  getInstructorActivities,
} = require("../controllers/activityController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// Activity routes
router.get("/course/:courseId", protect, getCourseActivities);
router.get(
  "/student/recent",
  protect,
  authorize("student"),
  getStudentActivities
);
router.get(
  "/instructor/recent",
  protect,
  authorize("instructor"),
  getInstructorActivities
);

module.exports = router;
