const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const otpController = require('../controllers/otpController');
const { verifyCollege } = require('../controllers/verificationController'); // Line 5

// Route for user login
router.post('/login', authController.login); // Line 7
router.post('/signup', authController.signup); // Line 8
router.get('/getUser', authController.getUserData); // Line 8
router.post('/verify-otp', otpController.verifyOtp); // Line 9
router.post('/verification', verifyCollege); // Line 10
module.exports = router;