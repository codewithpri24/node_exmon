const statusDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.statusCode,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};
const statusValidation=(err,res)=>{
let error=Object.values(err.errors).map(el=>el.message)
let message=error.join(" ,");
res.status(400).json({
  status:"ValidationError",
  message:message
});
};
const statusProd = (err, res) => {
  res.status(err.statusCode).json({
    status: err.statusCode,
    message: err.message,
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  console.log(err.errors);
  if (process.env.NODE_ENV == "development") {
    if (err.name === "CastError") {
      res.status(400).json({
        status: "error",
        message: `${err.path}:${err.value} is invalid`,
      });
    } 
    if (err.name === "ValidationError") {
      statusValidation(err, res);
    } 
    else {
      statusDev(err, res);
    }
  } else if (process.env.NODE_ENV == "production") {
    statusProd(err, res);
  } else {
    res.status(500).json({
      status: "fail",
      message: "Something went wrong",
    });
  }
};
