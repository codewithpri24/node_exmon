const express = require("express");
const Route = express.Router();
const reviewsController = require("./../controller/reviewsController");
const loginController = require("./../controller/loginController");
const adminController = require("./../controller/adminController");

Route.route("/").get(loginController.protect, reviewsController.allReviews);
Route.route("/:productId/review").post(
  loginController.protect,
  adminController.restrictTo("user"),
  reviewsController.createReview
);

module.exports = Route;
