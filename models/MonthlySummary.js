const mongoose = require("mongoose");

const MonthlySummarySchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  year: Number,
  month: Number,
  present: Number,
  absent: Number,
  halfDay: Number,
  leave: Number,
  permission: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("MonthlySummary", MonthlySummarySchema);
