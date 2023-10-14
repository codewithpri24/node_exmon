const fs = require("fs");
const path = require("path");
const Product = require("./../models/productModel.js");


// Use of Middleware Start-------
exports.topfiveProducts = (req, res, next) => {
  req.query.sort="-price";
  req.query.limit ="5";
next();
};
// Use of Middleware End-------

exports.homePage = (req, res) => {
  res.render("home");
  console.log(__dirname);
};
exports.allProducts = async (req, res) => {
  try {
    let query = Product.find();
    console.log(query);
    //Filtering---------
    // let query = await Product.findOne(req.query);
    // res.status(200).json({ query });

    //Advanced Filtering---------
    // let data = JSON.stringify(req.query);
    // data = data.replace(/(\b{gte|gt|lt|lte}\b)/g, (match) => `$${match}`);
    // let query = Product.find(JSON.parse(data));
    // console.log(query);
    //Sorting start----------------------------------
    if (req.query.sort) {
      const sort = req.query.sort.split(",").join(" ");
      query = query.sort(sort);
      console.log(sort);
    }
    //Sorting end----------------------------------
    //Limiting  start---------
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    }
    //Limiting  end---------
    //pagination start---------

    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      const numRows = await Product.countDocuments();
      if (skip >= numRows) throw new Error("Page doesn't exist");
    }
    // pagination end---------
    query = await query;
    res.status(200).json({ query });

    // let query = await Product.find();
    // res.status(200).json({ query });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }

  //Statis json file --------------------------------
  //   if (!products) {
  //     return res
  //       .status(404)
  //       .json({ status: "fail", message: "Invalid products" });
  //   }
  // res.status(200);
  // res.render('products',{products:products});
};
exports.productbyId = async (req, res) => {
  try {
    const singleProduct = await Product.findById(req.params.id);
    res.status(200).json({
      status: "success",
      data: { singleProduct },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }

  // Statis json file --------------------------------
  // const product=await products.find(el=>el.id==req.params.id);
  // if(!product){
  //     return  res.status(404).json(
  //         {"status":"fail",
  //         "message":"Invalid product"}
  //     )
  // }
  // res.status(200);
  // res.render('product',{product:product});
};
exports.createProduct = (req, res) => {
  console.log(req.body);
  try {
    const productList = Product.create(req.body);
    console.log(productList);
  } catch (err) {
    console.log(err);
  }

  //Normal data saved----------------------------------------------------------------
  // newId=parseInt(products[products.length-1].id)+1;
  // newProduct=Object.assign({id:newId},req.body);
  // products.push(newProduct);
  // fs.writeFile('./../express/data.json',JSON.stringify(products),err=>{
  //     console.log(err);
  // })
  res.send("Created");
};
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).send({
      status: 200,
      data: product,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    res.status(200).json(product);
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};
