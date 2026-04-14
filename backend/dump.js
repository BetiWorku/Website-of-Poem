const mongoose = require('mongoose');
const Poem = require('./models/Poem');

const MONGO_URI = "mongodb://127.0.0.1:27017/poetry-platform";

async function dump() {
    try {
        await mongoose.connect(MONGO_URI);
        const all = await Poem.find({});
        console.log(`TOTAL POEMS: ${all.length}`);
        all.forEach(p => {
            console.log(`- Title: ${p.title} | Category: ${p.category} | pdfPath: ${p.pdfPath || 'MISSING'}`);
        });
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

dump();
