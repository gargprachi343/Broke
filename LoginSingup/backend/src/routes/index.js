const express = require('express');
const router = express.Router();
const { protect, verifiedOnly } = require('../middleware/auth');

// Home route
router.get('/', (req, res) => {
  res.json({ message: 'Welcome to the BrokeBro API' });
});

// Protected route example - only verified users can access
router.get('/discounts', protect, verifiedOnly, (req, res) => {
  res.json({ 
    success: true, 
    message: 'Here are all available discounts',
    data: [
      { id: 1, brand: 'Amazon', discount: '10% off for students' },
      { id: 2, brand: 'Nike', discount: '15% off on all products' },
      { id: 3, brand: 'Apple', discount: 'Education pricing on Mac and iPad' }
    ]
  });
});

module.exports = router;