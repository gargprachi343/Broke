const User = require("../models/userModel");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransporter({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'brokebrooindia@gmail.com',
    pass: 'your_app_password_here'
  }
});

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTPEmail = async (email, otp, username) => {
  const mailOptions = {
    from: "brokebrooindia@gmail.com",
    to: email,
    subject: "BrokeBro - Verify Your Email Address",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1f2937; color: #ffffff; border-radius: 10px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #e4a00e, #f59e0b); padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 32px; font-weight: bold; color: #000000;">BrokeBro</h1>
          <p style="margin: 10px 0 0 0; color: #000000; opacity: 0.8;">Student Discounts Platform</p>
        </div>
        
        <div style="padding: 40px 30px;">
          <h2 style="color: #e4a00e; font-size: 24px; margin-bottom: 20px;">Welcome ${username}!</h2>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px; color: #d1d5db;">
            Thank you for registering with BrokeBro! Please verify your email address to complete your registration and start accessing exclusive student discounts.
          </p>
          
          <div style="background-color: #374151; padding: 30px; border-radius: 10px; text-align: center; margin: 30px 0;">
            <p style="margin: 0 0 15px 0; color: #9ca3af; font-size: 14px;">Your verification code is:</p>
            <div style="font-size: 36px; font-weight: bold; color: #e4a00e; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${otp}
            </div>
            <p style="margin: 15px 0 0 0; color: #9ca3af; font-size: 12px;">This code expires in 10 minutes</p>
          </div>
          
          <div style="background-color: #065f46; border: 1px solid #059669; border-radius: 8px; padding: 20px; margin: 30px 0;">
            <h3 style="color: #10b981; margin: 0 0 10px 0; font-size: 16px;">🎓 What's Next?</h3>
            <ul style="color: #d1fae5; margin: 0; padding-left: 20px; line-height: 1.6;">
              <li>Enter the verification code on our website</li>
              <li>Complete your profile setup</li>
              <li>Start browsing thousands of student discounts</li>
              <li>Save money on your favorite brands!</li>
            </ul>
          </div>
          
          <p style="font-size: 14px; color: #9ca3af; margin-top: 30px;">
            If you didn't request this verification, please ignore this email or contact our support team.
          </p>
        </div>
        
        <div style="background-color: #111827; padding: 20px; text-align: center; border-top: 1px solid #374151;">
          <p style="margin: 0; font-size: 12px; color: #6b7280;">
            © 2024 BrokeBro. All rights reserved.<br>
            <a href="#" style="color: #e4a00e; text-decoration: none;">Unsubscribe</a> | 
            <a href="#" style="color: #e4a00e; text-decoration: none;">Privacy Policy</a>
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Send OTP for registration
exports.sendRegistrationOtp = async (req, res) => {
  try {
    const { email, username } = req.body;

    if (!email || !username) {
      return res.status(400).json({
        success: false,
        message: "Email and username are required",
      });
    }

    // Check if email is educational
    if (!email.includes(".edu")) {
      return res.status(400).json({
        success: false,
        message:
          "Only educational email addresses are allowed for OTP verification",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.verificationStatus === "verified") {
      return res.status(400).json({
        success: false,
        message: "Email already registered and verified",
      });
    }

    // Generate OTP and expiry time (10 minutes)
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create or update user with OTP
    let user;
    if (existingUser) {
      // Update existing unverified user
      user = existingUser;
      user.otp = otp;
      user.otpExpiry = otpExpiry;
      user.username = username; // Update username if changed
    } else {
      // Create new user
      user = new User({
        email,
        username,
        otp,
        otpExpiry,
        verificationStatus: "pending_otp",
        accountType: "edu_verified",
      });
    }

    await user.save();

    // Send OTP email
    await sendOTPEmail(email, otp, username);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully to your email address",
      userId: user._id,
      expiresIn: 10, // minutes
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP. Please try again later.",
    });
  }
};

// Verify OTP and complete registration
exports.verifyRegistrationOtp = async (req, res) => {
  try {
    const { userId, otp, password } = req.body;

    if (!userId || !otp || !password) {
      return res.status(400).json({
        success: false,
        message: "User ID, OTP, and password are required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if already verified
    if (user.verificationStatus === "verified") {
      return res.status(400).json({
        success: false,
        message: "Account already verified",
      });
    }

    // Verify OTP
    if (user.otp !== otp || user.otpExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP. Please request a new one.",
      });
    }

    // Hash password (assuming you have a method for this)
    const bcrypt = require("bcrypt");
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user - complete registration
    user.password = hashedPassword;
    user.otp = null;
    user.otpExpiry = null;
    user.verificationStatus = "verified";
    user.registrationCompletedAt = new Date();

    // Generate QR code for user (if you have this functionality)
    // user.qrCode = await generateUserQRCode(user._id);

    await user.save();

    // Remove sensitive data from response
    const userResponse = {
      id: user._id,
      email: user.email,
      username: user.username,
      verificationStatus: user.verificationStatus,
      accountType: user.accountType,
      registrationCompletedAt: user.registrationCompletedAt,
    };

    res.status(200).json({
      success: true,
      message: "Email verified and registration completed successfully!",
      user: userResponse,
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during verification.",
    });
  }
};

// Resend OTP
exports.resendOtp = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.verificationStatus === "verified") {
      return res.status(400).json({
        success: false,
        message: "Account already verified",
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send new OTP email
    await sendOTPEmail(user.email, otp, user.username);

    res.status(200).json({
      success: true,
      message: "New OTP sent successfully",
      expiresIn: 10, // minutes
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to resend OTP. Please try again later.",
    });
  }
};

// Original verify OTP method (keeping for backward compatibility)
exports.verifyOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ message: "User ID and OTP are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.otp !== otp || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Clear OTP and update status
    user.otp = null;
    user.otpExpiry = null;
    user.verificationStatus = "verified";

    await user.save();

    res.status(200).json({
      message: "OTP verified successfully.",
      qrCode: user.qrCode,
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
