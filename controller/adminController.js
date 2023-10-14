const Product = require("./../models/productModel.js");
const Apifeaturs = require(`${__dirname}/../api/Apifeaturs`);
const catchError = require(`${__dirname}/../errors/catchError`);

const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "assets/files/products");
  },
  filename: function (req, file, cb) {
    const ext = file.mimetype.split("/")[1];
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-product" + uniqueSuffix + "." + ext);
  },
});
const upload = multer({ storage: storage });
exports.productPhoto = upload.single("upload_file");

exports.addProducts = (req, res) => {
  res.render("add_products");
};

exports.createProduct = catchError(async (req, res) => {
  const productList = await Product.create({
    name: req.body.name,
    email: req.body.email,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
    image: req.file.filename,
  });
  //console.log(productList);
  res.status(200).send({
    message: "Product created successfully",
  });

  // exports.createProduct = async (req, res) => {
  //   console.log(req.body);
  //   try {
  //     const productList = await Product.create(req.body);
  //     res.status(200).send({
  //       message: "Product created successfully",
  //     });
  //   } catch (err) {
  //     res.status(404).json({
  //       status: "fail",
  //       message: err.message,
  //     });
  //   }

  //Normal data saved----------------------------------------------------------------
  // newId=parseInt(products[products.length-1].id)+1;
  // newProduct=Object.assign({id:newId},req.body);
  // products.push(newProduct);
  // fs.writeFile('./../express/data.json',JSON.stringify(products),err=>{
  //     console.log(err);
  // })
  //res.send("Created");
});
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.currentUser.role)) {
      return next(new Error("You are not allowed"));
    }
    next();
  };
};
exports.restrictToAdmin = (req, res, next) => {
  console.log(req.currentUser.role);
  if (req.currentUser.role !== "admin") {
    res.clearCookie("jwt");
    res.render("loginpage", {
      msg: "You are not allowed to add products.",
      type: "danger",
    });
  }
  next();
};
