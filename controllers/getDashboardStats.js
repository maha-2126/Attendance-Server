const Leave = require('../models/LeaveRequest');   // your leave model
const Employee = require('../models/Employee'); // your employee model
const Attendance = require('../models/Attendance'); // attendance model
const Permission = require('../models/PermissionRequest');

async function getDashboardStats(req, res) {
  try {
    const totalEmployees = await Employee.countDocuments();

    const todayStr = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'

    const presentCount = await Attendance.countDocuments({
      date: todayStr,
      status: 'Present',
    });

    const absentCount = await Attendance.countDocuments({
      date: todayStr,
      status: 'Absent',
    });

    const leaveRequests = await Leave.find({
      status: { $in: ['Pending', 'Approved', 'Rejected'] },
    });
    const pendingLeaves = leaveRequests.filter(
      (l) => l.status.trim().toLowerCase() === 'pending'
    ).length;

    const permissionRequests = await Permission.find({
      status: { $in: ['Pending', 'Approved', 'Rejected'] },
    });
    const pendingPermissions = permissionRequests.filter(
      (p) => p.status.trim().toLowerCase() === 'pending'
    ).length;

    return res.status(200).json({
      totalEmployees,
      presentCount,
      absentCount,
      pendingLeaves,
      pendingPermissions,
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { getDashboardStats };