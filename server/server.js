import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import newsRoutes from './routes/news.js';
import userRoutes from './routes/users.js';
import commentRoutes from './routes/comments.js';
import uploadRoutes from './routes/upload.js';
import feedbackRoutes from './routes/feedback.js';
import adsRoutes from './routes/ads.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/ads', adsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'NewsHub API is running' });
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/newshub';

const createDefaultAdmin = async () => {
  try {
    const User = (await import('./models/User.js')).default;
    
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    
    if (!existingAdmin) {
      await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: 'Admin@123',
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        bio: 'System Administrator',
        location: 'New York',
        notifications: { email: true, likes: true, comments: true }
      });
      
      console.log('✅ Default admin user created');
      console.log('   Email: admin@example.com');
      console.log('   Password: Admin@123');
    } else {
      console.log('✅ Admin user already exists');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    await createDefaultAdmin();
    try {
      const News = (await import('./models/News.js')).default;
      const count = await News.countDocuments({ shortId: { $exists: false } });
      if (count > 0) {
        const allNews = await News.find({ shortId: { $exists: false } });
        for (const n of allNews) {
          n.shortId = n._id.toString().slice(-8);
          await n.save();
        }
        console.log(`✅ Backfilled shortId for ${count} news items`);
      }
    } catch (err) {
      console.error('Error backfilling shortIds:', err.message);
    }
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

export default app;
