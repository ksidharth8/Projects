const { Schema, model, mongoose } = require("mongoose");

const categorySchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		courses: {
			type: [mongoose.Schema.Types.ObjectId],
			ref: "Course",
		},
	},
	{ timestamps: true }
);

module.exports = model("Category", categorySchema);
