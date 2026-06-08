import mongoose from 'mongoose';
import crypto from 'crypto';

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    default: '',
    maxlength: 500
  },
  content: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800'
  },
  category: {
    type: String,
    enum: ['politics', 'sports', 'tech', 'entertainment', 'local', 'technology', 'business', 'health', 'science', 'world'],
    default: 'world'
  },
  status: {
    type: String,
    enum: ['approved', 'pending', 'rejected'],
    default: 'approved'
  },
  tags: [{
    type: String,
    trim: true
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  trp: {
    type: Number,
    default: 0
  },
  isLocal: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  shortId: {
    type: String,
    unique: true,
    sparse: true
  }
}, { timestamps: true });

newsSchema.index({ title: 'text', description: 'text', tags: 'text' });

function generateShortId() {
  return Date.now().toString(36).slice(-4) + Math.random().toString(36).slice(2, 6);
}

newsSchema.pre('save', function(next) {
  if (!this.shortId) {
    this.shortId = generateShortId();
  }
  next();
});

export default mongoose.model('News', newsSchema);
