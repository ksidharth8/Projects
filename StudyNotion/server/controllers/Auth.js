const bcrypt = require("bcrypt");
const User = require("../models/User");
const OTP = require("../models/OTP");
const Profile = require("../models/Profile");
const jwt = require("jsonwebtoken");
const { generate } = require("otp-generator");
const { mailSender } = require("../utils/mailSender");
const { passwordUpdate } = require("../mail/templates/passwordUpdate");
require("dotenv").config();

// Send OTP
const sendOTP = async (req, res) => {
	try {
		// fetch the email from the request body
		const { email } = req.body;

		// check if the user already exists
		const existingUser = await User.findOne({ email });

		// if the user already exists, return an error
		if (existingUser) {
			return res.status(400).json({
				success: false,
				message: "User already registered",
			});
		}

		// generate an OTP
		var otp = generate(6, {
			upperCaseAlphabets: false,
			lowerCaseAlphabets: false,
			specialChars: false,
		});
		console.log("OTP generated: ", otp);

		// check if the OTP already exists
		let existingOTP = await OTP.findOne({ otp: otp });

		// if the OTP already exists, generate a new OTP
		while (existingOTP) {
			otp = generate(6, {
				upperCaseAlphabets: false,
				lowerCaseAlphabets: false,
				specialChars: false,
			});
			// new OTP generated until a unique OTP is generated
			existingOTP = await OTP.findOne({ otp: otp });
		}

		// create a new OTP
		const newOTP = new OTP({
			email,
			otp,
		});

		// save the OTP to the database
		const otpBody = await newOTP.save();
		console.log("otpBody: ", otpBody);

		// return success response
		res.status(200).json({
			success: true,
			message: "OTP sent successfully",
			otp,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message:
				("Something went wrong while sending the OTP: ", error.message),
		});
	}
};

// Sign Up
const signUp = async (req, res) => {
	try {
		// fetch data from the request body
		const {
			firstName,
			lastName,
			email,
			password,
			confirmPassword,
			accountType,
			contactNumber,
			otp,
		} = req.body;

		// check if all fields are provided (validate)
		if (
			!firstName ||
			!lastName ||
			!email ||
			!password ||
			!confirmPassword ||
			!contactNumber ||
			!otp
		) {
			return res.status(403).json({
				success: false,
				message: "All fields are required",
			});
		}

		// check if the password and confirm password match
		if (password !== confirmPassword) {
			return res.status(403).json({
				success: false,
				message: "Passwords and confirm password do not match",
			});
		}

		// check if the user already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({
				success: false,
				message: "User already registered",
			});
		}

		// Find most recent OTP for the email
		const recentOTP = await OTP.find({ email })
			.sort({ createdAt: -1 }) // sort in descending order
			.limit(1); // limit to 1 result
		console.log("recentOTP: ", recentOTP);

		// check if the OTP exists
		if (recentOTP.length == 0) {
			// OTP not found
			return res.status(400).json({
				success: false,
				message: "OTP not found",
			});
		} else if (otp !== recentOTP.otp) {
			// OTP does not match
			return res.status(400).json({
				success: false,
				message: "Invalid OTP",
			});
		}

		// hash the password
		const hashedPassword = await bcrypt.hash(password, 10);

		// create a new profile
		const profileDetails = new Profile.create({
			gender: null,
			dateOfBirth: null,
			about: null,
			contactNumber: null,
		});

		// create a new user
		const newUser = await User.create({
			firstName,
			lastName,
			email,
			password: hashedPassword,
			accountType,
			contactNumber,
			additionalDetails: profileDetails._id,
			// image: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random`,
			image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`, // new image API with initials
		});

		// return success response
		res.status(200).json({
			success: true,
			message: "User registered successfully",
			user: newUser,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message: "Something went wrong while registering the user",
		});
	}
};

// Login
const login = async (req, res) => {
	try {
		// fetch data from the request body
		const { email, password } = req.body;

		// check if all fields are provided (validate)
		if (!email || !password) {
			return res.status(403).json({
				success: false,
				message: "All fields are required",
			});
		}

		// check if the user exists
		const existingUser = await User.findOne({ email }).populate(
			"additionalDetails"
		);
		if (!existingUser) {
			return res.status(401).json({
				success: false,
				message: "User is not registered, please sign up first",
			});
		}

		// check if the password matches
		const isMatch = await bcrypt.compare(password, existingUser.password);

		// if the password does not match, return an error
		if (!isMatch) {
			return res.status(401).json({
				success: false,
				message: "Invalid credentials",
			});
		}

		// since password matches, generate a token
		const payload = {
			email: existingUser.email,
			id: existingUser._id,
			accountType: existingUser.accountType,
		};
		const token = jwt.sign(payload, process.env.JWT_SECRET, {
			expiresIn: "2 h",
		});
		existingUser.token = token;
		existingUser.password = null;

		// create cookie with token and send success response
		const options = {
			expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
			httpOnly: true,
		};
		res.cookie("token", token, options).status(200).json({
			success: true,
			token,
			user: existingUser,
			message: "User logged in successfully",
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message: "Something went wrong while logging in",
		});
	}
};

// Change Password
const changePassword = async (req, res) => {
	try {
		// fetch data from the request body
		const { oldPassword, newPassword, confirmNewPassword } = req.body;
		const { id } = req.user.id; // user id from the token

		// check if all fields are provided (validate)
		if (!oldPassword || !newPassword || !confirmNewPassword) {
			return res.status(403).json({
				success: false,
				message: "All fields are required",
			});
		}

		// check if the new password and confirm new password match
		if (newPassword !== confirmNewPassword) {
			return res.status(403).json({
				success: false,
				message: "New password and confirm new password do not match",
			});
		}

		// check if the user exists
		const existingUser = await User.findById(req.user.id);
		if (!existingUser) {
			return res.status(401).json({
				success: false,
				message: "User is not registered",
			});
		}

		// check if the old password matches
		const isMatch = await bcrypt.compare(oldPassword, existingUser.password);
		if (!isMatch) {
			return res.status(401).json({
				success: false,
				message: "Invalid credentials",
			});
		}

		// hash the new password
		const hashedPassword = await bcrypt.hash(newPassword, 10);

		// update the password in the database
		const updatedUserDetails = await User.findByIdAndUpdate(
			id,
			{ password: hashedPassword },
			{ new: true }
		);

		// send email to user about password change
		try {
			const passwordChangeEmail = await mailSender(
				updatedUserDetails.email,
				"Password of your StudyNotion account has been updated",
				passwordUpdate(
					updatedUserDetails.email,
					`Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
				)
			);
			console.log("passwordChangeEmail: ", passwordChangeEmail);
		} catch (error) {
			console.log(error);
			res.status(500).json({
				success: false,
				message: "Something went wrong while sending the email",
				error: error.message,
			});
		}

		// return success response
		res.status(200).json({
			success: true,
			message: "Password changed successfully",
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message: "Something went wrong while changing the password",
		});
	}
};

module.exports = { sendOTP, signUp, login, changePassword };
