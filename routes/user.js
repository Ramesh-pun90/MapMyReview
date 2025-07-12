const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");
const { isLoggedIn} = require("../middleware.js");

router.route("/signup")
.get(userController.renderSignUpForm)
.post(wrapAsync(userController.signUp));

router.route("/login")
.get(userController.renderLoginForm)
.post(
    saveRedirectUrl,
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true
    }),
    userController.login
);

router.get("/profile", isLoggedIn, userController.renderProfile);
router.get("/profile/edit", isLoggedIn, userController.renderEditProfile);
router.put("/profile", isLoggedIn, userController.uploadProfileImage, userController.updateProfile);
router.get("/profile/favorites", isLoggedIn, wrapAsync(userController.renderFavorites));
router.get("/profile/my-listings", isLoggedIn, userController.renderUserListings);



router.get("/logout", userController.logout);



module.exports = router;