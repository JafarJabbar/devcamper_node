const nodemailer = require("nodemailer");

// async..await is not allowed in global scope, must use a wrapper
const sendMail=async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_SERVER,
        port: process.env.SMTP_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USERNAME, // generated ethereal user
            pass: process.env.SMTP_PASSWORD, // generated ethereal password
        },
    });

    let message= {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}}>`, // sender address
        to: options.email, // list of receivers
        subject: options.subject, // Subject line
        html: options.message, // plain text body
    };

        // send mail with defined transport object
    let info = await transporter.sendMail(message);

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
};

module.exports=sendMail;