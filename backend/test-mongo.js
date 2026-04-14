const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const testMongo = async () => {
    try {
        console.log('Connecting to:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB is working!');
        process.exit(0);
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);
        process.exit(1);
    }
};

testMongo();
