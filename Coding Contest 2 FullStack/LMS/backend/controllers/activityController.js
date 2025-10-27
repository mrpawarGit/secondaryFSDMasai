const Activity = require("../models/Activity");
const Course = require("../models/Course");

// Helper function to create activity
const createActivity = async (
  courseId,
  actorId,
  action,
  description,
  targetType = null,
  targetId = null,
  metadata = null
) => {
  try {
    const activity = await Activity.create({
      course: courseId,
      actor: actorId,
      action,
      description,
      targetType,
      targetId,
      metadata,
    });

    // Populate actor for real-time emission
    await activity.populate("actor", "name email role");

    return activity;
  } catch (error) {
    console.error("Error creating activity:", error);
    return null;
  }
};

// @desc    Get activities for a course
// @route   GET /api/activities/course/:courseId
// @access  Private (Enrolled students or instructor)
const getCourseActivities = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check authorization
    const isInstructor =
      course.instructor.toString() === req.user._id.toString();
    const isEnrolled = course.students.includes(req.user._id);

    if (!isInstructor && !isEnrolled) {
      return res.status(403).json({
        message: "Not authorized to view activities",
      });
    }

    // Get activities with pagination
    const activities = await Activity.find({ course: courseId })
      .populate("actor", "name email role")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count
    const count = await Activity.countDocuments({ course: courseId });

    res.json({
      activities,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalActivities: count,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get recent activities across all enrolled courses for a student
// @route   GET /api/activities/student/recent
// @access  Private (Student only)
const getStudentActivities = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get all courses where student is enrolled
    const courses = await Course.find({ students: req.user._id }).select("_id");
    const courseIds = courses.map((c) => c._id);

    // Get recent activities from all enrolled courses
    const activities = await Activity.find({ course: { $in: courseIds } })
      .populate("actor", "name email role")
      .populate("course", "title")
      .sort({ createdAt: -1 })
      .limit(limit * 1);

    res.json(activities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get activities for instructor's courses
// @route   GET /api/activities/instructor/recent
// @access  Private (Instructor only)
const getInstructorActivities = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get all courses created by instructor
    const courses = await Course.find({ instructor: req.user._id }).select(
      "_id"
    );
    const courseIds = courses.map((c) => c._id);

    // Get recent activities from all instructor's courses
    const activities = await Activity.find({ course: { $in: courseIds } })
      .populate("actor", "name email role")
      .populate("course", "title")
      .sort({ createdAt: -1 })
      .limit(limit * 1);

    res.json(activities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createActivity,
  getCourseActivities,
  getStudentActivities,
  getInstructorActivities,
};
