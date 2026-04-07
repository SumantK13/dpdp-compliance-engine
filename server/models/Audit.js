const mongoose = require('mongoose');

const CheckResultSchema = new mongoose.Schema({
  law: String,
  section: String,
  status: { type: String, enum: ['pass', 'fail', 'warn', 'na'] },
  score: Number,
  details: String,
  evidence: [String],
  recommendation: String
});

const AuditSchema = new mongoose.Schema({
  url: { type: String, required: true },
  domain: String,
  scanDate: { type: Date, default: Date.now },
  overallScore: Number,
  overallStatus: { type: String, enum: ['compliant', 'partial', 'non-compliant'] },
  pageTitle: String,
  checks: [CheckResultSchema],
  summary: {
    passed: Number,
    failed: Number,
    warnings: Number,
    notApplicable: Number
  },
  userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  default: null
},
  rawFindings: mongoose.Schema.Types.Mixed
}, { timestamps: true });

module.exports = mongoose.model('Audit', AuditSchema);
