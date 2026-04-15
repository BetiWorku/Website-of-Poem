const mongoose = require('mongoose');
const Poem = require('./models/Poem');
const User = require('./models/User');
require('dotenv').config();

const LOCAL_URI = 'mongodb://127.0.0.1:27017/poetry-platform';
const CLOUD_URI = 'mongodb+srv://bwwmas_db_user:12345678@cluster0.jbmmsqz.mongodb.net/poetry-platform?retryWrites=true&w=majority&appName=Cluster0';

async function migrate() {
    try {
        console.log('📡 Connecting to LOCAL database...');
        const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
        console.log('✅ Local Connected.');

        console.log('📡 Connecting to CLOUD database...');
        const cloudConn = await mongoose.createConnection(CLOUD_URI).asPromise();
        console.log('✅ Cloud Connected.');

        // Define Models for both connections
        const LocalPoem = localConn.model('Poem', Poem.schema);
        const CloudPoem = cloudConn.model('Poem', Poem.schema);
        
        const LocalUser = localConn.model('User', User.schema);
        const CloudUser = cloudConn.model('User', User.schema);

        // 1. Migrate Users (Admin, etc)
        console.log('👤 Migrating Users...');
        const localUsers = await LocalUser.find({});
        for (const user of localUsers) {
            const exists = await CloudUser.findOne({ email: user.email });
            if (!exists) {
                const userObj = user.toObject();
                await CloudUser.create(userObj);
                console.log(`   + Added User: ${user.email}`);
            }
        }

        // 2. Migrate Poems
        console.log('📚 Migrating Poems...');
        const localPoems = await LocalPoem.find({});
        let poemCount = 0;
        for (const poem of localPoems) {
            const exists = await CloudPoem.findOne({ title: poem.title, authorName: poem.authorName });
            if (!exists) {
                const poemObj = poem.toObject();
                await CloudPoem.create(poemObj);
                poemCount++;
                console.log(`   + Added Poem: ${poem.title}`);
            }
        }

        console.log(`\n🎉 DONE! Migrated ${poemCount} new poems to the cloud.`);
        process.exit(0);

    } catch (err) {
        console.error('❌ Migration Failed:', err.message);
        process.exit(1);
    }
}

migrate();
