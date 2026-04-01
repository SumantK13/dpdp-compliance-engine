const express = require('express');
const router = express.Router();
const Audit = require('../models/Audit');

// GET /api/reports - list recent audits
router.get('/', async (req, res) => {
  try {
    const audits = await Audit.find()
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
