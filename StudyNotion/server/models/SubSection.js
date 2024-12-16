const { Schema, model, mongoose } = require("mongoose");

const subSectionSchema = new Schema(
	{
		title: {
			type: String,
		},
		timeDuration: {
			type: String,
		},
		description: {
			type: String,
		},
		videoUrl: {
			type: String,
		},
	},
	{ timestamps: true }
);

module.exports = model("SubSection", subSectionSchema);
