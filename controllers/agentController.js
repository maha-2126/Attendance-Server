const axios = require('axios');

const { getConnectedWifiMac, getLocalDeviceMac  } = require('../utils/macUtils');

const API_BASE_URL = process.env.API_BASE_URL || 'https://attendance-server-7.onrender.com/api';

const triggerCheckIn = async (req, res) => {
  try {
      const wifiMac = getConnectedWifiMac();
      const deviceMac = getLocalDeviceMac();
      const token = req.body.token;
  
      console.log("👉 wifiMac:", wifiMac);
      console.log("👉 deviceMac:", deviceMac);
      console.log("👉 token:", token);

      const response = await axios.post(`${API_BASE_URL}/attendance/checkin`, {
        wifiMac,
        deviceMac
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      res.json(response.data);
    } catch (err) {
      console.error("❌ Agent Failed:", err.message);
      if (err.response) {
        console.error("👉 Backend Error:", err.response.status, err.response.data);
      }
      res.status(500).json({ message: err.response?.data?.message || "Agent Error" });
    }
};

module.exports = { triggerCheckIn };

// const axios = require('axios');

// const { getConnectedWifiMac, getLocalDeviceMac , getDeviceIpAddress } = require('../utils/macUtils');

// const API_BASE_URL = process.env.API_BASE_URL || 'https://attendance-server-7.onrender.com/api';

// const triggerCheckIn = async (req, res) => {
//   try {
//     const wifiMac = getConnectedWifiMac();
//     const deviceMac = getLocalDeviceMac();
//     const ipAddress = getDeviceIpAddress();
//     const token = req.body.token;

//     if (!token) {
//       return res.status(400).json({ message: '❌ Token missing' });
//     }

//     console.log("👉 wifiMac:", wifiMac);
//     console.log("👉 deviceMac:", deviceMac);
//     console.log("👉 ipAddress:", ipAddress);
//     console.log("👉 token:", token);

//     const response = await axios.post(`${API_BASE_URL}/attendance/checkin`, {
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
// };

// module.exports = { triggerCheckIn };
