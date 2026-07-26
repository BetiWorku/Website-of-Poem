const mongoose = require('mongoose');
const User = require('./models/User');

const LOCAL_URI = 'mongodb://127.0.0.1:27017/poetry-platform';
const CLOUD_URI = 'mongodb+srv://bwwmas_db_user:PoetryPlatform2026@cluster0.q5cj8y9.mongodb.net/poetry-platform?retryWrites=true&w=majority&appName=Cluster0';

async function updateUsername() {
    // Update LOCAL
    console.log('📡 Connecting to LOCAL database...');
    const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
    const LocalUser = localConn.model('User', User.schema);
    const localResult = await LocalUser.updateOne(
        { email: 'bwwmas@gmail.com' },
        { $set: { username: 'Habtamu' } }
    );
    console.log(`✅ Local: Updated ${localResult.modifiedCount} user(s) username to "Habtamu".`);

    // Update CLOUD
    console.log('\n📡 Connecting to CLOUD database...');
    const cloudConn = await mongoose.createConnection(CLOUD_URI).asPromise();
    const CloudUser = cloudConn.model('User', User.schema);
    const cloudResult = await CloudUser.updateOne(
        { email: 'bwwmas@gmail.com' },
        { $set: { username: 'Habtamu' } }
    );
    console.log(`✅ Cloud: Updated ${cloudResult.modifiedCount} user(s) username to "Habtamu".`);

    console.log('\n🎉 Done! From now on, all new poems will be saved as "Habtamu".');
    process.exit(0);
}

updateUsername().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
