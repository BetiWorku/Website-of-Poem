const mongoose = require('mongoose');
const Poem = require('./models/Poem');
require('dotenv').config();

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/poetry-platform');
        const count = await Poem.countDocuments({ pdfPath: { $ne: null, $ne: '' } });
        console.log('--- DB PDF COUNT ---');
        console.log(`Count: ${count}`);
        
        const all = await Poem.find({ pdfPath: { $ne: null, $ne: '' } });
        all.forEach(p => {
            console.log(`Poem: ${p.title} | PDF: ${p.pdfPath}`);
        });
        
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
check();
