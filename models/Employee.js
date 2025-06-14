const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // ✅ Add this line

  fullName: { type: String, required: true },
  mailID: { type: String, required: true },
  mobile: { type: String, required: true },
  role: { type: String, default: "employee" },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  mobileMacAddress: { type: String, lowercase: true, trim: true },
  laptopMacAddress: { type: String, lowercase: true, trim: true },

  deleted: { type: Boolean, default: false },
}, { timestamps: true });

employeeSchema.pre('save', function (next) {
  if (this.mobileMacAddress) {
    this.mobileMacAddress = this.mobileMacAddress.toLowerCase().trim();
  }
  if (this.laptopMacAddress) {
    this.laptopMacAddress = this.laptopMacAddress.toLowerCase().trim();
  }
  next();
});

module.exports = mongoose.model('Employee', employeeSchema);




// const mongoose = require('mongoose');

// const employeeSchema = new mongoose.Schema({
//   fullName: { type: String, required: true },
//   mailID: { type: String, required: true },
//   mobile: { type: String, required: true },
//   role: { type: String, default: 'employee' },
//   username: { type: String, required: true, unique: true },
//   password: { type: String, required: true },

//   mobileMacAddress: { type: String, lowercase: true, trim: true },
//   laptopMacAddress: { type: String, lowercase: true, trim: true },

//   deleted: { type: Boolean, default: false },
// }, { timestamps: true });

// module.exports = mongoose.model('Employee', employeeSchema);