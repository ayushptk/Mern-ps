const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//passportlocalmongoose
const passportLocalMongoose = require('passport-local-mongoose');

//schema
const userSchema = new Schema({
   email:{
    type:String,
    required:true,

   }
    });

    //plugin
    userSchema.plugin(passportLocalMongoose);
    //export
    module.exports = mongoose.model('User', userSchema);

