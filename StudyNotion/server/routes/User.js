// Import the required modules
const express = require("express");
const router = express.Router();

// Import the Auth controller
const {
	sendOTP,
	signUp,
	login,
	changePassword,
} = require("../controllers/Auth");

// Import the ResetPassword controller
const {
	resetPassword,
	resetPasswordToken,
} = require("../controllers/ResetPassword");

// Import the required middlewares
const { auth } = require("../middlewares/auth");

// ********************************************************************************************************
//                                      Authentication routes
// ********************************************************************************************************

// Route for user login [POST /login]
router.post("/login", login);
// Route for user signup [POST /signup]
router.post("/signup", signUp);
// Route for sending OTP to the user's email [POST /sendotp]
router.post("/sendOtp", sendOTP);
// Route for Changing the password [POST /changePassword]
router.post("/changePassword", auth, changePassword);

// ********************************************************************************************************
//                                      Reset Password
// ********************************************************************************************************

// Route for generating a reset password token [POST /reset-password-token]
router.post("/reset-password-token", resetPasswordToken);
// Route for resetting user's password after verification [POST /reset-password]
router.post("/reset-password", resetPassword);

module.exports = router;
