const Report = require("../models/Report");
const Listing = require("../models/Listing");
const Review = require("../models/Review");

// User creates a report
const DELETE_THRESHOLD = 20;  // threshold set garna sakincha

module.exports.createReport = async (req, res) => {
  try {
    const { type, targetId, reason } = req.body;

    if (!type || !targetId || !reason) {
      req.flash("error", "Please provide all report details.");
      return res.redirect("back");
    }

    // Check if user already reported
    const existingReport = await Report.findOne({
      reporter: req.user._id,
      targetId,
      type,
    });

    if (existingReport) {
      req.flash("error", "You have already reported this item.");
      return res.redirect(type === "listing" ? `/listings/${targetId}` : `/listings`);
    }

    // Create new report
    await Report.create({
      reporter: req.user._id,
      targetId,
      type,
      reason,
      status: "pending",
    });

    // Count reports for this listing (if listing type)
    if (type === "listing") {
      const count = await Report.countDocuments({ targetId, type, status: { $ne: "resolved" } });

      if (count >= DELETE_THRESHOLD) {
        // Delete the listing
        await Listing.findByIdAndDelete(targetId);

        // Mark all related reports as resolved
        await Report.updateMany({ targetId, type }, { status: "resolved" });

        req.flash("success", "Listing automatically deleted due to excessive reports.");
        return res.redirect("/listings");
      }
    }

    req.flash("success", "Report submitted. Thank you for helping us keep the community safe.");
    if (type === "listing") {
      return res.redirect(`/listings/${targetId}`);
    } else if (type === "review") {
      const review = await Review.findById(targetId);
      if (review) return res.redirect(`/listings/${review.listing}`);
      else return res.redirect("/listings");
    } else {
      return res.redirect("/listings");
    }
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to submit report.");
    return res.redirect("back");
  }
};



// Admin: Show grouped reports (by listing) with counts, unique reasons, status summary
module.exports.renderReports = async (req, res) => {
  try {
    // Fetch reports for listings only, exclude resolved reports
    const listingReports = await Report.aggregate([
      { $match: { type: "listing", status: { $ne: "resolved" } } },
      {
        $group: {
          _id: "$targetId",
          count: { $sum: 1 },
          reports: { $push: "$$ROOT" }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const listingIds = listingReports.map(r => r._id);
    const listings = await Listing.find({ _id: { $in: listingIds } });

    // Map reports to listings, filter out missing listings (deleted)
    const reportsWithListing = listingReports.map(report => {
      const listing = listings.find(l => l._id.equals(report._id));
      if (!listing) return null; // skip if listing deleted

      const uniqueReasons = [...new Set(report.reports.map(r => r.reason))];
      const statusCounts = report.reports.reduce((acc, r) => {
        acc[r.status] = (acc[r.status] || 0) + 1;
        return acc;
      }, {});

      return {
        targetId: report._id,
        count: report.count,
        reports: report.reports,
        listing,
        uniqueReasons,
        statusCounts
      };
    }).filter(report => report !== null);

    res.render("admin/reports", { reports: reportsWithListing });
  } catch (err) {
    console.error("Error loading reports:", err);
    req.flash("error", "Failed to load reports.");
    res.redirect("/admin");
  }
};

// Admin: Delete listing or review and mark related reports resolved
module.exports.deleteReportedContent = async (req, res) => {
  try {
    const { targetId, type } = req.params;

    if (type === "listing") {
      await Listing.findByIdAndDelete(targetId);
    } else if (type === "review") {
      await Review.findByIdAndDelete(targetId);
    } else {
      req.flash("error", "Invalid report type.");
      return res.redirect("/admin/reports");
    }

    // Mark all related reports as resolved
    await Report.updateMany({ targetId, type }, { status: "resolved" });

    req.flash("success", `${type.charAt(0).toUpperCase() + type.slice(1)} and related reports deleted.`);
    res.redirect("/admin/reports");
  } catch (err) {
    console.error("Error deleting reported content:", err);
    req.flash("error", "Failed to delete reported content.");
    res.redirect("/admin/reports");
  }
};

// Admin: Dismiss single report (mark status dismissed)
module.exports.dismissReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    await Report.findByIdAndUpdate(reportId, { status: "dismissed" });
    req.flash("info", "Report dismissed.");
    res.redirect("/admin/reports");
  } catch (err) {
    console.error("Error dismissing report:", err);
    req.flash("error", "Failed to dismiss report.");
    res.redirect("/admin/reports");
  }
};

// Admin: Resolve single report (mark status resolved)
module.exports.resolveReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    await Report.findByIdAndUpdate(reportId, { status: "resolved" });
    req.flash("success", "Report marked as resolved.");
    res.redirect("/admin/reports");
  } catch (err) {
    console.error("Error resolving report:", err);
    req.flash("error", "Failed to resolve report.");
    res.redirect("/admin/reports");
  }
};

