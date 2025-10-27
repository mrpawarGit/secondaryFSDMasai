const Course = require("../models/Course");
const User = require("../models/User");
const Lesson = require("../models/Lesson");
const Activity = require("../models/Activity");
const { createActivity } = require("./activityController");

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private (Instructor only)
const createCourse = async (req, res) => {
  try {
    const { title, description, category, level, thumbnail } = req.body;

    // Validation
    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Please provide title and description" });
    }

    // Check if user is instructor
    if (req.user.role !== "instructor") {
      return res
        .status(403)
        .json({ message: "Only instructors can create courses" });
    }

    // Create course
    const course = await Course.create({
      title,
      description,
      category,
      level,
      thumbnail,
      instructor: req.user._id,
    });

    // Add course to instructor's createdCourses
    await User.findByIdAndUpdate(req.user._id, {
      $push: { createdCourses: course._id },
    });

    const populatedCourse = await Course.findById(course._id).populate(
      "instructor",
      "name email"
    );

    res.status(201).json(populatedCourse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
const getAllCourses = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, level, search } = req.query;

    // Build query
    let query = {};

    if (category) {
      query.category = category;
    }

    if (level) {
      query.level = level;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Execute query with pagination
    const courses = await Course.find(query)
      .populate("instructor", "name email")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    // Get total count
    const count = await Course.countDocuments(query);

    res.json({
      courses,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalCourses: count,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get single course by ID
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructor", "name email")
      .populate("students", "name email")
      .populate("lessons");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Instructor only - own courses)
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if user is the course instructor
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this course" });
    }

    const { title, description, category, level, thumbnail, isPublished } =
      req.body;

    // Update fields
    course.title = title || course.title;
    course.description = description || course.description;
    course.category = category || course.category;
    course.level = level || course.level;
    course.thumbnail = thumbnail || course.thumbnail;
    if (isPublished !== undefined) course.isPublished = isPublished;

    const updatedCourse = await course.save();

    const populatedCourse = await Course.findById(updatedCourse._id).populate(
      "instructor",
      "name email"
    );

    // Log activity
    await createActivity(
      updatedCourse._id,
      req.user._id,
      "course_updated",
      `Updated course details`,
      "Course",
      updatedCourse._id,
      { courseTitle: updatedCourse.title }
    );

    // Emit activity to course room
    const io = req.app.get("io");
    const activity = await Activity.findOne({
      course: updatedCourse._id,
      action: "course_updated",
    })
      .populate("actor", "name email role")
      .sort({ createdAt: -1 });
    if (activity) {
      io.to(`course-${updatedCourse._id}`).emit("new-activity", activity);
    }

    res.json(populatedCourse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Instructor only - own courses)
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if user is the course instructor
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this course" });
    }

    // Delete all lessons associated with this course
    await Lesson.deleteMany({ course: course._id });

    // Remove course from instructor's createdCourses
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { createdCourses: course._id },
    });

    // Remove course from all enrolled students
    await User.updateMany(
      { enrolledCourses: course._id },
      { $pull: { enrolledCourses: course._id } }
    );

    await course.deleteOne();

    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Enroll in a course
// @route   POST /api/courses/:id/enroll
// @access  Private (Student only)
const enrollInCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if user is student
    if (req.user.role !== "student") {
      return res
        .status(403)
        .json({ message: "Only students can enroll in courses" });
    }

    // Check if already enrolled
    if (course.students.includes(req.user._id)) {
      return res
        .status(400)
        .json({ message: "Already enrolled in this course" });
    }

    // Add student to course
    course.students.push(req.user._id);
    await course.save();

    // Add course to student's enrolledCourses
    await User.findByIdAndUpdate(req.user._id, {
      $push: { enrolledCourses: course._id },
    });

    // Log activity
    await createActivity(
      course._id,
      req.user._id,
      "student_enrolled",
      `Enrolled in the course`,
      "User",
      req.user._id,
      { userName: req.user.name }
    );

    // Emit activity to course room
    const io = req.app.get("io");
    const activity = await Activity.findOne({
      course: course._id,
      actor: req.user._id,
      action: "student_enrolled",
    })
      .populate("actor", "name email role")
      .sort({ createdAt: -1 });
    if (activity) {
      io.to(`course-${course._id}`).emit("new-activity", activity);
    }

    res.json({ message: "Successfully enrolled in course", course });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Unenroll from a course
// @route   POST /api/courses/:id/unenroll
// @access  Private (Student only)
const unenrollFromCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if enrolled
    if (!course.students.includes(req.user._id)) {
      return res.status(400).json({ message: "Not enrolled in this course" });
    }

    // Store user name before unenrolling
    const userName = req.user.name;
    const courseId = course._id;

    // Remove student from course
    course.students = course.students.filter(
      (studentId) => studentId.toString() !== req.user._id.toString()
    );
    await course.save();

    // Remove course from student's enrolledCourses
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { enrolledCourses: course._id },
    });

    // Log activity
    await createActivity(
      courseId,
      req.user._id,
      "student_unenrolled",
      `Unenrolled from the course`,
      "User",
      null,
      { userName }
    );

    // Emit activity to course room
    const io = req.app.get("io");
    const activity = await Activity.findOne({
      course: courseId,
      action: "student_unenrolled",
    })
      .populate("actor", "name email role")
      .sort({ createdAt: -1 });
    if (activity) {
      io.to(`course-${courseId}`).emit("new-activity", activity);
    }

    res.json({ message: "Successfully unenrolled from course" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get instructor's courses
// @route   GET /api/courses/instructor/my-courses
// @access  Private (Instructor only)
const getInstructorCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id })
      .populate("instructor", "name email")
      .sort({ createdAt: -1 });

    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get student's enrolled courses
// @route   GET /api/courses/student/enrolled
// @access  Private (Student only)
const getEnrolledCourses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "enrolledCourses",
      populate: {
        path: "instructor",
        select: "name email",
      },
    });

    res.json(user.enrolledCourses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  unenrollFromCourse,
  getInstructorCourses,
  getEnrolledCourses,
};
