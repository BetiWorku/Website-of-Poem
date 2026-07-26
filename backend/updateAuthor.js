const mongoose = require('mongoose');

const CLOUD_URI = 'mongodb+srv://bwwmas_db_user:PoetryPlatform2026@cluster0.q5cj8y9.mongodb.net/poetry-platform?retryWrites=true&w=majority&appName=Cluster0';

async function updateAuthor() {
    try {
        console.log('Connecting to Cloud database...');
        await mongoose.connect(CLOUD_URI);
        console.log('Connected!\n');

        const PoemSchema = new mongoose.Schema({}, { strict: false });
        const Poem = mongoose.model('Poem', PoemSchema);

        // Show all poems first
        const poems = await Poem.find({});
        console.log('All poems in the cloud:');
        poems.forEach((p, i) => {
            console.log(`  ${i + 1}. "${p.title}" - Author: "${p.authorName}"`);
        });

        // Update Admin -> Habtamu
        const result = await Poem.updateMany(
            { authorName: 'Admin' },
            { $set: { authorName: 'Habtamu' } }
        );

        console.log(`\nDone! Updated ${result.modifiedCount} poems from "Admin" to "Habtamu".`);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

updateAuthor();
