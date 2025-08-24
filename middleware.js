
// const Listing = require("./models/Listing.js");
// const Review = require("./models/review.js");
// const ExpressError = require("./utils/ExpressError.js");
// const { listingSchema, reviewSchema } = require("./schema.js");
// const multer = require('multer');
// const path = require('path');

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/'); // uploads फोल्डरमा save हुन्छ
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + path.extname(file.originalname)); // unique filename
//   }
// });


// const upload = multer({ storage });

// module.exports = {
//   upload,
//   // ... your other middleware functions (isLoggedIn, validateListing etc)
// };

// module.exports.isLoggedIn = (req, res, next) => {
// if (!req.isAuthenticated()) {
// if (req.xhr || req.headers.accept.includes("json")) {
//   return res.status(401).json({ error: "You must be signed in." });
// }

//     req.session.redirectUrl = req.originalUrl;
//     req.flash("error", "You must be logged in to create a listing");
//     return res.redirect("/login");
// }
// next();
// };


// module.exports.saveRedirectUrl = (req, res, next) => {
//   if (req.session.redirectUrl) {
//     res.locals.redirectUrl = req.session.redirectUrl;
//   }
//   next();
// };

// module.exports.isOwner = async (req, res, next) => {
//   let { id } = req.params;
//   let listing = await Listing.findById(id);
//   if (!listing) {
//     req.flash("error", "Listing is not found");
//     return res.redirect("/listings");
//   }
//   if (!listing.owner.equals(req.user._id)) {
//     req.flash("error", "you don't have permission to edit");
//     return res.redirect(`/listings/${id}`);
//   }
//   next();
// };

// module.exports.validateListing = (req, res, next) => {
//   let { error } = listingSchema.validate(req.body);
//   if (error) {
//     let errMsg = error.details.map(el => el.message).join(",");
//     throw new ExpressError(400, errMsg);
//   } else {
//     next();
//   }
// };

// module.exports.validateReview = (req, res, next) => {
//   let { error } = reviewSchema.validate(req.body);
//   if (error) {
//     let errMsg = error.details.map(el => el.message).join(",");
//     throw new ExpressError(400, errMsg);
//   } else {
//     next();
//   }
// };

// module.exports.isReviewAuthor = async (req, res, next) => {
//   let { id, reviewId } = req.params;
//   let review = await Review.findById(reviewId);
//   if (!review) {
//     req.flash("error", "Review is not found");
//     return res.redirect(`/listings/${id}`);
//   // }
//   // if (!review.author.equals(req.user._id) && req.user.role !== "admin") {
//   //   req.flash("error", "you are not the author of this review or you are not able to delete it");
//   //   return res.redirect(`/listings/${id}`);
//   // }

//     }
//   if (!review.author.equals(req.user._id) && req.user.role !== "admin") {
//     req.flash("error", "you are not the author of this review or you are not able to delete it");
//     return res.redirect(`/listings/${id}`);
//   }

//   next();
// };

// module.exports.isAdmin = (req, res, next) => {
//   if (!req.isAuthenticated() || req.user.role !== "admin") {
//     req.flash("error", "तपाईंलाई admin अधिकार छैन");
//     return res.redirect("/listings");
//   }
//   next();
// };
const Listing = require("./models/Listing.js");
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const passport = require("passport");
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // uploads फोल्डरमा save हुन्छ
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
  }
});

const upload = multer({ storage });

module.exports = {
  upload,
  // ... your other middleware functions (isLoggedIn, validateListing etc)
};

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

// //admin laai public user route ma jana manahi 
// module.exports.isUser = (req, res, next) => {
//   // Check role
//   if (!req.isAuthenticated() ||req.user.role !== "user") {
//     req.flash("error", "be a user then you can access this routes");
//     return res.redirect("listings/signup");
//   }

//   next();
// };

//public user haru admin route jana manahi
module.exports.isAdmin = (req, res, next) => {
  if (!req.isAuthenticated() || req.user.role !== "admin") {
    req.flash("error", "तपाईंलाई admin अधिकार छैन");
    return res.redirect("/listings");
  }
  next();
};

//user block xa vane login garna manahi ra yadi user login xa vane logout
module.exports.isUserBlocked = (req, res, next) => {
  if (req.user && req.user.isBlocked) {
    req.logout(err => {
      if (err) return next(err);
      req.flash("error", "Your account has been blocked by admin.");
      return res.redirect("/login");
    });
    return;
  }
  next();
};

//admin block xa vane login garna manahi ra yadi admin login xa vane logout
module.exports.isAdminBlocked = (req, res, next) => {
  if (req.user && req.user.role === "admin" && req.user.isBlocked) {
    req.logout(err => {
      if (err) return next(err);
      req.flash("error", "Your admin account has been blocked.");
      return res.redirect("/admin/login");
    });
    return;
  }
  next();
};

// Admin मात्र user manage गर्न सक्ने permission
module.exports.canManageUsers = (req, res, next) => {
  if (!req.isAuthenticated() || req.user.role !== "admin") {
    req.flash("error", "Only admin can manage users!");
    return res.redirect("/listings");
  }
  next();
};

// User को आफ्नो profile हेर्न/सम्पादन गर्ने permission (optional, admin or self)
module.exports.isUserSelfOrAdmin = (req, res, next) => {
  const userId = req.params.userId || req.params.id; // route अनुसार adjust गर्नु
  if (!req.isAuthenticated()) {
    req.flash("error", "Please login first!");
    return res.redirect("/login");
  }
  if (req.user.role === "admin" || req.user._id.equals(userId)) {
    return next();
  }
  req.flash("error", "You don't have permission to access this.");
  return res.redirect("/");
};

//admin laai public user login page bata login garana manahi
module.exports.loginMiddleware = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      req.flash("error", "Invalid username or password.");
      return res.redirect("/login");
    }
    if (user.role === "admin") {
      req.flash("error", "Admins cannot login from this page.");
      return res.redirect("/login");
    }
    req.login(user, (err) => {
      if (err) return next(err);
      return next(); // successful login पछि next middleware वा controller call हुन्छ
    });
  })(req, res, next);
};


//admin update email and change password
module.exports.isAdminLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated() || req.user.role !== "admin") {
    req.flash("error", "You must be an admin to access this page.");
    return res.redirect("/admin/login");
  }
  next();
};


module.exports.chooseStrongPassword = (req, res, next) => {
  const password = req.body.password || req.body.user?.password || "";

  const uppercase = /[A-Z]/;
  const lowercase = /[a-z]/;
  const number = /[0-9]/;
  const specialChar = /[!@#$%^&*(),.?":{}|<>]/;
  const minLength = 8;

  function safeRedirectBack() {
    const backURL = req.header('Referer') || '/register'; // change fallback route as needed
    return res.redirect(backURL);
  }

  if (!password) {
    req.flash("error", "Password is required.");
    return safeRedirectBack();
  }

  if (password.length < minLength) {
    req.flash("error", `Password must be at least ${minLength} characters.`);
    return safeRedirectBack();
  }
  if (!uppercase.test(password)) {
    req.flash("error", "Password must contain at least one uppercase letter.");
    return safeRedirectBack();
  }
  if (!lowercase.test(password)) {
    req.flash("error", "Password must contain at least one lowercase letter.");
    return safeRedirectBack();
  }
  if (!number.test(password)) {
    req.flash("error", "Password must contain at least one number.");
    return safeRedirectBack();
  }
  if (!specialChar.test(password)) {
    req.flash("error", "Password must contain at least one special character.");
    return safeRedirectBack();
  }

  next();
};
