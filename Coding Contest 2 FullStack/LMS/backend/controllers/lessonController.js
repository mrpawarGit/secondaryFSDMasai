const Lesson = require("../models/Lesson");
const Course = require("../models/Course");

// @desc    Add a new lesson to a course
// @route   POST /api/courses/:courseId/lessons
// @access  Private (Instructor only)
const addLesson = async (req, res) => {
  try {
    const { title, description, videoUrl, resources, duration } = req.body;
    const { courseId } = req.params;

    // Validation
    if (!title || !description || !videoUrl) {
      return res.status(400).json({
        message: "Please provide title, description, and video URL",
      });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if user is the course instructor
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to add lessons to this course",
      });
    }

    // Get the order number (last lesson order + 1)
    const lessonsCount = await Lesson.countDocuments({ course: courseId });

    // Create lesson
    const lesson = await Lesson.create({
      title,
      description,
      videoUrl,
      resources: resources || [],
      duration: duration || "0:00",
      course: courseId,
      order: lessonsCount,
    });

    // Add lesson to course's lessons array
    course.lessons.push(lesson._id);
    await course.save();

    res.status(201).json(lesson);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all lessons for a course
// @route   GET /api/courses/:courseId/lessons
// @access  Public (but students must be enrolled to see full content)
const getLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Get lessons sorted by order
    const lessons = await Lesson.find({ course: courseId }).sort({ order: 1 });

    // If no user is authenticated, return basic lesson info only
    if (!req.user) {
      return res.json(lessons);
    }

    // If user is the instructor, return all lessons
    if (course.instructor.toString() === req.user._id.toString()) {
      return res.json(lessons);
    }

    // If user is a student, check enrollment
    if (req.user.role === "student") {
      const isEnrolled = course.students.some(
        (studentId) => studentId.toString() === req.user._id.toString()
      );

      if (!isEnrolled) {
        return res.status(403).json({
          message: "You must be enrolled in this course to view lessons",
        });
      }
    }

    res.json(lessons);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get single lesson by ID
// @route   GET /api/lessons/:id
// @access  Private (Enrolled students or instructor)
const getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate("course");

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
        message: "Not authorized to view this lesson",
      });
    }

    res.json(lesson);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update a lesson
// @route   PUT /api/lessons/:id
// @access  Private (Instructor only)
const updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate("course");

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    // Check if course exists
    const course = await Course.findById(lesson.course._id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if user is the course instructor
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to update this lesson",
      });
    }

    const { title, description, videoUrl, resources, duration } = req.body;

    // Update fields
    lesson.title = title || lesson.title;
    lesson.description = description || lesson.description;
    lesson.videoUrl = videoUrl || lesson.videoUrl;
    lesson.duration = duration || lesson.duration;
    if (resources !== undefined) lesson.resources = resources;

    const updatedLesson = await lesson.save();

    res.json(updatedLesson);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete a lesson
// @route   DELETE /api/lessons/:id
// @access  Private (Instructor only)
const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    // Check if course exists
    const course = await Course.findById(lesson.course);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if user is the course instructor
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to delete this lesson",
      });
    }

    // Remove lesson from course's lessons array
    course.lessons = course.lessons.filter(
      (lessonId) => lessonId.toString() !== lesson._id.toString()
    );
    await course.save();

    // Delete the lesson
    await lesson.deleteOne();

    // Reorder remaining lessons
    const remainingLessons = await Lesson.find({ course: course._id }).sort({
      order: 1,
    });
    for (let i = 0; i < remainingLessons.length; i++) {
      remainingLessons[i].order = i;
      await remainingLessons[i].save();
    }

    res.json({ message: "Lesson deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Reorder lessons
// @route   PUT /api/courses/:courseId/lessons/reorder
// @access  Private (Instructor only)
const reorderLessons = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { lessonIds } = req.body; // Array of lesson IDs in new order

    if (!lessonIds || !Array.isArray(lessonIds)) {
      return res
        .status(400)
        .json({ message: "Please provide an array of lesson IDs" });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if user is the course instructor
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to reorder lessons for this course",
      });
    }

    // Update order for each lesson
    for (let i = 0; i < lessonIds.length; i++) {
      await Lesson.findByIdAndUpdate(lessonIds[i], { order: i });
    }

    // Get updated lessons
    const lessons = await Lesson.find({ course: courseId }).sort({ order: 1 });

    res.json({ message: "Lessons reordered successfully", lessons });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  addLesson,
  getLessonsByCourse,
  getLessonById,
  updateLesson,
  deleteLesson,
  reorderLessons,
};
