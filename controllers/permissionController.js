const PermissionRequest = require('../models/PermissionRequest');
const User = require('../models/User');
const Employee = require('../models/Employee');

// ✅ Employee submits permission request
const requestPermission = async (req, res) => {
  try {
    const { userId } = req.user; // from JWT
    const { date, timeFrom, timeTo, reason } = req.body;

    if (!date || !timeFrom || !timeTo || !reason) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const employee = await User.findById(userId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const permission = new PermissionRequest({
      employeeId: userId,
      officeId: employee.officeId,
      date: new Date(date),
      timeFrom,
      timeTo,
      reason,
      status: 'Pending',
    });

    await permission.save();
    return res.status(201).json({ message: 'Permission request submitted successfully' });
  } catch (err) {
    console.error('Permission request failed:', err);
    res.status(500).json({ message: 'Failed to submit permission request', error: err.message });
  }
};

// const getPermissionStatusCounts = async (req, res) => {
//   try {
//     const { userId } = req.user;

//     const permissionCounts = await PermissionRequest.aggregate([
//       { $match: { employeeId: userId } },
//       { $group: { _id: "$status", count: { $sum: 1 } } }
//     ]);

//     const counts = { Approved: 0, Pending: 0, Rejected: 0 };
//     let total = 0;

//     permissionCounts.forEach(item => {
//       counts[item._id] = item.count;
//       total += item.count;
//     });

//     res.json({ ...counts, total });
//   } catch (err) {
//     console.error('Error fetching permission status counts:', err);
//     res.status(500).json({ error: 'Failed to fetch permission status counts' });
//   }
// };



// ✅ Show only current employee’s own permission requests
const listEmployeePermissions = async (req, res) => {
  try {
    const { userId } = req.user;
    const { month, year } = req.query; // <-- add this

    let filter = { employeeId: userId };

    if (month && year) {
      // Month is 1-based (1 = Jan)
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 1);
      filter.date = { $gte: start, $lt: end };
    }

    const permissions = await PermissionRequest.find(filter).sort({ createdAt: -1 });
    res.json(permissions);
  } catch (err) {
    console.error('Error fetching permissions:', err);
    res.status(500).json({ error: 'Failed to fetch permissions' });
  }
};



const listPermissionRequests = async (req, res) => {
  try {
    const permissions = await PermissionRequest.find({ status: 'Pending' }) // Only pending requests
      .populate('employeeId', 'fullName')
      .sort({ createdAt: -1 });

    const formatted = permissions.map((item) => ({
      _id: item._id,
      date: item.date,
      timeFrom: item.timeFrom,
      timeTo: item.timeTo,
      reason: item.reason,
      status: item.status,
      fullName: item.employeeId ? item.employeeId.fullName : 'N/A',
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching permission requests:', err);
    res.status(500).json({ error: 'Failed to fetch permission requests' });
  }
};


// ✅ Admin: Approve a permission request
const approvePermission = async (req, res) => {
  try {
    const permission = await PermissionRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'Approved' },
      { new: true }
    );

    if (!permission) {
      return res.status(404).json({ message: 'Permission request not found' });
    }

    res.json({ message: 'Permission approved', permission });
  } catch (err) {
    console.error('Error approving permission:', err);
    res.status(500).json({ error: 'Failed to approve permission request' });
  }
};

// ✅ Admin: Reject a permission request
const rejectPermission = async (req, res) => {
  try {
    const permission = await PermissionRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'Rejected' },
      { new: true }
    );

    if (!permission) {
      return res.status(404).json({ message: 'Permission request not found' });
    }

    res.json({ message: 'Permission rejected', permission });
  } catch (err) {
    console.error('Error rejecting permission:', err);
    res.status(500).json({ error: 'Failed to reject permission request' });
  }
};

const getPermissionStatusCounts = async (req, res) => {
  try {
    const { userId } = req.user;

    const [approved, rejected, pending] = await Promise.all([
      PermissionRequest.countDocuments({ employeeId: userId, status: 'Approved' }),
      PermissionRequest.countDocuments({ employeeId: userId, status: 'Rejected' }),
      PermissionRequest.countDocuments({ employeeId: userId, status: 'Pending' }),
    ]);

    res.json({ approved, rejected, pending });
  } catch (err) {
    console.error('Error counting permissions:', err);
    res.status(500).json({ error: 'Failed to get status counts' });
  }
};

module.exports = {
  requestPermission,
  listEmployeePermissions,
  getPermissionStatusCounts,
  listPermissionRequests,
  approvePermission,
  rejectPermission,
};