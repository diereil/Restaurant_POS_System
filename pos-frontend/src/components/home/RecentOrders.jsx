import React from "react";
import { FaSearch } from "react-icons/fa";
import OrderList from "./OrderList";
import { useNavigate } from "react-router-dom";

const RecentOrders = ({ orders = [] }) => {
  const navigate = useNavigate();
  const [search, setSearch] = React.useState("");

  const filteredOrders = orders.filter((order) => {
    const customerName = order.customerDetails?.name || "";
    const tableNo = String(order.table?.tableNo || "");
    const status = order.orderStatus || "";

    return (
      customerName.toLowerCase().includes(search.toLowerCase()) ||
      tableNo.toLowerCase().includes(search.toLowerCase()) ||
      status.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="px-8 mt-6 pb-8">
      <div className="bg-[#1a1a1a] w-full rounded-lg overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4">
          <h1 className="text-[#f5f5f5] text-lg font-semibold tracking-wide">
            Recent Orders
          </h1>

          <button
            onClick={() => navigate("/orders")}
            className="text-[#025cca] text-sm font-semibold hover:underline"
            type="button"
          >
            View all
          </button>
        </div>

        <div className="flex items-center gap-4 bg-[#1f1f1f] rounded-[15px] px-6 py-4 mx-6">
          <FaSearch className="text-[#f5f5f5] shrink-0" />
          <input
            type="text"
            placeholder="Search recent orders"
            className="bg-[#1f1f1f] outline-none text-[#f5f5f5] w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="mt-4 px-6 pb-6 max-h-[270px] overflow-y-auto scrollbar-hide">
          {filteredOrders.length > 0 ? (
            filteredOrders.slice(0, 6).map((order) => (
              <OrderList key={order._id} order={order} />
            ))
          ) : (
            <p className="text-gray-500 py-6 text-center">No orders found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentOrders;