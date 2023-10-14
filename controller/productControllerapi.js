const fs = require("fs");
const path = require("path");
var url = require("url");
const Product = require("./../models/productModel.js");
const Apifeaturs = require(`${__dirname}/../api/Apifeaturs`);
const catchError = require(`${__dirname}/../errors/catchError`);
const stripe = require("stripe")(
  "sk_test_51NJLchSHf1YC4BnD77soPvBzTKgcg3kuDNln2FVa7Bjjl2Y4D6XVHS6UEk36D1JVOtmKeNrYan6OSBArVRdu7ada00Jh3Bfm3i"
);
const STRIPE_PUBLISHABLE_KEY =
  "pk_test_51NJLchSHf1YC4BnDLFwLBBBwgfwFjOwAYeXnnsa0CJ3o4oiY3jqHbbrnYJlsifdrMOkoSqOizE7EENgPuI8zqhcZ00U3jmiH9i";

//Aggregation--------------------------------
exports.minavgprice = async (req, res) => {
  try {
    const result = await Product.aggregate([
      { $match: { price: { $lte: 90 } } },
      {
        $group: {
          _id: null,
          price: { $avg: "$price" },
        },
      },
      {
        $group: {
          _id: { $month: "$created_at" },
          numRows: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json({ result });
  } catch (e) {
    res.status(404).json({
      status: "fail",
      message: e.message,
    });
  }
};

// Use of Middleware Start-------
exports.topfiveProducts = (req, res, next) => {
  req.query.sort = "-price";
  req.query.limit = "5";
  next();
};
// Use of Middleware End-------

exports.homePage = (req, res) => {
  res.render("home");
  console.log(__dirname);
};
// exports.createProduct = (req, res) => {
//   console.log(req.body);
//   try {
//     const productList = Product.create(req.body);
//     console.log(productList);
//   } catch (err) {
//     console.log(err);
//   }
exports.allProducts = async (req, res) => {
  if (!req.message) {
    try {
      const features = new Apifeaturs(
        Product.find().populate("reviews"),
        req.query
      )
        // .filter()
        .sort()
        .fieldlimit()
        .pagination();

      let query = await features.query;
      const loginUser = req.currentUser;
      res.render("home", {
        data: loginUser,
        title: "Homepage",
        products: query,
      });
    } catch (err) {
      res.render("loginpage", { message: err.message });
    }
  } else {
    res.redirect("/login?" + req.message);
  }
};
// exports.productbyId = catchError(async (req, res) => {
//   const singleProduct = await Product.findById(req.params.id);
//   if (!singleProduct) {
//     return next(new ErrorConstruct("Data given Page not Found", 404));
//   } else {
//     res.render("single_product", {
//       product: singleProduct,
//       title: "Product",
//       data: req.currentUser,
//     });
//   }
// });

exports.productbyId = catchError(async (req, res) => {
  await Product.findById(req.params.id)
    .then((singleProduct) => {
      res.render("single_product", {
        product: singleProduct,
        title: "Product",
        data: req.currentUser,
      });
    })
    .catch((error) => {
      return next(new ErrorConstruct("Data given Page not Found", 404));
    });
});

exports.updateProduct = catchError(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).send({
    status: 200,
    data: product,
  });

  res.status(404).json({
    status: "fail",
    message: err.message,
  });
});

// exports.updateProduct = async (req, res) => {
//   try {
//     const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true,
//     });
//     res.status(200).send({
//       status: 200,
//       data: product,
//     });
//   } catch (err) {
//     res.status(404).json({
//       status: "fail",
//       message: err.message,
//     });
//   }
// };
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ product, message: "Deleted" });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};
exports.checkOutPage = (req, res) => {
  res.render("checkoutPage");
};
exports.renderbuypage = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    res.render("buy", {
      key: STRIPE_PUBLISHABLE_KEY,
      product: product,
      data: req.currentUser,
      title: "checkout",
    });
  } catch (error) {
    console.log(error.message);
  }
};

exports.checkOut = async (req, res) => {
  try {
    stripe.customers
      .create({
        email: req.body.stripeEmail,
        source: req.body.stripeToken,
        name: req.body.name,
        address: {
          line1: "115, Vikas Nagar",
          postal_code: "281001",
          city: "Mathura",
          state: "Uttar Pradesh",
          country: "India",
        },
      })
      .then((customer) => {
        return stripe.paymentIntents.create({
          amount: req.body.amount, // amount will be amount*100
          description: req.body.productName,
          currency: "INR",
          customer: customer.id,
        });
      })
      .then((charge) => {
        res.render("success", { data: req.currentUser });
      })
      .catch((err) => {
        res.render(err);
      });
  } catch (error) {
    console.log(error.message);
  }
};

exports.about = (req, res) => {
  res.render("about", { data: req.currentUser, title: "About" });
};

exports.videoStream = (req, res) => {
  let range = req.headers.range;
  if (!range) range = "bytes=0-";
  const videoPath = __dirname+"/../" + "assets/files/cake1.mp4";
  const videoSize = fs.statSync(videoPath).size;
  const chunkSize = 1 * 1e6;
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + chunkSize, videoSize - 1);
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };
  res.writeHead(206, headers);
  const stream = fs.createReadStream(videoPath, {
    start,
    end,
  });
  stream.pipe(res);
};
