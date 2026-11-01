import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
    },
    instructor: {
      type: String,
      required: [true, 'Instructor name is required'],
    },
    instructorTitle: {
      type: String,
      default: 'Professor of Computer Science',
    },
    thumbnail: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: [true, 'Course category is required'],
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Intermediate',
    },
    duration: {
      type: String,
      required: true,
    },
    totalLessons: {
      type: Number,
      default: 0,
    },
    skills: [
      {
        type: String,
      },
    ],
    lessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
      },
    ],
  },
  { timestamps: true }
);

const Course = mongoose.model('Course', courseSchema);
export default Course;

