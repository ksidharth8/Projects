const { Schema, model, mongoose } = require("mongoose");

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

module.exports = model("CourseProgress", courseProgressSchema);
