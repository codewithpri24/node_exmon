var express = require("express");
const process = require("node:process");
const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitizer = require("express-mongo-sanitize");
const xss=require("xss-clean");
const hpp=require("hpp");
const cookieParser = require('cookie-parser');
const Product = require("./models/productModel.js");
const ErrorConstruct = require("./controller/ErrorConstruct.js");
const AppError = require("./controller/appError.js");
const session = require('express-session');
var flash = require('connect-flash');
const app = express();

//set security HTTP headers ----
// app.use(helmet({
//   crossOriginResourcePolicy: false,
// }));

//set View engine -------
app.set("view engine", "ejs");
app.set("views", "./views");

//set statisc files --------
app.use(express.static(path.join(`${__dirname}`, "assets/css")));
app.use('/js',express.static(path.join(__dirname, "assets/js")));
app.use('/files', express.static(path.join(__dirname, 'assets/files')))

//Limit request from same API -----
const rate = rateLimit({
  max: 100,
  windowMs: 60 * 1000,
  message: "Too many requests, please try again later",
});
app.use("/", rate);

//Body parser, reading data from body to req.body----
app.use(express.json());
//cookie parser---
app.use(cookieParser());
//Set security from any NoSql query injection---
app.use(mongoSanitizer());

//set security from XSS-----
app.use(xss());

//set security from same filed in sorting---
app.use(hpp());

dotenv.config({ path: "./config.env" });

app.use(session({
  secret: 'it is my secret key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 30000 }
}));
app.use(flash());

//set database ----
// const DB = process.env.DATABASE.replace(
//   "<password>",
//   process.env.DATABASE_PASSWORD
// );

const DB = process.env.DATABASE_LOCAL;

mongoose
  .connect(DB,{
    useNewUrlParser: true,
  useUnifiedTopology: true
  })
  .then((con) => {
     //console.log(con.connection);
    console.log("Database connection established");
  })
  .catch((err) => {
    console.log(err, "Database connection error");
  });

// const productList = new Product({
//   name: "Banana",
//   price: 3,
//   description: "tasty",
// });

// productList
//   .save()
//   .then(() => {
//     console.log("Product saved");
//   })
//   .catch((err) => {
//     console.log(err);
//   });
const port = process.env.PORT || 3000;

// app.get('/',homePage);
// app.get('/products',allProducts);
// app.get('/product/:id',productbyId);

const productRoute = require("./routes/productRoute");
const reviewsRoute = require("./routes/reviewsRoute");
const adminRoute = require("./routes/adminRoute");

app.use("/", productRoute);
app.use("/reviews", reviewsRoute);
app.use("/admin", adminRoute);
app.all("*", (req, res, next) => {
  const err = new ErrorConstruct("Page not found please go back to Home", 404);
  next(err);
});
app.use(AppError);

//Error handling middleware
// const AppError=app.use((err, req, res, next) => {
//   err.statusCode = err.statusCode||500;
//   res.status(err.statusCode).json({
//     status:err.statusCode,
//     message: err.message});
// });
const server = app.listen(port);

//To handle Any Unhandled Errors-------
process.on("unhandledRejection", (err) => {
  console.log("Unhandled rejection.shutting down....");
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});
process.on("uncaughtExceptions", (err) => {
  console.log("Unhandled rejection.shutting down....");
  console.log(err.message);
  server.close(() => {
    process.exit(1);// 1 for uncaught fatal error  
  });
});
