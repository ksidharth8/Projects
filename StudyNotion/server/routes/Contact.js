// import express and create a router
const express = require("express");
const router = express.Router();

// import the contactUsController
const { contactUsController } = require("../controllers/ContactUs");

// Post a contact form [POST /contact]
router.post("/contact", contactUsController);

module.exports = router;
