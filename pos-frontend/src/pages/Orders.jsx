import React, { useState, useEffect, useRef } from "react";
import BottomNav from "../components/shared/BottomNav";
import OrderCard from "../components/orders/OrderCard";
import BackButton from "../components/shared/BackButton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getOrders,
  updateOrderStatus,
  deleteOrder,
  getOrderById,
} from "../https/index";
import { enqueueSnackbar } from "notistack";
import socket from "../socket";
import { useReactToPrint } from "react-to-print";
import Receipt from "../components/receipt/Receipt";

const Orders = () => {
  const [status, setStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const queryClient = useQueryClient();
  const printRef = useRef(null);

  useEffect(() => {
    document.title = "POS | Orders";
  }, []);

  useEffect(() => {
    const handleOrdersUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    };

    socket.on("ordersUpdated", handleOrdersUpdated);
    socket.on("new-order", handleOrdersUpdated);

    return () => {
      socket.off("ordersUpdated", handleOrdersUpdated);
      socket.off("new-order", handleOrdersUpdated);
    };
  }, [queryClient]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: selectedOrder
      ? `Receipt-${selectedOrder._id.slice(-6)}`
      : "Receipt",
  });

  const { data: resData, isError, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => await getOrders(),
  });

  useEffect(() => {
    if (isError) {
      enqueueSnackbar("Something went wrong!", { variant: "error" });
    }
  }, [isError]);

  const allOrders = resData?.data?.data || [];

  const filteredOrders = allOrders.filter((order) => {
    if (status === "all") return true;
    if (status === "progress") return order.orderStatus === "In Progress";
    if (status === "ready") return order.orderStatus === "Ready";
    if (status === "completed") return order.orderStatus === "Completed";
    if (status === "canceled") return order.orderStatus === "Canceled";
    return true;
  });

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus({ orderId, orderStatus: newStatus });
      enqueueSnackbar(`Order marked as ${newStatus}`, {
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    } catch (error) {
      enqueueSnackbar("Failed to update order", { variant: "error" });
    }
  };

  const handleDeleteOrder = async (orderId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this order?"
    );
    if (!confirmed) return;

    try {
      await deleteOrder(orderId);
      enqueueSnackbar("Order deleted successfully!", {
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    } catch (error) {
      enqueueSnackbar("Failed to delete order", { variant: "error" });
    }
  };

  const handlePrintReceipt = async (order) => {
    try {
      let latestOrder = order;

      if (order?.isNewOrder) {
        await updateOrderStatus({
          orderId: order._id,
          isNewOrder: false,
        });

        const refreshed = await getOrderById(order._id);
        latestOrder = refreshed?.data?.data || order;

        queryClient.invalidateQueries({ queryKey: ["orders"] });
        queryClient.invalidateQueries({ queryKey: ["tables"] });
      }

      setSelectedOrder(latestOrder);

      setTimeout(() => {
        handlePrint();
      }, 200);
    } catch (error) {
      enqueueSnackbar("Failed to print receipt", { variant: "error" });
    }
  };

  return (
    <section className="bg-[#1f1f1f] min-h-screen pb-24">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between px-6 py-4 gap-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-[#f5f5f5] text-2xl font-bold tracking-wider">
            Orders
          </h1>
        </div>

        <div className="flex flex-wrap gap-3">
          {[
            { key: "all", label: "All" },
            { key: "progress", label: "In Progress" },
            { key: "ready", label: "Ready" },
            { key: "completed", label: "Completed" },
            { key: "canceled", label: "Canceled" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setStatus(item.key)}
              className={`rounded-lg px-4 py-2 font-semibold transition ${
                status === item.key
                  ? "bg-[#383838] text-white"
                  : "text-[#ababab] hover:bg-[#2c2c2c]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6">
        {isLoading ? (
          <p className="text-gray-400">Loading orders...</p>
        ) : filteredOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="bg-[#202020] rounded-xl p-3 border border-[#2d2d2d]"
              >
                <OrderCard order={order} />

                <div className="flex flex-wrap gap-2 mt-3">
                  {order.orderStatus === "In Progress" && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(order._id, "Ready")}
                        className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-white text-sm font-medium"
                      >
                        Mark Ready
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(order._id, "Canceled")}
                        className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-white text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  {order.orderStatus === "Ready" && (
                    <>
                      <button
                        onClick={() =>
                          handleUpdateStatus(order._id, "Completed")
                        }
                        className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-white text-sm font-medium"
                      >
                        Mark Completed
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(order._id, "Canceled")}
                        className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-white text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => handlePrintReceipt(order)}
                    className="bg-yellow-500 hover:bg-yellow-600 px-3 py-2 rounded text-black text-sm font-medium"
                  >
                    Print Receipt
                  </button>

                  {(order.orderStatus === "Completed" ||
                    order.orderStatus === "Canceled") && (
                    <button
                      onClick={() => handleDeleteOrder(order._id)}
                      className="bg-red-700 hover:bg-red-800 px-3 py-2 rounded text-white text-sm font-medium"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No orders available</p>
        )}
      </div>

      <div className="fixed -left-[9999px] top-0">
        {selectedOrder && <Receipt ref={printRef} order={selectedOrder} />}
      </div>

      <BottomNav />
    </section>
  );
};

export default Orders;