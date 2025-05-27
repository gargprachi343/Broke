const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,

    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
   
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  qrCode: {
    type: String, // Store QR code as a data URL or file path
    required: false,
  },
  verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  collegeName: { type: String },
  document: {
    filePath: { type: String },
    fileType: { type: String },
    documentType: { type: String },
  },
  otp: { type: String },
  otpExpiry: { type: Date },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
