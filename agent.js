require('dotenv').config(); // Optional if you're using .env

const express = require('express');
const cors = require('cors');
const { getConnectedWifiMac, getLocalDeviceMac } = require('./utils/macUtils');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

app.post('/trigger-checkin', async (req, res) => {
  try {
    const wifiMac = getConnectedWifiMac();
    const deviceMac = getLocalDeviceMac();
    const token = req.body.token;

    if (!token) {
      return res.status(400).json({ message: '❌ Token missing' });
    }

    console.log("👉 wifiMac:", wifiMac);
    console.log("👉 deviceMac:", deviceMac);
    console.log("👉 token:", token);

    const response = await axios.post(`${API_BASE_URL}/api/attendance/checkin`, {
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
});

app.listen(3001, () => console.log("✅ MAC Agent running on port 3001"));
