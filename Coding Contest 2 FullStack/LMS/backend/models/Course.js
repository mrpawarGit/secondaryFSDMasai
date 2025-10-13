const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a course title"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please provide a course description"],
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
      },
    ],
    thumbnail: {
      type: String,
      default: "https://via.placeholder.com/400x200?text=Course+Thumbnail",
    },
    category: {
      type: String,
      enum: [
        "Web Development",
        "Data Science",
        "Mobile Development",
        "Design",
        "Other",
      ],
      default: "Other",
    },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for enrolled students count
courseSchema.virtual("enrolledCount").get(function () {
  return this.students.length;
});

// Virtual for lessons count
courseSchema.virtual("lessonsCount").get(function () {
  return this.lessons.length;
});

// Ensure virtuals are included in JSON
courseSchema.set("toJSON", { virtuals: true });
courseSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Course", courseSchema);
