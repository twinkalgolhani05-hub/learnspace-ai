import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true,
    },
    moduleTitle: {
      type: String,
      default: 'Core Module',
    },
    order: {
      type: Number,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    codeExample: {
      type: String,
      default: '',
    },
    keyTakeaways: [
      {
        type: String,
      },
    ],
    videos: [
      {
        title: { type: String, required: true },
        youtubeId: { type: String, required: true },
        url: { type: String, default: '' },
        duration: { type: String, default: '15:00' },
        channel: { type: String, default: 'University CS Lecture' },
        description: { type: String, default: '' },
      },
    ],
    resources: [
      {
        title: { type: String, required: true },
        type: { type: String, default: 'Revision Notes' },
        description: { type: String, default: '' },
      },
    ],
  },
  { timestamps: true }
);

const Lesson = mongoose.model('Lesson', lessonSchema);
export default Lesson;

