import React from "react";
import { FaCheckDouble, FaLongArrowAltRight, FaCircle } from "react-icons/fa";
import { getAvatarName } from "../../utils/index";

const OrderList = ({ order }) => {
  const status = order.orderStatus || "In Progress";

  const renderStatus = () => {
    if (status === "Ready") {
      return (
        <p className="text-green-400 bg-[#2e4a40] px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap">
          <FaCheckDouble className="inline mr-2" /> Ready
        </p>
      );
    }

    if (status === "Completed") {
      return (
        <p className="text-blue-400 bg-[#2e3a4a] px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap">
          <FaCheckDouble className="inline mr-2" /> Completed
        </p>
      );
    }

    if (status === "Canceled" || status === "Cancelled") {
      return (
        <p className="text-red-400 bg-[#4a2e2e] px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap">
          <FaCircle className="inline mr-2" /> Canceled
        </p>
      );
    }

    return (
      <p className="text-yellow-400 bg-[#4a452e] px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap">
        <FaCircle className="inline mr-2" /> {status}
      </p>
    );
  };

  return (
    <div className="grid grid-cols-[56px_1fr] gap-4 mb-3 bg-[#222] p-3 rounded-lg items-center">
      <button
        className="bg-[#f6b100] w-12 h-12 text-xl font-bold rounded-lg text-black shrink-0"
        type="button"
      >
        {getAvatarName(order.customerDetails?.name || "C")}
      </button>

      <div className="flex items-center justify-between gap-4 min-w-0">
        <div className="min-w-0">
          <h1 className="text-[#f5f5f5] text-lg font-semibold tracking-wide truncate">
            {order.customerDetails?.name || "Customer"}
          </h1>

          <p className="text-[#ababab] text-sm">
            {order.items?.length || 0} Items
          </p>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <h1 className="text-[#f6b100] font-semibold border border-[#f6b100] rounded-lg px-3 py-1 text-sm whitespace-nowrap">
            Table <FaLongArrowAltRight className="text-[#ababab] ml-2 inline" />
            {order.table?.tableNo || order.table?.tableNumber || "N/A"}
          </h1>

          {renderStatus()}
        </div>
      </div>
    </div>
  );
};

export default OrderList;