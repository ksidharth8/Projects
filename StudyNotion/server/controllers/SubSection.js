const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadFileToCloudinary } = require("../utils/fileUploader");
require("dotenv").config();

// createSubSection
const createSubSection = async (req, res) => {
	try {
		// fetch data from the request body
		const { title, timeDuration, description, sectionId } = req.body;

		// extract video from the request
		const video = req.files.videoFile;

		// data validation
		if (!title || !timeDuration || !description || !sectionId || !video) {
			return res.status(400).json({
				success: false,
				message: "All fields are required",
			});
		}

		// upload the video to cloudinary
		const uploadDetails = await uploadFileToCloudinary(
			video,
			process.env.FOLDER_NAME
		);

		// create entry in the database
		const newSubSection = await SubSection.create({
			title: title,
			timeDuration: timeDuration,
			description: description,
			videoUrl: uploadDetails.secure_url,
		});

		// update the section with the new subsection (push the subsection id to the section)
		const updatedSection = await Section.findByIdAndUpdate(
			{ _id: sectionId },
			{ $push: { subsections: newSubSection._id } },
			{ new: true }
		).populate("subsections");

		// return success response
		res.status(200).json({
			success: true,
			message: "Subsection created successfully",
			subsection: newSubSection,
			section: updatedSection,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message:
				("Something went wrong while creating the subsection",
				error.message),
		});
	}
};

// updateSubSection
const updateSubSection = async (req, res) => {
	try {
		// fetch data from the request body
		const { title, timeDuration, description, subSectionId } = req.body;
		const video = req.files.videoFile;

		// update the subsection in the database
		const updatedSubSection = await SubSection.findByIdAndUpdate(
			{ _id: subSectionId },
			{
				if(title) {
					return { title: title };
				},
				if(timeDuration) {
					return { timeDuration: timeDuration };
				},
				if(description) {
					return { description: description };
				},
				async if(video) {
					// upload the video to cloudinary
					const uploadDetails = await uploadFileToCloudinary(
						video,
						process.env.FOLDER_NAME
					);
					return {
						videoUrl: uploadDetails.secure_url,
						timeDuration: timeDuration,
					};
				},
			},
			{ new: true }
		);
		console.log("updatedSubSection: ", updatedSubSection);

		// return success response
		res.status(200).json({
			success: true,
			message: "Subsection updated successfully",
			subsection: updatedSubSection,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message:
				("Something went wrong while updating the subsection",
				error.message),
		});
	}
};

// deleteSubSection
const deleteSubSection = async (req, res) => {
	try {
		// fetch data from the request body
		const { subSectionId, sectionId } = req.body;

		// delete the subsection from the database
		await SubSection.findByIdAndDelete(subSectionId);

		// update the section by removing the subsection (pull the subsection id from the section)
		const updatedSection = await Section.findByIdAndUpdate(
			{ _id: sectionId },
			{ $pull: { subsections: subSectionId } },
			{ new: true }
		).populate("subsections");
		// TODO: check if the subsection is removed from the section

		// return success response
		res.status(200).json({
			success: true,
			message: "Subsection deleted successfully",
			section: updatedSection,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message:
				("Something went wrong while deleting the subsection",
				error.message),
		});
	}
};

module.exports = { createSubSection, updateSubSection, deleteSubSection };
