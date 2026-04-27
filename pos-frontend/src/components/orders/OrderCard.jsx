import React from "react";
import {
  FaCheckDouble,
  FaLongArrowAltRight,
  FaCircle,
  FaTimesCircle,
  FaClipboardCheck,
} from "react-icons/fa";
import { formatDateAndTime, getAvatarName } from "../../utils/index";

const OrderCard = ({ order }) => {
  const renderStatus = () => {
    switch (order.orderStatus) {
      case "Ready":
        return (
          <>
            <p className="text-green-600 bg-[#2e4a40] px-2 py-1 rounded-lg text-sm">
              <FaCheckDouble className="inline mr-2" /> Ready
            </p>
            <p className="text-[#ababab] text-xs">
              <FaCircle className="inline mr-2 text-green-600" /> Ready to serve
            </p>
          </>
        );

      case "Completed":
        return (
          <>
            <p className="text-blue-400 bg-[#24364f] px-2 py-1 rounded-lg text-sm">
              <FaClipboardCheck className="inline mr-2" /> Completed
            </p>
            <p className="text-[#ababab] text-xs">
              <FaCircle className="inline mr-2 text-blue-400" /> Order completed
            </p>
          </>
        );

      case "Canceled":
        return (
          <>
            <p className="text-red-500 bg-[#4a2e2e] px-2 py-1 rounded-lg text-sm">
              <FaTimesCircle className="inline mr-2" /> Canceled
            </p>
            <p className="text-[#ababab] text-xs">
              <FaCircle className="inline mr-2 text-red-500" /> Order canceled
            </p>
          </>
        );

      default:
        return (
          <>
            <p className="text-yellow-600 bg-[#4a452e] px-2 py-1 rounded-lg text-sm">
              <FaCircle className="inline mr-2" /> In Progress
            </p>
            <p className="text-[#ababab] text-xs">
              <FaCircle className="inline mr-2 text-yellow-600" /> Preparing your
              order
            </p>
          </>
        );
    }
  };

  return (
    <div className="w-full bg-[#262626] p-4 rounded-lg relative">
      {order.isNewOrder && (
        <div className="absolute top-3 right-3">
          <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow">
            NEW
          </span>
        </div>
      )}

      <div className="flex items-start gap-4">
        <div className="bg-[#f6b100] w-12 h-12 flex items-center justify-center text-xl font-bold rounded-lg shrink-0">
          {getAvatarName(order.customerDetails.name)}
        </div>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between w-full gap-3">
          <div className="min-w-0">
            <h1 className="text-[#f5f5f5] text-lg font-semibold tracking-wide truncate">
              {order.customerDetails.name}
            </h1>

            <p className="text-[#ababab] text-sm">
              #{Math.floor(new Date(order.orderDate).getTime())} / Dine in
            </p>

            <p className="text-[#ababab] text-sm">
              Table{" "}
              <FaLongArrowAltRight className="text-[#ababab] ml-2 inline" />{" "}
              {order.table?.tableNo || "N/A"}
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2">
            {renderStatus()}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-4 text-[#ababab] text-sm">
        <p>{formatDateAndTime(order.orderDate)}</p>
        <p>{order.items.length} Items</p>
      </div>

      <hr className="w-full mt-4 border-t border-gray-600" />

      <div className="flex items-center justify-between mt-4">
        <h1 className="text-[#f5f5f5] text-lg font-semibold">Total</h1>
        <p className="text-[#f5f5f5] text-lg font-semibold">
          ₱{(order.bills?.totalWithTax || 0).toFixed(2)}
        </p>
      </div>
    </div>
  );
};

export default OrderCard;