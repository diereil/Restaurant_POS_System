import React, { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getOrders } from "../../https";
import socket from "../../socket";

const Payments = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const update = () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    };

    socket.on("ordersUpdated", update);
    socket.on("new-order", update);

    return () => {
      socket.off("ordersUpdated", update);
      socket.off("new-order", update);
    };
  }, [queryClient]);

  const { data: resData } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  });

  const orders = resData?.data?.data || [];

  // 🔥 ONLY COMPLETED ORDERS
  const completedOrders = orders.filter(
    (o) => o.orderStatus === "Completed"
  );

  // 🔥 FILTER
  const filteredOrders = completedOrders.filter((order) => {
    if (filter === "cash") return order.paymentMethod === "Cash";
    if (filter === "online") return order.paymentMethod === "Online";
    return true;
  });

  // 🔥 METRICS
  const stats = useMemo(() => {
    const totalRevenue = completedOrders.reduce(
      (sum, o) => sum + (o.bills?.totalWithTax || 0),
      0
    );

    const cashTotal = completedOrders
      .filter((o) => o.paymentMethod === "Cash")
      .reduce((sum, o) => sum + (o.bills?.totalWithTax || 0), 0);

    const onlineTotal = completedOrders
      .filter((o) => o.paymentMethod === "Online")
      .reduce((sum, o) => sum + (o.bills?.totalWithTax || 0), 0);

    return {
      totalRevenue,
      cashTotal,
      onlineTotal,
      count: completedOrders.length,
    };
  }, [completedOrders]);

  return (
    <div className="container mx-auto px-6 py-6 text-white">

      <h1 className="text-2xl font-bold mb-6">Payments & Sales</h1>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#2e4a40] p-4 rounded">
          <p>Total Revenue</p>
          <h2 className="text-2xl font-bold">
            ₱{stats.totalRevenue.toFixed(2)}
          </h2>
        </div>

        <div className="bg-[#4a452e] p-4 rounded">
          <p>Cash Total</p>
          <h2 className="text-2xl font-bold">
            ₱{stats.cashTotal.toFixed(2)}
          </h2>
        </div>

        <div className="bg-[#2e3a4a] p-4 rounded">
          <p>Online Total</p>
          <h2 className="text-2xl font-bold">
            ₱{stats.onlineTotal.toFixed(2)}
          </h2>
        </div>

        <div className="bg-[#4a2e2e] p-4 rounded">
          <p>Completed Orders</p>
          <h2 className="text-2xl font-bold">{stats.count}</h2>
        </div>
      </div>

      {/* FILTER */}
      <div className="flex gap-3 mb-4">
        {["all", "cash", "online"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded ${
              filter === f
                ? "bg-[#F6B100] text-black"
                : "bg-[#333]"
            }`}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div className="bg-[#1a1a1a] rounded-lg overflow-hidden">

        <div className="max-h-[350px] overflow-y-auto">
          <table className="w-full text-left">
            <thead className="bg-[#262626] sticky top-0">
              <tr>
                <th className="p-3">Order</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Table</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Total</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order) => (
                <tr
                  key={order._id}
                  className="border-b border-gray-700 hover:bg-[#222]"
                >
                  <td className="p-3">#{order._id.slice(-6)}</td>
                  <td className="p-3">
                    {order.customerDetails?.name || "Guest"}
                  </td>
                  <td className="p-3">
                    Table {order.table?.tableNo}
                  </td>

                  {/* PAYMENT BADGE */}
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded text-sm ${
                        order.paymentMethod === "Cash"
                          ? "bg-green-600"
                          : "bg-blue-600"
                      }`}
                    >
                      {order.paymentMethod}
                    </span>
                  </td>

                  <td className="p-3 font-semibold">
                    ₱{order.bills?.totalWithTax?.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* EMPTY STATE */}
          {filteredOrders.length === 0 && (
            <p className="text-center py-6 text-gray-400">
              No payments found
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payments;