const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Notification = require('../models/Notification');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

const { protect } = require('../middleware/authMiddleware');

// Register User
router.post('/register', async (req, res) => {
    const { username, email, password, role } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const user = await User.create({ username, email, password, role: role || 'user' });
        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Login User
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide an email and password' });
        }

        const user = await User.findOne({ email });
        if (user && (await bcrypt.compare(password, user.password))) {
            // Normal login for everyone (OTP removed as requested)
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login Error:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// @desc    Get All Users (Admin only)
router.get('/users', protect, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized as an admin' });
    }
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Subscribe/Unsubscribe to an author
router.post('/subscribe/:id', protect, async (req, res) => {
    try {
        const author = await User.findById(req.params.id);
        if (!author) return res.status(404).json({ message: 'Author not found' });

        const isSubscribed = author.subscribers.includes(req.user._id);

        if (isSubscribed) {
            author.subscribers = author.subscribers.filter(id => id.toString() !== req.user._id.toString());
        } else {
            author.subscribers.push(req.user._id);

            // Create notification for the author (if not self)
            if (author._id.toString() !== req.user._id.toString()) {
                await Notification.create({
                    recipient: author._id,
                    sender: req.user._id,
                    senderName: req.user.username,
                    type: 'subscribe'
                });
            }
        }

        await author.save();
        res.json({ subscribers: author.subscribers.length, isSubscribed: !isSubscribed });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get User Earnings & Balance
router.get('/earnings', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('earnings balance');
        if (user) {
            res.json({
                earnings: user.earnings || 0,
                balance: user.balance || 0
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get User Profile
router.get('/profile', protect, async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// @desc    Update User Profile
router.put('/profile', protect, async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        user.username = req.body.username || user.username;
        user.email = req.body.email || user.email;
        if (req.body.password) {
            user.password = req.body.password;
        }
        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            role: updatedUser.role,
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// @desc    Forgot Password
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            // Keep it vague for security, but for admin let's be helpful or standard
            return res.status(404).json({ message: 'User not found with this email' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 mins

        await user.save();

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        const message = `
            <div style="font-family: serif; padding: 20px; border: 1px solid #d4aa70; border-radius: 12px; background: #fffcf8;">
                <h2 style="color: #1a0f06; font-family: 'Playfair Display', serif;">Password Reset Request</h2>
                <p>You requested a password reset for your PoetVerse account.</p>
                <p>Please click the button below to reset your password. This link is valid for 10 minutes.</p>
                <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #1a0f06; color: #d4aa70; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">Reset Password</a>
                <p style="color: #a09078; font-size: 0.8rem;">If you did not request this, please ignore this email.</p>
            </div>
        `;

        try {
            await sendEmail({
                to: user.email,
                subject: '🔐 Password Reset Request',
                html: message
            });
            res.json({ message: 'Email sent' });
        } catch (err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            return res.status(500).json({ message: 'Email could not be sent' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Reset Password
router.post('/reset-password/:token', async (req, res) => {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.json({ message: 'Password reset successful. You can now login.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Register Admin (By another admin)
router.post('/register-admin', protect, async (req, res) => {
    // Check if the current user is an admin
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only admins can register other admins' });
    }

    const { username, email, password } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'Email already registered' });

        const adminUser = await User.create({
            username,
            email,
            password,
            role: 'admin'
        });

        res.status(201).json({
            message: 'New administrative account created successfully',
            admin: {
                id: adminUser._id,
                username: adminUser.username,
                email: adminUser.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get User by ID
router.get('/user/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

module.exports = router;
