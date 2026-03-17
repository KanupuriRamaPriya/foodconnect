const Donation = require('../models/Donation');

const createDonation = async (req, res) => {
    const { foodType, quantity, category, expiryTime, pickupLocation } = req.body;

    try {
        const donation = await Donation.create({
            foodType,
            quantity,
            category,
            expiryTime,
            pickupLocation,
            donor: req.user.id
        });
        res.status(201).json(donation);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const getDonations = async (req, res) => {
    try {
        const donations = await Donation.find().populate('donor', 'name email');
        res.json(donations);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const getDonorDonations = async (req, res) => {
    try {
        const donations = await Donation.find({ donor: req.user.id });
        res.json(donations);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const updateDonationStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const donation = await Donation.findById(id);
        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }

        donation.status = status;
        if (status === 'accepted') {
            donation.acceptedBy = req.user.id;
        }

        await donation.save();
        res.json(donation);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = { createDonation, getDonations, getDonorDonations, updateDonationStatus };
