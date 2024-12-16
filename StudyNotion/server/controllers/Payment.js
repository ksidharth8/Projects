const mongoose = require("mongoose");
const User = require("../models/User");
const Course = require("../models/Course");
const CourseProgress = require("../models/CourseProgress");
const { instance } = require("../config/razorpay");
const mailSender = require("../utils/mailSender");
const courseEnrollmentEmail = require("../mail/templates/courseEnrollmentEmail");
const paymentSuccessEmail = require("../mail/templates/paymentSuccessEmail");
const crypto = require("crypto");
require("dotenv").config();

// capture the Payment and initialize the Razorpay payment
const capturePayment = async (req, res) => {
	// fetch courseId and UserId from the request body and request user
	const { courseId } = req.body;
	const userId = req.user.id;

	// validate the courseId
	if (!courseId) {
		return res.status(403).json({
			success: false,
			message: "CourseId is required",
		});
	}

	// initialize the total amount
	let totalAmount = 0;

	// fetch the course details and validate
	let course;
	try {
		// fetch the course details
		course = await Course.findById(courseId);
		// validate the course
		if (!course) {
			return res.status(404).json({
				success: false,
				message: "Course not found",
			});
		}
		// check if the user is already enrolled in the course
		const uid = new mongoose.Types.ObjectId(userId); // converting userId(string) to ObjectId
		if (course.studentsEnrolled.includes(uid)) {
			return res.status(403).json({
				success: false,
				message: "You are already enrolled in the course",
			});
		}

		// Add the course price to the total amount
		totalAmount += course.price;
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message: "Something went wrong while fetching the course",
		});
	}

	// create the order options
	const options = {
		amount: totalAmount * 100, // amount in smallest currency unit
		currency: "INR",
		receipt: Math.random(Date.now()).toString(),
		notes: {
			// passed for getting courseId and userId in webhook for updating the course and user
			courseId: courseId,
			userId: userId,
		},
	};

	// initialize the payment using Razorpay
	try {
		const paymentResponse = await instance.orders.create(options);
		console.log("Payment Response: ", paymentResponse);
		// send the payment response to the client
		res.status(200).json({
			success: true,
			courseName: course.courseName,
			courseDescription: course.courseDescription,
			thumbnail: course.thumbnail,
			orderId: paymentResponse.id,
			currency: paymentResponse.currency,
			amount: paymentResponse.amount,
			message: "Order created successfully",
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message: "Something went wrong while creating the order",
		});
	}
};

// verify signature of Razorpay and Server
const verifyPayment = async (req, res) => {
	// fetch the webhook secret
	const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

	// fetch the signature from the request header
	const signature = req.header("x-razorpay-signature");

	// verify the signature
	const shasum = crypto.createHmac("sha256", webhookSecret);
	shasum.update(JSON.stringify(req.body));
	const digest = shasum.digest("hex");

	// compare the signatures
	if (signature === digest) {
		console.log("Payment is Authorized, Request is legit");

		// fetch the courseId and userId from the notes
		const { courseId, userId } = req.body.payload.payment.entity.notes;

		// fulfill the course enrollment
		try {
			// update the course
			const enrolledCourse = await Course.findOneAndUpdate(
				{ _id: courseId },
				{ $push: { studentsEnrolled: userId } },
				{ new: true }
			);
			if (!enrolledCourse) {
				return res.status(404).json({
					success: false,
					message: "Course not found",
				});
			}
			console.log("Enrolled Course: ", enrolledCourse);

			// update the user
			const enrolledUser = await User.findOneAndUpdate(
				{ _id: userId },
				{ $push: { coursesEnrolled: courseId } },
				{ new: true }
			);
			console.log("Enrolled User: ", enrolledUser);

			// send the payment success mail
			const emailResponse = await mailSender(
				enrolledUser.email,
				"Payment Successful",
				paymentSuccessEmail(
					`${enrolledUser.firstName} ${enrolledUser.lastName}`
				)
			);
			console.log("Email Response: ", emailResponse);

			// send the course enrollment mail
			const emailResponse_ = await mailSender(
				enrolledUser.email,
				`Successfully Enrolled into ${enrolledCourse.courseName}`,
				courseEnrollmentEmail(
					enrolledCourse.courseName,
					`${enrolledUser.firstName} ${enrolledUser.lastName}`
				)
			);
			console.log("Email Response: ", emailResponse_);

			// send the success response
			return res.status(200).json({
				success: true,
				message: "Course enrollment successful",
			});
		} catch (error) {
			console.log(error);
			return res.status(500).json({
				success: false,
				message: "Something went wrong while enrolling in the course",
			});
		}
	} else {
		console.log("Payment is Unauthorized, Request is not legit");
		return res.status(403).json({
			success: false,
			message: "Payment is Unauthorized, Request is not legit",
		});
	}
};

module.exports = { capturePayment, verifyPayment };
