const { Schema, model, mongoose } = require("mongoose");

const courseSchema = new Schema(
	{
		courseName: {
			type: String,
			required: true,
		},
		courseDescription: {
			type: String,
			required: true,
		},
		instructor: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		category: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Category",
			// required: true,
		},
		whatYouWillLearn: {
			type: String,
			required: true,
		},
		courseContent: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Section",
			},
		],
		ratingAndReviews: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "RatingAndReview",
			},
		],
		price: {
			type: Number,
			required: true,
		},
		thumbnail: {
			type: String,
		},
		tags: {
			type: [String],
			required: true,
		},
		studentsEnrolled: [
			{
				type: mongoose.Schema.Types.ObjectId,
				// required: true is not added because it will be 0 by default
				ref: "User",
			},
		],
		instructions: {
			type: [String],
		},
		status: {
			type: String,
			default: "Draft",
			enum: ["Draft", "Published"],
		},
	},
	{ timestamps: true }
);

module.exports = model("Course", courseSchema);
