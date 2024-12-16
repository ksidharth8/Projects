import { Schema, model, mongoose } from "mongoose";

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

export const Category = model("Category", categorySchema);
