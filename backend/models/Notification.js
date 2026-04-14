const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    senderName: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['like', 'comment', 'subscribe', 'contact'],
        required: true
    },
    poem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Poem'
    },
    poemTitle: {
        type: String
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
