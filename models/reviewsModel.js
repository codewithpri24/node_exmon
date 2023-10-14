const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, "Review is required"],
  },
  rating: {
    type: Number,
    max: 5,
    min: 1,
    required: [true, "Rating is required"],
  },
  created_at: {
    type: Date,
    default: Date.now(),
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
});

reviewSchema.pre(/^find/,function(next){
  this.populate({
    path:'user',
    select:'-__v -id -_id -role -password -passwordChangeafter'
  });
  next();
});
module.exports =mongoose.model("Reviews",reviewSchema);
