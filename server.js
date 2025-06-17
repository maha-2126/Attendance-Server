const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { getConnectedWifiMac, getLocalDeviceMac } = require('./utils/macUtils');
const axios = require('axios');
const authRoutes = require('./routes/APIRouter');
const profileRoutes = require('./routes/Profile');


dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', authRoutes);
app.use('/api', profileRoutes);

app.post('/api/trigger-checkin', async (req, res) => {
  try {
    const wifiMac = getConnectedWifiMac();
    const deviceMac = getLocalDeviceMac();
    const token = req.body.token;

    console.log("👉 wifiMac:", wifiMac);
    console.log("👉 deviceMac:", deviceMac);
    console.log("👉 token:", token);

    const response = await axios.post('http://localhost:5000/api/attendance/checkin', {
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

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const dotenv = require('dotenv');

// const authRoutes = require('./routes/APIRouter');
// const profileRoutes = require('./routes/Profile');


// dotenv.config();

// const app = express();

// // Middleware
// app.use(cors({
//   origin: process.env.CLIENT_URL,
//   credentials: true
// }));

// app.use(express.json());

// // Routes
// app.use('/api', authRoutes);
// app.use('/api', profileRoutes);


// // MongoDB connection
// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// }).then(() => {
//   console.log('MongoDB connected');
// }).catch((err) => {
//   console.error('MongoDB connection error:', err);
//   process.exit(1);
// });

// // Server start
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

