const Comment = require("../models/Comment");
const Lesson = require("../models/Lesson");
const Course = require("../models/Course");

// @desc    Add a comment to a lesson
// @route   POST /api/lessons/:lessonId/comments
// @access  Private (Enrolled students or instructor)
const addComment = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { message, parentCommentId } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Please provide a message" });
    }

    // Check if lesson exists
    const lesson = await Lesson.findById(lessonId).populate("course");
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    // Check authorization
    const course = await Course.findById(lesson.course._id);
    const isInstructor =
      course.instructor.toString() === req.user._id.toString();
    const isEnrolled = course.students.includes(req.user._id);

    if (!isInstructor && !isEnrolled) {
      return res.status(403).json({
        message: "Not authorized to comment on this lesson",
      });
    }

    // Create comment
    const comment = await Comment.create({
      lesson: lessonId,
      user: req.user._id,
      message,
      parentComment: parentCommentId || null,
    });

    // If this is a reply, add it to parent's replies array
    if (parentCommentId) {
      await Comment.findByIdAndUpdate(parentCommentId, {
        $push: { replies: comment._id },
      });
    }

    // Populate user info
    await comment.populate("user", "name email role");

    // Emit real-time event
    const io = req.app.get("io");
    io.to(`lesson-${lessonId}`).emit("new-comment", comment);

    res.status(201).json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all comments for a lesson
// @route   GET /api/lessons/:lessonId/comments
// @access  Private (Enrolled students or instructor)
const getCommentsByLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;

    // Check if lesson exists
    const lesson = await Lesson.findById(lessonId).populate("course");
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    // Check authorization
    const course = await Course.findById(lesson.course._id);
    const isInstructor =
      course.instructor.toString() === req.user._id.toString();
    const isEnrolled = course.students.includes(req.user._id);

    if (!isInstructor && !isEnrolled) {
      return res.status(403).json({
        message: "Not authorized to view comments",
      });
    }

    // Get top-level comments (not replies)
    const comments = await Comment.find({
      lesson: lessonId,
      parentComment: null,
    })
      .populate("user", "name email role")
      .populate({
        path: "replies",
        populate: { path: "user", select: "name email role" },
      })
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:commentId
// @access  Private (Comment owner or course instructor)
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId).populate({
      path: "lesson",
      populate: { path: "course" },
    });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user is comment owner
    const isOwner = comment.user.toString() === req.user._id.toString();

    // Check if user is course instructor
    const course = await Course.findById(comment.lesson.course._id);
    const isInstructor =
      course.instructor.toString() === req.user._id.toString();

    // DELETION RULE: Only comment owner OR course instructor can delete
    if (!isOwner && !isInstructor) {
      return res.status(403).json({
        message: "Not authorized to delete this comment",
      });
    }

    // Delete all replies to this comment recursively
    const deleteReplies = async (commentId) => {
      const replies = await Comment.find({ parentComment: commentId });
      for (const reply of replies) {
        await deleteReplies(reply._id); // Recursively delete nested replies
        await reply.deleteOne();
      }
    };

    await deleteReplies(commentId);

    // Remove from parent's replies array if this is a reply
    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(comment.parentComment, {
        $pull: { replies: commentId },
      });
    }

    // Delete the comment itself
    await comment.deleteOne();

    // Emit real-time event
    const io = req.app.get("io");
    io.to(`lesson-${comment.lesson._id}`).emit("delete-comment", commentId);

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update a comment
// @route   PUT /api/comments/:commentId
// @access  Private (Comment owner only)
const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Please provide a message" });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user is comment owner (ONLY owner can edit)
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to update this comment",
      });
    }

    comment.message = message;
    await comment.save();

    await comment.populate("user", "name email role");

    // Emit real-time event
    const io = req.app.get("io");
    io.to(`lesson-${comment.lesson}`).emit("update-comment", comment);

    res.json(comment);
  } catch (err) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  addComment,
  getCommentsByLesson,
  deleteComment,
  updateComment,
};
