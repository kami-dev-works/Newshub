import express from "express";
import News from "../models/News.js";
import User from "../models/User.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      sort = "-createdAt",
    } = req.query;

    const query = { status: "approved" };

    if (category && category !== "all") {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const total = await News.countDocuments(query);
    const news = await News.find(query)
      .populate("author", "username avatar")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      news,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/pending", protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const query = { status: "pending" };
    const total = await News.countDocuments(query);
    const news = await News.find(query)
      .populate("author", "username avatar")
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json({
      news,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/my-submissions", protect, async (req, res) => {
  try {
    const news = await News.find({ author: req.user._id })
      .populate("author", "username avatar")
      .sort("-createdAt");
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/top", async (req, res) => {
  try {
    const news = await News.find({ status: "approved" })
      .populate("author", "username avatar")
      .sort("-views -likes.length")
      .limit(10);
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/recent", async (req, res) => {
  try {
    const news = await News.find({ status: "approved" })
      .populate("author", "username avatar")
      .sort("-createdAt")
      .limit(20);
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/local", async (req, res) => {
  try {
    const { location } = req.query;
    const query = { status: "approved", isLocal: true };

    if (location) {
      query.$or = [{ category: "local" }, { tags: location }];
    }

    const news = await News.find(query)
      .populate("author", "username avatar")
      .sort("-createdAt");
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/trp", async (req, res) => {
  try {
    const allNews = await News.find({ status: "approved" })
      .sort("-views")
      .limit(50);
    
    const totalViews = allNews.reduce((sum, n) => sum + (n.views || 0), 0);
    const totalLikes = allNews.reduce((sum, n) => sum + (n.likes?.length || 0), 0);
    const totalRatings = allNews.reduce((sum, n) => sum + (n.ratingCount || 0), 0);
    
    const avgRating = totalRatings > 0 
      ? allNews.reduce((sum, n) => sum + (n.rating || 0), 0) / allNews.length 
      : 0;
    
    const trpScore = calculateTRP(totalViews, totalLikes, avgRating, allNews.length);
    
    const topNews = allNews.slice(0, 10).map(n => ({
      _id: n._id,
      title: n.title,
      views: n.views,
      likes: n.likes?.length || 0,
      rating: n.rating,
      trp: calculateSingleTRP(n.views, n.likes?.length || 0, n.rating)
    }));
    
    res.json({
      trp: trpScore,
      trend: trpScore > 5 ? 'up' : trpScore < 3 ? 'down' : 'stable',
      totalViews,
      totalLikes,
      totalRatings,
      avgRating: Math.round(avgRating * 10) / 10,
      newsCount: allNews.length,
      topNews
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/short/:shortId", async (req, res) => {
  try {
    const news = await News.findOneAndUpdate(
      { shortId: req.params.shortId },
      { $inc: { views: 1 } },
      { new: true },
    ).populate("author", "username avatar");

    if (!news) {
      return res.status(404).json({ message: "News not found" });
    }
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const news = await News.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true },
    ).populate("author", "username avatar");

    if (!news) {
      return res.status(404).json({ message: "News not found" });
    }
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const news = await News.create({
      ...req.body,
      author: req.user._id,
      status: "approved",
    });
    res.status(201).json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/submit", protect, async (req, res) => {
  try {
    if (!req.body.description) {
      req.body.description = req.body.title
      console.log("Submitting news:", req.body.description);
    }
    const news = await News.create({
      ...req.body,
      author: req.user._id,
      status: "pending",
    });
    res.status(201).json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const news = await News.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!news) {
      return res.status(404).json({ message: "News not found" });
    }
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id/stats", protect, adminOnly, async (req, res) => {
  try {
    const { views, likes } = req.body;
    const updateData = {};
    
    if (typeof views === 'number' && views >= 0) {
      updateData.views = views;
    }
    
    if (Array.isArray(likes)) {
      updateData.likes = likes;
    }
    
    const news = await News.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });
    
    if (!news) {
      return res.status(404).json({ message: "News not found" });
    }
    
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/approve/:id", protect, adminOnly, async (req, res) => {
  try {
    const news = await News.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true },
    ).populate("author", "username avatar");

    if (!news) {
      return res.status(404).json({ message: "News not found" });
    }
    res.json({ message: "News approved successfully", news });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/reject/:id", protect, adminOnly, async (req, res) => {
  try {
    const news = await News.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true },
    ).populate("author", "username avatar");

    if (!news) {
      return res.status(404).json({ message: "News not found" });
    }
    res.json({ message: "News rejected", news });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const news = await News.findByIdAndDelete(req.params.id);
    if (!news) {
      return res.status(404).json({ message: "News not found" });
    }
    res.json({ message: "News deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/:id/like", protect, async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: "News not found" });
    }

    const userId = req.user._id.toString();
    const likeIndex = news.likes.findIndex((id) => id.toString() === userId);

    if (likeIndex > -1) {
      news.likes.splice(likeIndex, 1);
      await news.save();
      await User.findByIdAndUpdate(req.user._id, { $pull: { likedNews: news._id } });
      res.json({ likes: news.likes.length, liked: false });
    } else {
      news.likes.push(req.user._id);
      await news.save();
      await User.findByIdAndUpdate(req.user._id, { $addToSet: { likedNews: news._id } });
      res.json({ likes: news.likes.length, liked: true });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/:id/rate", async (req, res) => {
  try {
    const { rating } = req.body;
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({ message: "News not found" });
    }

    const newRatingCount = news.ratingCount + 1;
    const newRating =
      (news.rating * news.ratingCount + rating) / newRatingCount;

    news.rating = Math.round(newRating * 10) / 10;
    news.ratingCount = newRatingCount;

    await news.save();
    res.json({ rating: news.rating, ratingCount: news.ratingCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/trp", async (req, res) => {
  try {
    const allNews = await News.find({ status: "approved" })
      .sort("-views -likes.length")
      .limit(50);
    
    const totalViews = allNews.reduce((sum, n) => sum + (n.views || 0), 0);
    const totalLikes = allNews.reduce((sum, n) => sum + (n.likes?.length || 0), 0);
    const totalRatings = allNews.reduce((sum, n) => sum + (n.ratingCount || 0), 0);
    
    const avgRating = totalRatings > 0 
      ? allNews.reduce((sum, n) => sum + (n.rating || 0), 0) / allNews.length 
      : 0;
    
    const trpScore = calculateTRP(totalViews, totalLikes, avgRating, allNews.length);
    
    const topNews = allNews.slice(0, 10).map(n => ({
      _id: n._id,
      title: n.title,
      views: n.views,
      likes: n.likes?.length || 0,
      rating: n.rating,
      trp: calculateSingleTRP(n.views, n.likes?.length || 0, n.rating)
    }));
    
    res.json({
      trp: trpScore,
      trend: trpScore > 5 ? 'up' : trpScore < 3 ? 'down' : 'stable',
      totalViews,
      totalLikes,
      totalRatings,
      avgRating: Math.round(avgRating * 10) / 10,
      newsCount: allNews.length,
      topNews
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

function calculateTRP(views, likes, rating, newsCount) {
  const viewScore = Math.min(views / 20000, 10);
  const likeScore = Math.min(likes / 50, 10);
  const ratingScore = rating * 2;
  const countScore = Math.min(newsCount / 10, 10);
  
  let trp = (viewScore * 0.35) + (likeScore * 0.25) + (ratingScore * 0.25) + (countScore * 0.15);
  return Math.round(trp * 10) / 10;
}

function calculateSingleTRP(views, likes, rating) {
  const viewScore = Math.min(views / 5000, 10);
  const likeScore = Math.min(likes / 10, 10);
  const ratingScore = rating * 2;
  
  let trp = (viewScore * 0.4) + (likeScore * 0.3) + (ratingScore * 0.3);
  return Math.round(trp * 10) / 10;
}

export default router;
