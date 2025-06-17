// const express = require('express');
// const cors = require('cors');
// const { getConnectedWifiMac, getLocalDeviceMac } = require('./utils/macUtils');
// const axios = require('axios');
// const ip = require('ip');

// const app = express();
// app.use(cors());
// app.use(express.json());

// const API_BASE_URL = 'https://attendance-server-7.onrender.com';

// app.post('/trigger-checkin', async (req, res) => {
//   try {
//     const wifiMac = getConnectedWifiMac();
//     const deviceMac = getLocalDeviceMac();
//     const ipAddress = ip.address();
//     const token = req.body.token;

//     if (!token) {
//       return res.status(400).json({ message: '❌ Token missing' });
//     }

//     console.log("👉 wifiMac:", wifiMac);
//     console.log("👉 deviceMac:", deviceMac);
//     console.log("👉 ipAddress:", ipAddress);
//     console.log("👉 token:", token);

//     const response = await axios.post(`${API_BASE_URL}/api/attendance/checkin`, {
//       wifiMac,
//       deviceMac,
//       ipAddress
//     }, {
//       headers: { Authorization: `Bearer ${token}` }
//     });

//     res.json(response.data);
//   } catch (err) {
//     console.error("❌ Agent Failed:", err.message);
//     if (err.response) {
//       console.error("👉 Backend Error:", err.response.status, err.response.data);
//     }
//     res.status(500).json({ message: err.response?.data?.message || "Agent Error" });
//   }
// });

// app.listen(3001, () => console.log("✅ MAC Agent running on port 3001"));
