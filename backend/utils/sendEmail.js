const nodemailer = require('nodemailer');
require('dns').setDefaultResultOrder('ipv4first');

const sendEmail = async (options) => {
    // Automatically clean up spaces if the user pasted an App Password with spaces
    const cleanPass = (process.env.EMAIL_PASS || '').replaceAll(' ', '');

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: cleanPass,
        },
    });

    const mailOptions = {
        from: `"PoetVerse ✨" <${process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
    };

    return await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
