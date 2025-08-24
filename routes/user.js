const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl,isLoggedIn,isUserBlocked,loginMiddleware,chooseStrongPassword } = require("../middleware.js");
const userController = require("../controllers/users.js");


router.route("/signup")
.get(userController.renderSignUpForm)
.post(chooseStrongPassword,wrapAsync(userController.signUp));

router.route("/login")
.get(userController.renderLoginForm)
.post(
    saveRedirectUrl,
    loginMiddleware,
     isUserBlocked,
    userController.login
);

router.get("/profile", isLoggedIn, userController.renderProfile);
router.get("/profile/edit", isLoggedIn, userController.renderEditProfile);
router.put("/profile", isLoggedIn, userController.uploadProfileImage, userController.updateProfile);
router.get("/profile/favorites", isLoggedIn, wrapAsync(userController.renderFavorites));
router.get("/profile/my-listings", isLoggedIn, userController.renderUserListings);
router.get("/logout", userController.logout);
router.get("/users/:id", wrapAsync(userController.viewPublicProfile));

//User settings page देखाउने route//
router.get('/user/settings', isLoggedIn, userController.renderUserSettings);

//update username
router.post('/user/settings/update-username', isLoggedIn, userController.updateUsername);


// Update email POST route
router.post('/user/settings/update-email', isLoggedIn, userController.updateEmail);

// Change password POST route
router.post('/user/settings/change-password', isLoggedIn, userController.changePassword);

module.exports = router;