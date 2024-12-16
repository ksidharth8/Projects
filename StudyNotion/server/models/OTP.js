const { Schema, model, mongoose } = require("mongoose");
const { mailSender } = require("../utils/mailSender");
const emailVerification = require("../mail/templates/emailVerification");

const OTPSchema = new Schema({
	email: {
		type: String,
		required: true,
	},
	otp: {
		type: String,
		required: true,
	},
	createdAt: {
		type: Date,
		defaultB: Date.now(),
		expires: 60 * 5, // This document will be automatically deleted after 5 minutes of its creation
	},
});

// a function to send emails
async function sendVerificationEmail(email, otp) {
	try {
		// send mail with defined transport object
		const mailResponse = await mailSender(
			email,
			"Verification Email from StudyNotion",
			emailVerification(otp)
		);
		console.log("Email sent successfully", mailResponse);
	} catch (error) {
		console.error("Error occurred while sending mails", error);
		throw error;
	}
}

// pre-save hook to send email (middleware) before saving the OTP in the database
OTPSchema.pre("save", async function (next) {
	// send email
	await sendVerificationEmail(this.email, this.otp);
	next();
});

module.exports = model("OTP", OTPSchema);
