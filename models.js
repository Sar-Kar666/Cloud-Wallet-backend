require("dotenv").config();

const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URI);


  const userSchema = mongoose.Schema({
    username: String,
    password: String,
    privateKey: String,
    publicKey: String
  })

  const userModel = mongoose.model("users",userSchema);

  module.exports={
    userModel
  }