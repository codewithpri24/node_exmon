const express = require("express");
const Route = express.Router();
const adminController = require("../controller/adminController");
const productController = require("./../controller/productControllerapi");
const loginController = require("./../controller/loginController");

var bodyParser = require("body-parser");
const urlencode = bodyParser.urlencoded({
  extended: true,
});

Route.route("/add_products")
  .get(urlencode,loginController.protect,adminController.restrictToAdmin,adminController.addProducts)
  .post(urlencode,adminController.productPhoto, adminController.createProduct);

module.exports = Route;
