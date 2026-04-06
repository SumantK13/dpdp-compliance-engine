const express = require('express');
const router = express.Router();
const { runAudit } = require('../controllers/auditController');

const auth = require('../middleware/auth');

// auth middleware is optional — works for both logged in and guest
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      const jwt = require('jsonwebtoken');
      const User = require('../models/User');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    }
  } catch { /* no token or invalid — continue as guest */ }
  next();
};

router.post('/', optionalAuth, runAudit);

//router.post('/', runAudit);

module.exports = router;
