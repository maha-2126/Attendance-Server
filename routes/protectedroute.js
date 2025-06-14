const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/verifyToken');

router.get('/dashboard', authMiddleware, (req, res) => {
  res.json({ message: 'Access granted', user: req.user });
});

module.exports = router;
