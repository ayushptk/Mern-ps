
const express = require("express");
const app = express();
const mongoose = require('mongoose');
const Listing = require("./models/listing.js")
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapasync = require("./utils/wrapasyn.js")
const ExpressError = require("./utils/ExpressError.js")
const {listingSchema, reviewSchema} = require("./schema.js")
//review import
const Review = require("./models/review.js");
//import review schema


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

app.get("/", (req, res) => {
    res.send("hya");
})

const validateListing = (req,res,next) =>{
    let {error} = listingSchema.validate(req.body);
 
    if(error){
        throw new ExpressError(400, error);
    } else{
        next();
    }
}
const validateReview = (req,res,next) =>{
    let {error} = reviewSchema.validate(req.body);
 
    if(error){
        throw new ExpressError(400, error);
    } else{
        next();
    }
}

app.get("/listings", wrapasync (async (req, res) => {
    const allListings = await Listing.find({})
    res.render("listing/index.ejs", { allListings })
}))

app.get("/listings/new", (req, res) => {
    res.render("listing/new.ejs",)

})
app.get("/listings/:id", wrapasync (async (req, res, next) => {
    const { id } = req.params;

    // Check if the ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send("Invalid listing ID");
    }

    try {
        const listing = await Listing.findById(id).populate("reviews");
        if (!listing) {
            return res.status(404).send("Listing not found");
        }
        res.render("listing/show.ejs", { listing });
    } catch (err) {
        next(err);
    }
}))

app.post("/listings", validateListing, wrapasync ( async(req, res) => {
    // if(!req.body.listing){
    //     throw new ExpressError(404,"Send Valid data for listing....")
    // }

    const { title, description, price, location, country } = req.body;
    const newListing = new Listing({
        title: title,
        description: description, 
        price: price,
        location: location,
        country: country
    })
    // if(!newListing.title){
    //     throw new ExpressError(404,"title is required");
    // }
    // if(!newListing.location){
    //     throw new ExpressError(404,"location is required");
    //     }

    // if(!newListing.description){
    //     throw new ExpressError(404,"Description is required");
    // }

    await newListing.save();
    res.redirect("/listings");

})
);

app.get("/listings/:id/edit", wrapasync (async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
    res.render("listing/edit.ejs", { listing })
}))

// app.put("/listings/:id", async (req, res) => {
//     const { id } = req.params;
//     await Listing.findByIdAndUpdate(id, { ...req.body.listing });
//     res.redirect("/listings");
// })

app.put("/listings/:id", validateListing, wrapasync (async (req, res) => {
    const { id } = req.params;
    // Fetch the existing listing
    const existingListing = await Listing.findById(id);

    // Merge the existing image data with the new data from the form
    const updatedListing = {
        ...req.body.listing,
        image: {
            filename: existingListing.image.filename,
            url: existingListing.image.url
        }
    };
    // Update the listing with the merged data
    await Listing.findByIdAndUpdate(id, updatedListing);
    res.redirect("/listings");
}));

app.delete("/listings/:id", wrapasync (async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}))

//review post route
app.post("/listings/:id/reviews", validateReview,wrapasync(async(req,res)=>{
    let listing = await Listing.findById(req.params.id)
    let newReview = new Review(req.body.review)
//push the review
listing.reviews.push(newReview);

await newReview.save();  
//new review saved
await listing.save();

//res redirect
res.redirect(`/listings/${listing._id}`);



}))

//review delete route
app.delete("/listings/:id/reviews/:reviewId", wrapasync(async(req,res)=>{
    let {id,reviewId} = req.params;
    //update listing with pull
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
    }))



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