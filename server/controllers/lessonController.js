import Lesson from '../models/Lesson.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Progress from '../models/Progress.js';

export const getLessonById = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate({
      path: 'course',
      select: 'title code instructor lessons totalLessons',
      populate: {
        path: 'lessons',
        select: 'title moduleTitle order duration videos',
        options: { sort: { order: 1 } },
      },
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found.',
      });
    }

    // Ensure student is enrolled; if they open a lesson directly, auto-enroll or update lastAccessedAt
    let enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: lesson.course._id,
    });

    if (!enrollment) {
      enrollment = await Enrollment.create({
        user: req.user._id,
        course: lesson.course._id,
        completedLessons: [],
        progressPercentage: 0,
        completed: false,
        lastAccessedAt: new Date(),
      });
    } else {
      enrollment.lastAccessedAt = new Date();
      await enrollment.save();
    }

    const completedSet = new Set(
      enrollment.completedLessons.map((id) => id.toString())
    );

    const courseLessons = lesson.course.lessons.map((l) => ({
      _id: l._id,
      title: l.title,
      moduleTitle: l.moduleTitle || `Module ${l.order}`,
      order: l.order,
      duration: l.duration,
      videoCount: Array.isArray(l.videos) ? l.videos.length : 0,
      isCompleted: completedSet.has(l._id.toString()),
    }));

    res.status(200).json({
      success: true,
      lesson: {
        _id: lesson._id,
        title: lesson.title,
        moduleTitle: lesson.moduleTitle || `Module ${lesson.order}`,
        order: lesson.order,
        duration: lesson.duration,
        summary: lesson.summary,
        content: lesson.content,
        codeExample: lesson.codeExample,
        keyTakeaways: lesson.keyTakeaways,
        videos: lesson.videos || [],
        resources: lesson.resources || [],
        isCompleted: completedSet.has(lesson._id.toString()),
        course: {
          _id: lesson.course._id,
          title: lesson.course.title,
          code: lesson.course.code,
          instructor: lesson.course.instructor,
          progressPercentage: enrollment.progressPercentage,
          lessons: courseLessons,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const completeLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found.',
      });
    }

    const course = await Course.findById(lesson.course);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Associated course not found.',
      });
    }

    let enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: course._id,
    });

    if (!enrollment) {
      enrollment = await Enrollment.create({
        user: req.user._id,
        course: course._id,
        completedLessons: [],
        progressPercentage: 0,
        completed: false,
      });
    }

    const alreadyCompleted = enrollment.completedLessons.some(
      (id) => id.toString() === lesson._id.toString()
    );

    if (!alreadyCompleted) {
      enrollment.completedLessons.push(lesson._id);
    }

    const totalLessons = course.lessons.length || course.totalLessons || 1;
    const completedCount = enrollment.completedLessons.length;
    const progressPercentage = Math.min(
      100,
      Math.round((completedCount / totalLessons) * 100)
    );

    const justFinishedCourse = !enrollment.completed && progressPercentage === 100;

    enrollment.progressPercentage = progressPercentage;
    enrollment.completed = progressPercentage === 100;
    if (justFinishedCourse) {
      enrollment.completedAt = new Date();
    }
    enrollment.lastAccessedAt = new Date();
    await enrollment.save();

    if (!alreadyCompleted) {
      await Progress.create({
        user: req.user._id,
        course: course._id,
        actionType: 'lesson_completed',
        title: `Completed lesson: ${lesson.title}`,
        details: `Course progress in ${course.title} is now ${progressPercentage}%.`,
        metadata: {
          percentage: progressPercentage,
          lessonId: lesson._id,
        },
      });
    }

    if (justFinishedCourse) {
      await Progress.create({
        user: req.user._id,
        course: course._id,
        actionType: 'course_completed',
        title: `Completed course: ${course.title}`,
        details: `Finished all ${totalLessons} lessons in ${course.title}!`,
        metadata: {
          percentage: 100,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: alreadyCompleted
        ? 'Lesson was already marked as completed.'
        : `Great job! "${lesson.title}" marked as completed.`,
      progressPercentage: enrollment.progressPercentage,
      completed: enrollment.completed,
      completedLessons: enrollment.completedLessons,
    });
  } catch (error) {
    next(error);
  }
};

