const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/poetry-platform')
  .then(async () => {
    const User = mongoose.model('User', new mongoose.Schema({ email: String, role: String }));
    const result = await User.updateOne({ role: 'admin' }, { $set: { email: 'bwwmas@gmail.com' } });
    console.log('Update result:', result);
    process.exit(0);
  })
  .catch(err => {
    console.error('Update failed:', err);
    process.exit(1);
  });
