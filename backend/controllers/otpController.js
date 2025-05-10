const User = require('../models/userModel');

exports.verifyOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ message: 'User ID and OTP are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.otp !== otp || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Clear OTP and update status
    user.otp = null;
    user.otpExpiry = null;
    user.verificationStatus = 'verified';

    await user.save();

    res.status(200).json({ message: 'OTP verified successfully.', qrCode: user.qrCode });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};