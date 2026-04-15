const mongoose = require('mongoose');

const poemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: false,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    authorName: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    videoPath: {
        type: String, // Path or URL to the uploaded video
    },
    audioPath: {
        type: String, // Path to the uploaded audio file
    },
    authorNote: {
        type: String, // Behind the verse story
    },
    pdfPath: {
        type: String, // Path to the uploaded PDF file
    },
    manuscriptUrl: {
        type: String, // Google Drive / external view-only link for per-poem manuscript
    },
    imagePath: {
        type: String, // Path to the uploaded cover/thumbnail image
    },
    price: {
        type: Number,
        required: true,
        default: 0,
    },
    isFree: {
        type: Boolean,
        default: false,
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    guestLikes: [{
        type: String
    }],
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            // required: false (changed for guest comments)
        },
        username: {
            type: String,
            required: true
        },
        email: {
            type: String, // Guest email
        },
        text: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
}, {
    timestamps: true
});

const Poem = mongoose.model('Poem', poemSchema);
module.exports = Poem;
