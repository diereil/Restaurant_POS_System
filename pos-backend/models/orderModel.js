const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customerDetails: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      guests: { type: Number, required: true },
    },

    orderStatus: {
      type: String,
      enum: ["In Progress", "Ready", "Completed", "Canceled"],
      default: "In Progress",
      required: true,
    },

    orderDate: {
      type: Date,
      default: Date.now,
    },

    bills: {
      total: { type: Number, required: true },
      tax: { type: Number, required: true },
      totalWithTax: { type: Number, required: true },
    },

    items: {
      type: Array,
      default: [],
    },

    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["Cash", "Online"],
      default: "Cash",
    },

    paymentData: {
      provider: {
        type: String,
        default: null,
      },
      status: {
        type: String,
        default: "pending",
      },
      stripe_session_id: {
        type: String,
        default: null,
      },
    },

    orderSource: {
      type: String,
      enum: ["staff", "customer"],
      default: "staff",
    },

    // 🔥 NEW FLAG
    isNewOrder: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);