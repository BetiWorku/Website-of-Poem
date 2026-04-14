const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User'); // Adjust path as needed
const path = require('path');

dotenv.config({ path: './.env' });

async function clearPurchases() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const user = await User.findOne({ username: 'Habtamu' });
        if (user) {
            user.purchasedPoems = [];
            await user.save();
            console.log('Cleared all purchases for user Habtamu. You can now test the paywall again.');
        } else {
            console.log('User Habtamu not found');
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

clearPurchases();
