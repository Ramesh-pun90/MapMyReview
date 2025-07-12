const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { isAdmin,isReviewAuthor } = require("../middleware.js");
const multer= require("multer");
const {storage}=require("../cloudConfig.js");
const upload=multer({ storage });

// Signup
router.get("/signup", adminController.renderAdminSignup);
router.post("/signup", wrapAsync(adminController.adminSignUp));

// Login
router.get("/login", adminController.renderAdminLogin);
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/admin/login",
    failureFlash: true,
  }),
  adminController.adminLogin
);

// Logout
router.get("/logout", adminController.adminLogout);

// Admin Dashboard: All listings
router.get("/listings", isAdmin, wrapAsync(adminController.showAllListings));

// Show single listing details (Admin)
router.get("/listings/:id", wrapAsync(adminController.showListingDetails));

// Edit listing form
router.get("/listings/:id/edit", isAdmin, wrapAsync(adminController.renderEditForm));

// Update listing
router.put("/listings/:id", isAdmin,upload.single("image"), wrapAsync(adminController.updateListing));

// Delete listing
router.delete("/listings/:id", isAdmin, wrapAsync(adminController.deleteListing));

//admin delete review
router.delete(
  "/listings/:id/reviews/:reviewId",
  isReviewAuthor,
  wrapAsync(adminController.destroyReview)
);


module.exports = router;
