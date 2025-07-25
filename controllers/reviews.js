const Listing = require('../models/Listing.js');
const Review = require("../models/review.js");

// module.exports.createReview=async(req,res)=>{
//     let listing=await Listing.findById(req.params.id);
//     let newReview=new Review(req.body.review);
//     newReview.author = req.user._id;
//     listing.reviews.push(newReview);
//     await newReview.save();
//     await listing.save();
//     console.log("new review");
//     req.flash("success","New review added-.!");
//     res.redirect(`/listings/${listing._id}`);
// };

module.exports.createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body.review;

    const listing = await Listing.findById(req.params.id).populate('reviews');
    if (!listing) return res.status(404).json({ error: 'Listing not found' });

    const newReview = new Review({
      rating: Number(rating),
      comment,
      author: req.user._id
    });

    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();

    // ✅ Populate both username and userProfile (image)
    await newReview.populate({
      path: 'author',
      select: 'username userProfile'
    });

    res.json({
      _id: newReview._id,
      rating: newReview.rating,
      comment: newReview.comment,
      author: {
        _id: newReview.author._id,
        username: newReview.author.username,
        userProfile: newReview.author.userProfile
      },
      listing: listing._id,
      canDelete: true
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

 


module.exports.destroyReview=async(req,res)=>{
    let{id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Deleted review..!");
    res.redirect(`/listings/${id}`);
}