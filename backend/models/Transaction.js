const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Optional for guest purchases
    },
    guestName: { type: String },
    guestEmail: { type: String },
    poemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Poem',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'USD'
    },
    paymentMethod: {
        type: String,
        enum: ['stripe', 'paypal', 'Stripe', 'PayPal', 'Telebirr', 'Chapa', 'Cash'], // Include Chapa
        required: true
    },
    paymentId: {
        type: String, // Stripe/PayPal TXN ID
        required: true
    },
    status: {
        type: String,
        default: 'completed'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Transaction', transactionSchema);
