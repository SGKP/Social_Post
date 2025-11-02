import express from 'express';
import Post from '../models/Post.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get all posts (Public Feed) with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username profilePicture bio')
      .populate('comments.user', 'username profilePicture bio');

    const total = await Post.countDocuments();

    res.json({
      success: true,
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching posts',
      error: error.message 
    });
  }
});

// Get single post by ID
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'username profilePicture bio')
      .populate('comments.user', 'username profilePicture bio');

    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found' 
      });
    }

    res.json({
      success: true,
      post
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching post',
      error: error.message 
    });
  }
});

// Create new post (Protected)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { text, image } = req.body;

    // Validate: at least text or image is required
    if (!text && !image) {
      return res.status(400).json({ 
        success: false, 
        message: 'Post must contain either text or image' 
      });
    }

    const post = new Post({
      user: req.userId,
      username: req.user.username,
      text: text || '',
      image: image || ''
    });

    await post.save();

    // Populate user data
    await post.populate('user', 'username profilePicture bio');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating post',
      error: error.message 
    });
  }
});

// Like/Unlike a post (Protected)
router.post('/:id/like', verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found' 
      });
    }

    const userIndex = post.likes.indexOf(req.userId);

    if (userIndex === -1) {
      // Like the post
      post.likes.push(req.userId);
    } else {
      // Unlike the post
      post.likes.splice(userIndex, 1);
    }

    await post.save();

    res.json({
      success: true,
      message: userIndex === -1 ? 'Post liked' : 'Post unliked',
      likesCount: post.likesCount,
      isLiked: userIndex === -1
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating like',
      error: error.message 
    });
  }
});

// Add comment to post (Protected)
router.post('/:id/comment', verifyToken, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Comment text is required' 
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found' 
      });
    }

    const comment = {
      user: req.userId,
      username: req.user.username,
      text: text.trim()
    };

    post.comments.push(comment);
    await post.save();

    // Populate the new comment
    await post.populate('comments.user', 'username profilePicture bio');

    const newComment = post.comments[post.comments.length - 1];

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: newComment,
      commentsCount: post.commentsCount
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error adding comment',
      error: error.message 
    });
  }
});

// Edit comment (Protected - only comment owner)
router.put('/:postId/comment/:commentId', verifyToken, async (req, res) => {
  try {
    const { text } = req.body;
    const { postId, commentId } = req.params;

    if (!text || !text.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Comment text is required' 
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found' 
      });
    }

    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Comment not found' 
      });
    }

    // Check if user is the comment owner
    if (comment.user.toString() !== req.userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to edit this comment' 
      });
    }

    comment.text = text.trim();
    comment.updatedAt = new Date();
    await post.save();

    res.json({
      success: true,
      message: 'Comment updated successfully',
      comment
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating comment',
      error: error.message 
    });
  }
});

// Delete comment (Protected - only comment owner)
router.delete('/:postId/comment/:commentId', verifyToken, async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found' 
      });
    }

    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Comment not found' 
      });
    }

    // Check if user is the comment owner
    if (comment.user.toString() !== req.userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this comment' 
      });
    }

    comment.deleteOne();
    await post.save();

    res.json({
      success: true,
      message: 'Comment deleted successfully',
      commentsCount: post.commentsCount
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting comment',
      error: error.message 
    });
  }
});

// Increment view count (unique per user)
router.post('/:id/view', verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found' 
      });
    }

    // Check if user already viewed this post
    const alreadyViewed = post.viewedBy.includes(req.user.id);

    if (!alreadyViewed) {
      // Add user to viewedBy array and increment view count
      post.viewedBy.push(req.user.id);
      post.views = post.viewedBy.length;
      await post.save();
    }

    res.json({
      success: true,
      views: post.views
    });
  } catch (error) {
    console.error('Error incrementing view:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error incrementing view',
      error: error.message 
    });
  }
});

// Save/Bookmark post (Protected)
router.post('/:id/save', verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found' 
      });
    }

    const userIndex = post.savedBy.indexOf(req.userId);

    if (userIndex === -1) {
      // Save the post
      post.savedBy.push(req.userId);
    } else {
      // Unsave the post
      post.savedBy.splice(userIndex, 1);
    }

    await post.save();

    res.json({
      success: true,
      savedBy: post.savedBy,
      message: userIndex === -1 ? 'Post saved' : 'Post unsaved',
      isSaved: userIndex === -1,
      savedCount: post.savedBy.length
    });
  } catch (error) {
    console.error('Error toggling save:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating save',
      error: error.message 
    });
  }
});

// Update/Edit post (Protected - only post owner)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { text, image } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found' 
      });
    }

    // Check if user is the post owner
    if (post.user.toString() !== req.userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to edit this post' 
      });
    }

    // Validate: at least text or image is required
    if (!text && !image) {
      return res.status(400).json({ 
        success: false, 
        message: 'Post must contain either text or image' 
      });
    }

    // Update post
    post.text = text || '';
    post.image = image || '';
    await post.save();

    // Populate user data
    await post.populate('user', 'username profilePicture bio');

    res.json({
      success: true,
      message: 'Post updated successfully',
      post
    });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating post',
      error: error.message 
    });
  }
});

// Delete post (Protected - only post owner)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found' 
      });
    }

    // Check if user is the post owner
    if (post.user.toString() !== req.userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this post' 
      });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting post',
      error: error.message 
    });
  }
});

export default router;
