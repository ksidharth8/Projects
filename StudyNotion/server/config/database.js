const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
	try {
		// connect to the database
		const conn = await mongoose.connect(process.env.MONGODB_URI, {});
		console.log(`MongoDB Connected`);
	} catch (error) {
		console.error(error.message);
		process.exit(1);
	}
};

module.exports = connectDB;
