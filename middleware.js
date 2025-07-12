
const Listing = require("./models/Listing.js");
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");

module.exports.isLoggedIn = (req, res, next) => {
if (!req.isAuthenticated()) {
if (req.xhr || req.headers.accept.includes("json")) {
  return res.status(401).json({ error: "You must be signed in." });
}

    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in to create a listing");
    return res.redirect("/login");
}
next();
};


module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing is not found");
    return res.redirect("/listings");
  }
  if (!listing.owner.equals(req.user._id)) {
    req.flash("error", "you don't have permission to edit");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map(el => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map(el => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

module.exports.isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);
  if (!review) {
    req.flash("error", "Review is not found");
    return res.redirect(`/listings/${id}`);
  }
  if (!review.author.equals(req.user._id) && req.user.role !== "admin") {
    req.flash("error", "you are not the author of this review or you are not able to delete it");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.isAdmin = (req, res, next) => {
  if (!req.isAuthenticated() || req.user.role !== "admin") {
    req.flash("error", "तपाईंलाई admin अधिकार छैन");
    return res.redirect("/listings");
  }
  next();
};