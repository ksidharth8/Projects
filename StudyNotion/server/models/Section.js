import { Schema, model, mongoose } from "mongoose";

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

export const Section = model("Section", sectionSchema);
