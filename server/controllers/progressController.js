import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Progress from '../models/Progress.js';

export const getStudentProgress = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [allCourses, enrollments, quizAttempts, recentActivities] = await Promise.all([
      Course.find().select('title code category thumbnail duration totalLessons instructor').sort({ code: 1 }),
      Enrollment.find({ user: userId }).populate(
        'course',
        'title code category thumbnail duration totalLessons instructor'
      ),
      QuizAttempt.find({ user: userId })
        .populate('quiz', 'title passingPercentage')
        .populate('course', 'title code category')
        .sort({ createdAt: -1 }),
      Progress.find({ user: userId })
        .populate('course', 'title code')
        .sort({ createdAt: -1 })
        .limit(15),
    ]);

    const totalCoursesAvailable = allCourses.length;
    const totalEnrolledCourses = enrollments.length;
    const completedCourses = enrollments.filter((e) => e.completed).length;

    const overallLearningProgress =
      totalEnrolledCourses > 0
        ? Math.round(
            enrollments.reduce((sum, e) => sum + (e.progressPercentage || 0), 0) /
              totalEnrolledCourses
          )
        : 0;

    const totalLessonsCompleted = enrollments.reduce(
      (sum, e) => sum + (e.completedLessons ? e.completedLessons.length : 0),
      0
    );

    const totalQuizzesAttempted = quizAttempts.length;
    const averageQuizScore =
      totalQuizzesAttempted > 0
        ? Math.round(
            quizAttempts.reduce((sum, a) => sum + a.percentage, 0) /
              totalQuizzesAttempted
          )
        : 0;

    const highestQuizScore =
      totalQuizzesAttempted > 0
        ? Math.max(...quizAttempts.map((a) => a.percentage))
        : 0;

    // Build course progress breakdown for charts and cards
    const enrollmentByCourseId = new Map(
      enrollments
        .filter((e) => e.course)
        .map((e) => [e.course._id.toString(), e])
    );

    const courseProgressList = allCourses.map((course) => {
      const enr = enrollmentByCourseId.get(course._id.toString());
      const courseQuizAttempts = quizAttempts.filter(
        (att) => att.course && att.course._id.toString() === course._id.toString()
      );
      const bestQuizPercentage =
        courseQuizAttempts.length > 0
          ? Math.max(...courseQuizAttempts.map((a) => a.percentage))
          : 0;

      return {
        courseId: course._id,
        title: course.title,
        shortTitle: course.code,
        code: course.code,
        category: course.category,
        instructor: course.instructor,
        thumbnail: course.thumbnail,
        duration: course.duration,
        totalLessons: course.totalLessons,
        isEnrolled: Boolean(enr),
        completedLessonsCount: enr ? enr.completedLessons.length : 0,
        progressPercentage: enr ? enr.progressPercentage : 0,
        completed: enr ? enr.completed : false,
        bestQuizPercentage,
        quizAttemptsCount: courseQuizAttempts.length,
        lastAccessedAt: enr ? enr.lastAccessedAt : null,
      };
    });

    // Build chronological quiz performance chart data
    const quizChartData = [...quizAttempts]
      .reverse()
      .slice(-8)
      .map((att, idx) => ({
        attemptLabel: `Attempt #${idx + 1}`,
        quizTitle: att.quiz ? att.quiz.title : 'Course Quiz',
        courseCode: att.course ? att.course.code : 'CS',
        percentage: att.percentage,
        score: att.score,
        totalQuestions: att.totalQuestions,
        passed: att.passed,
        date: new Date(att.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
      }));

    res.status(200).json({
      success: true,
      stats: {
        totalCoursesAvailable,
        totalEnrolledCourses,
        completedCourses,
        overallLearningProgress,
        totalLessonsCompleted,
        totalQuizzesAttempted,
        averageQuizScore,
        highestQuizScore,
      },
      courseProgress: courseProgressList,
      quizHistory: quizAttempts.map((att) => ({
        _id: att._id,
        quizId: att.quiz ? att.quiz._id : null,
        quizTitle: att.quiz ? att.quiz.title : 'Assessment',
        courseTitle: att.course ? att.course.title : 'Course',
        courseCode: att.course ? att.course.code : '',
        score: att.score,
        totalQuestions: att.totalQuestions,
        percentage: att.percentage,
        passed: att.passed,
        timeSpentSeconds: att.timeSpentSeconds,
        createdAt: att.createdAt,
      })),
      quizChartData,
      recentActivities: recentActivities.map((act) => ({
        _id: act._id,
        actionType: act.actionType,
        title: act.title,
        details: act.details,
        courseTitle: act.course ? act.course.title : null,
        courseCode: act.course ? act.course.code : null,
        metadata: act.metadata,
        createdAt: act.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

