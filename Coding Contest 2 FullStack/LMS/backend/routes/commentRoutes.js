const express = require("express");
const router = express.Router();
const {
  addComment,
  getCommentsByLesson,
  deleteComment,
  updateComment,
} = require("../controllers/commentController");
const { protect } = require("../middleware/authMiddleware");

// Lesson comments
router.post("/lessons/:lessonId/comments", protect, addComment);
router.get("/lessons/:lessonId/comments", protect, getCommentsByLesson);

// Individual comment operations
router.put("/comments/:commentId", protect, updateComment);
router.delete("/comments/:commentId", protect, deleteComment);

module.exports = router;
