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
        console.log('User:', req.user);  // Log user object
        console.log('User ID:', req.user.id);  // Log user ID (use `id` instead of `_id`)

        const userId = req.user.id;  // Use `id` since that's how it's stored in the JWT payload
        const { comment } = req.body; // Get content from request body
        const blogId = req.params.blog_id; // Get blog ID from URL params

        if (!userId || !blogId) {
            return res.status(400).json({ error: 'User or Blog ID is missing.' });
        }

        // Create a new comment
        const newComment = new Comments({
            blogId,
            user: userId,  // Assign `userId` correctly
            comment,
        });

        // Save the comment to the database
        await newComment.save();

        // Send back the comment in response
        res.status(201).json(newComment);
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ error: "Error creating comment" });
    }
};

exports.addlike = async (req, res) => {
    console.log('Add like route hit');
    try {
        const userId = req.user.id;  // Assuming req.user._id contains the authenticated user ID
        const blogId = req.params.blog_id; // Get the blog ID from request params

        // Check if the like already exists for this blog by this user
        const existingLike = await Like.findOne({ blog_id: blogId, user_id: userId });

        if (existingLike) {
            // If the like exists, remove it (toggle off the like)
            await Like.deleteOne({ _id: existingLike._id });
            res.status(200).json({ message: 'Like removed' });
        } else {
            // If the like does not exist, create a new like
            const newLike = new Like({ blog_id: blogId, user_id: userId });
            await newLike.save();
            res.status(201).json({ message: 'Like added', like: newLike });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Function to count the number of likes for a specific blog
exports.countLikes = async (req, res) => {
    try {
        const blogId = req.params.blog_id;

        // Count the number of likes for the specified blog_id
        const likeCount = await Like.countDocuments({ blog_id: blogId });

        res.status(200).json({ blogId, likeCount });
    } catch (error) {
        console.error("Error counting likes:", error);
        res.status(500).json({ message: "Error counting likes" });
    }
};

// exports.countComments = async (req, res) => {
//     try {
//         const blog = await Blog.findById(req.params.id);
//         if (!blog) return res.status(404).json({ error: 'Blog not found' });

//         const commentCount = blog.Comments.length;
//         res.status(200).json({ commentCount });
//     } catch (err) {
//         res.status(500).json({ error: 'Internal server error' });
//     }
// };
exports.countComments = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.blog_id); // Change this line
        if (!blog) return res.status(404).json({ error: 'Blog not found' });

        const commentCount = blog.Comments.length;
        res.status(200).json({ blogId: req.params.blog_id, commentCount }); // Include blogId in response
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getCommentsByBlogId = async (req, res) => {
    try {
        const blogId = req.params.blog_id;
        console.log("Fetching comments for blog ID:", blogId); // Log the blog ID

        // Check if the blog ID exists in the comments collection
        const comments = await Comments.find({ blogId });  // Use blogId instead of blog_id
        
        if (!comments || comments.length === 0) {
            return res.status(404).send({ error: "No comments found for this blog" });
        }

        res.send(comments);
    } catch (error) {
        console.error("Error retrieving comments:", error); // Log error for debugging
        res.status(500).send({ error: "Error retrieving comments" });
    }
};

