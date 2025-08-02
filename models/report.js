// // const mongoose = require('mongoose');

// // const reportSchema = new mongoose.Schema({
// //   reporter: {
// //     type: mongoose.Schema.Types.ObjectId,
// //     ref: 'User',
// //     required: true,
// //   },
// //   targetId: {
// //     type: mongoose.Schema.Types.ObjectId,
// //     required: true,
// //   },
// //   type: {
// //     type: String,
// //     enum: ['listing', 'review'],
// //     required: true,
// //   },
// //   reason: {
// //     type: String,
// //     default: 'Violation of terms',
// //   },
// //   createdAt: {
// //     type: Date,
// //     default: Date.now,
// //   }
// // });

// // module.exports = mongoose.model('Report', reportSchema);

// const mongoose = require('mongoose');

// const reportSchema = new mongoose.Schema({
//   reporter: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//   },
//   targetId: {
//     type: mongoose.Schema.Types.ObjectId,
//     required: true,
//   },
//   type: {
//     type: String,
//     enum: ['listing', 'review'],
//     required: true,
//   },
//   reason: {
//     type: String,
//     default: 'Violation of terms',
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   }
// });

// // Fix to avoid OverwriteModelError:
// module.exports = mongoose.models.Report || mongoose.model('Report', reportSchema);
const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  type: { type: String, enum: ["listing", "review"], required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ["pending", "dismissed", "resolved"], default: "pending" },
  createdAt: { type: Date, default: Date.now }
});

// fix for OverwriteModelError:
module.exports = mongoose.models.Report || mongoose.model("Report", reportSchema);
