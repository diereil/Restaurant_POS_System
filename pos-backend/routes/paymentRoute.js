const express = require("express");
const {
  createCheckoutSession,
  getCheckoutSession,
} = require("../controllers/paymentController");


const router = express.Router();

router.post("/checkout-session", createCheckoutSession);
router.get("/checkout-session/:sessionId", getCheckoutSession);

module.exports = router;