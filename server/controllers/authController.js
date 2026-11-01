import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import Progress from '../models/Progress.js';

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'learnspace_super_secret_jwt_key_2026_college_project';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id: userId }, secret, { expiresIn });
};

const formatUserResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  department: user.department,
  semester: user.semester,
  studentId: user.studentId,
  bio: user.bio,
  avatar: user.avatar,
  preferences: user.preferences,
  createdAt: user.createdAt,
});

export const register = async (req, res, next) => {
  try {
    const { name, email, password, department, semester } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your full name, email address, and password.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address is already registered.',
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      department: department || 'Computer Science & Engineering',
      semester: semester || '5th Semester',
    });

    // Auto-enroll new student in Data Structures & Algorithms so they immediately have a starter course
    const firstCourse = await Course.findOne({ code: 'CS-301' });
    if (firstCourse) {
      await Enrollment.create({
        user: user._id,
        course: firstCourse._id,
        completedLessons: [],
        progressPercentage: 0,
        completed: false,
      });

      await Progress.create({
        user: user._id,
        course: firstCourse._id,
        actionType: 'course_enrolled',
        title: `Enrolled in ${firstCourse.title}`,
        details: 'Welcome to LearnSpace! Your starter course is ready.',
      });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to LearnSpace.',
      token,
      user: formatUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email address and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password.',
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: formatUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: formatUserResponse(req.user),
    });
  } catch (error) {
    next(error);
  }
};

