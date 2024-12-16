// import express and create a router
const express = require("express");
const router = express.Router();

// import the contactUsController
const { contactUs } = require("../controllers/ContactUs");

// Post a contact form [POST /contact]
router.post("/contact", contactUs);

module.exports = router;
