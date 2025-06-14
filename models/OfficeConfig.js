const mongoose = require("mongoose");

const officeConfigSchema = new mongoose.Schema({
  macAddress: { type: String, required: true },
});

module.exports = mongoose.model("OfficeConfig", officeConfigSchema);