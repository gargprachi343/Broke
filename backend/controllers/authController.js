const bcrypt = require("bcrypt");
const QRCode = require("qrcode");
const User = require("../models/userModel");

const isCollegeOrGmail = (email) =>
  email.endsWith(".edu.in") || email.endsWith(".ac.in") || email.endsWith("@gmail.com");

exports.signup = async (req, res) => {
  try {
    const {
      email,
      confirmEmail,
      password,
      confirmPassword,
      username,
      collegeName
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

    if (!isCollegeOrGmail(email)) {
      return res.status(400).json({
        message: "Email must be from a college domain (.edu.in or .ac.in) or a Gmail account (@gmail.com)",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const qrCodeData = JSON.stringify({ username });
    const qrCodeImage = await QRCode.toDataURL(qrCodeData);

    const newUser = new User({
      email,
      username,
      password: hashedPassword,
      qrCode: qrCodeImage,
      collegeName
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully.",
      userId: newUser._id,
      username: newUser.username,
      collegeName
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    res.status(200).json({
      message: "Login successful",
      userId: user._id,
      username: user.username,
      collegeName: user.collegeName,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.protectDashboard = async (req, res, next) => {
  try {
    const userId = req.headers["user-id"];
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    const user = await User.findById(userId);
    if (!user || user.verificationStatus !== "verified") {
      return res.status(403).json({ message: "College verification required" });
    }

    console.log("User verified:", userId);
    next();
  } catch (error) {
    console.error("Protect dashboard error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.getUserData = async (req, res) => {
  try {
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
