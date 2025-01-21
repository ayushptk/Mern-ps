//listing import form listing.js
const Listing = require("./models/listing")
const Review = require("./models/review")

module.exports.isLoggedin = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("success", "You must be logged in to create a new listing")
        return res.redirect("/login")
     }
     next(); 
} 

//save redirects
module.exports.saveRedirectUrl = (req,res,next)=>{
    if(req.session.redirectUrl){
      res.locals.redirectUrl = req.session.redirectUrl;
        }
            next();
            
            }
//isowner middle
module.exports.isOwner = async (req,res,next)=>{
  const { id } = req.params;
  // Fetch the existing listing
  const existingListing = await Listing.findById(id);
//permission for edit
if ( !existingListing.owner.equals(res.locals.currUser._id)) {
  //flash message
  req.flash("success", "You do not have permission to edit this listing");
  return res.redirect("/listings");
} 
next();
  
}

//isauthor
module.exports.isReviewAuthor = async (req,res,next)=>{
  const { id,reviewId } = req.params;
  // Fetch the existing listing
let review = await Review.findById(reviewId);
  //permission for edit
  if ( !review.author.equals(res.locals.currUser._id)) {
    //flash message
    req.flash("success", "You do not have create to or author edit this listing");
    return res.redirect("/listings");
    }
    next();
    }
