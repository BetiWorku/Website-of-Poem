const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { protect, admin } = require('../middleware/authMiddleware');

console.log("💎 [LOADED] Transaction Router Core");

// @desc    Test/Ping route
// @route   GET /api/transactions/ping
router.get('/ping', (req, res) => res.json({ message: 'Transaction route is active' }));

// @desc    Public Ping Test
// @route   GET /api/transactions/ping-public
router.get('/ping-public', (req, res) => res.json({ message: 'Public Transactions Access Available' }));

// @desc    Get CURRENT user transactions (for Earnings Dashboard)
// @route   GET /api/transactions/my
router.get('/my', protect, async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user._id })
            .populate('poemId', 'title authorName price')
            .sort({ createdAt: -1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all transactions
// @route   GET /api/transactions
router.get('/', protect, admin, async (req, res) => {
    console.log(`[TXN] Fetching transactions for user: ${req.user?.username}`);
    try {
        const transactions = await Transaction.find({})
            .populate('userId', 'username email')
            .populate('poemId', 'title authorName price')
            .sort({ createdAt: -1 });

        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
