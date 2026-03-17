const express = require('express');
const router = express.Router();
const { 
    createDonation, 
    getDonations, 
    getDonorDonations, 
    updateDonationStatus 
} = require('../controllers/donationController');
const { protect } = require('../utils/authMiddleware');

router.post('/', protect, createDonation);
router.get('/', getDonations);
router.get('/my-donations', protect, getDonorDonations);
router.put('/:id/status', protect, updateDonationStatus);

module.exports = router;
