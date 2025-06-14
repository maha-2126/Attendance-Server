const mongoose = require('mongoose');

const superAdminSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  officeId: { type: String, required: true }, // same as in User for linking
  password: { type: String, required: true },  // plain text
  email: { type: String },
  mobile: { type: String },
  role: { type: String, default: 'superadmin' },
  deleted: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('SuperAdmin', superAdminSchema);
