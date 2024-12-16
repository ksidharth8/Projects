const mongoose = require("mongoose");
const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");

// createRating
const createRating = async (req, res) => {
	try {
		// fetch user id
		const userId = req.user.id;

		// fetch data from the request body
		const { rating, review, courseId } = req.body;

		// validate
		if (!courseId || !rating) {
			return res.status(403).json({
				success: false,
				message: "CourseId and Rating are required",
			});
		}

		// check if user is enrolled in the course
		const course = await Course.findById({
			_id: courseId,
			studentsEnrolled: { elemMatch: { $eq: userId } }, // elemMatch: to match the element in the array and eq:equlity
		});
		if (!course) {
			return res.status(403).json({
				success: false,
				message: "You are not enrolled in the course",
			});
		}

		// check if the user has already rated the course
		const ratingDetails = await RatingAndReview.findOne({
			userId: userId,
			courseId: courseId,
		});
		if (ratingDetails) {
			return res.status(403).json({
				success: false,
				message: "You have already rated and reviewed the course",
			});
		}

		// create rating and review
		const newRatingDetails = await RatingAndReview.create({
			userId: userId,
			rating: rating,
			review: review,
			courseId: courseId,
		});

		// update the course with this new ratingAndReview
		const updatedCourseDetails = await Course.findByIdAndUpdate(
			{ _id: courseId },
			{
				$push: { ratingAndReviews: newRatingDetails._id },
			},
			{ new: true }
		);
		console.log("updatedCourseDetails: ", updatedCourseDetails);

		// return success response
		res.status(200).json({
			success: true,
			ratingAndReview: newRatingDetails,
			message: "Rating and Review created successfully",
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message: "Something went wrong while creating the rating and review",
		});
	}
};

// getAverageRating
const getAverageRating = async (req, res) => {
	try {
		// fetch courseId from the request body
		const courseId = req.body.courseId;

		// // fetch course details
		// const courseDetails = await Course.find({ _id: courseId })
		// 	.populate("ratingAndReviews")
		// 	.exec();

		// // validation
		// if (!courseDetails) {
		// 	return res.status(404).json({
		// 		success: false,
		// 		message: "Course not found with the course id",
		// 	});
		// }

		// // calculate the average rating
		// let totalRating = 0;
		// courseDetails.ratingAndReviews.forEach((ratingAndReview) => {
		// 	totalRating += ratingAndReview.rating;
		// });
		// const averageRating = totalRating / courseDetails.ratingAndReviews.length;

		// // if no rating is available
		// if (isNaN(averageRating)) {
		// 	return res.status(200).json({
		// 		success: true,
		// 		averageRating: 0,
		// 		message: "No ratings available",
		// 	});
		// }
		// 	res.status(200).json({
		// 	success: true,
		// 	averageRating: averageRating,
		// 	message: "Average rating fetched successfully",	,
		// });

		// calculate average rating
		const result = await RatingAndReview.aggregate([
			{
				$match: { course: new mongoose.Types.ObjectId(courseId) }, // match: filter
			},
			{
				$group: {
					// group: group the documents
					_id: null,
					averageRating: { $avg: "$rating" }, // avg: calculate the average
				},
			},
		]);

		// return success response if rating is available
		if (result.length > 0) {
			return res.status(200).json({
				success: true,
				averageRating: result[0].averageRating,
				message: "Average rating fetched successfully",
			});
		}

		// return success response if no rating is available
		res.status(200).json({
			success: true,
			averageRating: 0,
			message: "No ratings available, therefore average rating is 0",
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message: "Something went wrong while fetching the average rating",
		});
	}
};

// getAllRating (not for specific course or user)
const getAllRating = async (req, res) => {
	try {
		// fetch all the ratings
		const allReviews = await RatingAndReview.find({})
			.sort({ rating: "desc" })
			.populate({
				path: "user",
				select: "firstName lastName email image",
			})
			.populate({
				path: "course",
				select: "courseName",
			})
			.exec();

		// return success response
		res.status(200).json({
			success: true,
			data: allReviews,
			message: "All reviews fetched successfully",
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message: "Something went wrong while fetching all the ratings",
		});
	}
};

module.exports = { createRating, getAverageRating, getAllRating };
