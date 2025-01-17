const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const  Review = require("./review.js");

const listingSchema = new Schema({
    title: {
        type: String,
       
    },
    description: String,
    image: {
        filename: { type: String, default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDMQHJ3-Iz_LUWM1xZ0JrcdD7S9MFeZ6VtBw&s" },
        url: { 
            type: String, 
            default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDMQHJ3-Iz_LUWM1xZ0JrcdD7S9MFeZ6VtBw&s",
        },
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        }
    ],
});

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});


const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;