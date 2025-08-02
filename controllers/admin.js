const User = require("../models/user.js");
const passport = require("passport");
const Listing = require("../models/Listing.js");
const Review = require("../models/review.js");
const Report = require("../models/report.js");
const axios = require("axios");
const cloudinary = require("cloudinary").v2;

// Home
module.exports.Home = (req, res) => {
  res.render("admin/home.ejs");
};

// Render IndexAdmin page
module.exports.renderIndexAdmin = (req, res) => {
  res.render("admin/IndexAdmin.ejs");
};

// Admin panel home page
module.exports.AdminHome = (req, res) => {
  res.render("admin/IndexAdmin.ejs");
};

// Dashboard data rendering
module.exports.renderDashboard = async (req, res) => {
  try {
    const totalListings = await Listing.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalReviews = await Review.countDocuments();

    const recentListings = await Listing.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });

    const newSignups = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });

    res.render("admin/Dashboard.ejs", {
      totalListings,
      totalUsers,
      totalReviews,
      recentListings,
      newSignups,
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Could not load dashboard data");
    res.redirect("/admin");
  }
};

// Render Admin Signup form
module.exports.renderAdminSignup = (req, res) => {
  res.render("admin/signup.ejs");
};

// Admin Signup logic with secret verification
module.exports.adminSignUp = async (req, res, next) => {
  try {
    const { username, email, password, adminSecret } = req.body;

    if (adminSecret !== process.env.ADMIN_SECRET) {
      req.flash("error", "Invalid admin secret code.");
      return res.redirect("/admin/signup");
    }

    const newAdmin = new User({ username, email, role: "admin" });
    const registeredAdmin = await User.register(newAdmin, password);
    req.login(registeredAdmin, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome Admin!");
      res.redirect("/admin/Dashboard");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/admin/signup");
  }
};

// Render Admin Login form
module.exports.renderAdminLogin = (req, res) => {
  res.render("admin/login.ejs");
};

// Admin login handler
module.exports.adminLogin = (req, res) => {
  req.flash("success", "Welcome back Admin!");
  res.redirect("/admin/Dashboard");
};

// Admin logout handler
module.exports.adminLogout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "Logged out successfully");
    res.redirect("/admin");
  });
};

// Show all listings
module.exports.showAllListings = async (req, res) => {
  const allListings = await Listing.find({}).populate("owner");
  res.render("admin/listings.ejs", { allListings });
};

// Show listing details with owner and reviews
module.exports.showListingDetails = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id)
    .populate("owner")
    .populate({
      path: "reviews",
      populate: { path: "author" },
    });

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/admin/Dashboard");
  }

  if (req.user) {
    listing.reviews = listing.reviews.map((review) => {
      review.canDelete =
        review.author._id.equals(req.user._id) || req.user.role === "admin";
      return review;
    });
  }

  res.render("admin/ListingsDetails", {
    listing,
    maptilerKey: process.env.MAPTILER_API_KEY,
    currUser: req.user,
  });
};

// Render edit listing form
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/admin/listings");
  }

  const categories = Listing.schema.path("category")?.enumValues || [];

  res.render("admin/editListings.ejs", {
    listing,
    categories,
  });
};

// Update listing (with images upload, geocode, delete images)
module.exports.updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = { ...req.body.listing };

    if (updatedData.location && updatedData.country) {
      try {
        const geoUrl = `https://api.maptiler.com/geocoding/${encodeURIComponent(
          updatedData.location + ", " + updatedData.country
        )}.json?key=${process.env.MAPTILER_API_KEY}`;
        const geoRes = await axios.get(geoUrl);
        if (geoRes.data.features.length > 0) {
          const [lng, lat] = geoRes.data.features[0].center;
          updatedData.lat = lat;
          updatedData.lng = lng;
        }
      } catch {
        req.flash("error", "Could not geocode location");
        return res.redirect(`/admin/listings/${id}/edit`);
      }
    }

    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/admin/listings");
    }

    for (let key in updatedData) {
      listing[key] = updatedData[key];
    }

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((f) => ({
        url: f.path,
        filename: f.filename,
      }));
      if (!listing.image) listing.image = [];
      listing.image.push(...newImages);
    }

    if (req.body.deleteImages) {
      const deleteImages = Array.isArray(req.body.deleteImages)
        ? req.body.deleteImages
        : [req.body.deleteImages];

      for (let filename of deleteImages) {
        await cloudinary.uploader.destroy(filename);
        listing.image = listing.image.filter((img) => img.filename !== filename);
      }
    }

    if (req.body.mainImage) {
      const mainImg = listing.image.find((img) => img.filename === req.body.mainImage);
      if (mainImg) {
        listing.mainImage = mainImg;
      }
    }

    await listing.save();

    req.flash("success", "Listing updated successfully!");
    res.redirect(`/admin/listings/${id}`);
  } catch (e) {
    console.log(e);
    req.flash("error", "Something went wrong");
    res.redirect("/admin/listings");
  }
};

// Delete listing and its related images & reports
module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/admin/listings");
  }

  // Delete images from Cloudinary
  for (let img of listing.image) {
    await cloudinary.uploader.destroy(img.filename);
  }

  // Delete related reports of this listing
  await Report.deleteMany({ targetId: id, type: "listing" });

  // Delete listing itself
  await Listing.findByIdAndDelete(id);

  req.flash("success", "Listing deleted with related reports");
  res.redirect("/admin/listings");
};

// Create a new review for a listing
module.exports.createReview = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }
  const review = new Review(req.body.review);
  review.author = req.user._id;
  listing.reviews.push(review);
  await review.save();
  await listing.save();
  req.flash("success", "Review added!");
  res.redirect(`/admin/listings/${id}`);
};

// Delete individual review by admin
module.exports.destroyReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Deleted review!");
  res.redirect(`/admin/listings/${id}`);
};

// Delete individual image from listing (Cloudinary + DB)
module.exports.deleteListingImage = async (req, res) => {
  const { id, filename } = req.params;

  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/admin/listings");
  }

  await cloudinary.uploader.destroy(filename);

  listing.image = listing.image.filter((img) => img.filename !== filename);

  await listing.save();

  req.flash("success", "Image deleted successfully");
  res.redirect(`/admin/listings/${id}`);
};

// Render all users
module.exports.renderAllUser = async (req, res) => {
  try {
    const users = await User.find({});
    res.render("admin/user.ejs", { users });
  } catch (e) {
    req.flash("error", "Cannot load users");
    res.redirect("/admin/AdminDashboard");
  }
};

// Show single user profile
module.exports.renderUserDetail = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) {
    req.flash("error", "User not found");
    return res.redirect("/admin/user");
  }
  res.render("admin/userShow", { user });
};

// Delete user by admin
module.exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  await User.findByIdAndDelete(id);
  req.flash("success", "User has been deleted.");
  res.redirect("/admin/user");
};

// Block/unblock user by admin
module.exports.toggleBlockUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/admin/user");
    }
    user.isBlocked = !user.isBlocked;
    await user.save();
    req.flash("success", `User has been ${user.isBlocked ? "blocked" : "unblocked"}.`);
    res.redirect("/admin/user");
  } catch (e) {
    req.flash("error", "Error toggling block status");
    res.redirect("/admin/user");
  }
};

// Render settings page
module.exports.settings = async (req, res) => {
  const users = await User.find({});
  res.render("admin/setting.ejs", { users });
};

// Update admin email
module.exports.updateAdminEmail = async (req, res) => {
  const { newEmail } = req.body;
  const userId = req.user._id;

  try {
    await User.findByIdAndUpdate(userId, { email: newEmail });
    req.flash("success", "Email updated successfully!");
    res.redirect("/admin/settings");
  } catch (err) {
    req.flash("error", "Failed to update email.");
    res.redirect("/admin/settings");
  }
};

// Change admin password
module.exports.changeAdminPassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const admin = await User.findById(req.user._id);

  try {
    if (!(await admin.authenticate(currentPassword))) {
      req.flash("error", "Current password is incorrect.");
      return res.redirect("/admin/settings");
    }

    if (newPassword !== confirmPassword) {
      req.flash("error", "New passwords do not match.");
      return res.redirect("/admin/settings");
    }

    await admin.setPassword(newPassword);
    await admin.save();
    req.flash("success", "Password updated successfully!");
    res.redirect("/admin/settings");
  } catch (err) {
    req.flash("error", "Failed to change password.");
    res.redirect("/admin/settings");
  }
};

// Render admin profile page
module.exports.renderAdminProfile = (req, res) => {
  res.render("admin/adminProfile", { user: req.user });
};

// Render edit admin profile page
module.exports.renderEditAdminProfile = (req, res) => {
  res.render("admin/editAdminProfile", { user: req.user });
};

// Update admin profile
module.exports.updateAdminProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    user.userProfile.name = req.body.name || user.userProfile.name;
    user.userProfile.age = req.body.age || user.userProfile.age;
    user.userProfile.bio = req.body.bio || user.userProfile.bio;
    user.userProfile.hobbies = req.body.hobbies || user.userProfile.hobbies;
    user.userProfile.currentAdress = req.body.currentAdress || user.userProfile.currentAdress;
    user.userProfile.homeTownAdress = req.body.homeTownAdress || user.userProfile.homeTownAdress;
    user.userProfile.Collage = req.body.Collage || user.userProfile.Collage;
    user.userProfile.RelationShip = req.body.RelationShip || user.userProfile.RelationShip;
    user.userProfile.favAnimal = req.body.favAnimal || user.userProfile.favAnimal;
    user.userProfile.work = req.body.work || user.userProfile.work;

    if (req.file) {
      user.userProfile.image = req.file.path;
    }

    await user.save();

    req.flash("success", "Profile updated successfully!");
    res.redirect("/admin/adminProfile");
  } catch (e) {
    console.log(e);
    req.flash("error", "Could not update profile");
    res.redirect("/admin/adminProfile/edit");
  }
};
