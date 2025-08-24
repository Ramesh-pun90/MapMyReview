const User = require("../models/user.js");
const Listing = require("../models/Listing.js"); // ✅ यो लाइन थप्न नबिर्सनुहोस्
const Report = require('../models/Report');



const multer = require('multer');
const {storage}=require("../cloudConfig.js");
const upload = multer({ storage });
module.exports.uploadProfileImage = upload.single("profileImage");


// Signup form rendercle
module.exports.renderSignUpForm = (req, res) => {
  res.render("users/signup.ejs");
};

// Signup logic
module.exports.signUp = async (req, res, next) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to Wanderlust");
      res.redirect("/listings");
    });
  } catch (error) {
    req.flash("error", error.message);
    res.redirect("/signup");
  }
};

// Login form render
module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

// Login logic
module.exports.login = async (req, res) => {
  req.flash("success", "Welcome back to Wanderlust!");
  const redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);

  
};

// Logout logic
module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "Logged out successfully!");
    res.redirect("/listings");
  });
};

// Render user profile page
module.exports.renderProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  const hasProfileInfo = user.userProfile && (
    user.userProfile.name ||
    user.userProfile.age ||
    user.userProfile.bio ||
    user.userProfile.currentAdress ||
    user.userProfile.homeTownAdress ||
    user.userProfile.hobbies ||
    user.userProfile.RelationShip ||
    user.userProfile.Collage ||
    user.userProfile.work ||
    user.userProfile.favAnimal
  );

  res.render("users/Profile", { user, hasProfileInfo });
};

// Render profile edit form
module.exports.renderEditProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.render("users/editProfile", { user });
};

// // Update profile handle

module.exports.updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user.userProfile) user.userProfile = {};

  // Cloudinary बाट आउने URL save गर्ने
  if (req.file) {
    user.userProfile.image = req.file.path; // Cloudinary बाट आएको पूर्ण URL
  }

  user.userProfile.name = req.body.userProfile.name || user.userProfile.name;
  user.userProfile.age = req.body.userProfile.age || user.userProfile.age;
  user.userProfile.bio = req.body.userProfile.bio || user.userProfile.bio;
  user.userProfile.hobbies = req.body.userProfile.hobbies || user.userProfile.hobbies;
  user.userProfile.currentAdress= req.body.userProfile.currentAdress || user.userProfile.currentAdress;
  user.userProfile.homeTownAdress = req.body.userProfile.homeTownAdress || user.userProfile.homeTownAdress;
  user.userProfile.Collage = req.body.userProfile.Collage || user.userProfile.Collage;
  user.userProfile.RelationShip = req.body.userProfile.RelationShip || user.userProfile.RelationShip;
  user.userProfile.favAnimal = req.body.userProfile.favAnimal || user.userProfile.favAnimal;
  user.userProfile.work = req.body.userProfile.work || user.userProfile.work;

  await user.save();
  req.flash("success", "Profile updated successfully!");
  res.redirect("/profile");
};

module.exports.renderFavorites = async (req, res) => {
    const user = await User.findById(req.user._id).populate('favorites');
    res.render('users/favorites', { user });
};


module.exports.renderUserListings = async (req, res) => {
  const listings = await Listing.find({ owner: req.user._id });
  res.render("users/myListings", { listings });
};

// controllers/users.js
module.exports.viewPublicProfile = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        req.flash("error", "User not found.");
        return res.redirect("/listings");
    }
    res.render("users/showPublicProfile", { user });
};



// User Settings page देखाउने
module.exports.renderUserSettings = (req, res) => {
  res.render("users/userSettings");  // views/users/userSettings.ejs
};

// ✅ Update Username
module.exports.updateUsername = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || username.trim() === '') {
      req.flash('error', 'Username cannot be empty.');
      return res.redirect('/user/settings');
    }

    const existingUser = await User.findOne({ username });
    if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
      req.flash('error', 'Username already taken. Please choose another.');
      return res.redirect('/user/settings');
    }

    const user = await User.findById(req.user._id);
    user.username = username.trim();
    await user.save();

    // 🔥 Re-authenticate user after username update
    req.login(user, (err) => {
      if (err) {
        req.flash('error', 'Re-authentication failed. Please login again.');
        return res.redirect('/login');
      }
      req.flash('success', 'Username updated successfully!');
      res.redirect('/user/settings');
    });
  } catch (err) {
    console.error('Username Update Error:', err);
    req.flash('error', 'Something went wrong while updating username.');
    res.redirect('/user/settings');
  }
};


// Email update गर्ने function
module.exports.updateEmail = async (req, res) => {
  try {
    const userId = req.user._id;
    const { newEmail } = req.body;

    // नयाँ इमेल पहिलेबाट छ कि भनेर चेक गर्ने
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser) {
      req.flash('error', 'Email is already in use.');
      return res.redirect('/user/settings');
    }

    await User.findByIdAndUpdate(userId, { email: newEmail });

    req.flash('success', 'Email updated successfully.');
    res.redirect('/user/settings');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong.');
    res.redirect('/user/settings');
  }
};

// Password change गर्ने function (passport-local-mongoose अनुसार)
module.exports.changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      req.flash('error', 'New password and confirm password do not match.');
      return res.redirect('/user/settings');
    }

    const user = await User.findById(userId);
    const authResult = await user.authenticate(currentPassword);

    if (!authResult.user) {
      req.flash('error', 'Current password is incorrect.');
      return res.redirect('/user/settings');
    }

    user.setPassword(newPassword, async (err) => {
      if (err) {
        req.flash('error', 'Something went wrong.');
        return res.redirect('/user/settings');
      }
      await user.save();
      req.flash('success', 'Password changed successfully.');
      res.redirect('/user/settings');
    });

  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong.');
    res.redirect('/user/settings');
  }
};
