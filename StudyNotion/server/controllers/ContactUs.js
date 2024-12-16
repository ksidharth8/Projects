const { contactUsEmail } = require("../mail/templates/contactFormRes");
const mailSender = require("../utils/mailSender");

// contactUs
const contactUs = async (req, res) => {
	const { email, firstName, lastName, message, countryCode, phoneNo } =
		req.body;
	console.log(req.body);
	try {
		const emailResponse = await mailSender(
			email,
			"Your Data send successfully",
			contactUsEmail(
				email,
				firstName,
				lastName,
				message,
				countryCode,
				phoneNo
			)
		);
		console.log("Email Response: ", emailResponse);
		return res.json({
			success: true,
			message: "Email send successfully",
		});
	} catch (error) {
		console.log("Error: ", error);
		console.log("Error message :", error.message);
		return res.json({
			success: false,
			message: "Something went wrong...",
		});
	}
};

module.exports = { contactUs };
