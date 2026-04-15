import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTotalPrice, removeAllItems } from "../../redux/slices/cartSlice";
import {
  addOrder,
  updateTable,
  createStripeCheckoutSession,
} from "../../https/index";
import { enqueueSnackbar } from "notistack";
import { useMutation } from "@tanstack/react-query";
import { removeCustomer } from "../../redux/slices/customerSlice";
import Invoice from "../invoice/Invoice";

const Bill = () => {
  const dispatch = useDispatch();

  const customerData = useSelector((state) => state.customer);
  const cartData = useSelector((state) => state.cart);
  const total = useSelector(getTotalPrice);

  const taxRate = 5.25;
  const tax = (total * taxRate) / 100;
  const totalPriceWithTax = total + tax;

  const [paymentMethod, setPaymentMethod] = useState("");
  const [showInvoice, setShowInvoice] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const orderMutation = useMutation({
    mutationFn: (reqData) => addOrder(reqData),
    onSuccess: (resData) => {
      const { data } = resData.data;
      setOrderInfo(data);

      const tableData = {
        status: "Booked",
        orderId: data._id,
        tableId: data.table?._id || data.table,
      };

      setTimeout(() => {
        tableUpdateMutation.mutate(tableData);
      }, 500);

      enqueueSnackbar("Order Placed!", { variant: "success" });
      setShowInvoice(true);
      setIsPlacingOrder(false);
    },
    onError: (error) => {
      console.log("ORDER ERROR:", error?.response?.data || error);
      enqueueSnackbar(
        error?.response?.data?.message || "Failed to place order!",
        { variant: "error" }
      );
      setIsPlacingOrder(false);
    },
  });

  const tableUpdateMutation = useMutation({
    mutationFn: (reqData) => updateTable(reqData),
    onSuccess: () => {
      dispatch(removeCustomer());
      dispatch(removeAllItems());
    },
    onError: (error) => {
      console.log("TABLE UPDATE ERROR:", error?.response?.data || error);
    },
  });

  const validateOrder = () => {
    if (cartData.length === 0) {
      enqueueSnackbar("Your cart is empty!", { variant: "warning" });
      return false;
    }

    if (!paymentMethod) {
      enqueueSnackbar("Please select a payment method!", {
        variant: "warning",
      });
      return false;
    }

    if (
      !customerData?.customerName ||
      customerData.customerName === "Customer Name"
    ) {
      enqueueSnackbar("Customer name is missing!", { variant: "warning" });
      return false;
    }

    if (!customerData?.customerPhone) {
      enqueueSnackbar("Customer phone is missing!", { variant: "warning" });
      return false;
    }

    if (!customerData?.table?.tableId) {
      enqueueSnackbar("Table is missing!", { variant: "warning" });
      return false;
    }

    return true;
  };

  const buildOrderData = (extraData = {}) => ({
    customerDetails: {
      name: customerData.customerName,
      phone: customerData.customerPhone,
      guests: Number(customerData.guests || 1),
    },
    orderStatus: "In Progress",
    bills: {
      total: Number(total),
      tax: Number(tax),
      totalWithTax: Number(totalPriceWithTax),
    },
    items: cartData.map((item) => ({
      id: item.id || item._id || `${item.name}-${Date.now()}`,
      name: item.name,
      price: Number(item.price || 0),
      quantity: Number(item.quantity || 1),
    })),
    table: customerData.table.tableId,
    paymentMethod,
    ...extraData,
  });

  const handlePlaceOrder = async () => {
    if (isPlacingOrder) return;
    if (!validateOrder()) return;

    setIsPlacingOrder(true);

    if (paymentMethod === "Online") {
      try {
        const pendingOrder = buildOrderData({
          paymentData: {
            provider: "stripe",
            status: "pending_redirect",
          },
        });

        localStorage.setItem(
          "pendingStripeOrder",
          JSON.stringify(pendingOrder)
        );

        const { data } = await createStripeCheckoutSession({
          amount: totalPriceWithTax.toFixed(2),
          description: `Restaurant POS Order - Table ${customerData.table.tableNo}`,
          customer: {
            name: customerData.customerName,
            email: "customer@example.com",
            phone: customerData.customerPhone,
          },
        });

        if (!data?.url) {
          enqueueSnackbar("Failed to get Stripe checkout URL!", {
            variant: "error",
          });
          setIsPlacingOrder(false);
          return;
        }

        window.location.href = data.url;
      } catch (error) {
        console.log("STRIPE ERROR:", error?.response?.data || error);
        enqueueSnackbar(
          error?.response?.data?.message || "Failed to start online payment!",
          { variant: "error" }
        );
        setIsPlacingOrder(false);
      }

      return;
    }

    const orderData = buildOrderData();
    orderMutation.mutate(orderData);
  };

  return (
    <>
      <div className="px-4 py-4 bg-[#1a1a1a]">
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm text-[#ababab] font-medium">
            Items({cartData.length})
          </p>
          <h1 className="text-[#f5f5f5] text-lg font-bold">
            ₱{total.toFixed(2)}
          </h1>
        </div>

        <div className="flex items-center justify-between mt-2">
          <p className="text-sm text-[#ababab] font-medium">Tax(5.25%)</p>
          <h1 className="text-[#f5f5f5] text-lg font-bold">
            ₱{tax.toFixed(2)}
          </h1>
        </div>

        <div className="flex items-center justify-between mt-2">
          <p className="text-sm text-[#ababab] font-medium">Total With Tax</p>
          <h1 className="text-[#f5f5f5] text-lg font-bold">
            ₱{totalPriceWithTax.toFixed(2)}
          </h1>
        </div>

        {paymentMethod === "Online" && (
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm text-[#f6b100] font-medium">
              Stripe Checkout (PHP)
            </p>
            <h1 className="text-[#f6b100] text-lg font-bold">
              ₱{totalPriceWithTax.toFixed(2)}
            </h1>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            onClick={() => setPaymentMethod("Cash")}
            className={`px-4 py-3 rounded-lg text-[#ababab] font-semibold transition ${
              paymentMethod === "Cash" ? "bg-[#383737]" : "bg-[#1f1f1f]"
            }`}
            type="button"
          >
            Cash
          </button>

          <button
            onClick={() => setPaymentMethod("Online")}
            className={`px-4 py-3 rounded-lg text-[#ababab] font-semibold transition ${
              paymentMethod === "Online" ? "bg-[#383737]" : "bg-[#1f1f1f]"
            }`}
            type="button"
          >
            Online
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            className="bg-[#025cca] px-4 py-3 rounded-lg text-[#f5f5f5] font-semibold text-lg"
            type="button"
          >
            Print Receipt
          </button>

          <button
            onClick={handlePlaceOrder}
            disabled={isPlacingOrder}
            className={`bg-[#f6b100] px-4 py-3 rounded-lg text-[#1f1f1f] font-semibold text-lg ${
              isPlacingOrder ? "opacity-50 cursor-not-allowed" : ""
            }`}
            type="button"
          >
            {isPlacingOrder ? "Processing..." : "Place Order"}
          </button>
        </div>
      </div>

      {showInvoice && (
        <Invoice orderInfo={orderInfo} setShowInvoice={setShowInvoice} />
      )}
    </>
  );
};

export default Bill;