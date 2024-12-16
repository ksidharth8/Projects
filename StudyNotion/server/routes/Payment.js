// Import exress and create a router
const express = require("express");
const router = express.Router();

// Importing Payment Controllers
const {
	capturePayment,
	verifyPayment,
	// sendPaymentSuccessEmail,
} = require("../controllers/Payment");
// Importing Middlewares
const { auth, isStudent } = require("../middlewares/auth");

// Capture the Payment(by students only) [POST /capturePayment]
router.post("/capturePayment", auth, isStudent, capturePayment);

// Verify the Payment(by students only) [POST /verifyPayment]
router.post("/verifyPayment", auth, isStudent, verifyPayment);

// Send Payment Success Email(by students only) [POST /sendPaymentSuccessEmail]
// router.post(
// 	"/sendPaymentSuccessEmail",
// 	auth,
// 	isStudent,
// 	sendPaymentSuccessEmail
// );

module.exports = router;
