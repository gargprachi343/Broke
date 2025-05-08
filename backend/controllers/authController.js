const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode'); // Import QR code library

// Signup controller
exports.signup = async (req, res) => {
  try {
    const { email, confirmEmail, password, confirmPassword, username } = req.body;
    console.log('Signup data:', req.body);

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@(?!gmail\.com$)([a-zA-Z0-9.-]+\.(edu\.in|ac\.in))$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Only .edu.in or .ac.in email addresses are allowed.' });
    }

    // Check if email and confirmEmail match
    if (email !== confirmEmail) {
      return res.status(400).json({ message: 'Email addresses do not match.' });
    }

    // Check if password and confirmPassword match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: 'User already exists with this email.' });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ message: 'Username is already taken.' });
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      email,
      password: hashedPassword,
      username,
    });

    // Generate QR code
    const qrCodeData = JSON.stringify({
      userId: newUser._id,
      username: newUser.username,
      
    });
    const qrCode = await QRCode.toDataURL(qrCodeData); // Generate QR code as data URL
    newUser.qrCode = qrCode; // Store QR code in user document

    // Save the user to the database
    await newUser.save();

    res.status(201).json({
      message: 'User registered successfully.',
      qrCode, // Return QR code to client
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Login controller (unchanged)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@(?!gmail\.com$)([a-zA-Z0-9.-]+\.(edu\.in|ac\.in))$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Only .edu.in or .ac.in email addresses are allowed.' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({ message: 'Login successful.', token, qrCode: user.qrCode });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};