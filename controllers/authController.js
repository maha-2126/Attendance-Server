// const User = require('../models/User');

// // Create initial Superadmin (only one)
// const createSuperadmin = async (req, res) => {
//   try {
//     const { officeId, password, name } = req.body;

//     // Check if superadmin already exists
//     const existing = await User.findOne({ role: 'superadmin' });
//     if (existing) return res.status(400).json({ message: 'Superadmin already exists' });

//     const superadmin = new User({ officeId, password, role: 'superadmin', name });
//     await superadmin.save();

//     res.status(201).json({ message: 'Superadmin created successfully' });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Login user with officeId, password, and role
// // controllers/authController.js

// const loginUser = async (req, res) => {
//   try {
//     const { officeId, password, role } = req.body;

//     // Find user by officeId, role, and isDeleted = false
//     const user = await User.findOne({ officeId, role, isDeleted: false });

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Check password match (if using bcrypt, use bcrypt.compare here)
//     if (user.password !== password) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     // Successful login response
//     return res.status(200).json({
//       message: 'Login successful',
//       user: {
//         _id: user._id,
//         name: user.name,
//         role: user.role,
//         officeId: user.officeId,
//         email: user.email,
//       }
//     });

//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// };


// module.exports = { createSuperadmin, loginUser };



// routes/auth.js or controllers/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const loginUser = async (req, res) => {
  try {
    const { officeId, password, role } = req.body;

    const user = await User.findOne({ officeId, role, deleted: false });
    console.log("Found User:", user);

    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // ✅ Include fullName in the JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        officeId: user.officeId,
        role: user.role,
        fullName: user.fullName, // <- add this
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );


    // ✅ Send fullName in response too (optional for frontend use)
    res.status(200).json({
      message: 'Login successful',
      token,
      role: user.role,
      officeId: user.officeId,
      fullName: user.fullName, // <- add this
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

module.exports = { loginUser };