const LeaveRequest = require('../models/LeaveRequest');
const User = require('../models/User');

// ✅ Employee submits leave request
const requestLeave = async (req, res) => {
  try {
    const { userId } = req.user;
    const { fromdate, todate, reason } = req.body;

    if (!fromdate || !reason) {
      return res.status(400).json({ message: 'From date and reason are required' });
    }

    const employee = await User.findById(userId);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const leave = new LeaveRequest({
      employeeId: userId,
      officeId: employee.officeId,
      fromdate: new Date(fromdate),
      todate: todate ? new Date(todate) : null,
      reason,
      status: 'Pending',
    });

    await leave.save();
    return res.status(201).json({ message: 'Leave request submitted successfully' });
  } catch (err) {
    console.error('Leave request failed:', err);
    res.status(500).json({ message: 'Failed to submit leave request', error: err.message });
  }
};

// ✅ Show only current employee’s own leave requests
const listEmployeeLeaves = async (req, res) => {
  try {
    const { userId } = req.user;
    const { month, year } = req.query; // Get month/year from query params

    let filter = { employeeId: userId };

    if (month && year) {
      // Get start and end of the month
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 1); // First day of next month
      filter.fromdate = { $gte: start, $lt: end };
    }

    const leaves = await LeaveRequest.find(filter).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    console.error('Error fetching leave requests:', err);
    res.status(500).json({ error: 'Failed to fetch leave requests' });
  }
};



// ✅ Admin: List only pending leave requests
const listLeaveRequests = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find({ status: 'Pending' })
      .populate('employeeId', 'fullName')
      .sort({ createdAt: -1 });

    const formatted = leaves.map((item) => ({
      _id: item._id,
      fromdate: item.fromdate,
      todate: item.todate,
      reason: item.reason,
      status: item.status,
      fullName: item.employeeId ? item.employeeId.fullName : 'N/A',
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching leave requests:', err);
    res.status(500).json({ error: 'Failed to fetch leave requests' });
  }
};

// ✅ Admin: Approve
const approveLeave = async (req, res) => {
  try {
    const leave = await LeaveRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'Approved' },
      { new: true }
    );

    if (!leave) return res.status(404).json({ message: 'Leave request not found' });
    res.json({ message: 'Leave approved', leave });
  } catch (err) {
    console.error('Error approving leave:', err);
    res.status(500).json({ error: 'Failed to approve leave request' });
  }
};

// ✅ Admin: Reject
const rejectLeave = async (req, res) => {
  try {
    const leave = await LeaveRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'Rejected' },
      { new: true }
    );

    if (!leave) return res.status(404).json({ message: 'Leave request not found' });
    res.json({ message: 'Leave rejected', leave });
  } catch (err) {
    console.error('Error rejecting leave:', err);
    res.status(500).json({ error: 'Failed to reject leave request' });
  }
};

// ✅ Status counts for employee
const getLeaveStatusCounts = async (req, res) => {
  try {
    const { userId } = req.user;

    const [approved, rejected, pending] = await Promise.all([
      LeaveRequest.countDocuments({ employeeId: userId, status: 'Approved' }),
      LeaveRequest.countDocuments({ employeeId: userId, status: 'Rejected' }),
      LeaveRequest.countDocuments({ employeeId: userId, status: 'Pending' }),
    ]);

    res.json({ approved, rejected, pending });
  } catch (err) {
    console.error('Error counting leaves:', err);
    res.status(500).json({ error: 'Failed to get status counts' });
  }
};

module.exports = {
  requestLeave,
  listEmployeeLeaves,
  getLeaveStatusCounts,
  listLeaveRequests,
  approveLeave,
  rejectLeave,
};