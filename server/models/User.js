const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  email:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, required: true },
  plan:      { type: String, enum: ['free', 'pro'], default: 'free' },
  scansUsed: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

UserSchema.pre('save', async function() {
  if (this.isModified('password'))
    this.password = await bcrypt.hash(this.password, 12);
});

UserSchema.methods.comparePassword = function(plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', UserSchema);