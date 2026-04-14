const mongoose = require('mongoose');
const Poem = require('./models/Poem');

const MONGO_URI = "mongodb://127.0.0.1:27017/poem-platform";

async function testQuery() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const books = await Poem.find({
            pdfPath: { $exists: true, $ne: null, $ne: '' }
        });

        console.log(`Found ${books.length} documents with pdfPath`);
        books.forEach(b => console.log(`- ${b.title} (Category: ${b.category})`));

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

testQuery();
