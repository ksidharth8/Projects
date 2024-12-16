const cloudinary = require("cloudinary").v2;

const uploadFileToCloudinary = async (file, folder, quality, width, height) => {
	const options = { folder: folder };
	if (quality) {
		options.quality = quality;
	}
	if (width) {
		options.width = width;
	}
	if (height) {
		options.height = height;
	}
	options.resource_type = "auto";
	return await cloudinary.uploader.upload(file.tempFilePath, options);
};

module.exports = { uploadFileToCloudinary };
