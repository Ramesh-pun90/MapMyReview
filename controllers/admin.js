const User = require("../models/user.js");
const passport = require("passport");
const Listing = require("../models/Listing.js");
const Review = require("../models/review.js");
const axios = require("axios");

// ✅ Render admin signup form
module.exports.renderAdminSignup = (req, res) => {
  res.render("admin/signup.ejs");
};

// ✅ Handle admin signup logic
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

// ✅ Render admin login form
module.exports.renderAdminLogin = (req, res) => {
  res.render("admin/login.ejs");
};

// ✅ Handle admin login
module.exports.adminLogin = (req, res) => {
  req.flash("success", "Welcome back Admin!");
  res.redirect("/admin/listings");
};

// ✅ Admin logout
module.exports.adminLogout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "Logged out successfully");
    res.redirect("/admin/login");
  });
};

// ✅ Show all listings with owner info
module.exports.showAllListings = async (req, res) => {
  const allListings = await Listing.find({}).populate("owner");
  res.render("admin/listings.ejs", { allListings });
};

// ✅ Show individual listing with map + reviews
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
    maptilerKey: process.env.MAPTILER_API_KEY, // Make sure to pass this to EJS
  });
};

// ✅ Render edit form
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/admin/listings");
  }

  const originalImageUrl = listing.image?.url || "";
  const categories = Listing.schema.path("category").enumValues;

  res.render("admin/editListings.ejs", {
    listing,
    categories,
    originalImageUrl,
  });
};

// ✅ Update listing
// module.exports.updateListing = async (req, res) => {
//   const { id } = req.params;
//   const updatedData = { ...req.body.listing };

//   if (req.file) {
//     updatedData.image = {
//       url: req.file.path,
//       filename: req.file.filename,
//     };
//   }

//   await Listing.findByIdAndUpdate(id, updatedData);
//   req.flash("success", "Listing updated");
//   res.redirect("/admin/listings");
// };
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  const updatedData = { ...req.body.listing };

  // Geocode if location changed or exists
  if (updatedData.location && updatedData.country) {
    try {
      const geoUrl = `https://api.maptiler.com/geocoding/${encodeURIComponent(updatedData.location + ", " + updatedData.country)}.json?key=${process.env.MAPTILER_API_KEY}`;
      const geoRes = await axios.get(geoUrl);
      if (geoRes.data.features.length > 0) {
        const [lng, lat] = geoRes.data.features[0].center;
        updatedData.lat = lat;
        updatedData.lng = lng;
      }
    } catch (err) {
      req.flash("error", "Could not geocode location");
      return res.redirect(`/listings/${id}/edit`);
    }
  }

  let listing = await Listing.findByIdAndUpdate(id, updatedData, { new: true });

  if (req.file) {
    listing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
    await listing.save();
  }

  req.flash("success", "Listing updated..!");
  res.redirect(`/listings/${id}`);
};

// ✅ Delete listing
module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted");
  res.redirect("/admin/listings");
};


module.exports.destroyReview=async(req,res)=>{
    let{id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Deleted review..!");
    res.redirect(`/listings/${id}`);
}
