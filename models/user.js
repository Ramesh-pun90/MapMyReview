
// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;
// const passportLocalMongoose = require("passport-local-mongoose");

// const userSchema = new Schema({
//   email: {
//     type: String,
//     required: true,
//   },
//   role: {
//     type: String,
//     enum: ["user", "admin"],
//     default: "user",
//   },

//   favorites: [
//     {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Listing",
//     },
//   ],

//   userProfile: {
//     name: String,
//     age: Number,
//     bio: String,
//     hobbies: String,
//     currentAdress: String,
//     homeTownAdress: String,
//     Collage: String,
//     RelationShip: String,
//     favAnimal: String,
//     image: String,
//     work: String,
//   },

//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },

//   isBlocked: {
//     type: Boolean,
//     default: false,
//   },
// });

// userSchema.plugin(passportLocalMongoose);

// // Fix to avoid OverwriteModelError
// module.exports = mongoose.models.User || mongoose.model("User", userSchema);
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,          // email unique राख्नुस्
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  favorites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
    },
  ],
  userProfile: {
    name: String,
    age: Number,
    bio: String,
    hobbies: String,
    currentAdress: String,
    homeTownAdress: String,
    Collage: String,
    RelationShip: String,
    favAnimal: String,
    image: String,
    work: String,
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },

  // ===== Email Verification Fields =====
  isVerified: {
    type: Boolean,
    default: false,
  },
  emailToken: String,
  emailTokenExpires: Date,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// passport-local-mongoose plugin लाई email लाई usernameField बनाउन configure गर्नुहोस्
userSchema.plugin(passportLocalMongoose, { usernameField: "email" });

// Avoid OverwriteModelError
module.exports = mongoose.models.User || mongoose.model("User", userSchema);
