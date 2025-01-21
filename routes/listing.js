const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const wrapasync = require("../utils/wrapasyn.js")
const ExpressError = require("../utils/ExpressError.js")
const {listingSchema, reviewSchema} = require("../schema.js")
const Listing = require("../models/listing.js")
//isLogged in require import
const {isLoggedin ,isOwner,isReviewAuthor} = require("../milldleware.js");


const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate({ listing: req.body.listing });
    if (error) {
      throw new ExpressError(400, error);
    } else {
      next();
    }
  }

//index router
router.get("/", wrapasync (async (req, res) => {
    const allListings = await Listing.find({})
    res.render("listing/index.ejs", { allListings })
}))
//neew router
router.get("/new", isLoggedin, (req, res) => {
    //req for auth
    
    res.render("listing/new.ejs",)

})

//showroutes
router.get("/:id", wrapasync (async (req, res, next) => {
    const { id } = req.params;

    // Check if the ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send("Invalid listing ID");
    }

    try {
        const listing = await Listing.findById(id).populate({path:"reviews",populate:{
            path:"author",
        }}).populate("owner");
        if (!listing) {
            return res.status(404).send("Listing not found");
        }
        res.render("listing/show.ejs", { listing });
    } catch (err) {
        next(err);
    }
}))


//Create routes
router.post("/", validateListing, wrapasync ( async(req, res) => {
    const { title, description, price, location, country } = req.body;
    const newListing = new Listing({
        title: title,
        description: description, 
        price: price,
        location: location,
        country: country
    })
newListing.owner = req.user._id;
    await newListing.save();
    //flash message
    req.flash("success", "New listing created");
    res.redirect("/listings");

})
);


//edit routes
router.get("/:id/edit" ,isOwner,wrapasync  (async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
    res.render("listing/edit.ejs", { listing })
}))

//Update Router
router.put("/:id", isOwner,  validateListing, wrapasync (async (req, res) => {
    const { id } = req.params;
    // Fetch the existing listing
//     const existingListing = await Listing.findById(id);
// //permission for edit
// if ( !existingListing.owner.equals(res.locals.currUser._id)) {
//     //flash message
//     req.flash("success", "You do not have permission to edit this listing");
//     return res.redirect("/listings");
// } 
    

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
    req.flash("success", "Listing Update");
    res.redirect("/listings");
}));

//delete router 
router.delete("/:id", isLoggedin, isOwner, wrapasync  (async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", " listing Delete");
    res.redirect("/listings");
}))

//export router
module.exports = router;
 
