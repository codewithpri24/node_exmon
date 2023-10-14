const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name required"],
  },
  email: {
    type: String,
    required: [true, "Email required"],
  },
  role: {
    type: String,
    enum: ["admin", "user", "guide"],
    required: [true, "Role required"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Password required"],
  },
  passwordConfirm: {
    type: String,
    required: [true, "passwordConfirm required"],
    validate: {
      validator: function (value) {
        return value === this.password;
      },
      message: "Password Does not match",
    },
  },
  passwordChangeafter: {
    type: Date,
  },
  passwordResetToken: String,
  image: String,
  passwordResetExpire: Date,
  active: {
    type: Boolean,
    default: true,
  },
},
{
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.passCheck = async function (userPassword, dbPassword) {
  return await bcrypt.compare(userPassword, dbPassword);
};

userSchema.methods.passwordChangeaftermethod = function (JWTTimestamp) {
  if (this.passwordChangeafter) {
    const passwordChangeTimestamp = parseInt(
      this.passwordChangeafter.getTime() / 1000,
      10
    );
    if (passwordChangeTimestamp > JWTTimestamp) {
      return true;
    }
  }
  return false;
};
userSchema.methods.createResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};



const user = mongoose.model("User", userSchema);

module.exports = user;
