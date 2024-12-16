const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const Course = require("../models/Course");

// createSection
const createSection = async (req, res) => {
	try {
		// fetch data from the request body
		const { sectionName, courseId } = req.body;

		// data validation
		if (!sectionName || !courseId) {
			return res.status(400).json({
				success: false,
				message: "All fields are required",
			});
		}

		// create entry in the database
		const newSection = await Section.create({
			sectionName: sectionName,
		});

		// update the course with the new section (push the section id to the course)
		const updatedCourseDetails = await Course.findByIdAndUpdate(
			courseId,
			{ $push: { courseContent: newSection._id } },
			{ new: true }
		).populate({
			path: "courseContent",
			populate: {
				path: "subsections",
			},
		});
		// populated the courseContent with the sections and subsections in the course

		// return success response
		res.status(200).json({
			success: true,
			message: "Section created successfully",
			section: newSection,
			course: updatedCourseDetails,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message:
				("Something went wrong while creating the section", error.message),
		});
	}
};

// updateSection
const updateSection = async (req, res) => {
	try {
		// fetch data from the request body
		const { sectionName, sectionId, courseId } = req.body;

		// data validation
		if (!sectionId) {
			return res.status(400).json({
				success: false,
				message: "Section Id is required",
			});
		}

		// update the section in the database
		const updatedSection = await Section.findByIdAndUpdate(
			sectionId,
			{ sectionName: sectionName },
			{ new: true }
		);

		let course;
		if (courseId) {
			// update the course with the updated section
			course = await Course.findById(courseId)
				.populate({
					path: "courseContent",
					populate: {
						path: "subSection",
					},
				})
				.exec();
		}

		// return success response
		res.status(200).json({
			success: true,
			section: updatedSection,
			course: course,
			message: "Section updated successfully",
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message:
				("Something went wrong while updating the section", error.message),
		});
	}
};

// deleteSection
const deleteSection = async (req, res) => {
	try {
		// const { sectionId, courseId } = req.body;
		// await Course.findByIdAndUpdate(courseId, {
		// 	$pull: {
		// 		courseContent: sectionId,
		// 	},
		// });
		// const section = await Section.findById(sectionId);
		// console.log(sectionId, courseId);
		// if (!section) {
		// 	return res.status(404).json({
		// 		success: false,
		// 		message: "Section not Found",
		// 	});
		// }

		// //delete sub section
		// await SubSection.deleteMany({ _id: { $in: section.subSection } });

		// await Section.findByIdAndDelete(sectionId);

		// //find the updated course and return
		// const course = await Course.findById(courseId)
		// 	.populate({
		// 		path: "courseContent",
		// 		populate: {
		// 			path: "subSection",
		// 		},
		// 	})
		// 	.exec();

		// res.status(200).json({
		// 	success: true,
		// 	message: "Section deleted",
		// 	data: course,
		// });

		// fetch data from the request body
		const { sectionId } = req.body;

		// fetch the course that the section belongs to
		const courseId = await Section.findById(sectionId);

		// delete the section from the database
		const deletedSection=await Section.findByIdAndDelete(sectionId);

		// check if the section is deleted
		if (!deletedSection) {
			return res.status(404).json({
				success: false,
				message: "Section not found",
			});
			
		}

		// update the course (pull the section id from the course)
		const updatedCourse = await Course.findOneAndUpdate(
			{ _id: courseId.courseContent },
			{ $pull: { courseContent: sectionId } },
			{ new: true }
		).populate({ path: "courseContent" });
		// TODO: check if the section is removed from the course

		// return success response
		res.status(200).json({
			success: true,
			deletedSection: deletedSection,
			course: updatedCourse,
			message: "Section deleted successfully",
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message:
				("Something went wrong while deleting the section", error.message),
		});
	}
};

module.exports = { createSection, updateSection, deleteSection };
