const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  officeId: { type: String, unique: true, required: true },
  password: { type: String, required: true }, // plain text password
  role: { type: String, enum: ['superadmin', 'admin', 'employee'], required: true },
  deleted: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);