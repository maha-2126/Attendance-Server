const User = require('../models/User');
const Admin = require('../models/Admin');
const Employee = require('../models/Employee');
const errorHandlerFunction = (res, err) => res.status(500).json({ msg: err.message });
const listUsers = async (req, res) => {
  const users = await User.find({ deleted: false });
  res.json(users);
};

const deleteUser = async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { deleted: true });
  res.json({ message: 'User deleted' });
};

const restoreUser = async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { deleted: false });
  res.json({ message: 'User restored' });
};


// controllers/userController.js

const getProfile = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.userId || req.user?.user_id;
    const role = req.user?.role;

    if (!userId || !role) {
      return res.status(400).json({ msg: 'User ID or role missing in token' });
    }

    let profileData;

    // Return profile based on role
    if (role === 'superadmin') {
      profileData = await User.findOne({ _id: userId, role: 'superadmin', deleted: false }).select('-password');
    } else if (role === 'admin') {
      profileData = await Admin.findOne({ _id: userId, deleted: false }).select('-password');
    } else if (role === 'employee') {
      profileData = await Employee.findOne({ _id: userId, deleted: false }).select('-password');
    } else {
      return res.status(400).json({ msg: 'Unknown role' });
    }

    if (!profileData) {
      return res.status(404).json({ msg: 'Profile not found' });
    }

    res.status(200).json({
      msg: 'Profile fetched successfully',
      profile: profileData,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};


module.exports = { listUsers, deleteUser, restoreUser, getProfile };