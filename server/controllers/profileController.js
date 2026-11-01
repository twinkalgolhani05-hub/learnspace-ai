import User from '../models/User.js';

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      profile: {
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
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      department,
      semester,
      bio,
      avatar,
      preferences,
      currentPassword,
      newPassword,
    } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    if (typeof name === 'string' && name.trim()) {
      user.name = name.trim();
    }
    if (typeof department === 'string') {
      user.department = department.trim();
    }
    if (typeof semester === 'string') {
      user.semester = semester.trim();
    }
    if (typeof bio === 'string') {
      user.bio = bio.trim();
    }
    if (typeof avatar === 'string') {
      user.avatar = avatar.trim();
    }

    if (preferences && typeof preferences === 'object') {
      user.preferences = {
        ...user.preferences.toObject(),
        ...preferences,
      };
    }

    // Handle optional secure password update
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Please provide your current password to set a new password.',
        });
      }

      const isCurrentValid = await user.comparePassword(currentPassword);
      if (!isCurrentValid) {
        return res.status(401).json({
          success: false,
          message: 'Your current password is incorrect.',
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long.',
        });
      }

      user.password = newPassword;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: newPassword
        ? 'Profile and password updated successfully!'
        : 'Profile updated successfully!',
      profile: {
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
      },
    });
  } catch (error) {
    next(error);
  }
};

