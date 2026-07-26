const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const resetPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('📦 Connected to MongoDB...');

        const adminEmail = 'bwwmas@gmail.com';
        const user = await User.findOne({ email: adminEmail });

        if (user) {
            user.password = '12345678';
            await user.save();
            console.log('✅ Admin password has been successfully reset to: 12345678');
        } else {
            console.log('❌ User not found! Creating new admin...');
            await User.create({
                username: 'Admin',
                email: adminEmail,
                password: '12345678',
                role: 'admin',
            });
            console.log('✅ Admin Created! Password is: 12345678');
        }
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

resetPassword();
