const express = require("express");
const router = express.Router();
const {
  markLessonComplete,
  markLessonIncomplete,
  getCourseProgress,
  getStudentProgress,
} = require("../controllers/progressController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// Progress routes
router.post(
  "/lesson/:lessonId/complete",
  protect,
  authorize("student"),
  markLessonComplete
);
router.post(
  "/lesson/:lessonId/incomplete",
  protect,
  authorize("student"),
  markLessonIncomplete
);
router.get(
  "/course/:courseId",
  protect,
  authorize("student"),
  getCourseProgress
);
router.get(
  "/student/my-progress",
  protect,
  authorize("student"),
  getStudentProgress
);

module.exports = router;
