var express = require("express");
const Route = express.Router();
const productController = require("./../controller/productControllerapi");
const loginController = require("./../controller/loginController");
const adminController = require("./../controller/adminController");

var bodyParser = require("body-parser");
const urlencode = bodyParser.urlencoded({
  extended: true,
});

Route.route("/minavgprice").get(productController.minavgprice);
Route.route("/top-5-costly").get(
  productController.topfiveProducts, //-->middleware using
  productController.allProducts
);
//Route.route("/").get(productController.homePage);
Route.route("/about").get(loginController.protect,productController.about);
Route.route("/video").get(loginController.protect,productController.videoStream);

Route.route("/").get(loginController.protect, productController.allProducts);
Route.route("/signup")
  .get(loginController.userSignup)
  .post(urlencode, loginController.userPhoto, loginController.createUser);
Route.route("/login").get(loginController.loginpage);
Route.route("/login").post(urlencode, loginController.login);
Route.route("/logout").get(loginController.logout);
Route.route("/forgetpassword").post(loginController.forgetPassword);
Route.route("/resetpassword/:token").post(loginController.resetPassword);
Route.route("/updatepassword").post(loginController.UpdatePassword);

Route.route("/my_profile").get(
  loginController.protect,
  loginController.myProfile
);
Route.route("/edit_profile")
  .get(loginController.protect, loginController.editForm)
  .post(
    loginController.protect,
    loginController.userPhoto,
    loginController.updateMe
  );
Route.route("/deleteMe").delete(
  loginController.protect,
  loginController.deleteMe
);
Route.route("/product/checkout/:productId").get(
  loginController.protect,
  productController.renderbuypage
);
Route.route("/product/checkout/payment").post(
  urlencode,
  loginController.protect,
  productController.checkOut
);
Route.route("/product/:id")
  .get(loginController.protect, productController.productbyId)
  .post(productController.updateProduct)
  .delete(
    loginController.protect,
    adminController.restrictTo("admin", "guide"),
    productController.deleteProduct
  );
//Route.route("/payment/:productId").post(productController.checkOut);

module.exports = Route;
