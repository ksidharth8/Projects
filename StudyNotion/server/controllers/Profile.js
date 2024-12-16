const mongoose = require("mongoose");
const Profile = require("../models/Profile");
const User = require("../models/User");
const Course = require("../models/Course");
const CourseProgress = require("../models/CourseProgress");
const { uploadFileToCloudinary } = require("../utils/fileUploader");
const { convertSecondsToDuration } = require("../utils/convertSecondsToDuration");

// update profile (as profile is created when user is created with null values)
const updateProfile = async (req, res) => {
	try {
		// fetch data from request body
		const { gender, dateOfBirth = "", about = "", contactNumber } = req.body;

		// fetching userId from the request passed as payload in the token after decoding
		const userId = req.user.id;

		// check if all fields are provided (validate)
		if (!gender || !contactNumber || !userId) {
			return res.status(403).json({
				success: false,
				message: "All fields are required",
			});
		}

		// find profile using userDetails
		const userDetails = await User.findById(userId);
		const profileId = userDetails.additionalDetails;
		const profileDetails = await Profile.findById(profileId);

		// update the profile
		profileDetails.dateOfBirth = dateOfBirth;
		profileDetails.about = about;
		profileDetails.gender = gender;
		profileDetails.contactNumber = contactNumber;
		await profileDetails.save();

		// find the updated profile details
		const updatedProfileDetails = await User.findById(userId)
			.populate("additionalDetails")
			.exec();

		// return success response
		res.status(200).json({
			success: true,
			profile: profileDetails,
			message: "Profile updated successfully",
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message:
				("Something went wrong while updating the profile", error.message),
		});
	}
};

// deleteAccount
// Explore -> how can we schedule the deletion of the account after a certain period of time : hint -> use setTimeout
const deleteAccount = async (req, res) => {
	try {
		// fetching userId from the request passed as payload in the token after decoding
		const userId = req.user.id;

		// fetch user details and validate
		const userDetails = await User.findById(userId);
		if (!userDetails) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		// delete profile
		await Profile.findByIdAndDelete({
			_id: new mongoose.Types.ObjectId(userDetails.additionalDetails),
		});

		// unenroll user from all courses
		userDetails.courses.map(async (courseId) => {
			await Course.findByIdAndUpdate(
				courseId,
				{
					$pull: { students: userId },
				},
				{ new: true }
			);
		});

		// delete user
		await User.findByIdAndDelete(userId);

		// delete course progress
		await CourseProgress.deleteMany({ userId: userId });

		// return success response
		res.status(200).json({
			success: true,
			message: "Account deleted successfully",
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message:
				("Something went wrong while deleting the account", error.message),
		});
	}
};

// getAllUserDetails
const getAllUserDetails = async (req, res) => {
	try {
		// fetching userId from the request passed as payload in the token after decoding
		const userId = req.user.id;

		// fetch user details
		const userDetails = await User.findById(userId)
			.populate("additionalDetails")
			.exec();

		// return success response
		res.status(200).json({
			success: true,
			userDetails: userDetails,
			message: "User details fetched successfully",
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message: "Something went wrong while fetching the user details",
		});
	}
};

//  updateDisplayPicture
const updateDisplayPicture = async (req, res) => {
	try {
		// fetch display picture from the request and userId from the request passed as payload in the token after decoding
		const displayPicture = req.files.displayPicture;
		const userId = req.user.id;

		// upload the display picture to cloudinary
		const image = await uploadFileToCloudinary(
			displayPicture,
			process.env.FOLDER_NAME,
			1000,
			1000
		);
		console.log("image: ", image);

		// update the user with the display picture
		const updatedProfile = await User.findByIdAndUpdate(
			{ _id: userId },
			{ image: image.secure_url },
			{ new: true }
		);

		// return success response
		res.send(200).json({
			success: true,
			updatedProfile: updatedProfile,
			message: `Image Updated successfully`,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// getEnrolledCourses
const getEnrolledCourses = async (req, res) => {
	try {
		// fetching userId from the request passed as payload in the token after decoding
		const userId = req.user.id;

		// fetch user details
		let userDetails = await User.findOne({
			_id: userId,
		})
			.populate({
				path: "courses",
				populate: {
					path: "courseContent",
					populate: {
						path: "subSection",
					},
				},
			})
			.exec();

		// validate user details
		if (!userDetails) {
			return res.status(400).json({
				success: false,
				message: `Could not find user with id: ${userId}`,
			});
		}
		userDetails = userDetails.toObject();

		// calculate the total duration of the course and progress percentage
		var SubsectionLength = 0;
		for (var i = 0; i < userDetails.courses.length; i++) {
			let totalDurationInSeconds = 0;
			SubsectionLength = 0;
			for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
				totalDurationInSeconds += userDetails.courses[i].courseContent[
					j
				].subSection.reduce(
					(acc, curr) => acc + parseInt(curr.timeDuration),
					0
				);
				userDetails.courses[i].totalDuration = convertSecondsToDuration(
					totalDurationInSeconds
				);
				SubsectionLength +=
					userDetails.courses[i].courseContent[j].subSection.length;
			}
			let courseProgressCount = await CourseProgress.findOne({
				courseID: userDetails.courses[i]._id,
				userId: userId,
			});
			courseProgressCount = courseProgressCount?.completedVideos.length;
			if (SubsectionLength === 0) {
				userDetails.courses[i].progressPercentage = 100;
			} else {
				// To make it up to 2 decimal point
				const multiplier = Math.pow(10, 2);
				userDetails.courses[i].progressPercentage =
					Math.round(
						(courseProgressCount / SubsectionLength) * 100 * multiplier
					) / multiplier;
			}
		}

		// return success response
		return res.status(200).json({
			success: true,
			data: userDetails.courses,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Something went wrong while fetching the enrolled courses",
		});
	}
};

// instructorDashboard
const instructorDashboard = async (req, res) => {
	try {
		// Fetch all courses by the instructor
		const courseDetails = await Course.find({ instructor: req.user.id });

		// Calculate the total number of students enrolled and the total amount generated
		const courseData = courseDetails.map((course) => {
			const totalStudentsEnrolled = course.studentsEnrolled.length;
			const totalAmountGenerated = totalStudentsEnrolled * course.price;

			// Create a new object with the additional fields
			const courseDataWithStats = {
				_id: course._id,
				courseName: course.courseName,
				courseDescription: course.courseDescription,
				// Include other course properties as needed
				totalStudentsEnrolled,
				totalAmountGenerated,
			};

			return courseDataWithStats;
		});

		res.status(200).json({
			success: true,
			courses: courseData,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			success: false,
			message: "Something went while fetching the instructor dashboard",
		});
	}
};

module.exports = {
	updateProfile,
	deleteAccount,
	getAllUserDetails,
	updateDisplayPicture,
	getEnrolledCourses,
	instructorDashboard,
};
