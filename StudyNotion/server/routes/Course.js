// Import Express and create a router
const express = require("express");
const router = express.Router();

// Course Controllers Import
const {
	getAllCourses,
	createCourse,
	getCourseDetails,
	updateCourse,
	getFullCourseDetails,
	getInstructorCourses,
	deleteCourse,
} = require("../controllers/Course");

// Categories Controllers Import
const {
	showAllCategories,
	createCategory,
	categoryPageDetails,
} = require("../controllers/Category");

// Sections Controllers Import
const {
	createSection,
	updateSection,
	deleteSection,
} = require("../controllers/Section");

// Sub-Sections Controllers Import
const {
	createSubSection,
	updateSubSection,
	deleteSubSection,
} = require("../controllers/SubSection");

// Rating Controllers Import
const {
	createRating,
	getAverageRating,
	getAllRating,
} = require("../controllers/RatingAndReview");

const {
	updateCourseProgress,
	// getProgressPercentage,
} = require("../controllers/CourseProgress");

// Importing Middlewares
const {
	auth,
	isStudent,
	isInstructor,
	isAdmin,
} = require("../middlewares/auth");

// ********************************************************************************************************
// *                                    Course routes                                                     *
// ********************************************************************************************************

// Only Instructors can create, update, delete a course & get all courses of a instructor; add, update & delete a section; add & delete a subsection
// Create a Course [POST /createCourse]
router.post("/createCourse", auth, isInstructor, createCourse);
// Update Course routes [POST /updateCourse]
router.post("/updateCourse", auth, isInstructor, updateCourse);
// Delete a Course [DELETE /deleteCourse]
router.delete("/deleteCourse", auth, isInstructor, deleteCourse);
// Get all Courses Under a Specific Instructor [GET /getInstructorCourses]
router.get("/getInstructorCourses", auth, isInstructor, getInstructorCourses);
// Add a Section to a Course [POST /addSection]
router.post("/addSection", auth, isInstructor, createSection);
// Update a Section [POST /updateSection]
router.post("/updateSection", auth, isInstructor, updateSection);
// Delete a Section [POST /deleteSection]
router.post("/deleteSection", auth, isInstructor, deleteSection);
// Update a Sub Section [POST /updateSubSection]
router.post("/updateSubSection", auth, isInstructor, updateSubSection);
// Delete a Sub Section [POST /deleteSubSection]
router.post("/deleteSubSection", auth, isInstructor, deleteSubSection);
// Add a Sub Section to a Section
router.post("/addSubSection", auth, isInstructor, createSubSection);

// Get all Registered Courses [GET /getAllCourses]
router.get("/getAllCourses", getAllCourses);
// Get Details for a Specific Courses [POST /getCourseDetails]
router.post("/getCourseDetails", getCourseDetails);
// Get Details for a Specific Courses [POST /getCourseDetails]
router.post("/getFullCourseDetails", auth, getFullCourseDetails);

// Update Course Progress(by Students only) [POST /updateCourseProgress]
router.post("/updateCourseProgress", auth, isStudent, updateCourseProgress);

// ********************************************************************************************************
// *                                     Category routes                                                  *
// ********************************************************************************************************
// Category can Only be Created by Admin
// Create a Category [POST /createCategory]
router.post("/createCategory", auth, isAdmin, createCategory);

// Get all Categories [GET /showAllCategories]
router.get("/showAllCategories", showAllCategories);
// Get Category Page Details [POST /getCategoryPageDetails]
router.post("/getCategoryPageDetails", categoryPageDetails);

// ********************************************************************************************************
// *                                     Rating routes                                                    *
// ********************************************************************************************************
// Create a Rating(by Students only) [POST /createRating]
router.post("/createRating", auth, isStudent, createRating);
// Get Average Rating [GET /getAverageRating]
router.get("/getAverageRating", getAverageRating);
// Get all Ratings [GET /getReviews]
router.get("/getReviews", getAllRating);

module.exports = router;
