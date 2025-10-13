const Progress = require("../models/Progress");
const Course = require("../models/Course");
const Lesson = require("../models/Lesson");

// @desc    Mark lesson as complete
// @route   POST /api/progress/lesson/:lessonId/complete
// @access  Private (Student only)
const markLessonComplete = async (req, res) => {
  try {
    const { lessonId } = req.params;

    // Get lesson and course
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    const course = await Course.findById(lesson.course);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if student is enrolled
    if (!course.students.includes(req.user._id)) {
      return res.status(403).json({ message: "Not enrolled in this course" });
    }

    // Find or create progress record
    let progress = await Progress.findOne({
      student: req.user._id,
      course: lesson.course,
    });

    if (!progress) {
      progress = await Progress.create({
        student: req.user._id,
        course: lesson.course,
        completedLessons: [lessonId],
        lastAccessedLesson: lessonId,
      });
    } else {
      // Add lesson if not already completed
      if (!progress.completedLessons.includes(lessonId)) {
        progress.completedLessons.push(lessonId);
        progress.lastAccessedLesson = lessonId;
      }
    }

    // Calculate completion percentage
    const totalLessons = await Lesson.countDocuments({ course: lesson.course });
    progress.completionPercentage = Math.round(
      (progress.completedLessons.length / totalLessons) * 100
    );

    await progress.save();

    res.json(progress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Mark lesson as incomplete
// @route   POST /api/progress/lesson/:lessonId/incomplete
// @access  Private (Student only)
const markLessonIncomplete = async (req, res) => {
  try {
    const { lessonId } = req.params;

    // Get lesson
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    // Find progress record
    const progress = await Progress.findOne({
      student: req.user._id,
      course: lesson.course,
    });

    if (!progress) {
      return res.status(404).json({ message: "Progress not found" });
    }

    // Remove lesson from completed
    progress.completedLessons = progress.completedLessons.filter(
      (id) => id.toString() !== lessonId
    );

    // Recalculate completion percentage
    const totalLessons = await Lesson.countDocuments({ course: lesson.course });
    progress.completionPercentage = Math.round(
      (progress.completedLessons.length / totalLessons) * 100
    );

    await progress.save();

    res.json(progress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get progress for a course
// @route   GET /api/progress/course/:courseId
// @access  Private (Student only)
const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if student is enrolled
    if (!course.students.includes(req.user._id)) {
      return res.status(403).json({ message: "Not enrolled in this course" });
    }

    // Get progress
    let progress = await Progress.findOne({
      student: req.user._id,
      course: courseId,
    })
      .populate("completedLessons")
      .populate("lastAccessedLesson");

    // If no progress exists, create empty one
    if (!progress) {
      const totalLessons = await Lesson.countDocuments({ course: courseId });
      progress = {
        student: req.user._id,
        course: courseId,
        completedLessons: [],
        completionPercentage: 0,
        totalLessons,
      };
    } else {
      const totalLessons = await Lesson.countDocuments({ course: courseId });
      progress = progress.toObject();
      progress.totalLessons = totalLessons;
    }

    res.json(progress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all progress for student
// @route   GET /api/progress/student/my-progress
// @access  Private (Student only)
const getStudentProgress = async (req, res) => {
  try {
    const progressRecords = await Progress.find({ student: req.user._id })
      .populate("course")
      .populate("lastAccessedLesson");

    // Add total lessons for each course
    const progressWithTotals = await Promise.all(
      progressRecords.map(async (record) => {
        const totalLessons = await Lesson.countDocuments({
          course: record.course._id,
        });
        return {
          ...record.toObject(),
          totalLessons,
        };
      })
    );

    res.json(progressWithTotals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  markLessonComplete,
  markLessonIncomplete,
  getCourseProgress,
  getStudentProgress,
};
