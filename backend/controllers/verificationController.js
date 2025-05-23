const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');
const User = require('../models/userModel');
require('dotenv').config();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads')); // <- fixed here
  },
  filename: (req, file, cb) => {
    cb(null, `${req.body.userId}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

  const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only PDF, PNG, or JPEG files are allowed'));
      }
    },
    limits: { fileSize: 5 * 1024 * 1024 },
  });
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  
  exports.verifyCollege = [
    upload.single('document'),
    async (req, res) => {
      try {
        console.log('Received verification request:', {
          userId: req.body.userId,
          collegeName: req.body.collegeName,
          documentType: req.body.documentType,
          file: req.file ? req.file.filename : null,
        });
  
        const { userId, collegeName, documentType } = req.body;
        const file = req.file;
  
        if (!userId || !collegeName || !documentType || !file) {
          console.log('Missing required fields');
          return res.status(400).json({ message: 'All fields are required' });
        }
  
        const user = await User.findById(userId);
        if (!user) {
          console.log('User not found:', userId);
          return res.status(404).json({ message: 'User not found' });
        }
  
        user.collegeName = collegeName;
        user.document = {
          filePath: file.path,
          fileType: file.mimetype,
          documentType,
        };
        user.verificationStatus = 'pending';
  
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  
        console.log('Saving user data:', { userId, collegeName, verificationStatus: 'pending' });
        await user.save();
  
        console.log('Sending OTP email to:', user.email);
        const mailOptions = {
          from: `"BrokeBro" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: 'BrokeBro College Verification OTP',
          text: `Your OTP for college verification is: ${otp}. It expires in 10 minutes.`,
        };
  
        await transporter.sendMail(mailOptions);
        console.log('OTP email sent successfully');
  
        res.status(200).json({ message: 'Documents submitted successfully. OTP sent to your email.' });
      } catch (error) {
        console.error('Verify college error:', error);
        res.status(500).json({ message: 'Internal server error.' });
      }
    },
  ];
