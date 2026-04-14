const mongoose = require('mongoose');
require('dotenv').config();

const Poem = require('./models/Poem');
const User = require('./models/User');
const Notification = require('./models/Notification');

async function checkDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/poetry-platform');
        console.log('--- USERS ---');
        const users = await User.find({});
        users.forEach(u => console.log(`- ${u.username} (${u._id})`));

        console.log('\n--- POEMS ---');
        const poems = await Poem.find({});
        poems.forEach(p => console.log(`- ${p.title} by ${p.authorName} (${p._id})`));

        console.log('\n--- NOTIFICATIONS ---');
        const notifications = await Notification.find({});
        notifications.forEach(n => console.log(`- Type: ${n.type}, Poem: ${n.poemTitle}, From: ${n.senderName}`));

        mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

checkDB();
