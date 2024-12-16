import { Schema, model, mongoose } from "mongoose";

const ratingAndReviewSchema = new Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		rating: {
			type: Number,
			required: true,
		},
		review: {
			type: String,
			required: true,
		},
		course: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Course",
			required: true,
			index: true,
		},
	},
	{ timestamps: true }
);

export const RatingAndReview = model("RatingAndReview", ratingAndReviewSchema);
