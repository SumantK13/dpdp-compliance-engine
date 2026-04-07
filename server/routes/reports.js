const express = require('express');
const router = express.Router();
const Audit = require('../models/Audit');

// GET /api/reports - list recent audits
const auth = require('../middleware/auth');

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      const jwt = require('jsonwebtoken');
      const User = require('../models/User');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    }
  } catch { }
  next();
};

router.get('/', optionalAuth, async (req, res) => {
  try {
    // If logged in → show only their audits
    // If guest → show nothing (or you can show all if you want)
    const filter = req.user ? { userId: req.user._id } : { userId: null };

    const audits = await Audit.find(filter)
      .sort({ scanDate: -1 })
      .limit(20)
      .select('url domain pageTitle overallScore overallStatus summary scanDate');
    res.json({ success: true, audits });
  } catch {
    res.json({ success: true, audits: [] });
  }
});
// GET /api/reports/:id
router.get('/:id', async (req, res) => {
  try {
    const audit = await Audit.findById(req.params.id);
    if (!audit) return res.status(404).json({ error: 'Audit not found' });
    res.json({ success: true, audit });
  } catch {
    res.status(404).json({ error: 'Audit not found' });
  }
});

// DELETE /api/reports/:id
router.delete('/:id', async (req, res) => {
  try {
    await Audit.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(404).json({ error: 'Audit not found' });
  }
});

module.exports = router;
