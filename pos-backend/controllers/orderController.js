const createHttpError = require("http-errors");
const Order = require("../models/orderModel");
const Table = require("../models/tableModel");
const { default: mongoose } = require("mongoose");

const emitOrdersUpdated = (req) => {
  const io = req.app.get("io");
  if (io) {
    io.emit("ordersUpdated");
  }
};

const addOrder = async (req, res, next) => {
  try {
    const {
      customerDetails,
      orderStatus,
      bills,
      items,
      table,
      paymentMethod,
      paymentData,
    } = req.body;

    if (!customerDetails?.name) {
      return next(createHttpError(400, "Customer name is required!"));
    }

    if (!customerDetails?.phone) {
      return next(createHttpError(400, "Customer phone is required!"));
    }

    if (!customerDetails?.guests) {
      return next(createHttpError(400, "Number of guests is required!"));
    }

    if (!bills?.total || bills?.total < 0) {
      return next(createHttpError(400, "Valid bill total is required!"));
    }

    if (typeof bills?.tax !== "number") {
      return next(createHttpError(400, "Valid tax is required!"));
    }

    if (!bills?.totalWithTax || bills?.totalWithTax < 0) {
      return next(createHttpError(400, "Valid total with tax is required!"));
    }

    if (!Array.isArray(items) || items.length === 0) {
      return next(createHttpError(400, "Order items are required!"));
    }

    if (!table) {
      return next(createHttpError(400, "Table is required!"));
    }

    if (!mongoose.Types.ObjectId.isValid(table)) {
      return next(createHttpError(400, "Invalid table id!"));
    }

    const existingTable = await Table.findById(table);
    if (!existingTable) {
      return next(createHttpError(404, "Table not found!"));
    }

    if (paymentData?.stripe_session_id) {
      const existingOrder = await Order.findOne({
        "paymentData.stripe_session_id": paymentData.stripe_session_id,
      }).populate("table");

      if (existingOrder) {
        return res.status(200).json({
          success: true,
          message: "Order already exists!",
          data: existingOrder,
        });
      }
    }

    const cleanedItems = items.map((item) => ({
      id: item.id ? String(item.id) : "",
      name: item.name || "Unnamed Item",
      price: Number(item.price || 0),
      quantity: Number(item.quantity || 1),
    }));

    const order = new Order({
      customerDetails: {
        name: customerDetails.name,
        phone: customerDetails.phone,
        guests: Number(customerDetails.guests),
      },
      orderStatus: orderStatus || "In Progress",
      bills: {
        total: Number(bills.total),
        tax: Number(bills.tax),
        totalWithTax: Number(bills.totalWithTax),
      },
      items: cleanedItems,
      table,
      paymentMethod: paymentMethod || "Cash",
      paymentData: paymentData || {},
    });

    await order.save();

    const populatedOrder = await Order.findById(order._id).populate("table");

    emitOrdersUpdated(req);

    return res.status(201).json({
      success: true,
      message: "Order created!",
      data: populatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createHttpError(404, "Invalid id!"));
    }

    const order = await Order.findById(id).populate("table");

    if (!order) {
      return next(createHttpError(404, "Order not found!"));
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate("table").sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

const updateOrder = async (req, res, next) => {
  try {
    const { orderStatus } = req.body;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createHttpError(404, "Invalid id!"));
    }

    if (!orderStatus) {
      return next(createHttpError(400, "Order status is required!"));
    }

    const allowedStatuses = ["In Progress", "Ready", "Completed", "Canceled"];
    if (!allowedStatuses.includes(orderStatus)) {
      return next(createHttpError(400, "Invalid order status!"));
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { orderStatus },
      { new: true }
    ).populate("table");

    if (!order) {
      return next(createHttpError(404, "Order not found!"));
    }

    emitOrdersUpdated(req);

    res.status(200).json({
      success: true,
      message: "Order updated",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

const deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createHttpError(404, "Invalid id!"));
    }

    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return next(createHttpError(404, "Order not found!"));
    }

    emitOrdersUpdated(req);

    res.status(200).json({
      success: true,
      message: "Order deleted successfully!",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addOrder,
  getOrderById,
  getOrders,
  updateOrder,
  deleteOrder,
};