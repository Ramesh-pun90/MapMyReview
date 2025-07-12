const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const Listing = require("../models/Listing.js");
const { isLoggedIn,isOwner,validateListing} = require("../middleware.js");
const listingController=require("../controllers/listings.js");
const multer= require("multer");
const {storage}=require("../cloudConfig.js");
const upload=multer({ storage });


// index route and create route
router.route("/")
.get(
    wrapAsync(listingController.index))
.post(
    isLoggedIn,
    upload.single('listing[image]'),
    validateListing,
    wrapAsync(listingController.createListing));

//new route
router.get("/new",
    isLoggedIn,
    listingController.renderNewForm);

router
.route("/:id")
.get(
    wrapAsync(listingController.showListing))// Render category page
.put
    (isLoggedIn,
    isOwner,
    upload.single('listing[image]'),
    validateListing,
    wrapAsync(listingController.updateListing))
.delete
    (isLoggedIn,
    isOwner,
    wrapAsync(listingController.destroyListing));    



//edit route
router.get(
"/:id/edit",
isLoggedIn,
isOwner,
wrapAsync(listingController.renderEditForm));

router.post(
    "/:id/favorite",
    isLoggedIn,
    wrapAsync(listingController.toggleFavorite)
);


router.get("/test-map", (req, res) => {
  res.render("listings/testMap", { maptilerKey: process.env.MAPTILER_API_KEY });
});


module.exports=router;

