const nodemailer = require('nodemailer');

const sendEmail = async options => {
    // 1) Create a transporter
    const transporter = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: "5d9e09c9773271",
            pass: "9733dc3b0ecdda"
        }
    });

    // 2) Define the email options
    const mailOptions = {
        from: 'Jonas Schmedtmann <hello@jonas.io>',
        to: options.email,
        subject: options.subject,
        text: options.message
        // html:
    };

    // 3) Actually send the email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
