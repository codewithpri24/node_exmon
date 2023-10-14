const Usersmodel = require("./../models/loginModel.js");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { response } = require("express");
const catchError = require(`${__dirname}/../errors/catchError`);
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "assets/files");
  },
  filename: function (req, file, cb) {
    const ext = file.mimetype.split("/")[1];
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "." + ext);
  },
});

const upload = multer({ storage: storage });

let req = {};
let title = {};

const signup = (id) => {
  return jwt.sign({ id: id }, "my-secret-code");
};
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.userPhoto = upload.single("upload_file");
exports.createUser = async (req, res, next) => {
  if (
    !req.body.name ||
    !req.body.email ||
    !req.body.password ||
    !req.body.passwordConfirm
  ) {
    let error = "Fill all blank fields";
    res.send("signin");
  } else {
    const users = await Usersmodel.create({
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      passwordChangeafter: req.body.passwordChangeafter,
      image: req.file.filename,
    });
    // const token = signup(users._id);
    // const cookieOptions = {
    //   expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    //   httpOnly: true,
    // };
    // res.cookie("jwt", token, cookieOptions);
    req.flash("message", "Account has been created successfully");
    res.redirect("/login");
    // .json({ message: "User created", users: users, token: token });
  }
};
exports.userSignup = (req, res) => {
  res.render("signin");
};

exports.getUser = async (req, res) => {
  const allUsers = await Usersmodel.find();
  res.status(200).json({ users: allUsers });
};
exports.loginpage = async (req, res) => {
  if (!req.cookies.jwt) {
    res.render("loginpage", { msg: req.flash("message"), type: "success" });
  } else {
    res.redirect("/login");
  }
};
exports.login = async (req, res, next) => {
  const user = await Usersmodel.findOne({ email: req.body.email }).select(
    "password"
  );

  if (!user || !req.body.password)
    return next(new Error("Invalid User and Password", 404));

  if (user) {
    const passdata = await user.passCheck(req.body.password, user.password);

    if (passdata) {
      const token = signup(user._id);

      if (token) {
        const loginUser = await Usersmodel.find({ _id: user._id });

        res.cookie("jwt", token);
        res.redirect("/");
      } else {
        res.render("loginpage", { msg: "Login failed", type: "danger" });
      }
    } else {
      res.render("loginpage", {
        msg: "Login failed. Email and password do not match",
        type: "danger",
      });
    }
  }
};

exports.logout = (req, res) => {
  res.clearCookie("jwt");
  res.render("loginpage", { msg: "You have been Log out", type: "success" });
};
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    req.message = "You are not logged in";
    res.render("loginpage", { msg: req.message, type: "danger" });
  }
  try {
    //2)token varification----
    const decode = await jwt.verify(token, "my-secret-code");

    //3)Check user still exist or not----
    const freshUser = await Usersmodel.findById(decode.id);
    if (!freshUser) return next(new Error("User not found"));

    //4)check if user changed password after the token was issued
    if (freshUser.passwordChangeaftermethod(decode.iat))
      return next(new Error("Password changed after token is issued"));

    //5)When all ok-----
    req.currentUser = freshUser;
    next();
  } catch (e) {
    res.status(401).json({ message: e });
  }
};

exports.forgetPassword = async (req, res, next) => {
  const user = await Usersmodel.findOne({ email: req.body.email });
  if (!user) return next(new Error("Not a valid user"));
  const resetToken = user.createResetToken();
  //Here need to send the token with reset url to user email account--
  //but currently o/p showing in console
  user.save({ validateBeforeSave: false });
};
exports.resetPassword = async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await Usersmodel.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpire: { $gt: Date.now() },
  });
  if (!user) return next(new Error("Invalid User or Toekn expired"));
  try {
    user.password = req.body.password;
    (user.passwordConfirm = req.body.passwordConfirm),
      (user.passwordResetExpire = undefined);
    user.passwordResetToken = undefined;

    user.save();
    const token = signup(user._id);
    res.status(200).json({ message: "User created", user: user, token: token });
  } catch (e) {
    return next(new Error(e));
  }
};
exports.UpdatePassword = async (req, res, next) => {
  const user = await Usersmodel.findOne({ email: req.body.email }).select(
    "password"
  );
  if (!user) return next(new Error("User not found"));
  const result = await user.passCheck(req.body.oldpassword, user.password);
  if (!result) return next(new Error("Pass check failed"));
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  res
    .status(200)
    .json({ success: true, message: "password updated successfully" });
};

exports.myProfile = async (req, res) => {
  const user = await Usersmodel.findById({ _id: req.currentUser._id });
  res.render("profile", {
    user: user,
    title: "My Profile",
    data: req.currentUser,
  });
};
exports.editForm = (req, res) => {
  res.render("editForm", { data: req.currentUser, title: "Profile Edit" });
};
exports.updateMe = catchError(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new Error("To change the password please hit the updatepassword url")
    );
  filteredBody = {
    name: req.body.name,
    email: req.body.email,
    image: req.file.filename,
  };
  const user = await Usersmodel.findByIdAndUpdate(
    req.currentUser._id,
    filteredBody,
    { new: true, runValidators: true }
  );
  res.render("profile", {
    user: user,
    title: "My Profile",
    data: req.currentUser,
  });
});
exports.deleteMe = catchError(async (req, res, next) => {
  await Usersmodel.findByIdAndUpdate(req.currentUser._id, { active: false });
  res.status(204).json({ message: "Deleted" });
});
