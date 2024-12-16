// Import express and create a router
const express = require("express");
const router = express.Router();

// Importing Profile Controllers
const {
	updateProfile,
	deleteAccount,
	getAllUserDetails,
	updateDisplayPicture,
	getEnrolledCourses,
	instructorDashboard,
} = require("../controllers/Profile");

// Importing Middlewares
const { auth, isInstructor } = require("../middlewares/auth");

// ********************************************************************************************************
// *                                    Profile routes                                                    *
// ********************************************************************************************************

// Delete User Account [DELETE /deleteProfile]
router.delete("/deleteProfile", auth, deleteAccount);
// Update User Profile [PUT /updateProfile]
router.put("/updateProfile", auth, updateProfile);
// Get User Details [GET /getUserDetails]
router.get("/getUserDetails", auth, getAllUserDetails);
// Get Enrolled Courses [GET /getEnrolledCourses]
router.get("/getEnrolledCourses", auth, getEnrolledCourses);
// Update Display Picture [PUT /updateDisplayPicture]
router.put("/updateDisplayPicture", auth, updateDisplayPicture);
// Get Instructor Dashboard(by instructors only) [GET /instructorDashboard]
router.get("/instructorDashboard", auth, isInstructor, instructorDashboard);

module.exports = router;
