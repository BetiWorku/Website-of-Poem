const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        required: false,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: 'user', // user or admin
    },
    purchasedPoems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Poem'
    }],
    otp: {
        type: String,
    },
    otpExpires: {
        type: Date,
    },
    subscribers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    balance: {
        type: Number,
        default: 0
    },
    earnings: {
        type: Number,
        default: 0
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
module.exports = User;
