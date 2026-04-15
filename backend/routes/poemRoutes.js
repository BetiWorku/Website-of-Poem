const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, admin } = require('../middleware/authMiddleware');
const Poem = require('../models/Poem');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Configure Multer for Video Uploads
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 1024 * 1024 * 1024 }, // 1GB limit for high-quality video
    fileFilter(req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase();
        const mime = file.mimetype.toLowerCase();

        const isImage = /jpg|jpeg|png|webp|gif/.test(ext) || mime.startsWith('image/');
        const isPdf = ext === '.pdf' || mime === 'application/pdf';
        const isVideo = mime.startsWith('video/') || /mp4|mov|avi|wmv|m4v/.test(ext);
        const isAudio = mime.startsWith('audio/') || /mp3|wav|m4a|aac|ogg/.test(ext);

        if (isImage || isPdf || isVideo || isAudio) {
            cb(null, true);
        } else {
            cb(new Error(`File type ${ext} (${mime}) is not allowed!`));
        }
    },
});

// @desc    Add a new poem
router.post('/', protect, upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'audio', maxCount: 1 },
    { name: 'pdf', maxCount: 1 },
    { name: 'image', maxCount: 1 }
]), async (req, res) => {
    const { title, content, category, price, isFree, authorNote } = req.body;
    try {
        const videoPath = req.files && req.files['video'] ? req.files['video'][0].path.replace(/\\/g, '/') : '';
        const audioPath = req.files && req.files['audio'] ? req.files['audio'][0].path.replace(/\\/g, '/') : '';
        const pdfPath = req.files && req.files['pdf'] ? req.files['pdf'][0].path.replace(/\\/g, '/') : '';
        const imagePath = req.files && req.files['image'] ? req.files['image'][0].path.replace(/\\/g, '/') : '';
        const { manuscriptUrl } = req.body;

        const poem = await Poem.create({
            title,
            content,
            authorNote,
            author: req.user._id,
            authorName: req.user.username,
            category,
            price: price || 0,
            isFree: isFree === 'true' || isFree === true,
            videoPath,
            audioPath,
            pdfPath,
            imagePath,
            manuscriptUrl: manuscriptUrl || ''
        });

        // Email Notification for Subscribers (Async)
        try {
            const sendEmail = require('../utils/sendEmail');
            // Find users who have subscribed to this author
            const fans = await User.find({ subscribers: req.user._id });
            const subscriberEmails = fans.map(f => f.email);

            if (subscriberEmails.length > 0) {
                await sendEmail({
                    to: subscriberEmails,
                    subject: `✨ New Masterpiece from ${req.user.username}`,
                    html: `
                        <div style="font-family: 'serif'; padding: 20px; color: #1a1a1a;">
                            <h2 style="color: #92400e;">New Poem Published!</h2>
                            <p>${req.user.username} just shared a new verse: <strong style="font-size: 1.2em;">${title}</strong></p>
                            <p style="font-style: italic; color: #71717a; margin: 20px 0;">"${content.substring(0, 100)}..."</p>
                            <a href="${process.env.FRONTEND_URL}/poems/${poem._id}" style="display: inline-block; padding: 12px 24px; background: #92400e; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Read the Verse</a>
                            <p style="margin-top: 30px; font-size: 0.8em; color: #a1a1aa;">You're receiving this because you follow ${req.user.username} on PoetVerse.</p>
                        </div>
                    `
                });
            }
        } catch (mailError) {
            console.error('Mail notification failed:', mailError.message);
        }

        res.status(201).json(poem);
    } catch (error) {
        console.error('💥 Poem Creation Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all poems for admin dashboard
router.get('/admin/all', protect, async (req, res) => {
    try {
        const poems = await Poem.find().sort({ createdAt: -1 });
        res.json(poems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all poems with sorting and category filtering
router.get('/', async (req, res) => {
    try {
        const { sort, category } = req.query;
        let query = {};
        if (category) console.log(`🔍 [DEBUG] Querying Category: ${category}`);

        if (category && category !== 'All') {
            if (category.toLowerCase() === 'books') {
                query = {
                    $or: [
                        { pdfPath: { $exists: true, $ne: null, $ne: "" } },
                        { category: "Books" }
                    ]
                };
            } else {
                query.category = new RegExp(`^${category}$`, 'i');
            }
        }

        console.log(`🔍 [DEBUG] Generated MongoDB Query: ${JSON.stringify(query)}`);

        let poemsQuery = Poem.find(query);

        if (sort === 'trending') {
            // Advanced Trending: (Likes + Comments * 2)
            // We fetch all and sort by a calculated score
            const allPoems = await Poem.find(query);
            const now = new Date();
            const sorted = allPoems.sort((a, b) => {
                const aLikes = (a.likes?.length || 0) + (a.guestLikes?.length || 0);
                const aComments = a.comments?.length || 0;
                const bLikes = (b.likes?.length || 0) + (b.guestLikes?.length || 0);
                const bComments = b.comments?.length || 0;

                // Simple score: (Likes * 1) + (Comments * 2)
                // We add a tiny boost for "newness" (within last 48h)
                const aIsNew = (now - new Date(a.createdAt)) < (48 * 60 * 60 * 1000) ? 5 : 0;
                const bIsNew = (now - new Date(b.createdAt)) < (48 * 60 * 60 * 1000) ? 5 : 0;

                const aScore = aLikes + (aComments * 2) + aIsNew;
                const bScore = bLikes + (bComments * 2) + bIsNew;

                return bScore - aScore;
            });
            return res.json(sorted.slice(0, 50));
        } else if (sort === 'most-liked') {
            // Memory intensive for large sets, but fine for now
            const allPoems = await Poem.find(query);
            const sorted = allPoems.sort((a, b) =>
                (b.likes.length + b.guestLikes.length) - (a.likes.length + a.guestLikes.length)
            );
            return res.json(sorted.slice(0, 50));
        } else {
            // Latest (Default)
            poemsQuery = poemsQuery.sort({ createdAt: -1 });
        }

        const poems = await poemsQuery.select('title content author authorName category price isFree likes guestLikes comments createdAt pdfPath imagePath videoPath');
        console.log(`✅ [FOUND] ${poems.length} items for client.`);
        res.json(poems);
    } catch (error) {
        console.error("Error in GET /api/poems:", error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get current user's library
router.get('/library/my-poems', protect, async (req, res) => {
    try {
        const liked = await Poem.find({ likes: req.user._id });
        const user = await User.findById(req.user._id).populate('purchasedPoems');
        const purchased = user.purchasedPoems || [];
        res.json({ liked, purchased });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get admin analytics
router.get('/admin/analytics', protect, admin, async (req, res) => {
    try {
        const poems = await Poem.find();
        const totalPoemsCount = poems.length;
        const totalLikes = poems.reduce((acc, p) => acc + (p.likes?.length || 0) + (p.guestLikes?.length || 0), 0);
        const totalComments = poems.reduce((acc, p) => acc + (p.comments?.length || 0), 0);

        const users = await User.find({ role: 'user' }).populate('purchasedPoems');
        let estimatedRevenue = 0;
        users.forEach(u => {
            (u.purchasedPoems || []).forEach(p => {
                if (p && p.price) estimatedRevenue += p.price;
            });
        });

        const topPoems = [...poems].sort((a, b) =>
            ((b.likes?.length || 0) + (b.guestLikes?.length || 0)) - ((a.likes?.length || 0) + (a.guestLikes?.length || 0))
        ).slice(0, 5);

        res.json({
            stats: {
                totalPoems: poems.length,
                totalLikes,
                totalComments,
                estimatedRevenue: estimatedRevenue.toFixed(2),
            },
            recentPoems: poems.slice(0, 10).map(p => ({
                id: p._id,
                title: p.title,
                category: p.category,
                price: p.price,
                isFree: p.isFree,
                likes: (p.likes?.length || 0) + (p.guestLikes?.length || 0),
                comments: p.comments.length
            }))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get single poem
router.get('/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid ID format.' });
        }
        
        const poem = await Poem.findById(req.params.id);
        if (!poem) return res.status(404).json({ message: 'Poem not found.' });

        let isPurchased = false;
        let paymentMethod = null;
        let transactionId = null;

        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer')) {
            try {
                const token = authHeader.split(' ')[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded.id);
                
                if (user && user.purchasedPoems) {
                    isPurchased = user.purchasedPoems.some(p => p && p.toString() === poem._id.toString());
                    
                    if (isPurchased) {
                        const txn = await Transaction.findOne({ poemId: poem._id, userId: user._id }).sort({ createdAt: -1 });
                        if (txn) {
                            paymentMethod = txn.paymentMethod;
                            transactionId = txn.paymentId;
                        }
                    }
                }
            } catch (err) {
                console.warn("Soft-auth failed in GET poem:", err.message);
            }
        }

        const data = {
            ...poem.toObject(),
            isPurchased,
            paymentMethod,
            transactionId,
            isFree: (poem.price || 0) === 0
        };

        res.json(data);
    } catch (error) {
        console.error("💥 Poem Fetch Error:", error);
        res.status(500).json({ message: 'Server error loading verse data.' });
    }
});

// @desc    Update a poem (Admin only)
router.put('/:id', protect, admin, upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'audio', maxCount: 1 },
    { name: 'pdf', maxCount: 1 },
    { name: 'image', maxCount: 1 }
]), async (req, res) => {
    try {
        const poem = await Poem.findById(req.params.id);
        if (!poem) return res.status(404).json({ message: 'Poem not found.' });

        // Update fields if they exist in req.body
        const b = req.body;
        if (b.title) poem.title = b.title;
        if (b.content) poem.content = b.content;
        if (b.category) poem.category = b.category;
        if (b.authorNote !== undefined) poem.authorNote = b.authorNote;
        if (b.price !== undefined) poem.price = parseFloat(b.price) || 0;
        if (b.isFree !== undefined) poem.isFree = b.isFree === 'true' || b.isFree === true;

        if (req.files) {
            if (req.files['video']) poem.videoPath = req.files['video'][0].path.replace(/\\/g, '/');
            if (req.files['audio']) poem.audioPath = req.files['audio'][0].path.replace(/\\/g, '/');
            if (req.files['pdf']) poem.pdfPath = req.files['pdf'][0].path.replace(/\\/g, '/');
            if (req.files['image']) poem.imagePath = req.files['image'][0].path.replace(/\\/g, '/');
        }
        if (req.body.manuscriptUrl !== undefined) poem.manuscriptUrl = req.body.manuscriptUrl;

        const updatedPoem = await poem.save();
        res.json(updatedPoem);
    } catch (error) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'Video file too large! Limit 1GB.' });
        }
        console.error('💥 Poem Update Failed:', error);
        res.status(500).json({ message: 'Error saving changes.', error: error.message });
    }
});

// @desc    Delete a poem (Admin only)
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const poem = await Poem.findById(req.params.id);
        if (!poem) return res.status(404).json({ message: 'Poem not found' });
        await poem.deleteOne();
        res.json({ message: 'Poem removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Like/Unlike a poem
router.post('/:id/like', async (req, res) => {
    try {
        const poem = await Poem.findById(req.params.id);
        if (!poem) return res.status(404).json({ message: 'Poem not found' });

        const authHeader = req.headers.authorization;
        let userId = null;
        let username = 'A Guest';
        let isGuest = false;

        if (authHeader && authHeader.startsWith('Bearer')) {
            const token = authHeader.split(' ')[1];
            const jwt = require('jsonwebtoken');
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded.id);
                if (user) {
                    userId = user._id;
                    username = user.username;
                }
            } catch (e) { }
        }

        if (!userId) {
            // Guest mode – use the guestId sent from frontend
            userId = req.body.guestId || `guest_${Date.now()}`;
            isGuest = true;
        }

        let isLiked = false;
        if (isGuest || (typeof userId === 'string' && userId.startsWith('guest_'))) {
            isLiked = poem.guestLikes.includes(userId);
            if (isLiked) {
                poem.guestLikes = poem.guestLikes.filter(id => id !== userId);
            } else {
                poem.guestLikes.push(userId);
                await Notification.create({ recipient: poem.author, senderName: 'A Guest', type: 'like', poem: poem._id, poemTitle: poem.title });
            }
        } else if (userId && userId !== 'guest') {
            isLiked = poem.likes.includes(userId);
            if (isLiked) {
                poem.likes = poem.likes.filter(id => id.toString() !== userId.toString());
            } else {
                poem.likes.push(userId);

                // Send Email Notification to Author
                try {
                    const author = await User.findById(poem.author);
                    if (author && author.email && author._id.toString() !== (userId?.toString() || '')) {
                        const sendEmail = require('../utils/sendEmail');
                        await sendEmail({
                            to: author.email,
                            subject: `❤️ Your poem was appreciated!`,
                            html: `
                        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                            <h3 style="color: #92400e;">Good news, ${author.username}!</h3>
                            <p><strong>${username}</strong> just liked your poem <strong>"${poem.title}"</strong>.</p>
                            <p>Keep writing, your words are making an impact!</p>
                            <a href="${process.env.FRONTEND_URL}/poems/${poem._id}" style="color: #92400e; font-weight: bold;">View your poem</a>
                        </div>
                    `
                        });
                    }
                } catch (err) {
                    console.error('Like email failed:', err);
                }
            }
        }

        await poem.save();
        const totalCount = (poem.likes?.length || 0) + (poem.guestLikes?.length || 0);
        res.json({ likes: totalCount, isLiked: !isLiked });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Comment on a poem
router.post('/:id/comment', async (req, res) => {
    const { text, username: guestName, email: guestEmail } = req.body;
    try {
        const poem = await Poem.findById(req.params.id);
        if (!poem) return res.status(404).json({ message: 'Poem not found' });

        let userId = null;
        let username = guestName || 'A Guest';
        let email = guestEmail || '';

        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer')) {
            const token = authHeader.split(' ')[1];
            const jwt = require('jsonwebtoken');
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded.id);
                if (user) { 
                    userId = user._id; 
                    if (!guestName) username = user.username; 
                    if (!guestEmail) email = user.email; 
                }
            } catch (e) { }
        }

        const newComment = { user: userId, username, email, text, createdAt: new Date() };
        poem.comments.push(newComment);
        await poem.save();

        if (!userId || poem.author.toString() !== userId.toString()) {
            await Notification.create({
                recipient: poem.author,
                sender: userId,
                senderName: username,
                type: 'comment',
                poem: poem._id,
                poemTitle: poem.title
            });

            // Send Email Notification to Author
            try {
                const author = await User.findById(poem.author);
                if (author && author.email) {
                    const sendEmail = require('../utils/sendEmail');
                    await sendEmail({
                        to: author.email,
                        subject: `💬 New reflection on your work`,
                        html: `
                            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                                <h3 style="color: #92400e;">New Comment!</h3>
                                <p><strong>${username}</strong> left a reflection on your poem <strong>"${poem.title}"</strong>:</p>
                                <blockquote style="border-left: 4px solid #92400e; padding-left: 15px; font-style: italic; margin: 20px 0;">
                                    "${text}"
                                </blockquote>
                                <a href="${process.env.FRONTEND_URL}/poems/${poem._id}" style="color: #92400e; font-weight: bold;">Reply to comment</a>
                            </div>
                        `
                    });
                }
            } catch (err) {
                console.error('Comment email failed:', err);
            }
        }

        res.status(201).json(poem.comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
