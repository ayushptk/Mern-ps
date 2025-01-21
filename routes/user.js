const express = require("express");
const router = express.Router();
const User = require("../models/user.js"); 
const wrapasyn = require("../utils/wrapasyn.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../milldleware.js");

//router.get implement
router.get("/signup", (req, res) => {
    //user render
    res.render("users/signup.ejs");
})

//router post
router.post("/signup", wrapasyn(async(req,res)=>{
    try{
        let {username,email,password} = req.body;
        const newUser = new User({email,username});
       const registerUser = await User.register(newUser,password);
       console.log(registerUser);
    req.login(registerUser,(err)=>{
      if(err) return next(err); 
      req.flash("success","Welcome to homepage");
      res.redirect("/listings")
    })
    }
   catch(e){
    req.flash("error",e.message);
    res.redirect("/signup");

   }
  

}))

//get login
router.get("/login",(req,res)=>{
     res.render("users/login.ejs")
 
})

//post routes
// router.post("/login",passport.authenticate("local",{failureRedirect: '/login',failureFlash:true}),async(req,res)=>{
//     res.flash("success","Welcome User Ayush");
//     res.redirect("/listings")

// })




//post routes
// router.post("/login", async (req, res, next) => {
//     passport.authenticate("local", (err, user, info) => {
//       if (err) {
//         return next(err);
//       }
//       if (!user) {
//         req.flash("error", "Invalid username or password");
//         return res.redirect("/login");
//       }
//       req.logIn(user, (err) => {
//         if (err) {
//           return next(err);
//         }
//         req.flash("success", "Welcome User Ayush");
//         res.redirect("/listings");
//       });
//     })(req, res, next);
//   });

router.post("/login",saveRedirectUrl, async (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      req.flash("error", err.message);
      return res.redirect("/login");
    }
    if (!user) {
      req.flash("error", "Invalid username or password");
      return res.redirect("/login");
    }
    req.logIn(user, (err) => {
      if (err) {
        req.flash("error", err.message);
        return res.redirect("/login");
      }
      req.flash("success", "Welcome User Ayush");
      let redirectUrl = res.locals.redirectUrl || "/listings";
      return res.redirect(redirectUrl);
    });
  })(req, res, next);
});


//for logout
router.get("/logout", (req, res,next) => {
  req.logout((err)=>{
    if(err){
      return next(err);
    }
    req.flash("success","Logged out successfully");
    res.redirect("/listings");
  });
})
 

module.exports = router;