const express = require("express");
const router = express.Router();
const {
  addLesson,
  getLessonsByCourse,
  getLessonById,
  updateLesson,
  deleteLesson,
  reorderLessons,
} = require("../controllers/lessonController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// Optional auth middleware
const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    return protect(req, res, next);
  }
  next();
};

// Course-specific lesson routes
router.post(
  "/courses/:courseId/lessons",
  protect,
  authorize("instructor"),
  addLesson
);
router.get("/courses/:courseId/lessons", optionalAuth, getLessonsByCourse);
router.put(
  "/courses/:courseId/lessons/reorder",
  protect,
  authorize("instructor"),
  reorderLessons
);

// Individual lesson routes
router.get("/lessons/:id", protect, getLessonById);
router.put("/lessons/:id", protect, authorize("instructor"), updateLesson);
router.delete("/lessons/:id", protect, authorize("instructor"), deleteLesson);

module.exports = router;
