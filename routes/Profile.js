// routes/profile.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/verifyToken');
const User = require('../models/User'); // Make sure this path is correct
const { getProfile } = require('../controllers/userController');
const verifyToken = require('../middleware/verifyToken');

router.get('/profile', verifyToken(), getProfile);

module.exports = router;



// router.get('/profile', authMiddleware, async (req, res) => {
//   try {
//     const userId = req.decoded?.userId;
//     if (!userId) {
//       return res.status(400).json({ message: 'Invalid token. User ID missing.' });
//     }

//     const user = await User.findOne({ _id: userId, deleted: false }).select('-password');
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     res.status(200).json({ message: 'Profile fetched successfully', user });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });