const mongoose = require('mongoose');
require('dotenv').config();
const Poem = require('./models/Poem');

async function cleanGuests() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB...');

        const poems = await Poem.find({});
        let removed = 0;

        for (let poem of poems) {
            const beforeLength = poem.comments.length;
            // Remove where username is exactly 'A Guest'
            poem.comments = poem.comments.filter(c => c.username !== 'A Guest');
            if (poem.comments.length !== beforeLength) {
                removed += (beforeLength - poem.comments.length);
                await poem.save();
            }
        }

        console.log(`Successfully removed ${removed} 'A Guest' comments from all items.`);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

cleanGuests();
