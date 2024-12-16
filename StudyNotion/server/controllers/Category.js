const mongoose = require("mongoose");
const Category = require("../models/Category");
const Course = require("../models/Course");
const { populate } = require("dotenv");

// getRandomInt
function getRandomInt(max) {
	return Math.floor(Math.random() * max);
}

// showAllCategories
const showAllCategories = async (req, res) => {
	try {
		const categories = await Category.find(
			{},
			{ name: true, description: true }
		);
		res.status(200).json({
			success: true,
			categories: categories,
			message: "Categories fetched successfully",
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message: "Something went wrong while fetching the categories",
		});
	}
};

// createCategory
const createCategory = async (req, res) => {
	try {
		// fetch data from the request body
		const { name, description } = req.body;

		// check if all fields are provided (validate)
		if (!name || !description) {
			return res.status(403).json({
				success: false,
				message: "All fields are required",
			});
		}

		// create entry in the database
		const categoryDetails = await Category.create({
			name: name,
			description: description,
		});
		console.log("Category Details: ", categoryDetails);

		// return success response
		res.status(200).json({
			success: true,
			message: "Category created successfully",
			category: categoryDetails,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message: "Something went wrong while creating the category",
		});
	}
};

// categoryPageDetails
const categoryPageDetails = async (req, res) => {
	try {
		// fetch categoryId from the request body
		const { categoryId } = req.body;

		// fetch coueses of the specific category
		const selectedCategory = await Category.findById(categoryId)
			.populate({
				path: "courses",
				match: { status: "published" },
				populate: "ratingAndReviews",
			})
			.exec();

		// validate if the category exists
		if (!selectedCategory) {
			return res.status(403).json({
				success: false,
				message: "Category does not exist",
			});
		}

		// when no courses are available
		if (selectedCategory.courses.length === 0) {
			console.log("No courses available for this category");
			return res.status(404).json({
				success: false,
				message: "No courses found for this category",
			});
		}

		// get courses of the different category
		const categoriesExceptSelected = await Category.find({
			_id: { $ne: categoryId }, // ne: not equal
		});
		let differentCategories = await Category.findOne(
			categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
				._id
		)
			.populate({
				path: "courses",
				match: { status: "Published" },
			})
			.exec();

		// get top selling courses
		// const allCategories = await Category.find()
		// 	.populate({
		// 		path: "courses",
		// 		match: { status: "Published" },
		// 		populate: {
		// 			path: "instructor",
		// 		},
		// 	})
		// 	.exec();
		// const allCourses = allCategories.flatMap((category) => category.courses);
		// const topSellingCourses = allCourses
		// 	.sort((a, b) => b.sold - a.sold)
		// 	.slice(0, 10);
		const topSellingCourses = await Course.find(
			{},
			{
				courseName: true,
				price: true,
				thumbnail: true,
				instructor: true,
				ratingAndReviews: true,
				studentEnrolled: true,
			}
		)
			.sort({ studentEnrolled: -1 })
			.limit(5)
			.populate("instructor")
			.exec();

		// return success response
		res.status(200).json({
			success: true,
			selectedCategory: selectedCategory,
			differentCategories: differentCategories,
			topSellingCourses: topSellingCourses,
			message: "Category details fetched successfully",
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message: "Something went wrong while fetching the category details",
		});
	}
};

module.exports = { showAllCategories, createCategory, categoryPageDetails };
