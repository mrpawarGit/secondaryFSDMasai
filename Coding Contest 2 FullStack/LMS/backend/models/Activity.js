const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "lesson_added",
        "lesson_updated",
        "lesson_deleted",
        "lesson_reordered",
        "comment_added",
        "comment_deleted",
        "student_enrolled",
        "student_unenrolled",
        "course_updated",
      ],
    },
    description: {
      type: String,
      required: true,
    },
    targetType: {
      type: String,
      enum: ["Lesson", "Comment", "User", "Course"],
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
activitySchema.index({ course: 1, createdAt: -1 });

module.exports = mongoose.model("Activity", activitySchema);
