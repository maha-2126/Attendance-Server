const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const User = require('../models/User');
const OfficeConfig = require('../models/OfficeConfig');


// const { execSync } = require('child_process');

// function getConnectedWifiMac() {
//   try {
//     const output = execSync('netsh wlan show interfaces', { encoding: 'utf-8' });
//     const match = output.match(/BSSID\s+:\s+([0-9a-fA-F:-]{17})/);
//     return match ? match[1].toLowerCase().trim() : null;
//   } catch (error) {
//     console.error("❌ Failed to fetch WiFi MAC:", error.message);
//     return null;
//   }
// }

// const os = require('os');

// function getLocalDeviceMac() {
//   const interfaces = os.networkInterfaces();
//   for (const name in interfaces) {
//     for (const iface of interfaces[name]) {
//       if (!iface.internal && iface.family === 'IPv4') {
//         return iface.mac.toLowerCase();
//       }
//     }
//   }
//   return null;
// }


// CREATE Superadmin
const createSuperadmin = async (req, res) => {
  try {
    const { fullName, email, officeId, password } = req.body;

    const existingUser = await User.findOne({ officeId });
    if (existingUser) {
      return res.status(400).json({ message: 'Superadmin with this officeId already exists' });
    }

    const superadmin = new User({
      _id: new mongoose.Types.ObjectId(),
      name: fullName,
      email,
      officeId,
      password, // plain text password
      role: 'superadmin',
      deleted: false,
    });

    await superadmin.save();
    res.status(201).json({
      message: 'Superadmin created successfully',
      superadmin: { officeId, fullName, email },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CREATE Admin + User
const createAdmin = async (req, res) => {
  try {
    const { fullName, mailID, mobile, username, password, brandName, location, validity } = req.body;
    const _id = new mongoose.Types.ObjectId();

    const admin = new Admin({
      _id,
      fullName,
      mailID,
      mobile,
      username,
      password, // plain text password
      brandName,
      location,
      role: 'admin',
      deleted: false,
    });

    const user = new User({
      _id,
      fullName: fullName,
      email: mailID,
      officeId: username,
      password, // plain text password
      role: 'admin',
      deleted: false,
    });

    await admin.save();
    await user.save();

    res.status(201).json({ message: 'Admin and User created successfully', admin });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// LIST all active admins
const listAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({ deleted: false });
    res.json(admins);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch admins', error: err.message });
  }
};

// UPDATE Admin + User
const updateAdmin = async (req, res) => {
  try {
    const { fullName, mailID, mobile, username, password, brandName, location } = req.body;

    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.params.id,
      {
        fullName,
        mailID,
        mobile,
        username,
        password, // plain text password
        brandName,
        location,
      },
      { new: true }
    );

    await User.findByIdAndUpdate(req.params.id, {
      name: fullName,
      email: mailID,
      officeId: username,
      password, // plain text password
    });

    res.json({ message: 'Admin and User updated successfully', admin: updatedAdmin });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// SOFT DELETE Admin + User
const deleteAdmin = async (req, res) => {
  try {
    await Admin.findByIdAndUpdate(req.params.id, { deleted: true });
    await User.findByIdAndUpdate(req.params.id, { deleted: true });
    res.json({ message: 'Admin soft deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// RESTORE Admin + User
const restoreAdmin = async (req, res) => {
  try {
    await Admin.findByIdAndUpdate(req.params.id, { deleted: false });
    await User.findByIdAndUpdate(req.params.id, { deleted: false });
    res.json({ message: 'Admin restored successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LIST Deleted Admins
const getDeletedAdmins = async (req, res) => {
  try {
    const deletedAdmins = await Admin.find({ deleted: true });
    res.json(deletedAdmins);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch deleted admins', error: err.message });
  }
};

const createOfficeMacAddress = async (req, res) => {
  try {
    const { macAddress } = req.body;

    // Check if already exists
    const existing = await OfficeConfig.findOne();
    if (existing) {
      return res.status(400).json({ message: 'MAC address already exists' });
    }

    const newConfig = new OfficeConfig({ macAddress });
    await newConfig.save();

    res.status(201).json({ message: 'MAC address saved successfully', macAddress });
  } catch (err) {
    res.status(500).json({ message: 'Error saving MAC address', error: err.message });
  }
};


const getOfficeMacAddress = async (req, res) => {
  try {
    const config = await OfficeConfig.findOne();
    res.status(200).json(config || {});
  } catch (err) {
    res.status(500).json({ message: 'Error fetching MAC address', error: err.message });
  }
};

// UPDATE Office MAC Address
const updateOfficeMacAddress = async (req, res) => {
  try {
    const { macAddress } = req.body;
    if (!macAddress) {
      return res.status(400).json({ message: 'MAC Address is required' });
    }

    let config = await OfficeConfig.findOne();
    if (config) {
      config.macAddress = macAddress.toLowerCase();
    } else {
      config = new OfficeConfig({ macAddress: macAddress.toLowerCase() });
    }

    await config.save();
    res.status(200).json({ message: 'MAC Address updated', macAddress: config.macAddress });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update MAC address', error: err.message });
  }
};

const getSystemMac = async (req, res) => {
  try {
    const mac = getConnectedWifiMac();
    if (mac) {
      res.status(200).json({ macAddress: mac });
    } else {
      res.status(404).json({ message: "No MAC address found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error getting MAC", error: err.message });
  }
};

const getDeviceMac = (req, res) => {
  const mac = getLocalDeviceMac();
  if (mac) {
    res.status(200).json({ macAddress: mac });
  } else {
    res.status(404).json({ message: "MAC not found" });
  }
};

module.exports = {
  createSuperadmin,
  createAdmin,
  listAdmins,
  updateAdmin,
  deleteAdmin,
  getDeletedAdmins,
  restoreAdmin,
  createOfficeMacAddress,
  getOfficeMacAddress,
  updateOfficeMacAddress,
  getSystemMac,
  getDeviceMac,
};
