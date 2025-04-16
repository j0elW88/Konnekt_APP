const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");



// GET feed of posts for a user's clubs
router.get("/feed/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
  
      // Get user's club memberships
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ msg: "User not found" });
  
      const clubIds = user.clubs || [];
  
      // Calculate date 30 days ago
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30);
  
      // Get recent posts only
      const posts = await Post.find({
        clubId: { $in: clubIds },
        createdAt: { $gte: cutoffDate }  // 👈 only newer posts
      }).sort({ createdAt: -1 });
  
      res.json(posts);
    } catch (err) {
      console.error("Error fetching feed:", err);
      res.status(500).json({ msg: "Server error" });
    }
  });
  

// PATCH like
    router.patch('/:id/like', async (req, res) => {
        const { id } = req.params;
        const { userId } = req.body;
    
        try {
        const post = await Post.findById(id);
        if (!post) return res.status(404).json({ error: "Post not found" });
    
        if (!post.likes.includes(userId)) {
            post.likes.push(userId);
        }
    
        await post.save();
        res.json(post);
        } catch (err) {
        res.status(500).json({ error: "Server error" });
        }
    });
  
// DELETE unlike
    router.delete('/:id/like', async (req, res) => {
        const { id } = req.params;
        const { userId } = req.body;
    
        try {
        const post = await Post.findById(id);
        if (!post) return res.status(404).json({ error: "Post not found" });
    
        post.likes = post.likes.filter(likeId => likeId.toString() !== userId);
        await post.save();
        res.json(post);
        } catch (err) {
        res.status(500).json({ error: "Server error" });
        }
    });

// Create Post
    router.post("/create", async (req, res) => {
        const { clubId, clubName, content, imageUrl } = req.body;
    
        if (!clubId || !clubName || !content) {
        return res.status(400).json({ msg: "Missing required fields" });
        }
    
        try {
        const newPost = new Post({ clubId, clubName, content, imageUrl });
        await newPost.save();
        res.status(201).json(newPost);
        } catch (err) {
        console.error("Post creation error:", err);
        res.status(500).json({ msg: "Server error" });
        }
    });

// DELETE a post by ID
    router.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;
  
      const deleted = await Post.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ msg: "Post not found" });
  
      res.json({ msg: "Post deleted successfully", post: deleted });
    } catch (err) {
      console.error("Error deleting post:", err);
      res.status(500).json({ msg: "Server error" });
    }
  });
  
  

  
  
module.exports = router;
