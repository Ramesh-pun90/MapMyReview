if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride=require("method-override"); 
const ejsMate=require("ejs-mate");
const ExpressError=require("./utils/ExpressError.js"); 
const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");
const adminRoutes = require("./routes/admin.js");
const session=require("express-session");
const MongoStore=require("connect-mongo");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");

app.engine("ejs",ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));;
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"/public")));



// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// main()
//     .then(() => {
//     console.log("connected to DB");
// })
//     .catch(() => {
//     console.log("error connecting to DB");
// });

// async function main() {
//     await mongoose.connect(MONGO_URL);
// }

const dbUrl = process.env.ATLAS_DB_URL;

main()
.then(() => {
    console.log("connected to DB");
    })
    .catch((err) => {
    console.log("error connecting to DB", err);
});

async function main() {
    await mongoose.connect(dbUrl, {
    serverSelectionTimeoutMS: 30000, // 30 सेकेन्ड timeout
});
}

const store = MongoStore.create({
    mongoUrl: dbUrl,   // यहाँ typo सुधार्नुपर्छ
    crypto: {
        secret: "mysupersecretcode",
    },
    touchAfter: 24 * 3600,  // seconds मा हुन्छ, २४ घन्टा
});

store.on("error", (err) => {   // err parameter पनि लिनुपर्छ
    console.log("ERROR IN MONGO SESSION STORE", err);
});

// session and flash setup
const sessionOptions = {
    store,
    secret: "mysupersecretkey",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),  // Date object दिनु राम्रो हुन्छ
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
};




app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
});
//...


app.use((req, res, next) => {
  res.locals.currUser = req.user || null; // null सेफ्टी जोड्नुहोस्
next();
});


app.use("/listings", listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/", userRouter);
app.use("/admin", adminRoutes);



// app.all("*", (req,res,next)=>{
//     next(new ExpressError(404,"page not found"));
// });

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("error.ejs", { message, statusCode });
});

app.listen(8080, () => {
console.log("server is running on port 8080");
});