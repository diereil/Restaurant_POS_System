import React, { useMemo, useState, useEffect } from "react";
import { MdTableBar, MdCategory, MdDownload } from "react-icons/md";
import { BiSolidDish } from "react-icons/bi";
import { FaChartBar, FaMoneyBillWave, FaReceipt, FaUsers } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import Metrics from "../components/dashboard/Metrics";
import RecentOrders from "../components/dashboard/RecentOrders";
import Modal from "../components/dashboard/Modal";
import Payments from "../components/dashboard/Payments";
import { getOrders } from "../https";

const buttons = [
  { label: "Add Table", icon: <MdTableBar />, action: "table" },
  { label: "Add Category", icon: <MdCategory />, action: "category" },
  { label: "Add Dishes", icon: <BiSolidDish />, action: "dishes" },
];

const tabs = ["Metrics", "Orders", "Payments", "Summary Reports"];

const Dashboard = () => {
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Metrics");

  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");

  useEffect(() => {
    document.title = "POS | Admin Dashboard";
  }, []);

  const handleOpenModal = (action) => {
    if (action === "table") setIsTableModalOpen(true);
  };

  const { data: ordersRes, isLoading } = useQuery({
    queryKey: ["admin-summary-orders"],
    queryFn: async () => await getOrders(),
    refetchInterval: 5000,
  });

  const orders = ordersRes?.data?.data || [];

  const filteredOrders = useMemo(() => {
    const now = new Date();

    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt || order.orderDate);

      const statusMatch =
        statusFilter === "All" || order.orderStatus === statusFilter;

      const paymentMatch =
        paymentFilter === "All" || order.paymentMethod === paymentFilter;

      const sourceMatch =
        sourceFilter === "All" || order.orderSource === sourceFilter;

      let dateMatch = true;

      if (dateFilter === "Today") {
        dateMatch = orderDate.toDateString() === now.toDateString();
      }

      if (dateFilter === "Last 7 Days") {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        dateMatch = orderDate >= sevenDaysAgo;
      }

      if (dateFilter === "Last 30 Days") {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        dateMatch = orderDate >= thirtyDaysAgo;
      }

      return statusMatch && paymentMatch && sourceMatch && dateMatch;
    });
  }, [orders, statusFilter, paymentFilter, sourceFilter, dateFilter]);

  const report = useMemo(() => {
    const totalOrders = filteredOrders.length;

    const totalRevenue = filteredOrders.reduce(
      (sum, order) => sum + Number(order.bills?.totalWithTax || 0),
      0
    );

    const completedOrders = filteredOrders.filter(
      (order) => order.orderStatus === "Completed"
    ).length;

    const inProgressOrders = filteredOrders.filter(
      (order) => order.orderStatus === "In Progress"
    ).length;

    const cashTotal = filteredOrders
      .filter((order) => order.paymentMethod === "Cash")
      .reduce((sum, order) => sum + Number(order.bills?.totalWithTax || 0), 0);

    const onlineTotal = filteredOrders
      .filter((order) => order.paymentMethod === "Online")
      .reduce((sum, order) => sum + Number(order.bills?.totalWithTax || 0), 0);

    const customerOrders = filteredOrders.filter(
      (order) => order.orderSource === "customer"
    ).length;

    const staffOrders = filteredOrders.filter(
      (order) => order.orderSource === "staff"
    ).length;

    const paymentBreakdown = [
      { label: "Cash", value: cashTotal },
      { label: "Online", value: onlineTotal },
    ];

    const statusBreakdown = ["In Progress", "Ready", "Completed", "Canceled"].map(
      (status) => ({
        label: status,
        value: filteredOrders.filter((order) => order.orderStatus === status)
          .length,
      })
    );

    const activityLogs = filteredOrders.slice(0, 10).map((order) => ({
      id: order._id,
      action: `${order.orderSource || "staff"} created ${order.paymentMethod} order`,
      table: order.table?.tableNo || "N/A",
      status: order.orderStatus,
      total: Number(order.bills?.totalWithTax || 0),
      date: new Date(order.createdAt || order.orderDate).toLocaleString(),
    }));

    return {
      totalOrders,
      totalRevenue,
      completedOrders,
      inProgressOrders,
      cashTotal,
      onlineTotal,
      customerOrders,
      staffOrders,
      paymentBreakdown,
      statusBreakdown,
      activityLogs,
    };
  }, [filteredOrders]);

  const exportCSV = () => {
    const headers = [
      "Order ID",
      "Customer",
      "Table",
      "Payment",
      "Status",
      "Source",
      "Total",
      "Date",
    ];

    const rows = filteredOrders.map((order) => [
      order._id,
      order.customerDetails?.name || "Guest",
      order.table?.tableNo || "N/A",
      order.paymentMethod || "N/A",
      order.orderStatus || "N/A",
      order.orderSource || "staff",
      Number(order.bills?.totalWithTax || 0).toFixed(2),
      new Date(order.createdAt || order.orderDate).toLocaleString(),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "summary-report.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const maxStatusValue =
    Math.max(...report.statusBreakdown.map((item) => item.value), 1) || 1;

  const maxPaymentValue =
    Math.max(...report.paymentBreakdown.map((item) => item.value), 1) || 1;

  const renderSummaryReports = () => {
    return (
      <div className="px-6 pb-28 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Summary Reports</h1>
            <p className="text-gray-400 mt-1">
              Dynamic report generated from database orders with sales,
              transactions, and user activity insights.
            </p>
          </div>

          <button
            onClick={exportCSV}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-5 py-3 rounded-xl font-bold flex items-center gap-2 w-fit"
          >
            <MdDownload size={22} />
            Export CSV
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-[#2a2a2a] border border-[#333] rounded-xl px-4 py-3 outline-none"
          >
            <option>All</option>
            <option>Today</option>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#2a2a2a] border border-[#333] rounded-xl px-4 py-3 outline-none"
          >
            <option>All</option>
            <option>In Progress</option>
            <option>Ready</option>
            <option>Completed</option>
            <option>Canceled</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="bg-[#2a2a2a] border border-[#333] rounded-xl px-4 py-3 outline-none"
          >
            <option>All</option>
            <option>Cash</option>
            <option>Online</option>
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="bg-[#2a2a2a] border border-[#333] rounded-xl px-4 py-3 outline-none"
          >
            <option>All</option>
            <option value="customer">Customer QR</option>
            <option value="staff">Staff/Admin</option>
          </select>
        </div>

        {isLoading ? (
          <p className="text-gray-400">Loading summary reports...</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-[#262626] rounded-2xl p-5 border border-[#333]">
                <div className="flex justify-between items-center">
                  <p className="text-gray-400">Total Revenue</p>
                  <FaMoneyBillWave className="text-green-400 text-2xl" />
                </div>
                <h2 className="text-3xl font-bold mt-4">
                  ₱{report.totalRevenue.toFixed(2)}
                </h2>
                <p className="text-green-400 mt-2">From filtered orders</p>
              </div>

              <div className="bg-[#262626] rounded-2xl p-5 border border-[#333]">
                <div className="flex justify-between items-center">
                  <p className="text-gray-400">Total Orders</p>
                  <FaReceipt className="text-yellow-400 text-2xl" />
                </div>
                <h2 className="text-3xl font-bold mt-4">
                  {report.totalOrders}
                </h2>
                <p className="text-yellow-400 mt-2">Transaction count</p>
              </div>

              <div className="bg-[#262626] rounded-2xl p-5 border border-[#333]">
                <div className="flex justify-between items-center">
                  <p className="text-gray-400">Completed</p>
                  <FaChartBar className="text-blue-400 text-2xl" />
                </div>
                <h2 className="text-3xl font-bold mt-4">
                  {report.completedOrders}
                </h2>
                <p className="text-blue-400 mt-2">Successful orders</p>
              </div>

              <div className="bg-[#262626] rounded-2xl p-5 border border-[#333]">
                <div className="flex justify-between items-center">
                  <p className="text-gray-400">Customer QR Orders</p>
                  <FaUsers className="text-purple-400 text-2xl" />
                </div>
                <h2 className="text-3xl font-bold mt-4">
                  {report.customerOrders}
                </h2>
                <p className="text-purple-400 mt-2">Self-service orders</p>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-6">
              <div className="bg-[#262626] rounded-2xl p-5 border border-[#333]">
                <h2 className="text-xl font-bold mb-4">Payment Breakdown</h2>

                <div className="space-y-4">
                  {report.paymentBreakdown.map((item) => {
                    const width = (item.value / maxPaymentValue) * 100;

                    return (
                      <div key={item.label}>
                        <div className="flex justify-between mb-1">
                          <span>{item.label}</span>
                          <span>₱{item.value.toFixed(2)}</span>
                        </div>
                        <div className="h-4 bg-[#1a1a1a] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.label === "Cash"
                                ? "bg-green-500"
                                : "bg-blue-500"
                            }`}
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <p className="text-gray-400 text-sm mt-4">
                  Insight: Cash sales currently total ₱
                  {report.cashTotal.toFixed(2)}, while online sales total ₱
                  {report.onlineTotal.toFixed(2)}.
                </p>
              </div>

              <div className="bg-[#262626] rounded-2xl p-5 border border-[#333]">
                <h2 className="text-xl font-bold mb-4">Order Status Chart</h2>

                <div className="space-y-4">
                  {report.statusBreakdown.map((item) => {
                    const width = (item.value / maxStatusValue) * 100;

                    return (
                      <div key={item.label}>
                        <div className="flex justify-between mb-1">
                          <span>{item.label}</span>
                          <span>{item.value}</span>
                        </div>
                        <div className="h-4 bg-[#1a1a1a] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-500 rounded-full"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <p className="text-gray-400 text-sm mt-4">
                  Insight: There are {report.inProgressOrders} active orders and{" "}
                  {report.completedOrders} completed orders in the selected
                  report filter.
                </p>
              </div>
            </div>

            <div className="bg-[#262626] rounded-2xl p-5 border border-[#333] mb-6">
              <h2 className="text-xl font-bold mb-4">Transaction History</h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[900px]">
                  <thead className="bg-[#333]">
                    <tr>
                      <th className="p-3">Order</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Table</th>
                      <th className="p-3">Payment</th>
                      <th className="p-3">Source</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Total</th>
                      <th className="p-3">Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredOrders.length > 0 ? (
                      filteredOrders.map((order) => (
                        <tr
                          key={order._id}
                          className="border-b border-[#333] hover:bg-[#2c2c2c]"
                        >
                          <td className="p-3">#{order._id?.slice(-6)}</td>
                          <td className="p-3">
                            {order.customerDetails?.name || "Guest"}
                          </td>
                          <td className="p-3">
                            Table {order.table?.tableNo || "N/A"}
                          </td>
                          <td className="p-3">{order.paymentMethod}</td>
                          <td className="p-3">
                            {order.orderSource === "customer"
                              ? "Customer QR"
                              : "Staff/Admin"}
                          </td>
                          <td className="p-3">{order.orderStatus}</td>
                          <td className="p-3">
                            ₱{Number(order.bills?.totalWithTax || 0).toFixed(2)}
                          </td>
                          <td className="p-3">
                            {new Date(
                              order.createdAt || order.orderDate
                            ).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="p-4 text-gray-400" colSpan="8">
                          No transactions found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-[#262626] rounded-2xl p-5 border border-[#333]">
              <h2 className="text-xl font-bold mb-4">User Activity Logs</h2>

              <div className="space-y-3">
                {report.activityLogs.length > 0 ? (
                  report.activityLogs.map((log) => (
                    <div
                      key={log.id}
                      className="bg-[#1a1a1a] rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
                    >
                      <div>
                        <p className="font-semibold">{log.action}</p>
                        <p className="text-gray-400 text-sm">
                          Table {log.table} • Status: {log.status}
                        </p>
                      </div>

                      <div className="text-left md:text-right">
                        <p className="font-bold">₱{log.total.toFixed(2)}</p>
                        <p className="text-gray-400 text-sm">{log.date}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">No activity logs found.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="bg-[#1f1f1f] min-h-[calc(100vh-5rem)] overflow-y-auto">
      <div className="container mx-auto flex flex-col xl:flex-row xl:items-center xl:justify-between py-10 px-6 md:px-4 gap-5">
        <div className="flex items-center gap-3 flex-wrap">
          {buttons.map(({ label, icon, action }) => {
            return (
              <button
                key={action}
                onClick={() => handleOpenModal(action)}
                className="bg-[#1a1a1a] hover:bg-[#262626] px-8 py-3 rounded-lg text-[#f5f5f5] font-semibold text-md flex items-center gap-2"
              >
                {label} {icon}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {tabs.map((tab) => {
            return (
              <button
                key={tab}
                className={`
                px-8 py-3 rounded-lg text-[#f5f5f5] font-semibold text-md flex items-center gap-2 ${
                  activeTab === tab
                    ? "bg-[#262626] border border-yellow-500"
                    : "bg-[#1a1a1a] hover:bg-[#262626]"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "Metrics" && <Metrics />}
      {activeTab === "Orders" && <RecentOrders />}
      {activeTab === "Payments" && <Payments />}
      {activeTab === "Summary Reports" && renderSummaryReports()}

      {isTableModalOpen && <Modal setIsTableModalOpen={setIsTableModalOpen} />}
    </div>
  );
};

export default Dashboard;