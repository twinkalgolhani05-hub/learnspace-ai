import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import Enrollment from '../models/Enrollment.js';
import Quiz from '../models/Quiz.js';
import Progress from '../models/Progress.js';

export const getCourses = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const filter = {};

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: regex },
        { code: regex },
        { description: regex },
        { instructor: regex },
        { category: regex },
      ];
    }

    const courses = await Course.find(filter)
      .populate({
        path: 'lessons',
        select: 'title order duration summary',
        options: { sort: { order: 1 } },
      })
      .sort({ code: 1 });

    const enrollments = await Enrollment.find({ user: req.user._id });
    const enrollmentMap = new Map(
      enrollments.map((enr) => [enr.course.toString(), enr])
    );

    const formattedCourses = courses.map((course) => {
      const enrollment = enrollmentMap.get(course._id.toString());
      return {
        _id: course._id,
        title: course.title,
        code: course.code,
        description: course.description,
        instructor: course.instructor,
        instructorTitle: course.instructorTitle,
        thumbnail: course.thumbnail,
        category: course.category,
        level: course.level,
        duration: course.duration,
        totalLessons: course.lessons.length || course.totalLessons,
        skills: course.skills,
        lessons: course.lessons,
        isEnrolled: Boolean(enrollment),
        progressPercentage: enrollment ? enrollment.progressPercentage : 0,
        completedLessonsCount: enrollment ? enrollment.completedLessons.length : 0,
        completed: enrollment ? enrollment.completed : false,
        lastAccessedAt: enrollment ? enrollment.lastAccessedAt : null,
      };
    });

    res.status(200).json({
      success: true,
      count: formattedCourses.length,
      courses: formattedCourses,
    });
  } catch (error) {
    next(error);
  }
};

export const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate({
      path: 'lessons',
      options: { sort: { order: 1 } },
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.',
      });
    }

    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: course._id,
    });

    const quiz = await Quiz.findOne({ course: course._id }).select(
      '_id title description durationMinutes passingPercentage questions'
    );

    const completedSet = new Set(
      enrollment ? enrollment.completedLessons.map((id) => id.toString()) : []
    );

    const lessonsWithStatus = course.lessons.map((lesson) => ({
      _id: lesson._id,
      title: lesson.title,
      moduleTitle: lesson.moduleTitle || `Module ${lesson.order}`,
      order: lesson.order,
      duration: lesson.duration,
      summary: lesson.summary,
      videoCount: Array.isArray(lesson.videos) ? lesson.videos.length : 0,
      resourceCount: Array.isArray(lesson.resources) ? lesson.resources.length : 0,
      isCompleted: completedSet.has(lesson._id.toString()),
    }));

    res.status(200).json({
      success: true,
      course: {
        _id: course._id,
        title: course.title,
        code: course.code,
        description: course.description,
        instructor: course.instructor,
        instructorTitle: course.instructorTitle,
        thumbnail: course.thumbnail,
        category: course.category,
        level: course.level,
        duration: course.duration,
        totalLessons: course.lessons.length,
        skills: course.skills,
        lessons: lessonsWithStatus,
        isEnrolled: Boolean(enrollment),
        progressPercentage: enrollment ? enrollment.progressPercentage : 0,
        completedLessonsCount: completedSet.size,
        completed: enrollment ? enrollment.completed : false,
        quiz: quiz
          ? {
              _id: quiz._id,
              title: quiz.title,
              description: quiz.description,
              durationMinutes: quiz.durationMinutes,
              passingPercentage: quiz.passingPercentage,
              questionCount: quiz.questions.length,
            }
          : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const enrollInCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.',
      });
    }

    let enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: course._id,
    });

    if (enrollment) {
      return res.status(200).json({
        success: true,
        message: `You are already enrolled in ${course.title}.`,
        enrollment,
      });
    }

    enrollment = await Enrollment.create({
      user: req.user._id,
      course: course._id,
      completedLessons: [],
      progressPercentage: 0,
      completed: false,
      lastAccessedAt: new Date(),
    });

    await Progress.create({
      user: req.user._id,
      course: course._id,
      actionType: 'course_enrolled',
      title: `Enrolled in ${course.title}`,
      details: `Started ${course.code} (${course.totalLessons} lessons).`,
    });

    res.status(201).json({
      success: true,
      message: `Successfully enrolled in ${course.title}!`,
      enrollment,
    });
  } catch (error) {
    next(error);
  }
};

