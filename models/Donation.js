const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
    foodType: {
        type: String,
        required: true
    },
    quantity: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['veg', 'non-veg'],
        default: 'veg'
    },
    expiryTime: {
        type: String,
        required: true
    },
    pickupLocation: {
        type: String,
        required: true
    },
    donor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'completed'],
        default: 'pending'
    },
    acceptedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

module.exports = mongoose.model('Donation', donationSchema);
