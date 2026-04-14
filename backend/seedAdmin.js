const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('📦 Connected to MongoDB for seeding...');

        const adminEmail = 'bwwmas@gmail.com'.trim().toLowerCase();
        
        // Remove existing record for a clean start
        await User.deleteOne({ email: adminEmail });
        console.log(`🧹 Cleaned up existing entries for ${adminEmail}`);

        const admin = await User.create({
            username: 'Habtamu',
            email: adminEmail,
            password: '12345678',
            role: 'admin',
        });

        console.log('✅ Admin Created Successfully!');
        console.log('📧 Email: ', adminEmail);
        console.log('🔑 Password: 12345678');
        process.exit();
    } catch (error) {
        console.error('❌ Seeding Error: ', error.message);
        process.exit(1);
    }
};

seedAdmin();
