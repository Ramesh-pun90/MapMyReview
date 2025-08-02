const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reports");
const { isLoggedIn } = require("../middleware");

// User can report
router.post("/create", isLoggedIn, reportController.createReport);

module.exports = router;
