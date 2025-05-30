const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
    trim: true
  },
  collegeName: {
    type: String,
    required: [true, 'Please provide your college name']
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isEducationalEmail: {
    type: Boolean,
    default: false
  },
  collegeIdPath: {
    type: String
  },
  feeReceiptPath: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET || 'brokebrosecret', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

const User = require('../models/User');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Store OTPs temporarily
const otpStore = {};

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    console.log("Registration attempt with body:", req.body);
    const { email, username, collegeName, password } = req.body;
    
    // Validate email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }
    
    // Check if user already exists
    let existingUser = null;
    try {
      existingUser = await User.findOne({ email });
    } catch (err) {
      console.log('User lookup error:', err.message);
    }
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }

    // Check if it's an educational email
    const isEducationalEmail = email.toLowerCase().endsWith('.edu.in');
    
    // Create user object
    const user = new User({
      email,
      username,
      collegeName,
      password,
      isEducationalEmail,
      isVerified: isEducationalEmail // Auto-verify educational emails
    });

    // Save the file paths if files were uploaded
    if (req.files) {
      if (req.files.collegeId) {
        user.collegeIdPath = req.files.collegeId[0].path;
      }
      if (req.files.feeReceipt) {
        user.feeReceiptPath = req.files.feeReceipt[0].path;
      }
    }

    // Save user to database
    await user.save();
    console.log("User registered successfully with ID:", user._id);

    // Create token
    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      isVerified: user.isVerified,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration: ' + error.message
    });
  }
};

// @desc    Login user and generate OTP
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt for email:", email);

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    console.log("User found:", !!user);

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    console.log("Password match result:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Generate OTP
    const otp = generateOTP();
    console.log(`⚠️ TESTING ONLY - OTP for ${email}: ${otp}`);
    
    // Store OTP with user ID
    otpStore[user._id.toString()] = {
      otp,
      expires: Date.now() + 10 * 60 * 1000, // 10 minutes expiration
      verified: false
    };
    
    // Send OTP via email
    const emailSent = await sendOTPEmail(user.email, otp);

    res.status(200).json({
      success: true,
      message: emailSent ? 'OTP sent to your email' : 'OTP generated (check server logs)',
      userId: user._id,
      requiresOTP: true
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    
    // Check if OTP exists and is valid
    if (!otpStore[userId] || otpStore[userId].otp !== otp) {
      return res.status(401).json({
        success: false,
        message: 'Invalid OTP'
      });
    }
    
    // Check if OTP has expired
    if (Date.now() > otpStore[userId].expires) {
      // Delete expired OTP
      delete otpStore[userId];
      
      return res.status(401).json({
        success: false,
        message: 'OTP has expired'
      });
    }
    
    // Mark OTP as verified
    otpStore[userId].verified = true;
    
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Create token
    const token = user.getSignedJwtToken();
    
    // Clean up OTP after successful verification
    delete otpStore[userId];
    
    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      isVerified: user.isVerified,
      token
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during OTP verification'
    });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Generate new OTP
    const otp = generateOTP();
    
    // Update stored OTP
    otpStore[userId] = {
      otp,
      expires: Date.now() + 10 * 60 * 1000, // 10 minutes expiration
      verified: false
    };
    
    // Send OTP via email
    await sendOTPEmail(user.email, otp);
    
    res.status(200).json({
      success: true,
      message: 'New OTP sent to your email',
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while resending OTP'
    });
  }
};

// Helper function to generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper function to send OTP email
async function sendOTPEmail(email, otp) {
  console.log('Environment variables check:', {
    EMAIL_USERNAME: process.env.EMAIL_USERNAME,
    EMAIL_PASSWORD_LENGTH: process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 0
  });

  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: 'Your BrokeBro Login OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4a4a4a;">BrokeBro Account Verification</h2>
        <p>Your one-time password (OTP) for login is:</p>
        <h1 style="font-size: 36px; letter-spacing: 5px; background-color: #f5f5f5; padding: 10px; text-align: center;">${otp}</h1>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you did not request this OTP, please ignore this email.</p>
        <p>Thank you,<br>BrokeBro Team</p>
      </div>
    `
  };
  
  try {
    console.log('Attempting to send OTP email to:', email);
    const info = await transporter.sendMail(mailOptions);
    console.log(`OTP sent successfully to ${email}, messageId:`, info.messageId);
    return true;
  } catch (error) {
    console.error('Email sending FAILED with error:', error);
    return false;
  }
}

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        username: user.username,
        collegeName: user.collegeName,
        isVerified: user.isVerified,
        isEducationalEmail: user.isEducationalEmail
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Export all controller methods
module.exports = {
  register,
  login,
  verifyOTP,
  resendOTP,
  getMe
};