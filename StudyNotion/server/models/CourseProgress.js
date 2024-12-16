import { Schema, model, mongoose } from "mongoose";

const courseProgressSchema = new Schema(
	{
		courseID: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Course",
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		completedVideos: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "SubSection",
			},
		],
	},
	{ timestamps: true }
);

export const Course = model("CourseProgress", courseProgressSchema);
