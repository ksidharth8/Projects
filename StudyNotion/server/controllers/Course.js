const Course = require("../models/Course");
const Category = require("../models/Category");
const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const User = require("../models/User");
const CourseProgress = require("../models/CourseProgress");
const { uploadFileToCloudinary } = require("../utils/fileUploader");
const {
	convertSecondsToDuration,
} = require("../utils/convertSecondsToDuration");
require("dotenv").config();

// getAllCourses
const getAllCourses = async (req, res) => {
	try {
		// fetch all courses
		const courses = await Course.find(
			{ status: "published" },
			{
				courseName: true,
				price: true,
				thumbnail: true,
				instructor: true,
				ratingAndReviews: true,
				studentEnrolled: true,
			}
		)
			.populate("instructor")
			.exec();

		// return success response
		res.status(200).json({
			success: true,
			data: courses,
			message: "Courses fetched successfully",
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message: "Something went wrong while fetching the courses",
		});
	}
};

// createCourse
const createCourse = async (req, res) => {
	try {
		// fetch userId from the request object
		const userId = req.user.id;

		// fetch data from the request body
		const {
			courseName,
			courseDescription,
			whatYouWillLearn,
			price,
			tags,
			category,
			status,
			instructions,
		} = req.body;

		// fetch the thumbnail from the request
		const thumbnail = req.files.thumbnailImage;

		// convert tags and instructions from stringified Array to Array
		const _tags = JSON.parse(tags);
		const _instructions = JSON.parse(instructions);

		console.log("Tags: ", _tags);
		console.log("Instructions: ", _instructions);

		// check if all fields are provided (validate)
		if (
			!courseName ||
			!courseDescription ||
			!whatYouWillLearn ||
			!price ||
			!tags.length ||
			!thumbnail ||
			!category ||
			!instructions.length
		) {
			return res.status(403).json({
				success: false,
				message: "All fields are required",
			});
		}

		// check for instructor (for storing instructor Object ID)
		const instructorDetails = await User.findById(userId, {
			accountType: "Instructor",
		});
		console.log("Instructor Details: ", instructorDetails);
		// ToDo: Check if the id of user and instructor is same

		if (!instructorDetails) {
			return res.status(404).json({
				success: false,
				message: "Instructor Details not found",
			});
		}

		// check if the categories exist
		const categoryDetails = await Category.findById(category);
		if (!categoryDetails) {
			return res.status(404).json({
				success: false,
				message: "Category Details not found",
			});
		}

		// upload thumbnailImage to cloudinary
		const thumbnailImage = await uploadFileToCloudinary(
			thumbnail,
			process.env.FOLDER_NAME
		);
		console.log("Thumbnail Image: ", thumbnailImage);

		// create entry for course in the database
		const newCourse = await Course.create({
			courseName: courseName,
			courseDescription: courseDescription,
			instructor: instructorDetails._id,
			whatYouWillLearn: whatYouWillLearn,
			price: price,
			tags: tags,
			category: categoryDetails._id,
			thumbnail: thumbnailImage.secure_url,
			status: status,
			instructions: instructions,
		});

		// add the new course to the user schema of instructor
		await User.findByIdAndUpdate(
			{ _id: instructorDetails._id },
			{ $push: { courses: newCourse._id } },
			{ new: true }
		);

		// add the new course to the category schema
		const categoryDetails_ = await Category.findByIdAndUpdate(
			{ _id: categoryDetails._id },
			{ $push: { courses: newCourse._id } },
			{ new: true }
		);
		console.log("Category Details: ", categoryDetails_);

		// return success response
		res.status(200).json({
			success: true,
			message: "Course created successfully",
			course: newCourse,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message:
				("Something went wrong while creating the course", error.message),
		});
	}
};

// updateCourse
const updateCourse = async (req, res) => {
	try {
		// fetch courseId from the request body
		const { courseId, updates } = req.body;

		// fetch course details
		const course = await Course.findById(courseId);

		// validation
		if (!course) {
			return res.status(404).json({ error: "Course not found" });
		}

		// If Thumbnail Image is found, update it
		if (req.files) {
			console.log("thumbnail update");
			const thumbnail = req.files.thumbnailImage;
			const thumbnailImage = await uploadFileToCloudinary(
				thumbnail,
				process.env.FOLDER_NAME
			);
			course.thumbnail = thumbnailImage.secure_url;
		}

		// Update only the fields that are present in the request body
		for (const key in updates) {
			if (updates.hasOwnProperty(key)) {
				if (key === "tag" || key === "instructions") {
					course[key] = JSON.parse(updates[key]);
				} else {
					course[key] = updates[key];
				}
			}
		}

		// save the updated course
		await course.save();

		// fetch the updated course details
		const updatedCourse = await Course.findOne({
			_id: courseId,
		})
			.populate({
				path: "instructor",
				populate: {
					path: "additionalDetails",
				},
			})
			.populate("category")
			.populate("ratingAndReviews")
			.populate({
				path: "courseContent",
				populate: {
					path: "subSection",
				},
			})
			.exec();

		// return success response
		res.json({
			success: true,
			message: "Course updated successfully",
			data: updatedCourse,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			success: false,
			message: "Something went wrong while updating the course",
			error: error.message,
		});
	}
};

// getCourseDetails
const getCourseDetails = async (req, res) => {
	try {
		// fetch courseId from the request body
		const { courseId } = req.body;

		// fetch course details
		const courseDetails = await Course.find({ _id: courseId })
			.populate({
				path: "instructor",
				populate: { path: "additionalDetails" },
			})
			.populate("category")
			.populate("ratingAndReviews")
			.populate({
				path: "courseContent",
				populate: {
					path: "subSection",
					// select: "-videoUrl", // exclude videoUrl from the response
				},
			})
			.exec();

		// validation
		if (!courseDetails) {
			return res.status(404).json({
				success: false,
				message: ("Course not found with the course id", courseId),
			});
		}

		// checking if the course is in Draft status
		if (courseDetails.status === "Draft") {
			return res.status(403).json({
				success: false,
				message: "Accessing a draft course is forbidden",
			});
		}

		// calculate the total duration of the course in seconds
		let totalDurationInSeconds = 0;
		courseDetails.courseContent.forEach((content) => {
			content.subSection.forEach((subSection) => {
				const timeDurationInSeconds = parseInt(subSection.timeDuration);
				totalDurationInSeconds += timeDurationInSeconds;
			});
		});
		const totalDuration = convertSecondsToDuration(totalDurationInSeconds);

		// return success response
		res.status(200).json({
			success: true,
			data: courseDetails,
			message: "Course details fetched successfully",
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message:
				("Something went wrong while fetching the course details",
				error.message),
		});
	}
};

// getFullCourseDetails
const getFullCourseDetails = async (req, res) => {
	try {
		// fetch courseId from the request body
		const { courseId } = req.body;

		// fetch userId from the request object
		const userId = req.user.id;

		// fetch course details
		const courseDetails = await Course.findOne({
			_id: courseId,
		})
			.populate({
				path: "instructor",
				populate: {
					path: "additionalDetails",
				},
			})
			.populate("category")
			.populate("ratingAndReviews")
			.populate({
				path: "courseContent",
				populate: {
					path: "subSection",
				},
			})
			.exec();

		// fetch course progress count
		let courseProgressCount = await CourseProgress.findOne({
			courseID: courseId,
			userId: userId,
		});
		console.log("courseProgressCount : ", courseProgressCount);

		// validation
		if (!courseDetails) {
			return res.status(400).json({
				success: false,
				message: `Could not find course with id: ${courseId}`,
			});
		}

		// checking if the course is in Draft status
		if (courseDetails.status === "Draft") {
			return res.status(403).json({
				success: false,
				message: `Accessing a draft course is forbidden`,
			});
		}

		// calculate the total duration of the course in seconds
		let totalDurationInSeconds = 0;
		courseDetails.courseContent.forEach((content) => {
			content.subSection.forEach((subSection) => {
				const timeDurationInSeconds = parseInt(subSection.timeDuration);
				totalDurationInSeconds += timeDurationInSeconds;
			});
		});
		const totalDuration = convertSecondsToDuration(totalDurationInSeconds);

		// return success response
		return res.status(200).json({
			success: true,
			data: {
				courseDetails,
				totalDuration,
				// if courseProgressCount is not found, return an empty array
				completedVideos: courseProgressCount?.completedVideos
					? courseProgressCount?.completedVideos
					: [],
			},
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Something went wrong while fetching the course details",
			error: error.message,
		});
	}
};

// getInstructorCourses
const getInstructorCourses = async (req, res) => {
	try {
		// Get the instructor ID from the authenticated user or request body
		const instructorId = req.user.id;

		// Find all courses belonging to the instructor
		const instructorCourses = await Course.find({
			instructor: instructorId,
		}).sort({ createdAt: -1 });

		// Return the instructor's courses
		res.status(200).json({
			success: true,
			data: instructorCourses,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			success: false,
			message: "Failed to retrieve instructor courses",
			error: error.message,
		});
	}
};

// deleteCourse
const deleteCourse = async (req, res) => {
	try {
		// fetch courseId from request body
		const { courseId } = req.body;

		// Find the course
		const course = await Course.findById(courseId);
		if (!course) {
			return res.status(404).json({ message: "Course not found" });
		}

		// Unenroll students from the course
		const studentsEnrolled = course.studentsEnroled;
		for (const studentId of studentsEnrolled) {
			await User.findByIdAndUpdate(studentId, {
				$pull: { courses: courseId },
			});
		}

		// Delete sections and sub-sections
		const courseSections = course.courseContent;
		for (const sectionId of courseSections) {
			// Delete sub-sections of the section
			const section = await Section.findById(sectionId);
			if (section) {
				const subSections = section.subSection;
				for (const subSectionId of subSections) {
					await SubSection.findByIdAndDelete(subSectionId);
				}
			}

			// Delete the section
			await Section.findByIdAndDelete(sectionId);
		}

		// Delete the course
		await Course.findByIdAndDelete(courseId);

		//   return successfull response
		return res.status(200).json({
			success: true,
			message: "Course deleted successfully",
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			success: false,
			message: "Something went wrong while deleting Course",
			error: error.message,
		});
	}
};

module.exports = {
	getAllCourses,
	createCourse,
	getCourseDetails,
	updateCourse,
	getFullCourseDetails,
	getInstructorCourses,
	deleteCourse,
};
