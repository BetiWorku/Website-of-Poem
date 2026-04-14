const express = require('express');
const router = express.Router();
const sendEmail = require('../utils/sendEmail');
const ContactMessage = require('../models/ContactMessage');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Submit contact form
// @route   POST /api/contact
router.post('/', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ message: 'Please provide name, email, and message.' });
    }

    try {
        // 1. Always save to the Database first (Ensures data is never lost)
        const newMessage = new ContactMessage({ name, email, message });
        await newMessage.save();

        // 2. Create a notification for the admin (Bell Icon)
        try {
            const adminUser = await User.findOne({ role: 'admin' });
            if (adminUser) {
                await Notification.create({
                    recipient: adminUser._id,
                    senderName: name, // From the contact form
                    type: 'contact',
                    poemTitle: 'Contact Form Message' // Or just message summary
                });
            }
        } catch (notifErr) {
            console.error("Notif failed:", notifErr);
        }

        // 3. Attempt to send email notification (Optional check)
        try {
            await sendEmail({
                to: process.env.EMAIL_USER,
                subject: `📧 New Contact Message from ${name}`,
                html: `
                    <div style="font-family: sans-serif; padding: 30px; border: 1px solid #e2e8f0; border-radius: 20px; color: #1e293b; background: white; max-width: 600px; margin: auto;">
                        <h2 style="color: #92400e; margin-bottom: 20px; border-bottom: 2px solid #fef3c7; padding-bottom: 10px;">New Message Received ✨</h2>
                        <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border-left: 5px solid #92400e;">
                            <p style="margin: 0 0 10px 0;"><strong>From:</strong> ${name}</p>
                            <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${email}</p>
                            <p style="margin: 15px 0 0 0; font-style: italic; line-height: 1.6;">"${message}"</p>
                        </div>
                        <p style="margin-top: 25px; font-size: 0.75em; color: #94a3b8; text-align: center;">This was sent automatically from your PoetVerse Contact Form.</p>
                    </div>
                `,
            });
            console.log('✅ Success: Admin notified via email.');
        } catch (emailError) {
            // Log the error but DO NOT break the response for the user
            console.warn('⚠️ Warning: Could not send notification email. Please check your .env credentials.');
            console.warn('Reason:', emailError.message);
        }

        // 3. Return success because the message IS in the database
        res.status(201).json({ 
            message: 'Message saved successfully!', 
            note: 'Admins will see this in their dashboard.' 
        });
    } catch (error) {
        console.error('Contact Database save error:', error.message);
        res.status(500).json({ message: 'A server error occurred while processing your message.' });
    }
});

// @desc    Get all contact messages (Admin)
// @route   GET /api/contact
router.get('/', async (req, res) => {
    try {
        const messages = await ContactMessage.find().sort({ createdAt: -1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Delete a contact message
// @route   DELETE /api/contact/:id
router.delete('/:id', async (req, res) => {
    try {
        await ContactMessage.findByIdAndDelete(req.params.id);
        res.json({ message: 'Message deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Reply to a contact message
// @route   POST /api/contact/reply
router.post('/reply', async (req, res) => {
    const { to, subject, replyMessage, originalMessage, originalName } = req.body;

    if (!to || !replyMessage) {
        return res.status(400).json({ message: 'Missing recipient or reply content.' });
    }

    try {
        await sendEmail({
            to,
            subject: subject || `Re: Your message to PoetVerse`,
            html: `
                <div style="font-family: sans-serif; padding: 40px; background: #fffbeb; color: #1e293b; border-radius: 24px; border: 1px solid #fef3c7;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #92400e; font-size: 24px; margin: 0;">PoetVerse ✨</h1>
                        <p style="font-size: 14px; opacity: 0.6;">Admin Reflection</p>
                    </div>
                    
                    <div style="background: white; padding: 30px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                        <p style="margin-top: 0; line-height: 1.6;">Hello <strong>${originalName || ''}</strong>,</p>
                        <p style="line-height: 1.8; color: #334155;">${replyMessage}</p>
                    </div>

                    <div style="margin-top: 40px; padding-top: 30px; border-top: 1px dashed #fcd34d;">
                        <p style="font-size: 12px; font-weight: bold; color: #92400e; text-transform: uppercase;">Original Message:</p>
                        <p style="font-size: 13px; font-style: italic; color: #6b7280; background: #fff; padding: 15px; border-radius: 8px;">"${originalMessage}"</p>
                    </div>
                </div>
            `,
        });

        res.json({ message: 'Reply sent successfully!' });
    } catch (error) {
        console.error('Reply error:', error.message);
        res.status(500).json({ message: 'Failed to send reply. Check your SMTP settings.' });
    }
});

module.exports = router;
