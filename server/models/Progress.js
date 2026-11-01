import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      default: null,
    },
    actionType: {
      type: String,
      enum: ['course_enrolled', 'lesson_completed', 'course_completed', 'quiz_completed', 'ai_tutor_query'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    details: {
      type: String,
      default: '',
    },
    metadata: {
      score: { type: Number, default: null },
      percentage: { type: Number, default: null },
      lessonId: { type: mongoose.Schema.Types.ObjectId, default: null },
      quizId: { type: mongoose.Schema.Types.ObjectId, default: null },
    },
  },
  { timestamps: true }
);

const Progress = mongoose.model('Progress', progressSchema);
export default Progress;

