const bcrypt = require('bcrypt');
const QRCode = require('qrcode');
const User = require('../models/userModel');

exports.signup = async (req, res) => {
  try {
    const { email, confirmEmail, password, confirmPassword, username } = req.body;

    if (email !== confirmEmail) {
      return res.status(400).json({ message: 'Emails do not match' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    if (!email.endsWith('.edu.in') && !email.endsWith('.ac.in')) {
      return res.status(400).json({ message: 'Email must be from a college domain (.edu.in or .ac.in)' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Email or username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, username, password: hashedPassword });

    const qrCodeData = JSON.stringify({
      userId: newUser._id,
      username: newUser.username,
    });
    newUser.qrCode = await QRCode.toDataURL(qrCodeData);

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully.', userId: newUser._id });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    res.status(200).json({ message: 'Login successful', userId: user._id });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

exports.protectDashboard = async (req, res, next) => {
  try {
    const userId = req.headers['user-id'];
    const user = await User.findById(userId);

    if (!user || user.verificationStatus !== 'verified') {
      return res.status(403).json({ message: 'College verification required' });
    }

    next();
  } catch (error) {
    console.error('Protect dashboard error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};