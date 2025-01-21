
const express = require("express");
const app = express();
const mongoose = require('mongoose');
// const Listing = require("./models/listing.js")
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
// const wrapasync = require("./utils/wrapasyn.js")
const ExpressError = require("./utils/ExpressError.js")
const session = require("express-session");
const listingsRouter = require("./routes/listing.js");
//reviews import
const reviewsRouter = require("./routes/review.js");
//user
const userRouter = require("./routes/user.js");
//flash import
const flash = require("connect-flash");
//pass import
const passport = require("passport");
//local strateg
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "/views"));
app.engine('ejs', ejsMate);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "/public")));

// Serve static files from the node_modules directory
app.use('/node_modules', express.static(path.join(__dirname, "/node_modules")));

main()
    .then(() => {
        console.log("Connect with db")
    })
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/projectdb');
}

//session options
const sessionOptions = {
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie:{
        //expires cookie time
        expires: Date.now()+ 7*24*60*60*1000,
        maxAge: 1000*60*60*24*7 ,//7 days
        httpOnly:true,
        
    },


    }


    app.get("/", (req, res) => {
        res.send("hya");
    })

    //app.use
    app.use(session(sessionOptions));
    //flash
    app.use(flash());

    app.use(passport.initialize());
    app.use(passport.session());
    passport.use(new LocalStrategy(User.authenticate()));
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());




    //route flash
    app.use((req, res,next) => {
        //res.locals
        res.locals.success = req.flash("success");
        res.locals.error = req.flash("error");
        res.locals.currUser = req.user;
        next();
        }); 

        
          








// app.get("/listings", wrapasync (async (req, res) => {
//     const allListings = await Listing.find({})
//     res.render("listing/index.ejs", { allListings })
// }))

// app.get("/listings/new", (req, res) => {
//     res.render("listing/new.ejs",)

// })
// app.get("/listings/:id", wrapasync (async (req, res, next) => {
//     const { id } = req.params;

//     // Check if the ID is a valid ObjectId
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//         return res.status(400).send("Invalid listing ID");
//     }

//     try {
//         const listing = await Listing.findById(id).populate("reviews");
//         if (!listing) {
//             return res.status(404).send("Listing not found");
//         }
//         res.render("listing/show.ejs", { listing });
//     } catch (err) {
//         next(err);
//     }
// }))

// app.post("/listings", validateListing, wrapasync ( async(req, res) => {
//     // if(!req.body.listing){
//     //     throw new ExpressError(404,"Send Valid data for listing....")
//     // }

//     const { title, description, price, location, country } = req.body;
//     const newListing = new Listing({
//         title: title,
//         description: description, 
//         price: price,
//         location: location,
//         country: country
//     })

//     await newListing.save();
//     res.redirect("/listings");

// })
// );

// app.get("/listings/:id/edit", wrapasync (async (req, res) => {
//     const { id } = req.params;
//     const listing = await Listing.findById(id)
//     res.render("listing/edit.ejs", { listing })
// }))


// app.put("/listings/:id", validateListing, wrapasync (async (req, res) => {
//     const { id } = req.params;
//     // Fetch the existing listing
//     const existingListing = await Listing.findById(id);

//     // Merge the existing image data with the new data from the form
//     const updatedListing = {
//         ...req.body.listing,
//         image: {
//             filename: existingListing.image.filename,
//             url: existingListing.image.url
//         }
//     };
//     // Update the listing with the merged data
//     await Listing.findByIdAndUpdate(id, updatedListing);
//     res.redirect("/listings");
// }));

// app.delete("/listings/:id", wrapasync (async (req, res) => {
//     const { id } = req.params;
//     await Listing.findByIdAndDelete(id);
//     res.redirect("/listings");
// }))

// app.get("/demouser", async(req,res)=>{
//     //fakeuser
//     let fakeUser = new User({
//         email: "demouser@gmail.com",
//         username: "hello",
//     });
//     //save to database
//    let registeredUser =  await User.register(fakeUser,"helloworld");
//    res.send(registeredUser);


    
// })

app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);

//review post route



app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page not found"))
})

app.use((err,req,res,next)=>{
    let {statusCode=500,message="Error Aayo"} = err;
// res.status(statusCode).send(message);
res.render("listing/error.ejs",{err})
})


app.listen("3000", () => {
    console.log("server is running on port 3000");
})