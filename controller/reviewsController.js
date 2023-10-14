const Reviews = require("./../models/reviewsModel.js");
const catchError = require(`${__dirname}/../errors/catchError`);

exports.createReview = catchError(async function(req, res, next) {
    const userId=req.currentUser._id;
    if(!req.body.product) req.body.product=req.params.productId;
    if(!req.body.user) req.body.user=userId;
    const review= await Reviews.create(req.body);
    res.status(200).json(review);
});

exports.allReviews=async function(req,res,next) {
    const allreviews = await Reviews.find();
    res.status(200).json(allreviews);
};