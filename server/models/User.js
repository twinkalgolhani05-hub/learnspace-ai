import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    department: {
      type: String,
      default: 'Computer Science & Engineering',
      trim: true,
    },
    semester: {
      type: String,
      default: '3rd Semester',
      trim: true,
    },
    studentId: {
      type: String,
      default: () => `LS-${Math.floor(100000 + Math.random() * 900000)}`,
    },
    bio: {
      type: String,
      default: 'Passionate college student exploring computer science, software engineering, and AI.',
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    avatar: {
      type: String,
      default: '',
    },
    preferences: {
      emailNotifications: { type: Boolean, default: true },
      quizReminders: { type: Boolean, default: true },
      aiExplanationStyle: {
        type: String,
        enum: ['concise', 'detailed', 'step-by-step'],
        default: 'step-by-step',
      },
      weeklyStudyGoalHours: { type: Number, default: 12, min: 1, max: 80 },
      compactSidebar: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;

