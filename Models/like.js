const mongoose = require("mongoose");

const LikeSchema = new mongoose.Schema({
  like: {
    type: Boolean,  
    required: true,
    default: false, 
  },
  blog_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Blogs",
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("Like", LikeSchema);
