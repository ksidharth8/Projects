const nodemailer = require("nodemailer");

require("dotenv").config();

// Mail sender function
const mailSender = async (email, title, body) => {
	try {
		// create reusable transporter object using the default SMTP transport
		const transporter = nodemailer.createTransport({
			host: process.env.MAIL_HOST,
			auth: {
				user: process.env.MAIL_USER,
				pass: process.env.MAIL_PASS,
			},
		});

		// send mail with defined transport object
		let info = await transporter.sendMail({
			from: process.env.EMAIL,
			to: `${email}`,
			subject: `${title}`,
			html: `${body}`,
		});
		console.log("Info: ", info);

		return info;
	} catch (error) {
		console.log(error.message);
	}
};

module.exports = mailSender;
