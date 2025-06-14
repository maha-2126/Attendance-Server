// const Employee = require("../models/Employee");

// exports.getProfile = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const employee = await Employee.findById(userId).select("-password");

//     if (!employee || employee.deleted) {
//       return res.status(404).json({ message: "Employee not found" });
//     }

//     res.status(200).json(employee);
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };



const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const User = require('../models/User');

// CREATE Employee + User
const createEmployee = async (req, res) => {
  try {
    const { fullName, mailID, mobile, username, password, mobileMacAddress, laptopMacAddress } = req.body;
    const _id = new mongoose.Types.ObjectId();

    // Create User first
    const user = new User({
      _id,
      fullName,   // make sure field names in User schema match
      mailID,     // or email if your User schema uses 'email'
      officeId: username,
      password,
      role: 'employee',
      deleted: false,
    });

    await user.save();

    // Now create Employee with userId referencing the User._id
    const employee = new Employee({
      _id: new mongoose.Types.ObjectId(), // new ObjectId for employee
      userId: user._id,                   // reference to User document
      fullName,
      mailID,
      mobile,
      username,
      password,
      mobileMacAddress,
      laptopMacAddress,
      role: 'employee',
      deleted: false,
    });

    await employee.save();

    res.status(201).json({ message: 'Employee and User created', employee });
  } catch (err) {
    console.error('Error creating employee:', err);
    res.status(500).json({ message: err.message, errors: err.errors });
  }
};

// GET single employee by ID
const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findOne({ _id: req.params.id, deleted: false });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LIST all active employees
const listEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({ deleted: false });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE Employee + User
const updateEmployee = async (req, res) => {
  try {
    const { fullName, mailID, mobile, username, password, mobileMacAddress, laptopMacAddress } = req.body;

    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      { fullName, mailID, mobile, username, password, mobileMacAddress, laptopMacAddress },
      { new: true }
    );

    await User.findByIdAndUpdate(req.params.id, {
      name: fullName,
      email: mailID,
      officeId: username,
      password,
    });

    res.json({ message: 'Employee and User updated', employee: updatedEmployee });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// SOFT DELETE Employee + User
const deleteEmployee = async (req, res) => {
  try {
    await Employee.findByIdAndUpdate(req.params.id, { deleted: true });
    await User.findByIdAndUpdate(req.params.id, { deleted: true });
    res.json({ message: 'Employee soft deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET all soft-deleted employees
const getDeletedEmployees = async (req, res) => {
  try {
    const deletedEmployees = await Employee.find({ deleted: true });
    res.json(deletedEmployees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// RESTORE Employee + User
const restoreEmployee = async (req, res) => {
  try {
    await Employee.findByIdAndUpdate(req.params.id, { deleted: false });
    await User.findByIdAndUpdate(req.params.id, { deleted: false });
    res.json({ message: 'Employee restored' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createEmployee,
  listEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getDeletedEmployees,
  restoreEmployee,
};