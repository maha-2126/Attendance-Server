// routes/APIRouter.js

const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');

// Controllers
const { loginUser } = require('../controllers/authController');
const { 
  createSuperadmin, createAdmin, listAdmins, updateAdmin, deleteAdmin, getDeletedAdmins, restoreAdmin, createOfficeMacAddress, getOfficeMacAddress,
  updateOfficeMacAddress, 
  getSystemMac, getDeviceMac,
} = require('../controllers/superadminController');

const { 
  createEmployee, listEmployees, getEmployeeById, updateEmployee, deleteEmployee, getDeletedEmployees, restoreEmployee 
} = require('../controllers/employeeController');

const { 
  checkIn,
  checkOut,
  getMyAttendance,
  getSingleEmployeeAttendance,
  getAllAttendance,
  getMonthlySummary,
  saveMonthlySummary,
} = require('../controllers/attendanceContoller');


const { 
  requestLeave, listEmployeeLeaves, getLeaveStatusCounts, listLeaveRequests, approveLeave, rejectLeave 
} = require('../controllers/leaveController');
const { 
  requestPermission, listEmployeePermissions, getPermissionStatusCounts, listPermissionRequests, approvePermission, rejectPermission 
} = require('../controllers/permissionController');
const { 
  listUsers, deleteUser, restoreUser 
} = require('../controllers/userController');

const { getDashboardStats } = require('../controllers/getDashboardStats');

const { triggerCheckIn } = require('../controllers/agentController');

// -------------------- AUTH --------------------
router.post('/auth/login', loginUser); // /api/auth/login

// -------------------- SUPERADMIN ROUTES --------------------
router.post('/create-superadmin', verifyToken(['superadmin']), createSuperadmin);
router.post('/create-admin', verifyToken(['superadmin']), createAdmin);
router.get('/list-admins', verifyToken(['superadmin']), listAdmins);
router.put('/update-admin/:id', verifyToken(['superadmin']), updateAdmin);
router.patch('/delete-admin/:id', verifyToken(['superadmin']), deleteAdmin);
router.get('/deleted-admin', verifyToken(['superadmin']),getDeletedAdmins);
router.patch('/restore-admin/:id', verifyToken(['superadmin']), restoreAdmin);

router.post('/create/office-mac', verifyToken(['superadmin']), createOfficeMacAddress);

// Get MAC
router.get('/get/office-mac', verifyToken(['superadmin', 'employee']), getOfficeMacAddress);

// Update MAC
router.put('/update/office-mac', verifyToken(['superadmin']), updateOfficeMacAddress);

router.get('/system-mac', verifyToken(['superadmin', 'employee']), getSystemMac);

router.get('/device-mac', verifyToken(['superadmin', 'employee']), getDeviceMac); // GET /api/device-mac



// -------------------- EMPLOYEE ROUTES --------------------
// Only Admin can manage employees
router.post('/employee/create', verifyToken(['admin']), createEmployee);
router.get('/employee/list', verifyToken(['admin']), listEmployees);
router.get('/employee/list/:id', verifyToken(['admin']), getEmployeeById);
router.put('/employee/update/:id', verifyToken(['admin']), updateEmployee);
router.delete('/employee/delete/:id', verifyToken(['admin']), deleteEmployee);
router.get('/employee/deleted', verifyToken(['admin']), getDeletedEmployees);
router.put('/employee/restore/:id', verifyToken(['admin']), restoreEmployee);

// -------------------- ATTENDANCE ROUTES --------------------
router.post("/attendance/checkin", verifyToken(['employee']), checkIn);
router.post("/attendance/checkout", verifyToken(['employee']), checkOut);
router.get("/attendance/my-today", verifyToken(['employee']), getMyAttendance);
router.get('/attendance/monthly-summary/:employeeId/:year/:month', verifyToken(['admin','employee']), getMonthlySummary);
router.post('/attendance/monthly/save', verifyToken(['employee', 'admin']), saveMonthlySummary);



// GET
router.get("/single/:employeeId", verifyToken(['admin']), getSingleEmployeeAttendance);
router.get("/all", verifyToken(['admin']), getAllAttendance);



// -------------------- LEAVE ROUTES --------------------
router.post('/leave/request', verifyToken(['employee']), requestLeave);
router.get('/leave/my-requests', verifyToken(['employee']), listEmployeeLeaves);
router.get('/leave/list', verifyToken(['admin']), listLeaveRequests);
router.put('/leave/approve/:id', verifyToken(['admin']), approveLeave);
router.put('/leave/reject/:id', verifyToken(['admin']), rejectLeave);
router.get('/leave/status-counts', verifyToken(['employee']), getLeaveStatusCounts);

// -------------------- PERMISSION ROUTES --------------------
router.post('/permission/request', verifyToken(['employee']), requestPermission);
router.get('/permission/my-requests', verifyToken(['employee']), listEmployeePermissions);
router.get('/permission/list', verifyToken(['admin']), listPermissionRequests);
router.put('/permission/approve/:id', verifyToken(['admin']), approvePermission);
router.put('/permission/reject/:id', verifyToken(['admin']), rejectPermission);
router.get('/permission/status-counts', verifyToken(['employee']), getPermissionStatusCounts);

router.get('/dashboard/stats', verifyToken(['admin', 'superadmin']), getDashboardStats);

// -------------------- USER ROUTES (SUPERADMIN ONLY) --------------------
router.get('/user/list', verifyToken(['superadmin']), listUsers);
router.delete('/user/delete/:id', verifyToken(['superadmin']), deleteUser);
router.put('/user/restore/:id', verifyToken(['superadmin']), restoreUser);

// -------------------- AGENT ROUTE --------------------
router.post('/trigger-checkin', verifyToken(['employee']), triggerCheckIn);


module.exports = router;
