const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Automatically clean up spaces if the user pasted an App Password with spaces
    const cleanPass = (process.env.EMAIL_PASS || '').replaceAll(' ', '');

    const transporter = nodemailer.createTransport({
        service: 'gmail',
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
