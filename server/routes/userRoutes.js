const express = require('express');
const { User } = require('../models');
const { signToken, authMiddleware } = require('../utils/auth');

const router = express.Router();

const requireAuth = (req, res, next) => {
  authMiddleware({ req });

  if (!req.user?._id) {
    res.status(401).json({
      error: 'Authentication required.',
    });
    return;
  }

  next();
};

const mapUserProfile = (user) => ({
  _id: user._id,
  name: user.username,
  email: user.email,
  age: user.age || 0,
  bio: user.bio || '',
  profileImage: user.profileImage || '',
  state: user.state || '',
  city: user.city || '',
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    res.status(400).json({
      error: 'Email and password are required.',
    });
    return;
  }

  try {
    const user = await User.findOne({ email });

    if (!user || !(await user.isCorrectPassword(password))) {
      res.status(401).json({
        error: 'Incorrect credentials.',
      });
      return;
    }

    const token = signToken(user);

    res.json({
      token,
      user: mapUserProfile(user),
    });
  } catch (error) {
    console.error('REST login failed:', error);
    res.status(500).json({
      error: 'Unable to log in right now.',
    });
  }
});

router.get('/user/profile', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -__v');

    if (!user) {
      res.status(404).json({
        error: 'User profile not found.',
      });
      return;
    }

    res.json({
      user: mapUserProfile(user),
    });
  } catch (error) {
    console.error('Get profile failed:', error);
    res.status(500).json({
      error: 'Unable to load profile right now.',
    });
  }
});

router.put('/user/profile', requireAuth, async (req, res) => {
  const { name, age, bio, profileImage, state, city } = req.body || {};

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404).json({
        error: 'User profile not found.',
      });
      return;
    }

    if (typeof name === 'string' && name.trim()) {
      user.username = name.trim();
    }

    if (age !== undefined) {
      user.age = Math.max(Number(age) || 0, 0);
    }

    if (typeof bio === 'string') {
      user.bio = bio.trim();
    }

    if (typeof profileImage === 'string') {
      user.profileImage = profileImage.trim();
    }

    if (typeof state === 'string') {
      user.state = state.trim();
    }

    if (typeof city === 'string') {
      user.city = city.trim();
    }

    await user.save();

    res.json({
      user: mapUserProfile(user),
    });
  } catch (error) {
    console.error('Update profile failed:', error);
    res.status(500).json({
      error: 'Unable to update profile right now.',
    });
  }
});

module.exports = router;
