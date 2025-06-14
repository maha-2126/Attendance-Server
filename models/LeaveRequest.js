

  const mongoose = require('mongoose');

  const leaveRequestSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    officeId: { type: String, required: true },
    fromdate: { type: Date, required: true },
    todate: { type: Date, required: false },
    reason: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  }, { timestamps: true });

  module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);