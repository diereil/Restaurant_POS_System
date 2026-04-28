const express = require("express");
const {
  addOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} = require("../controllers/orderController");
const { isVerifiedUser } = require("../middlewares/tokenVerification");

const router = express.Router();

// allow PUBLIC order (customer QR)
router.route("/").post(addOrder);

// keep admin routes protected
router.route("/").get(isVerifiedUser, getOrders);
router.route("/:id").get(isVerifiedUser, getOrderById);
router.route("/:id").put(isVerifiedUser, updateOrder);
router.route("/:id").delete(isVerifiedUser, deleteOrder);

module.exports = router;