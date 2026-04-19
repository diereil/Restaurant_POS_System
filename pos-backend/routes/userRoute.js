const express = require("express");
const {
  register,
  login,
  getUserData,
  logout,
  verifyOtp,
} = require("../controllers/userController");
const { isVerifiedUser } = require("../middlewares/tokenVerification");

const router = express.Router();

// Authentication Routes
router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.post("/logout", isVerifiedUser, logout);

router.get("/", isVerifiedUser, getUserData);

module.exports = router;