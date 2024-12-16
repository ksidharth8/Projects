const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

// resentPasswordToken
const resetPasswordToken = async (req, res) => {
	try {
		// get the email from the request body
		const { email } = req.body;

		// find the user with the email
		const user = await User.findOne({ email });

		// if the user does not exist, return an error
		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		// generate a reset password token
		const token = crypto.randomUUID(); // generate a random token like "f7b3f1b1-0b36-4b4b-8b3e-3b3f7b3b3b3b"

		// update the user with the token and resetPasswordExpires
		const updatedDetails = await User.findOneAndUpdate(
			{ email: email },
			{ token: token, resetPasswordExpires: Date.now() + 5 * 60 * 1000 }, // 5 minutes
			{ new: true }
		);
		console.log("updatedDetails: ", updatedDetails);

		// create the reset password url
		const url = `http://localhost:3000/update-password/${token}`;

		// send the email with the reset password link
		await mailSender({
			to: user.email,
			subject: "Reset Password",
			text: `Your Link for email verification is ${url}. Please click this url to reset your password.`,
		});

		// send success response
		res.status(200).json({
			success: true,
			message: "Reset password link has been sent to your email",
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message: "Something went wrong while sending the reset password link",
		});
	}
};

// resetPassword
const resetPassword = async (req, res) => {
	try {
		// fetching the token and password & confirm password from the request body
		const { token, password, confirmPassword } = req.body;

		// check if the password and confirm password match
		if (password !== confirmPassword) {
			return res.status(403).json({
				success: false,
				message: "Passwords and confirm password do not match",
			});
		}

		// find the user with the token
		const user = await User.findOne({ token: token });

		// if the user does not exist, return an error
		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		// check if the token has expired
		if (user.resetPasswordExpires < Date.now()) {
			return res.status(403).json({
				success: false,
				message: "Token has expired!, Please request a new one",
			});
		}

		// hash the password
		const hashedPassword = await bcrypt.hash(password, 10);

		// update the user with the new password and remove the token and resetPasswordExpires
		await User.findOneAndUpdate(
			{ token },
			{ password: hashedPassword, token: null, resetPasswordExpires: null },
			{ new: true }
		);

		// return success response
		res.status(200).json({
			success: true,
			message: "Password has been reset successfully",
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message: "Something went wrong while resetting the password",
		});
	}
};

module.exports = { resetPassword, resetPasswordToken };
