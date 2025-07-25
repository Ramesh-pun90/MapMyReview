const User = require("../models/user.js");
const passport = require("passport");
const Listing = require("../models/Listing.js");
const Review = require("../models/review.js");
const axios = require("axios");
const cloudinary = require("cloudinary").v2;

// Render Admin Signup form
module.exports.renderAdminSignup = (req, res) => {
  res.render("admin/signup.ejs");
};

// Admin Signup logic with admin secret verification
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
      res.redirect("/admin/listings");
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

// Admin login handler (passport local)
module.exports.adminLogin = (req, res) => {
  req.flash("success", "Welcome back Admin!");
  res.redirect("/admin/listings");
};

// Admin logout handler
module.exports.adminLogout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "Logged out successfully");
    res.redirect("/admin/login");
  });
};

// Show all listings with owner populated
module.exports.showAllListings = async (req, res) => {
  const allListings = await Listing.find({}).populate("owner");
  res.render("admin/listings.ejs", { allListings });
};

// Show single listing details with owner, reviews & authors populated
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
    return res.redirect("/admin/listings");
  }

  res.render("admin/ListingsDetails", {
    listing,
    maptilerKey: process.env.MAPTILER_API_KEY,
  });
};

// Render edit form with current listing info and categories
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

// Update listing including multiple images upload, geocode, delete images, set mainImage
module.exports.updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = { ...req.body.listing };

    // Geocode location + country to get lat/lng (optional)
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
      } catch (err) {
        req.flash("error", "Could not geocode location");
        return res.redirect(`/admin/listings/${id}/edit`);
      }
    }

    // DB बाट पुरा listing ल्याउनु
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing भेटिएन");
      return res.redirect("/admin/listings");
    }

    // Update fields manually assign गर्नुस्
    for (let key in updatedData) {
      listing[key] = updatedData[key];
    }

    // नयाँ images थप्नु (upload files बाट)
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((f) => ({
        url: f.path,
        filename: f.filename,
      }));
      if (!listing.image) listing.image = [];
      listing.image.push(...newImages);
    }

    // Delete गरिएका images Cloudinary र DB बाट हटाउनु
    if (req.body.deleteImages) {
      const deleteImages = Array.isArray(req.body.deleteImages)
        ? req.body.deleteImages
        : [req.body.deleteImages];

      for (let filename of deleteImages) {
        await cloudinary.uploader.destroy(filename);
        listing.image = listing.image.filter((img) => img.filename !== filename);
      }
    }

    // Main image update (optional)
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

// Delete entire listing + all images in Cloudinary
module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/admin/listings");
  }

  for (let img of listing.image) {
    await cloudinary.uploader.destroy(img.filename);
  }

  await Listing.findByIdAndDelete(id);

  req.flash("success", "Listing deleted");
  res.redirect("/admin/listings");
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

  // Delete image from Cloudinary
  await cloudinary.uploader.destroy(filename);

  // Remove image from listing.image array
  listing.image = listing.image.filter((img) => img.filename !== filename);

  await listing.save();

  req.flash("success", "Image deleted successfully");
  res.redirect(`/admin/listings/${id}`);
};
