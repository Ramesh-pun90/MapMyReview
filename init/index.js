const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/Listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
    initDB();
  })
  .catch(() => {
    console.log("error connecting to DB");
  });

async function main() {
  await mongoose.connect(MONGO_URL);
};

const initDB = async () => {
    await Listing.deleteMany({});
    const mongoose = require("mongoose");

initData.data = initData.data.map((obj) => ({
  ...obj,
  owner: new mongoose.Types.ObjectId("6844297fef4edbddb302a658")
}));
    await Listing.insertMany(initData.data);
    console.log("data initialized");
    mongoose.connection.close();
};