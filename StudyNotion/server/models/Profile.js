const { Schema, model, mongoose } = require("mongoose");

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

module.exports = model("Profile", profileSchema);
