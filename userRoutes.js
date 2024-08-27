// const express = require('express');
// const router = express.Router();
// const { createUser, loginUser } = require('./controller/userController');

// router.post('/users', createUser);
// router.post('/userLogin', loginUser);

// module.exports = router;

const express = require('express');
const router = express.Router();
const { createUser, loginUser } = require('./controller/userController');

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: User registered successfully.
 *       400:
 *         description: Invalid input data.
 */
router.post('/users', createUser);

/**
 * @swagger
 * /userLogin:
 *   post:
 *     summary: Login a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: User logged in successfully.
 *       401:
 *         description: Unauthorized, invalid credentials.
 *       400:
 *         description: Invalid input data.
 */
router.post('/userLogin', loginUser);

module.exports = router;
