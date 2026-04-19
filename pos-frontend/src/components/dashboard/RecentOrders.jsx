import React, { useEffect } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { getOrders, updateOrderStatus } from "../../https/index";
import { formatDateAndTime } from "../../utils";
import socket from "../../socket";

const RecentOrders = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleOrdersUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    };

    socket.on("ordersUpdated", handleOrdersUpdated);
    socket.on("new-order", handleOrdersUpdated);

    return () => {
      socket.off("ordersUpdated", handleOrdersUpdated);
      socket.off("new-order", handleOrdersUpdated);
    };
  }, [queryClient]);

  const handleStatusChange = ({ orderId, orderStatus }) => {
    orderStatusUpdateMutation.mutate({ orderId, orderStatus });
  };

  const orderStatusUpdateMutation = useMutation({
    mutationFn: ({ orderId, orderStatus }) =>
      updateOrderStatus({ orderId, orderStatus }),

    onSuccess: () => {
      enqueueSnackbar("Order status updated!", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },

    onError: () => {
      enqueueSnackbar("Failed to update!", { variant: "error" });
    },
  });

  const { data: resData, isLoading, isError } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    placeholderData: keepPreviousData,
  });

  if (isLoading) {
    return <div className="text-white p-6">Loading orders...</div>;
  }

  if (isError) {
    return <div className="text-red-500 p-6">Error loading orders</div>;
  }

  const orders = resData?.data?.data || [];

  return (
    <div className="container mx-auto bg-[#262626] p-4 rounded-lg">
      <h2 className="text-[#f5f5f5] text-xl font-semibold mb-4">
        Recent Orders
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-[#f5f5f5]">
          <thead className="bg-[#333] text-[#ababab]">
            <tr>
              <th className="p-3">Order ID</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date & Time</th>
              <th className="p-3">Items</th>
              <th className="p-3">Table</th>
              <th className="p-3">Total</th>
              <th className="p-3 text-center">Payment</th>
            </tr>
          </thead>

          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr
                  key={order._id}
                  className="border-b border-gray-600 hover:bg-[#333]"
                >
                  <td className="p-4">#{order._id.slice(-6)}</td>

                  <td className="p-4">
                    {order.customerDetails?.name || "Customer"}
                  </td>

                  <td className="p-4">
                    <select
                      value={order.orderStatus}
                      onChange={(e) =>
                        handleStatusChange({
                          orderId: order._id,
                          orderStatus: e.target.value,
                        })
                      }
                      className="bg-[#1a1a1a] p-2 rounded text-white"
                    >
                      <option value="In Progress">In Progress</option>
                      <option value="Ready">Ready</option>
                      <option value="Completed">Completed</option>
                      <option value="Canceled">Canceled</option>
                    </select>
                  </td>

                  <td className="p-4">{formatDateAndTime(order.orderDate)}</td>

                  <td className="p-4">{order.items?.length || 0}</td>

                  <td className="p-4">Table {order.table?.tableNo || "N/A"}</td>

                  <td className="p-4">
                    ₱{order.bills?.totalWithTax?.toFixed(2) || "0.00"}
                  </td>

                  <td className="p-4 text-center">
                    {order.paymentMethod || "N/A"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-4 text-center" colSpan="8">
                  No orders yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOrders;