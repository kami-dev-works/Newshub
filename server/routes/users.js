import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import News from '../models/News.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const total = await User.countDocuments();
    const users = await User.find()
      .select('-password')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/with-passwords', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find()
      .select('+password')
      .sort('-createdAt');

    const usersWithMaskedPasswords = users.map(user => ({
      _id: user._id,
      username: user.username,
      email: user.email,
      password: user.password,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      location: user.location,
      notifications: user.notifications,
      likedNews: user.likedNews,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));

    res.json(usersWithMaskedPasswords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalNews = await News.countDocuments();
    const totalViews = await News.aggregate([
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]);
    const trendingNews = await News.find({ status: 'approved' })
      .sort('-views -likes.length')
      .limit(5)
      .populate('author', 'username');

    res.json({
      totalUsers,
      totalNews,
      totalViews: totalViews[0]?.total || 0,
      trendingNews
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/profile', protect, async (req, res) => {
  try {
    const { username, bio, location, avatar, notifications } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { username, bio, location, avatar, notifications },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/password', protect, adminOnly, async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { password: hashedPassword },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Password updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/liked', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'likedNews',
      populate: { path: 'author', select: 'username avatar' }
    });
    res.json(user.likedNews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/like/:newsId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const newsId = req.params.newsId;

    const likeIndex = user.likedNews.indexOf(newsId);
    if (likeIndex > -1) {
      user.likedNews.splice(likeIndex, 1);
    } else {
      user.likedNews.push(newsId);
    }

    await user.save();
    
    const news = await News.findById(newsId);
    const newsLikeIndex = news.likes.indexOf(req.user._id);
    if (newsLikeIndex > -1) {
      news.likes.splice(newsLikeIndex, 1);
    } else {
      news.likes.push(req.user._id);
    }
    await news.save();

    res.json({ likedNews: user.likedNews, liked: likeIndex === -1 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
