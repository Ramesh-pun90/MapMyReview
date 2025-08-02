// const mongoose=require("mongoose");
// const Schema=mongoose.Schema;

// const reviewSchema=new Schema({
//     comment:String,
//     rating:{
//         type:Number,
//         min:1,
//         max:5
//     },
//     createdAt:{
//         type:Date,
//         default:Date.now()
//     },
//     author:{
//         type:Schema.Types.ObjectId,
//         ref:"User",
//     }
// });

// module.exports = mongoose.model("Review",reviewSchema);
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  comment: String,
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now, // default मा function call नगर्नुहोस, function reference मात्र दिनुहोस
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

// Fix to avoid OverwriteModelError
module.exports = mongoose.models.Review || mongoose.model("Review", reviewSchema);
