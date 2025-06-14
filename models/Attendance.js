

// const mongoose = require('mongoose');

// const attendanceSchema = new mongoose.Schema({
//   employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
//   date: { type: Date, required: true },
//   status: { type: String, enum: ['Present', 'Absent', 'Half Day'], required: true },
// }, { timestamps: true });

// attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

// module.exports = mongoose.model('Attendance', attendanceSchema);



const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  date: { type: Date, required: true }, 
  checkInTime: { type: Date },
  checkOutTime: { type: Date },
  status: {
    type: String,
    enum: ["Present", "Absent", "Pending", "Half Day", "Permission", "Leave"],
    default: "Absent",
  },
  notes: { type: String }, // for project submit date, remarks, etc.
});

attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true }); // prevent duplicates

module.exports = mongoose.model("Attendance", attendanceSchema);