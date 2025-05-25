<<<<<<< HEAD
const bcrypt = require('bcrypt');
const QRCode = require('qrcode');
const User = require('../models/userModel');

exports.signup = async (req, res) => {
  try {
    const { email, confirmEmail, password, confirmPassword, username, collegeName } = req.body;

    if (email !== confirmEmail) {
      return res.status(400).json({ message: 'Emails do not match' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    if (!email.endsWith('.edu.in') && !email.endsWith('.ac.in')) {
      return res.status(400).json({ message: 'Email must be from a college domain (.edu.in or .ac.in)' });
=======
const bcrypt = require("bcrypt");
const QRCode = require("qrcode");
const User = require("../models/userModel");

exports.signup = async (req, res) => {
  try {
    const {
      email,
      confirmEmail,
      password,
      confirmPassword,
      username,
      collegeName,
    } = req.body;

    // Basic validations
    if (
      !email ||
      !confirmEmail ||
      !password ||
      !confirmPassword ||
      !username ||
      !collegeName
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (email !== confirmEmail) {
      return res.status(400).json({ message: "Emails do not match" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    if (!email.endsWith(".edu.in") && !email.endsWith(".ac.in")) {
      return res.status(400).json({
        message: "Email must be from a college domain (.edu.in or .ac.in)",
      });
>>>>>>> 0caa20e (Register Page)
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
<<<<<<< HEAD
      return res.status(400).json({ message: 'Email or username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, username, password: hashedPassword, collegeName });
=======
      return res
        .status(400)
        .json({ message: "Email or username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      username,
      password: hashedPassword,
      collegeName,
    });

    await newUser.save();
>>>>>>> 0caa20e (Register Page)

    const qrCodeData = JSON.stringify({
      userId: newUser._id,
      username: newUser.username,
    });
    newUser.qrCode = await QRCode.toDataURL(qrCodeData);
<<<<<<< HEAD

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully.', userId: newUser._id });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error.' });
=======
    await newUser.save();

    res
      .status(201)
      .json({ message: "User registered successfully.", userId: newUser._id });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error." });
>>>>>>> 0caa20e (Register Page)
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
<<<<<<< HEAD
      return res.status(400).json({ message: 'Invalid email or password' });
=======
      return res.status(400).json({ message: "Invalid email or password" });
>>>>>>> 0caa20e (Register Page)
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
<<<<<<< HEAD
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    res.status(200).json({ message: 'Login successful', userId: user._id });
   console.log('User verified:', user._id );
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error.' });
=======
      return res.status(400).json({ message: "Invalid email or password" });
    }

    res.status(200).json({ message: "Login successful", userId: user._id });
    console.log("User verified:", user._id);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error." });
>>>>>>> 0caa20e (Register Page)
  }
};

exports.protectDashboard = async (req, res, next) => {
  try {
<<<<<<< HEAD
    const userId = req.headers['user-id'];
    const user = await User.findById(userId);

    if (!user || user.verificationStatus !== 'verified') {
      return res.status(403).json({ message: 'College verification required' });
    }
   console.log('User verified:', userId);
    next();
  } catch (error) {
    console.error('Protect dashboard error:', error);
    res.status(500).json({ message: 'Internal server error.' });
=======
    const userId = req.headers["user-id"];
    const user = await User.findById(userId);

    if (!user || user.verificationStatus !== "verified") {
      return res.status(403).json({ message: "College verification required" });
    }
    console.log("User verified:", userId);
    next();
  } catch (error) {
    console.error("Protect dashboard error:", error);
    res.status(500).json({ message: "Internal server error." });
>>>>>>> 0caa20e (Register Page)
  }
};
exports.getUserData = async (req, res) => {
  try {
<<<<<<< HEAD
    const userId = req.headers['user-id'];
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const user = await User.findById(userId).select('username collegeName qrCode');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

   
    res.status(200).json({
      username: user.username,
      collegeName: user.collegeName || 'Not specified',
      qrCode: user.qrCode || '',
    });
  } catch (error) {
    console.error('Get user data error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
=======
    const userId = req.headers["user-id"];
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId).select(
      "username collegeName qrCode"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      username: user.username,
      collegeName: user.collegeName || "Not specified",
      qrCode: user.qrCode || "",
    });
  } catch (error) {
    console.error("Get user data error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
>>>>>>> 0caa20e (Register Page)
