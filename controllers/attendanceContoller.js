const mongoose = require("mongoose");
const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const OfficeConfig = require("../models/OfficeConfig");
const LeaveRequest = require('../models/LeaveRequest');
const PermissionRequest = require("../models/PermissionRequest");
const MonthlySummary = require('../models/MonthlySummary');



const checkIn = async (req, res) => {
  try {
    const { wifiMac, deviceMac } = req.body;

    if (!wifiMac || !deviceMac) {
      return res.status(400).json({ message: "MAC addresses required" });
    }

    const employee = await Employee.findById(req.user.userId);
    const office = await OfficeConfig.findOne();

    if (!employee || !office?.macAddress) {
      return res.status(404).json({ message: "Employee or Office config not found" });
    }

    const normalizeMac = (mac) => mac?.toLowerCase().replace(/-/g, ':').trim();
    const officeMac = normalizeMac(office.macAddress);
    const deviceMacClean = normalizeMac(deviceMac);
    const wifiMacClean = normalizeMac(wifiMac);
    const mobileMac = normalizeMac(employee.mobileMacAddress);
    const laptopMac = normalizeMac(employee.laptopMacAddress);

    if (wifiMacClean !== officeMac) {
      return res.status(403).json({ message: "Not connected to office WiFi" });
    }

    const isFromValidDevice = deviceMacClean === mobileMac || deviceMacClean === laptopMac;
    if (!isFromValidDevice) {
      return res.status(403).json({ message: "Device not registered for you" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const alreadyMarked = await Attendance.findOne({
      employeeId: req.user.userId,
      date: today,
    });

    if (alreadyMarked) {
      return res.status(400).json({ message: "Already checked in today" });
    }

    const now = new Date();
    await Attendance.create({
      employeeId: req.user.userId,
      date: today,
      checkInTime: now,
      status: "Pending",
    });

    return res.status(200).json({
      message: "Check-in successful",
      date: now.toISOString(),
      time: now.toLocaleTimeString("en-IN", {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    });

  } catch (err) {
    console.error("Check-in Error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const checkOut = async (req, res) => {
  try {
    const employeeId = req.user.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const record = await Attendance.findOne({ employeeId, date: today });

    if (!record || !record.checkInTime) {
      return res.status(400).json({ message: "Please check in first" });
    }

    if (record.checkOutTime) {
      return res.status(400).json({ message: "Already checked out" });
    }

    const now = new Date();
    const checkInTime = new Date(record.checkInTime);
    const totalHours = (now - checkInTime) / (1000 * 60 * 60); // in hours
    const checkInHour = checkInTime.getHours();
    const checkInMin = checkInTime.getMinutes();

    let status = "Absent";

    if (
      (checkInHour === 10 || (checkInHour === 11 && checkInMin === 0)) &&
      totalHours >= 6
    ) {
      status = "Present";
    } else if (
      ((checkInHour >= 10 && checkInHour < 13) ||
        (checkInHour >= 13 && checkInHour <= 17)) &&
      totalHours >= 3
    ) {
      status = "Half Day";
    }

    record.checkOutTime = now;
    record.status = status;
    await record.save();

    return res.status(200).json({
      message: `Check-out successful (${status})`,
      time: now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    });
  } catch (error) {
    console.error("Check-out Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getMyAttendance = async (req, res) => {
  try {
    const employeeId = req.user.userId;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const record = await Attendance.findOne({
      employeeId,
      date: today,
    });

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

    const summaryData = await Attendance.aggregate([
      {
        $match: {
          employeeId: new mongoose.Types.ObjectId(employeeId),
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const monthlySummary = {
      Present: 0,
      Absent: 0,
      "Half Day": 0,
      Permission: 0,
      Leave: 0,
      Pending: 0,
    };

    summaryData.forEach(({ _id, count }) => {
      monthlySummary[_id] = count;
    });

    res.status(200).json({
      todayStatus: record ? {
        checkIn: record.checkInTime?.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false }),
        checkOut: record.checkOutTime?.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false }),
        status: record.status,
      } : null,
      monthlySummary,
    });
  } catch (error) {
    console.error("getMyAttendance error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get Single Employee's All Attendance Records
const getSingleEmployeeAttendance = async (req, res) => {
  const { employeeId } = req.params;

  try {
    const records = await Attendance.find({ employeeId }).sort({ date: -1 });
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// ✅ Get All Employees' Attendance Records
const getAllAttendance = async (req, res) => {
  try {
    const records = await Attendance.find()
      .populate("employeeId", "fullName username") // populate employee name and username
      .sort({ date: -1 });

    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// const getMonthlySummary = async (req, res) => {
//   const { employeeId, year, month } = req.params;

//   if (!mongoose.Types.ObjectId.isValid(employeeId)) {
//     return res.status(400).json({ message: "Invalid employeeId" });
//   }

//   const monthPadded = month.padStart(2, '0');
//   const startDate = new Date(`${year}-${monthPadded}-01T00:00:00.000Z`);
//   const endDate = new Date(year, month, 0);
//   endDate.setHours(23, 59, 59, 999);

//   try {
//     const result = {
//       Present: 0,
//       Absent: 0,
//       'Half Day': 0,
//       Leave: 0,
//       Permission: 0,
//       dailyRecords: [],
//     };

//     // 1. Get Attendance Records
//     const attendanceRecords = await Attendance.find({
//       employeeId,
//       date: { $gte: startDate, $lte: endDate },
//     });

//     attendanceRecords.forEach((entry) => {
//       const status = entry.status;
//       const date = entry.date.toISOString().split('T')[0]; // format YYYY-MM-DD

//       if (status === 'Present' || status === 'Absent' || status === 'Half Day') {
//         result[status] += 1;
//         result.dailyRecords.push({ date, status });
//       }
//     });

//     // 2. Get Approved Leaves
//     const leaveRecords = await LeaveRequest.find({
//       employeeId,
//       status: 'Approved',
//       createdAt: { $gte: startDate, $lte: endDate },
//     });

//     leaveRecords.forEach((entry) => {
//       const date = new Date(entry.createdAt).toISOString().split('T')[0];
//       result.Leave += 1;
//       result.dailyRecords.push({ date, status: 'Leave' });
//     });

//     // 3. Get Approved Permissions
//     const permissionRecords = await PermissionRequest.find({
//       employeeId,
//       status: 'Approved',
//       createdAt: { $gte: startDate, $lte: endDate },
//     });

//     permissionRecords.forEach((entry) => {
//       const date = new Date(entry.createdAt).toISOString().split('T')[0];
//       result.Permission += 1;
//       result.dailyRecords.push({ date, status: 'Permission' });
//     });

//     return res.status(200).json(result);
//   } catch (error) {
//     console.error("getMonthlySummary error:", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };


const getMonthlySummary = async (req, res) => {
  const { employeeId, year, month } = req.params;

  if (!mongoose.Types.ObjectId.isValid(employeeId)) {
    return res.status(400).json({ message: "Invalid employeeId" });
  }

  const monthInt = parseInt(month);
  const startDate = new Date(year, monthInt - 1, 1);
  const endDate = new Date(year, monthInt, 0);
  endDate.setHours(23, 59, 59, 999);

  try {
    const result = {
      Present: 0,
      Absent: 0,
      'Half Day': 0,
      Leave: 0,
      Permission: 0,
      dailyRecords: [],
    };

    // Map for fast lookup
    const attendanceMap = {};
    const leaveMap = {};
    const permissionMap = {};

    // Fetch attendance
    const attendanceRecords = await Attendance.find({
      employeeId,
      date: { $gte: startDate, $lte: endDate },
    });

    attendanceRecords.forEach((entry) => {
      const dateStr = entry.date.toISOString().split('T')[0];
      attendanceMap[dateStr] = entry.status;
      result[entry.status] += 1;
    });

    // Fetch approved leaves
    const leaveRecords = await LeaveRequest.find({
      employeeId,
      status: 'Approved',
      createdAt: { $gte: startDate, $lte: endDate },
    });

    leaveRecords.forEach((entry) => {
      const dateStr = new Date(entry.createdAt).toISOString().split('T')[0];
      leaveMap[dateStr] = true;
      result.Leave += 1;
    });

    // Fetch approved permissions
    const permissionRecords = await PermissionRequest.find({
      employeeId,
      status: 'Approved',
      createdAt: { $gte: startDate, $lte: endDate },
    });

    permissionRecords.forEach((entry) => {
      const dateStr = new Date(entry.createdAt).toISOString().split('T')[0];
      permissionMap[dateStr] = true;
      result.Permission += 1;
    });

    // Loop all days in the month up to today
    const today = new Date();
    for (let d = new Date(startDate); d <= endDate && d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];

      if (attendanceMap[dateStr]) {
        result.dailyRecords.push({ date: dateStr, status: attendanceMap[dateStr] });
      } else if (leaveMap[dateStr]) {
        result.dailyRecords.push({ date: dateStr, status: 'Leave' });
      } else if (permissionMap[dateStr]) {
        result.dailyRecords.push({ date: dateStr, status: 'Permission' });
      } else {
        result.Absent += 1;
        result.dailyRecords.push({ date: dateStr, status: 'Absent' });
      }
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("getMonthlySummary error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


const saveMonthlySummary = async (req, res) => {
  const { employeeId, year, month } = req.body;

  if (!mongoose.Types.ObjectId.isValid(employeeId)) {
    return res.status(400).json({ message: "Invalid employeeId" });
  }

  const monthPadded = month.toString().padStart(2, '0');
  const startDate = new Date(`${year}-${monthPadded}-01T00:00:00.000Z`);
  const endDate = new Date(year, month, 0);
  endDate.setHours(23, 59, 59, 999);

  try {
    // 1. Attendance
    const attendanceSummary = await Attendance.aggregate([
      {
        $match: {
          employeeId: new mongoose.Types.ObjectId(employeeId),
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const summary = {
      Present: 0,
      Absent: 0,
      "Half Day": 0,
      Leave: 0,
      Permission: 0,
    };

    attendanceSummary.forEach(item => {
      if (summary.hasOwnProperty(item._id)) {
        summary[item._id] = item.count;
      }
    });

    // 2. Leave and Permission
    const leaveCount = await LeaveRequest.countDocuments({
      employeeId,
      status: "Approved",
      createdAt: { $gte: startDate, $lte: endDate },
    });
    summary.Leave = leaveCount;

    const permissionCount = await PermissionRequest.countDocuments({
      employeeId,
      status: "Approved",
      createdAt: { $gte: startDate, $lte: endDate },
    });
    summary.Permission = permissionCount;

    // 3. Prevent duplicate monthly summary
    const exists = await MonthlySummary.findOne({ employeeId, year, month });
    if (exists) {
      return res.status(400).json({ message: "Monthly summary already exists" });
    }

    const saved = await MonthlySummary.create({
      employeeId,
      year,
      month,
      present: summary.Present,
      absent: summary.Absent,
      halfDay: summary["Half Day"],
      leave: summary.Leave,
      permission: summary.Permission,
    });

    return res.status(200).json({ message: "Monthly summary saved", data: saved });
  } catch (err) {
    console.error("saveMonthlySummary error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = {
  checkIn,
  checkOut,
  getMyAttendance,
  getSingleEmployeeAttendance,
  getAllAttendance,
  getMonthlySummary,
  saveMonthlySummary,
};