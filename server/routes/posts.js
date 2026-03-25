const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/auth');
const Post = require('../models/Post');


const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });


router.get('/', authMiddleware, async (req, res) => {
  try {
    const { sort } = req.query;
    let sortQuery = { createdAt: -1 };

    if (sort === 'likes') sortQuery = { likesCount: -1 };
    if (sort === 'comments') sortQuery = { commentsCount: -1 };

    const posts = await Post.aggregate([
      {
        $addFields: {
          likesCount: { $size: '$likes' },
          commentsCount: { $size: '$comments' },
        },
      },
      { $sort: sortQuery },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'authorData',
        },
      },
      { $unwind: '$authorData' },
      {
        $project: {
          text: 1,
          imageUrl: 1,
          likes: 1,
          likesCount: 1,
          comments: 1,
          commentsCount: 1,
          createdAt: 1,
          'authorData._id': 1,
          'authorData.username': 1,
          'authorData.avatar': 1,
        },
      },
    ]);

    res.json(posts);
  } catch (err) {
    console.error('Get posts error:', err);
    res.status(500).json({ message: 'Server error fetching posts' });
  }
});

// POST /api/posts — create a new post (auth required)
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { text } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    if (!text && !imageUrl) {
      return res.status(400).json({ message: 'Post must have text or an image' });
    }

    const post = await Post.create({
      author: req.user.id,
      text: text || '',
      imageUrl,
    });

    const populated = await Post.findById(post._id).populate('author', 'username avatar');

    res.status(201).json(populated);
  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).json({ message: 'Server error creating post' });
  }
});


router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userId = req.user.id;
    const alreadyLiked = post.likes.some((id) => id.toString() === userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.json({
      likes: post.likes,
      likesCount: post.likes.length,
      liked: !alreadyLiked,
    });
  } catch (err) {
    console.error('Like error:', err);
    res.status(500).json({ message: 'Server error toggling like' });
  }
});


router.post('/:id/comment', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const newComment = {
      user: req.user.id,
      username: req.user.username,
      text: text.trim(),
    };

    post.comments.push(newComment);
    await post.save();

    const addedComment = post.comments[post.comments.length - 1];
    res.status(201).json({
      comment: addedComment,
      commentsCount: post.comments.length,
    });
  } catch (err) {
    console.error('Comment error:', err);
    res.status(500).json({ message: 'Server error adding comment' });
  }
});

module.exports = router;
