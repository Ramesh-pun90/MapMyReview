const Listing=require("../models/Listing.js");
const User=require("../models/user.js");
const axios = require("axios");


module.exports.index = async (req, res) => {
    const { category = 'All',search } = req.query;

    let filter = {};

    if (search && search.trim() !== "") {
    // $or को मतलब search criteria मध्ये कुनै पनि मिल्न सक्ने
    filter = {
      $or: [
        { title: new RegExp(search, "i") },
        { category: new RegExp(search, "i") },
        { location: new RegExp(search, "i") },
        { country: new RegExp(search, "i") },
      ],
    };
  }
    // Filter by category if not "All"
    if (category && category !== 'All') {
        filter.category =category;
    }

    // Filter by search query in title

    // Log filter to debug if needed

    const allListings = await Listing.find(filter);
;


    if (allListings.length === 0) {
        return res.render("empty/filters.ejs");
    }

    res.render("listings/index", {
        allListings,
        category,
        search,
    });
};

module.exports.renderNewForm=(req,res)=>{
const categories = Listing.schema.path("category").enumValues;
res.render("listings/new.ejs", {categories});
}

module.exports.showListing=   async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({path:"reviews",populate:{path:"author"},}).populate("owner");;
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    return res.render("listings/show.ejs", { listing, maptilerKey: process.env.MAPTILER_API_KEY});
};





// module.exports.createListing=async(req,res,next)=>{ 
//         let url=req.file.path;
//         let filename=req.file.filename;
//         const newListing=new Listing(req.body.listing);
//         newListing.owner=req.user._id; // owner को id set कर रहे हैं
//         newListing.image={url,filename};
//         await newListing.save();
//         req.flash("success","created a new listing..!");
//         res.redirect("/listings");
//     }

module.exports.createListing = async (req, res, next) => {
  let url = req.file.path;
  let filename = req.file.filename;

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };

  // 🌍 Geocode using MapTiler
  const location = req.body.listing.location;
  const country = req.body.listing.country;
  const maptilerKey = process.env.MAPTILER_API_KEY;

  console.log("📌 Location:", location);
  console.log("📌 Country:", country);

  const geoUrl = `https://api.maptiler.com/geocoding/${encodeURIComponent(location + ", " + country)}.json?key=${maptilerKey}`;
  console.log("🌍 Geo URL:", geoUrl);

  try {
    const geoRes = await axios.get(geoUrl);
    console.log("🌐 Geocode Response:", geoRes.data);

    if (geoRes.data.features.length === 0) {
      console.log("❌ No geocode results found!");
      req.flash("error", "Could not geocode location");
      return res.redirect("/listings/new");
    }

    const [lng, lat] = geoRes.data.features[0].center;
    console.log("📍 Coordinates:", { lat, lng });

    newListing.lat = lat;
    newListing.lng = lng;

  } catch (err) {
    console.log("❌ Error during geocoding:", err.message);
    req.flash("error", "Could not geocode location");
    return res.redirect("/listings/new");
  }

  await newListing.save();
  console.log("✅ New listing saved with lat/lng:", newListing.lat, newListing.lng);

  req.flash("success", "Created a new listing!");
  res.redirect("/listings");
};


module.exports.renderEditForm=async (req,res)=>{
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    let originalImageUrl= listing.image.url;
    const categories = Listing.schema.path("category").enumValues;
    originalImageUrl=originalImageUrl.replace("/upload","upload/h_300,w_250")
    res.render("listings/edit.ejs", { listing, originalImageUrl, categories });

};

// module.exports.updateListing=async(req,res)=>{
//     let { id } = req.params;
//     let listing=await Listing.findByIdAndUpdate(id,{...req.body.listing});
//     if(typeof req.file !== "undefined"){
//         let url=req.file.path;
//         let filename=req.file.filename;
//         listing.image={url,filename};
//         await listing.save();
//     }
    
//     req.flash("success","Listing updated..!");
//     res.redirect(`/listings/${id}`);
// };

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  const updatedData = { ...req.body.listing };

  // Geocode if location changed or exists
  if (updatedData.location && updatedData.country) {
    try {
      const geoUrl = `https://api.maptiler.com/geocoding/${encodeURIComponent(updatedData.location + ", " + updatedData.country)}.json?key=${process.env.MAPTILER_API_KEY}`;
      const geoRes = await axios.get(geoUrl);
      if (geoRes.data.features.length > 0) {
        const [lng, lat] = geoRes.data.features[0].center;
        updatedData.lat = lat;
        updatedData.lng = lng;
      }
    } catch (err) {
      req.flash("error", "Could not geocode location");
      return res.redirect(`/listings/${id}/edit`);
    }
  }

  let listing = await Listing.findByIdAndUpdate(id, updatedData, { new: true });

  if (req.file) {
    listing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
    await listing.save();
  }

  req.flash("success", "Listing updated..!");
  res.redirect(`/listings/${id}`);
};



module.exports.destroyListing=async (req,res)=>{
    let {id}=req.params;
    let deleteListings=await Listing.findByIdAndDelete(id);
    console.log(deleteListings);
    req.flash("success","Listing deleted..!");
    res.redirect("/listings");
};


// module.exports.toggleFavorite = async (req, res) => {
//   try {
    
//     const { id: listingId } = req.params;

//     // Populate चाहिँदैन
//     const user = await User.findById(req.user._id);
//     if (!user) {
//       return res.status(404).json({ error: "User फेला परेन" });
//     }

//     let favorited;

//     if (user.favorites.includes(listingId)) {
//       // Remove properly
//       user.favorites.pull(listingId);
//       favorited = false;
//     } else {
//       user.favorites.push(listingId);
//       favorited = true;
//     }

//     await user.save();
//     res.json({ favorited });
//   } catch (error) {
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

module.exports.toggleFavorite = async (req, res) => {
  try {
    // ✅ User logged in check
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { id: listingId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let favorited;

    if (user.favorites.includes(listingId)) {
      user.favorites.pull(listingId);
      favorited = false;
    } else {
      user.favorites.push(listingId);
      favorited = true;
    }

    await user.save();
    res.json({ favorited });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};



















