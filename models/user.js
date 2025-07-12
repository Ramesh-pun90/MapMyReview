const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const passportLocalMongoose=require("passport-local-mongoose");
const userSchema=new Schema({
    email:{
        type:String,
        required:true,

    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
},

    favorites:[
            {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Listing",
},
    ],
    userProfile: {
        name: String,
        age: Number,
        bio: String,
        hobbies:String,
        currentAdress:String,
        homeTownAdress:String,
        Collage:String,
        RelationShip:String,
        favAnimal:String,
        image:String,
        work:String,
    },
});

userSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model("User",userSchema);