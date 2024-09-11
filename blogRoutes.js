
const express = require('express');
const router = express.Router();
const upload = require('./multer');
const {
    createBlog,
    getBlogs,
    getBlogById,
    updateBlog,
    deleteBlog,
    createComment,
    addlike,
    getCommentsByBlogId,
    updateLike,
    uploadImageToBlog
} = require('./controller/BlogController');
const validateAuth = require('./middleware/validateAuth');
const validateInput = require('./middleware/validateInput');

/**
 * @swagger
 * /blogs:
 *   post:
 *     summary: Create a new blog post
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - author
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               author:
 *                 type: string
 *     responses:
 *       201:
 *         description: The blog was successfully created.
 *       400:
 *         description: Invalid input data.
 *       401:
 *         description: Unauthorized.
 */
router.post('/blogs', validateAuth, validateInput, createBlog);

/**
 * @swagger
 * /blogs/{id}/image:
 *   post:
 *     summary: Upload an image for a blog post
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The blog ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully.
 *       404:
 *         description: Blog not found.
 *       500:
 *         description: Internal server error.
 */
router.post('/blogs/:id/image', upload, uploadImageToBlog);

/**
 * @swagger
 * /blogs:
 *   get:
 *     summary: Get all blogs
 *     tags: [Blogs]
 *     responses:
 *       200:
 *         description: List of all blogs.
 */
router.get('/blogs', getBlogs);

/**
 * @swagger
 * /blogs/{id}:
 *   get:
 *     summary: Get a blog by ID
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The blog ID
 *     responses:
 *       200:
 *         description: The blog data.
 *       404:
 *         description: Blog not found.
 */
router.get('/blogs/:id', getBlogById);

/**
 * @swagger
 * /blogs/{id}:
 *   patch:
 *     summary: Update a blog
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The blog ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               author:
 *                 type: string
 *     responses:
 *       200:
 *         description: The blog was updated successfully.
 *       400:
 *         description: Invalid input data.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Blog not found.
 */
router.patch('/blogs/:id', validateAuth, validateInput, updateBlog);

/**
 * @swagger
 * /blogs/{id}:
 *   delete:
 *     summary: Delete a blog
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The blog ID
 *     responses:
 *       200:
 *         description: The blog was deleted.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Blog not found.
 */
router.delete('/blogs/:id', validateAuth, deleteBlog);

/**
 * @swagger
 * /blogs/{blog_id}/comments:
 *   post:
 *     summary: Add a comment to a blog
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blog_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The blog ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: The comment was added successfully.
 *       400:
 *         description: Invalid input data.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Blog not found.
 */
router.post('/blogs/:blog_id/comments', validateAuth, createComment);

/**
 * @swagger
 * /blogs/{blog_id}/comments:
 *   get:
 *     summary: Get comments for a blog
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: blog_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The blog ID
 *     responses:
 *       200:
 *         description: List of comments for the blog.
 *       404:
 *         description: No comments found for this blog.
 */
router.get('/blogs/:blog_id/comments', getCommentsByBlogId);

/**
 * @swagger
 * /blogs/{blog_id}/likes:
 *   post:
 *     summary: Add a like to a blog
 *     tags: [Likes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blog_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The blog ID
 *     responses:
 *       201:
 *         description: The like was added successfully.
 *       400:
 *         description: Invalid input data.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Blog not found.
 */
router.post('/blogs/:blog_id/likes', validateAuth, addlike);


/**
 * @swagger
 * /comments/{comment_id}/like:
 *   patch:
 *     summary: Update the like count for a comment
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: comment_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The comment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               like:
 *                 type: integer
 *     responses:
 *       200:
 *         description: The like count was updated.
 *       400:
 *         description: Invalid input data.
 *       404:
 *         description: Comment not found.
 */
router.patch('/comments/:comment_id/like', updateLike);

module.exports = router;
