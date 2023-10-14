const mongoose = require("mongoose");
const slugify = require("slugify");
const bcrypt = require("bcryptjs");
//const User=require('./loginModel.js');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: { true: "Name requierd" },
  },
  price: {
    type: Number,
    required: { true: "Price requierd" },
  },
  discountprice: {
    type: Number,
    validate: {
      validator: function (val) {
        return val < this.price; //Custom validation
      },
      message: "Discount price({VALUE}) should be less than Price",
    },
  },
  description: {
    type: String,
  },
  category: {
    type: String,
    required: [true, "Category requierd"],
    enum: {
      values: ["food", "cloths"],
      message: "Category must be food or cloths",
    },
  },
  image:{
    type: "string",
    required: [true, "Please Upload a product file"]
  },
  ratings: {
    type: Number,
    max: [5, "Higest rating is 5.0"],
    min: [1, "Higest rating is 1.0"],
  },
  //   password:{
  // type: String,
  // required: [true,'Please enter a password'],
  // minlength:8,
  //   },
  //   passwordConfirm:{
  //     type: String,
  //     required: [true,'Please Confirm the password'],
  //     validate: {
  //       validator: function (el) {
  //         return el=== this.password;                                //Custom validation
  //       },
  //       message:
  //         "Password does not match",
  //   },
  // },
  created_at: {
    type: Date,
    default: Date.now(),
  },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref:"User", required: true }],
  color_variantions: [String],
  slug: String,
},
{
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// productSchema.pre("save", function (next) {
//   this.slug = slugify(this.name, { lower: true });
//   console.log("middleware");
//   next();
// });

//--------------------------Start Populate-----------------------
// productSchema.pre(/^find/, function (next){
//   this.populate({
//     path: "users",
//     select: "-__v -password -passwordChangeafter",
//   });
// });
//--------------------------End Populate-----------------------

//------------------------start Virtual Populate-----------------
productSchema.virtual("reviews", {
  ref: "Reviews",
  localField: "_id",
  foreignField: "product",
  justOne: true,
});
//------------------------end Virtual Populate-----------------

productSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});


const Product = mongoose.model("product", productSchema);
module.exports = Product;
