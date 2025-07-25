const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const Review = require("../models/review.js"); 
const Listing = require("../models/Listing.js");
const {validateReview, isLoggedIn,isReviewAuthor} = require("../middleware.js");
const reviewsController=require("../controllers/reviews.js"); 


// router.post(
//     "/",
//     isLoggedIn,
//     validateReview,
//     wrapAsync(reviewsController.createReview));

    router.post('/', isLoggedIn,wrapAsync(reviewsController.createReview));

//delete review route
router.delete(
    "/:reviewId",
    isLoggedIn,
    isReviewAuthor,
    wrapAsync(reviewsController.destroyReview));

module.exports=router;
