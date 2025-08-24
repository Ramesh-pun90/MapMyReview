const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reports");
const { isLoggedIn } = require("../middleware");

// User can report
router.post("/create", isLoggedIn, reportController.createReport);

// Admin: View all reports
router.get('/mailbox', isLoggedIn, reportController.showMailbox);


module.exports = router;
