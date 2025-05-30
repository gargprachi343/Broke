const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Simple college list route
router.get('/', async (req, res) => {
  try {
    // This would normally come from a database
    const colleges = [
      { id: 1, name: 'Delhi University' },
      { id: 2, name: 'IIT Delhi' },
      { id: 3, name: 'Jawaharlal Nehru University' },
      { id: 4, name: 'Mumbai University' },
      { id: 5, name: 'IIT Mumbai' }
    ];
    
    res.status(200).json({
      success: true,
      count: colleges.length,
      data: colleges
    });
  } catch (error) {
    console.error('College list error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Verify college email domain
router.get('/verify-domain/:domain', async (req, res) => {
  try {
    const { domain } = req.params;
    
    // This is a simplified verification - in a real app, 
    // you would check against a database of valid academic domains
    const isValid = domain.endsWith('.edu.in') || 
                   domain.endsWith('.ac.in') ||
                   domain.includes('university') ||
                   domain.includes('college');
    
    res.status(200).json({
      success: true,
      isValid,
      message: isValid ? 
        'This appears to be a valid educational domain.' : 
        'This does not appear to be a recognized educational domain.'
    });
  } catch (error) {
    console.error('Domain verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;