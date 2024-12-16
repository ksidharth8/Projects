const cloudinary = require("cloudinary").v2;

const cloudinaryConnect = () => {
	try {
		cloudinary.config({
			// configure cloudinary
			cloud_name: process.env.CLOUD_NAME,
			api_key: process.env.CLOUD_API_KEY,
			api_secret: process.env.CLOUD_API_SECRET,
		});
		console.log("Cloudinary connected");
	} catch (error) {
		console.log(error);
		process.exit(1);
	}
};

module.exports = { cloudinaryConnect };
