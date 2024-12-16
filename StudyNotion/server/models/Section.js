const { Schema, model, mongoose } = require("mongoose");

const sectionSchema = new Schema(
	{
		sectionName: {
			type: String,
		},
		subSection: [
			{
				type: mongoose.Schema.Types.ObjectId,
				required: true,
				ref: "SubSection",
			},
		],
	},
	{ timestamps: true }
);

module.exports = model("Section", sectionSchema);
