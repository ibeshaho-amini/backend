const Post = require('../Models/Blogs');
const Comments = require('../Models/Coments');
const Like = require('../Models/like'); 
const cloudinary = require('../cloudinary');
const fs = require('fs').promises;
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const schema = Joi.object({
    title: Joi.string().required(),
    content: Joi.string().required(),
    author: Joi.string().required(),
});

// Middleware to validate blog input


exports.createBlog = async (req, res) => {
    try {
        const { error } = schema.validate(req.body);
        if (error) return res.status(400).send({ error: error.details[0].message });

        const { title, content, author } = req.body;
        const post = new Post({ title, content, author });
        await post.save();
        res.status(201).send(post);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Error creating blog" });
    }
};


exports.uploadImageToBlog = async (req, res) => {
    if (!req.file) return res.status(400).json({ err: 'Please select an image' });

    try {
        console.log('Uploading image from:', req.file.path); // Log the file path

        const result = await cloudinary.uploader.upload(req.file.path, { folder: "Posts" });
        console.log('Cloudinary upload result:', result); // Log the Cloudinary result

        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        // Update post with image URL and Cloudinary public ID
        post.image = result.secure_url;
        post.public_id = result.public_id;

        await post.save(); // Save post with image URL
        console.log('Image URL saved to post:', post.image);

        // Remove the file from local uploads folder
        await fs.unlink(req.file.path);
        console.log('Local file removed:', req.file.path);

        res.status(200).json({
            message: 'Image uploaded successfully',
            id: post._id,
            image: post.image,
        });
    } catch (err) {
        console.error('Error uploading image:', err); // Log any errors
        res.status(500).json({ error: 'Error uploading image' });
    }
};
  

exports.getBlogs = async (req, res) => {
    try {
        const posts = await Post.find();
        res.send(posts);
    } catch (error) {
        res.status(500).send({ error: "Error fetching blogs" });
    }
};

exports.getBlogById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).send({ error: "Blog not found" });
        res.send(post);
    } catch (error) {
        res.status(500).send({ error: "Error fetching blog" });
    }
};

exports.updateBlog = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).send({ error: "Blog not found" });

        if (req.body.title) post.title = req.body.title;
        if (req.body.content) post.content = req.body.content;

        await post.save();
        res.send(post);
    } catch (error) {
        res.status(500).send({ error: "Error updating blog" });
    }
};

exports.deleteBlog = async (req, res) => {
    try {
        const result = await Post.findByIdAndDelete(req.params.id);
        if (!result) return res.status(404).send({ error: "Blog not found" });
        res.status(204).send();
    } catch (error) {
        res.status(500).send({ error: "Error deleting blog" });
    }
};
exports.createComment = async (req, res) => {
    try {
        const userId = req.user._id;  // Ensure the user is authenticated
        const { comment } = req.body; // Get content from request body
        const blogId = req.params.blog_id; // Get blog ID from URL params

        // Create a new comment
        const comments = new Comments({
            blogId, 
            user: userId, 
            comment,
        });

        // Save the comment to the database
        await comments.save();

        // Send back the comment in response
        res.status(201).json(comments);
    } catch (error) {
        console.error(error);
        res.status(404).json({ error: "Blog post doesn't exist!" });
    }
};


    exports.addlike = async (req, res) => {
        console.log('Add like route hit');
        try {
            const userId = req.user._id;
           const blogId = req.params.blog_id;
      
           const liked = new Like({blogId, user: userId,})
        //   if (!userId) {
        //     return res.status(400).json({ message: 'User ID is missing' });
        //   }
      
        //   const liked = await Like.findOne({ blog_id: blogId, user_id: userId });
      
          if (liked) {
            await Like.deleteOne({ _id: liked._id });
            res.status(200).json({ message: 'Like removed' });
          } else {
            const newLike = new Like({ blog_id: blogId, user_id: userId, like: true });
            await newLike.save();
            res.status(201).json({ message: 'Like added', like: newLike });
          }
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Server error' });
        }
      };
      
exports.updateLike = async (req, res) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) return res.status(401).send({ error: "No token provided" });

        const decoded = jwt.verify(token, 'secret_key0987');
        const userId = decoded.id;

        const { comment_id } = req.params;
        const { like } = req.body;

        // Validate like input
        if (typeof like !== 'number' || like < 0) {
            return res.status(400).send({ error: "Invalid like value" });
        }

        // Find the comment and update the like field
        const comment = await Comments.findOneAndUpdate(
            { _id: comment_id, user_id: userId },
            { like },
            { new: true }
        );

        if (!comment) return res.status(404).send({ error: "Comment not found or not authorized" });

        res.send(comment);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Error updating like" });
    }
};





exports.getCommentsByBlogId = async (req, res) => {
    try {
        const comments = await Comments.find({ blog_id: req.params.blog_id }).populate('user_id', 'email');
        if (!comments || comments.length === 0) return res.status(404).send({ error: "No comments found for this blog" });
        res.send(comments);
    } catch (error) {
        res.status(500).send({ error: "Error retrieving comments" });
    }
};
