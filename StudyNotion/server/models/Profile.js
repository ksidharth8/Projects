import { Schema, model, mongoose } from "mongoose";

const profileSchema = new Schema(
	{
		gender: {
			type: String,
		},
		dateOfBirth: {
			type: Date,
		},
		about: {
			type: String,
			trim: true,
		},
		contactNumber: {
			type: String,
			trim: true,
		},
	},
	{ timestamps: true }
);

export const Profile = model("Profile", profileSchema);
