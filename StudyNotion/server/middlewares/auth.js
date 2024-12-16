const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

// auth
const auth = (req, res, next) => {
	try {
		// get token from header or body or cookie
		const token =
			req.cookies.token ||
			req.body.token ||
			req.header("Authorization").replace("Bearer ", "");

		// if no token, return error
		if (!token) {
			return res.status(401).json({
				success: false,
				message: "Access denied! Token is missing",
			});
		}

		// verify the token
		try {
			// decode the token
			const decoded = jwt.verify(token, process.env.JWT_SECRET);
			console.log("Decoded: ", decoded);
			// find the user with the decoded id
			req.user = decoded;
		} catch (error) {
			return res.status(401).json({
				success: false,
				message: "Invalid token",
			});
		}
		next();
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message: "Something went wrong while verifying the token",
		});
	}
};

// isStudent
const isStudent = (req, res, next) => {
	try {
		// check if the user is a student
		if (req.user.accountType !== "Student") {
			return res.status(401).json({
				success: false,
				message: "Access denied! Only students are allowed",
			});
		}
		// if the user is a student, continue to the next middleware
		next();
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message: "Something went wrong while checking the user type",
		});
	}
};

// isInstructor
const isInstructor = (req, res, next) => {
	try {
		// check if the user is an instructor
		if (req.user.accountType !== "Instructor") {
			return res.status(401).json({
				success: false,
				message: "Access denied! Only instructors are allowed",
			});
		}
		// if the user is an instructor, continue to the next middleware
		next();
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message: "Something went wrong while checking the user type",
		});
	}
};

// isAdmin
const isAdmin = (req, res, next) => {
	try {
		// check if the user is an admin
		if (req.user.accountType !== "Admin") {
			return res.status(401).json({
				success: false,
				message: "Access denied! Only admins are allowed",
			});
		}
		// if the user is an admin, continue to the next middleware
		next();
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message: "Something went wrong while checking the user type",
		});
	}
};

module.exports = { auth, isStudent, isInstructor, isAdmin };
