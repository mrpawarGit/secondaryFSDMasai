const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a lesson title"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please provide a lesson description"],
    },
    videoUrl: {
      type: String,
      required: [true, "Please provide a video URL"],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    resources: [
      {
        title: String,
        url: String,
      },
    ],
    order: {
      type: Number,
      default: 0,
    },
    duration: {
      type: String,
      default: "0:00",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Lesson", lessonSchema);
