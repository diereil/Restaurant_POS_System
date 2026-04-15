const express = require("express");
const {
  createCheckoutSession,
  getCheckoutSession,
} = require("../controllers/paymentController");
const { isVerifiedUser } = require("../middlewares/tokenVerification");

const router = express.Router();

router.post("/checkout-session", isVerifiedUser, createCheckoutSession);
router.get("/checkout-session/:sessionId", isVerifiedUser, getCheckoutSession);

module.exports = router;