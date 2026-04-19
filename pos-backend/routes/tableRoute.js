const express = require("express");
const {
  addTable,
  getTables,
  updateTable,
  getTableByNumber,
} = require("../controllers/tableController");

const router = express.Router();
const { isVerifiedUser } = require("../middlewares/tokenVerification");

router.route("/").post(isVerifiedUser, addTable);
router.route("/").get(isVerifiedUser, getTables);

// 🔥 NEW ROUTE
router.get("/number/:tableNo", getTableByNumber);

router.route("/:id").put(isVerifiedUser, updateTable);

module.exports = router;