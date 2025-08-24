const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });
const { isAdmin, isReviewAuthor, isLoggedIn,isAdminBlocked,isAdminLoggedIn,chooseStrongPassword } = require("../middleware.js");
const reportController = require("../controllers/reports");


// ==================== Admin Auth Routes ==================== //

//home
router.get("/home", adminController.Home);
// Render admin signup page
router.get("/signup", adminController.renderAdminSignup);

// Handle admin signup
router.post("/signup",chooseStrongPassword,wrapAsync(adminController.adminSignUp));

// Render admin login page
router.get("/login", adminController.renderAdminLogin);

// Handle admin login
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/admin/login",
    failureFlash: true,
  }),
  isAdminBlocked,
  adminController.adminLogin
);

// Logout admin
router.get("/logout", adminController.adminLogout);

// ==================== Admin Dashboard Routes ==================== //

// Admin main dashboard index
router.get("/", adminController.renderIndexAdmin);

// Admin dashboard overview
router.get("/Dashboard", isAdmin, adminController.renderDashboard);

// Admin settings
router.get("/settings", isAdmin, adminController.settings);

// ==================== Listing Management ==================== //

// All listings
router.get("/listings", isAdmin, wrapAsync(adminController.showAllListings));

// Show single listing details
router.get("/listings/:id", isAdmin, wrapAsync(adminController.showListingDetails));

// Edit listing form
router.get("/listings/:id/edit", isAdmin, wrapAsync(adminController.renderEditForm));

// Update listing with image upload
router.put(
  "/listings/:id",
  isAdmin,
  upload.array("image", 5), // Up to 5 images
  wrapAsync(adminController.updateListing)
);

// Delete listing
router.delete("/listings/:id", isAdmin, wrapAsync(adminController.deleteListing));

// Delete individual image from listing
router.delete("/listings/:id/images/:filename", isAdmin, wrapAsync(adminController.deleteListingImage));

// ==================== Review Management ==================== //

// Create review (admin)
router.post(
  "/listings/:id/reviews",
  isLoggedIn,
  wrapAsync(adminController.createReview)
);

// Delete review (admin)
router.delete(
  "/listings/:id/reviews/:reviewId",
  isReviewAuthor,
  wrapAsync(adminController.destroyReview)
);

// ==================== User Management ==================== //

// Show all users
router.get("/user", isAdmin, wrapAsync(adminController.renderAllUser));

// View single user
router.get("/users/:id", isAdmin, wrapAsync(adminController.renderUserDetail));

// Delete user
router.delete("/users/:id", isAdmin, wrapAsync(adminController.deleteUser));

// Block user
router.put("/users/:id/block", isAdmin, wrapAsync(adminController.toggleBlockUser));


//=====================admin le aafno email ra password change garne wala=====================//
//update email//
router.post("/settings/update-email", isAdminLoggedIn, adminController.updateAdminEmail);
//change password//
router.post("/settings/change-password", isAdminLoggedIn, adminController.changeAdminPassword);

// ==================== Admin Profile Management ==================== //
router.get("/adminProfile",adminController.renderAdminProfile);
//edit admin profile
router.get("/adminProfile/edit",adminController.renderEditAdminProfile);
//update admin profile
router.put(
  "/updateAdminProfile",
  isAdmin,
  upload.single("image"),
  wrapAsync(adminController.updateAdminProfile)
);

// For admin report routes inside admin router
router.get("/reports", isAdmin, reportController.renderReports);

router.delete(
  "/reports/:targetId/:type/delete",
  isAdmin,
  reportController.deleteReportedContent
);

router.put(
  "/reports/:reportId/dismiss",
  isAdmin,
  reportController.dismissReport
);

// Resolve a single report (status = resolved)
router.put("/reports/:reportId/resolve", isAdmin, reportController.resolveReport);

module.exports = router;
