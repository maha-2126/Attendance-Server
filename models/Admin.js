// admin.model.js
const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  fullName: String,
  mailID: String,
  mobile: String,
  username: { type: String, required: true, unique: true },
  password: String,
  brandName: String,
  location: String,
  role: { type: String, default: "admin" },
  deleted: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);