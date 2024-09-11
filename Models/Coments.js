const mongoose = require("mongoose");

const commentLikeSchema = new mongoose.Schema({
  blog_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Blogs",
  },
  date: {
    type: Date,
    default: Date.now,
  },
  comment: {
    type: String,
  },
});

module.exports = mongoose.model("CommentLike", commentLikeSchema);
