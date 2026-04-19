import React, { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getOrders, getTables } from "../../https";
import socket from "../../socket";

const Metrics = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleRealtimeUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    };

    socket.on("ordersUpdated", handleRealtimeUpdate);
    socket.on("new-order", handleRealtimeUpdate);

    return () => {
      socket.off("ordersUpdated", handleRealtimeUpdate);
      socket.off("new-order", handleRealtimeUpdate);
    };
  }, [queryClient]);

  const { data: ordersRes, isLoading: ordersLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  });

  const { data: tablesRes, isLoading: tablesLoading } = useQuery({
    queryKey: ["tables"],
    queryFn: getTables,
  });

  const orders = ordersRes?.data?.data || [];
  const tables = tablesRes?.data?.data || [];

  const metrics = useMemo(() => {
    const totalRevenue = orders
      .filter((order) => order.orderStatus === "Completed")
      .reduce((sum, order) => sum + (order.bills?.totalWithTax || 0), 0);

    const inProgressOrders = orders.filter(
      (order) => order.orderStatus === "In Progress"
    ).length;

    const completedOrders = orders.filter(
      (order) => order.orderStatus === "Completed"
    ).length;

    const bookedTables = tables.filter(
      (table) => table.status === "Booked"
    ).length;

    const availableTables = tables.filter(
      (table) => table.status === "Available"
    ).length;

    const totalOrders = orders.length;

    const itemMap = {};

    orders.forEach((order) => {
      order.items?.forEach((item) => {
        if (!itemMap[item.name]) {
          itemMap[item.name] = 0;
        }
        itemMap[item.name] += item.quantity || 0;
      });
    });

    const sortedItems = Object.entries(itemMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    return {
      totalRevenue,
      inProgressOrders,
      completedOrders,
      bookedTables,
      availableTables,
      totalOrders,
      topItems: sortedItems,
    };
  }, [orders, tables]);

  const loading = ordersLoading || tablesLoading;

  return (
    <div className="container mx-auto py-2 px-6 md:px-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-semibold text-[#f5f5f5] text-xl">
            Overall Performance
          </h2>
          <p className="text-sm text-[#ababab]">
            Live restaurant performance based on actual orders and tables.
          </p>
        </div>

        <button className="flex items-center gap-1 px-4 py-2 rounded-md text-[#f5f5f5] bg-[#1a1a1a]">
          Live Data
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="shadow-sm rounded-lg p-4 bg-[#2e4a40]">
          <p className="font-medium text-xs text-[#f5f5f5]">Total Revenue</p>
          <p className="mt-1 font-semibold text-2xl text-[#f5f5f5]">
            {loading ? "..." : `₱${metrics.totalRevenue.toFixed(2)}`}
          </p>
        </div>

        <div className="shadow-sm rounded-lg p-4 bg-[#4a452e]">
          <p className="font-medium text-xs text-[#f5f5f5]">In Progress Orders</p>
          <p className="mt-1 font-semibold text-2xl text-[#f5f5f5]">
            {loading ? "..." : metrics.inProgressOrders}
          </p>
        </div>

        <div className="shadow-sm rounded-lg p-4 bg-[#2e3a4a]">
          <p className="font-medium text-xs text-[#f5f5f5]">Completed Orders</p>
          <p className="mt-1 font-semibold text-2xl text-[#f5f5f5]">
            {loading ? "..." : metrics.completedOrders}
          </p>
        </div>

        <div className="shadow-sm rounded-lg p-4 bg-[#4a2e2e]">
          <p className="font-medium text-xs text-[#f5f5f5]">Total Orders</p>
          <p className="mt-1 font-semibold text-2xl text-[#f5f5f5]">
            {loading ? "..." : metrics.totalOrders}
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-between mt-12">
        <div>
          <h2 className="font-semibold text-[#f5f5f5] text-xl">
            Table & Item Insights
          </h2>
          <p className="text-sm text-[#ababab]">
            Current table availability and most ordered dishes.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="shadow-sm rounded-lg p-4 bg-[#1f3b57]">
            <p className="font-medium text-xs text-[#f5f5f5]">Booked Tables</p>
            <p className="mt-1 font-semibold text-2xl text-[#f5f5f5]">
              {loading ? "..." : metrics.bookedTables}
            </p>
          </div>

          <div className="shadow-sm rounded-lg p-4 bg-[#22543d]">
            <p className="font-medium text-xs text-[#f5f5f5]">Available Tables</p>
            <p className="mt-1 font-semibold text-2xl text-[#f5f5f5]">
              {loading ? "..." : metrics.availableTables}
            </p>
          </div>

          {loading ? (
            <>
              <div className="shadow-sm rounded-lg p-4 bg-[#3a2e4a]">
                <p className="font-medium text-xs text-[#f5f5f5]">Top Item 1</p>
                <p className="mt-1 font-semibold text-2xl text-[#f5f5f5]">...</p>
              </div>
              <div className="shadow-sm rounded-lg p-4 bg-[#4a3d2e]">
                <p className="font-medium text-xs text-[#f5f5f5]">Top Item 2</p>
                <p className="mt-1 font-semibold text-2xl text-[#f5f5f5]">...</p>
              </div>
            </>
          ) : (
            <>
              <div className="shadow-sm rounded-lg p-4 bg-[#3a2e4a]">
                <p className="font-medium text-xs text-[#f5f5f5]">Top Item 1</p>
                <p className="mt-1 font-semibold text-2xl text-[#f5f5f5]">
                  {metrics.topItems[0]
                    ? `${metrics.topItems[0][0]} (${metrics.topItems[0][1]})`
                    : "No data"}
                </p>
              </div>

              <div className="shadow-sm rounded-lg p-4 bg-[#4a3d2e]">
                <p className="font-medium text-xs text-[#f5f5f5]">Top Item 2</p>
                <p className="mt-1 font-semibold text-2xl text-[#f5f5f5]">
                  {metrics.topItems[1]
                    ? `${metrics.topItems[1][0]} (${metrics.topItems[1][1]})`
                    : "No data"}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Metrics;