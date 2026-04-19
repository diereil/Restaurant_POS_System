const createHttpError = require("http-errors");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const sendOtpEmail = require("../utils/sendOtpEmail");

// REGISTER WITH OTP
const register = async (req, res, next) => {
  try {
    const { name, phone, email, password, role } = req.body;

    if (!name || !phone || !email || !password || !role) {
      return next(createHttpError(400, "All fields required"));
    }

    const isUserPresent = await User.findOne({ email });
    if (isUserPresent) {
      return next(createHttpError(400, "User already exists"));
    }

    let safeRole = "Cashier";
    if (role === "Waiter") safeRole = "Waiter";
    if (role === "Admin") {
      return next(createHttpError(403, "Cannot register as Admin"));
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = new User({
      name,
      phone,
      email,
      password,
      role: safeRole,
      otp,
      otpExpiry: Date.now() + 5 * 60 * 1000,
      isVerified: false,
    });

    await newUser.save();
    await sendOtpEmail(email, otp);

    res.status(201).json({
      success: true,
      message: "OTP sent to email",
    });
  } catch (error) {
    next(error);
  }
};

// VERIFY OTP
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return next(createHttpError(400, "Email and OTP are required"));
    }

    const user = await User.findOne({ email });

    if (!user) {
      return next(createHttpError(404, "User not found"));
    }

    if (user.otp !== otp) {
      return next(createHttpError(400, "Invalid OTP"));
    }

    if (Date.now() > user.otpExpiry) {
      return next(createHttpError(400, "OTP expired"));
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Verified successfully",
    });
  } catch (error) {
    next(error);
  }
};

// LOGIN
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(createHttpError(400, "All fields are required!"));
    }

    const isUserPresent = await User.findOne({ email });
    if (!isUserPresent) {
      return next(createHttpError(401, "Invalid Credentials"));
    }

    if (!isUserPresent.isVerified) {
      return next(createHttpError(403, "Verify your email first"));
    }

    const isMatch = await bcrypt.compare(password, isUserPresent.password);
    if (!isMatch) {
      return next(createHttpError(401, "Invalid Credentials"));
    }

    const accessToken = jwt.sign(
      { _id: isUserPresent._id },
      config.accessTokenSecret,
      {
        expiresIn: "1d",
      }
    );

    res.cookie("accessToken", accessToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    res.status(200).json({
      success: true,
      message: "User login successfully!",
      data: isUserPresent,
      token: accessToken,
    });
  } catch (error) {
    next(error);
  }
};

const getUserData = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    res.clearCookie("accessToken");
    res.status(200).json({
      success: true,
      message: "User logout successfully!",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getUserData, logout, verifyOtp };