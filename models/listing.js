const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;