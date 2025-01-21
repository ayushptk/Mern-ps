//restructring the reviews
const express = require("express");
const router = express.Router({mergeParams: true});
const wrapasync = require("../utils/wrapasyn.js")
const ExpressError = require("../utils/ExpressError.js")
const {listingSchema, reviewSchema} = require("../schema.js")
const Review = require("../models/review.js");
const Listing = require("../models/listing.js")
//milldware import
const {isLoggedin ,isReviewAuthor} = require("../milldleware.js");



const validateReview = (req,res,next) =>{
    let {error} = reviewSchema.validate(req.body);
 
    if(error){
        throw new ExpressError(400, error);
    } else{
        next();
    }
}



router.post("/", isLoggedin,validateReview,wrapasync(async(req,res)=>{
    let listing = await Listing.findById(req.params.id)
    let newReview = new Review(req.body.review)
//push the review
newReview.author = req.user._id
listing.reviews.push(newReview);

await newReview.save();  
//new review saved
await listing.save();

req.flash("success", "New Review created");
//res redirect
res.redirect(`/listings/${listing._id}`);



}))

//review delete route
router.delete("/:reviewId", isLoggedin,isReviewAuthor,wrapasync(async(req,res)=>{
    let {id,reviewId} = req.params;
    //update listing with pull
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review delete");
    res.redirect(`/listings/${id}`);
    }))

    module.exports = router;