// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;
// const Review = require("./review.js");

// const ListingSchema = new Schema({
// title: {
//     type: String,
//     required: true,
// },
// description: String,

// image: [
//   {
//     url: String,           
//     filename: String,
// }
// ],

//     price: Number,
//     location: String,
//     country: String,
//     lat: {
//   type: Number,
// },
// lng: {
//   type: Number,
// },



// reviews: [
//     {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Review",
//     },
//     ],

// owner: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
// },

// category: {
//     type: String,
//     enum: [
//     "Mountain",
//     "Camping",
//     "Hiking",
//     "Beach",
//     "Island",
//     "Desert",
//     "Forest",
//     "Cultural",
//     "Adventure",
//     "Wildlife",
//     "Historical",
//     "Luxury",
//     "Budget",
//     "Romantic",
//     "SoloTravel",
//     "Room",
//     "Iconic city",
//     ],
//     },
//      createdAt: {
//     type: Date,
//     default: Date.now
//   },
// });



// ListingSchema.post("findOneAndDelete", async (listing) => {
//   if (listing) {
//     await Review.deleteMany({
//       _id: { $in: listing.reviews },
//     });
//   }
// });

// // const Listing = mongoose.model("Listing", ListingSchema);
// // module.exports = Listing;
// module.exports = mongoose.models.Listing || mongoose.model("Listing", ListingSchema);

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js"); // ठीकै छ, तर circular import बाट बच्न ध्यान दिनुहोस्

const ListingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,

  image: [
    {
      url: String,
      filename: String,
    },
  ],

  price: Number,
  location: String,
  country: String,
  lat: {
    type: Number,
  },
  lng: {
    type: Number,
  },

  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  ],

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  category: {
    type: String,
    enum: [
      "Mountain",
      "Camping",
      "Hiking",
      "Beach",
      "Island",
      "Desert",
      "Forest",
      "Cultural",
      "Adventure",
      "Wildlife",
      "Historical",
      "Luxury",
      "Budget",
      "Romantic",
      "SoloTravel",
      "Room",
      "Iconic city",
    ],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

ListingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({
      _id: { $in: listing.reviews },
    });
  }
});

// OverwriteModelError रोक्न यो pattern प्रयोग गर्नुहोस्:
module.exports = mongoose.models.Listing || mongoose.model("Listing", ListingSchema);

