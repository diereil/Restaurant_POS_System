const Table = require("../models/tableModel");
const createHttpError = require("http-errors");
const mongoose = require("mongoose");

// ➕ ADD TABLE
const addTable = async (req, res, next) => {
  try {
    const { tableNo, seats } = req.body;

    if (!tableNo) {
      return next(createHttpError(400, "Please provide table No!"));
    }

    const isTablePresent = await Table.findOne({ tableNo });

    if (isTablePresent) {
      return next(createHttpError(400, "Table already exist!"));
    }

    const newTable = new Table({ tableNo, seats });
    await newTable.save();

    res.status(201).json({
      success: true,
      message: "Table added!",
      data: newTable,
    });
  } catch (error) {
    next(error);
  }
};

// 📦 GET TABLES
const getTables = async (req, res, next) => {
  try {
    const tables = await Table.find().populate({
      path: "currentOrder",
      select: "customerDetails",
    });

    res.status(200).json({ success: true, data: tables });
  } catch (error) {
    next(error);
  }
};

// 🔥 NEW: GET TABLE BY tableNo (IMPORTANT)
const getTableByNumber = async (req, res, next) => {
  try {
    const { tableNo } = req.params;

    const table = await Table.findOne({ tableNo });

    if (!table) {
      return next(createHttpError(404, "Table not found!"));
    }

    res.status(200).json({
      success: true,
      data: table,
    });
  } catch (error) {
    next(error);
  }
};

// 🔄 UPDATE TABLE
const updateTable = async (req, res, next) => {
  try {
    const { status, orderId } = req.body;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createHttpError(404, "Invalid id!"));
    }

    let updateData = {};

    if (status === "Available") {
      updateData = {
        status: "Available",
        currentOrder: null,
      };
    } else {
      updateData = {
        status,
        currentOrder: orderId || null,
      };
    }

    const table = await Table.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!table) {
      return next(createHttpError(404, "Table not found!"));
    }

    res.status(200).json({
      success: true,
      message: "Table updated!",
      data: table,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addTable,
  getTables,
  updateTable,
  getTableByNumber, // ✅ export this
};