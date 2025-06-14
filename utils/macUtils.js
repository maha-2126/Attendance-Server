const os = require('os');
const { execSync } = require('child_process');

function getConnectedWifiMac() {
  try {
    const output = execSync('netsh wlan show interfaces', { encoding: 'utf-8' });
    const match = output.match(/BSSID\s+:\s+([0-9a-fA-F:-]{17})/);
    return match ? match[1].toLowerCase().trim() : null;
  } catch (error) {
    console.error("❌ Failed to fetch WiFi MAC:", error.message);
    return null;
  }
}

function getLocalDeviceMac() {
  const interfaces = os.networkInterfaces();
  for (const name in interfaces) {
    for (const iface of interfaces[name]) {
      if (!iface.internal && iface.family === 'IPv4') {
        return iface.mac.toLowerCase();
      }
    }
  }
  return null;
}

function getDeviceIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name in interfaces) {
    for (const iface of interfaces[name]) {
      if (!iface.internal && iface.family === 'IPv4') {
        return iface.address;
      }
    }
  }
  return null;
}

// ✅ Add this here
function normalizeMac(mac) {
  return mac?.toLowerCase().replace(/-/g, ':').trim();
}

module.exports = {
  getConnectedWifiMac,
  getLocalDeviceMac,
  getDeviceIpAddress,
  normalizeMac, // ✅ Export this as well
};
