const nodemailer = require('nodemailer');

const sendOTP = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `"Poetry Platform Admin" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your Admin OTP - Poetry Platform',
        html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px; max-width: 500px; background-color: #f9f9f9;">
        <h2 style="color: #6366f1;">🔐 Admin OTP Verification</h2>
        <p style="font-size: 16px;">Hello,</p>
        <p style="font-size: 16px;">Your One-Time Password (OTP) for the Poetry Platform admin dashboard is:</p>
        <div style="font-size: 32px; font-weight: bold; background: #6366f1; color: white; padding: 10px; text-align: center; border-radius: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p style="font-size: 14px; color: #666;">This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #ddd;" />
        <p style="font-size: 12px; color: #999;">Poetry Platform ✨ | Helping Poets Monetize Their Soul.</p>
      </div>
    `,
    };

    return await transporter.sendMail(mailOptions);
};

module.exports = sendOTP;
