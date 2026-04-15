import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { formatDate, getAvatarName } from "../../utils";

const CustomerInfo = () => {
  const [dateTime, setDateTime] = useState(new Date());
  const customerData = useSelector((state) => state.customer);

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center justify-between px-4 py-4 gap-3">
      <div className="flex flex-col items-start min-w-0">
        <h1 className="text-md text-[#f5f5f5] font-semibold tracking-wide truncate">
          {customerData.customerName || "Customer Name"}
        </h1>

        <p className="text-xs text-[#ababab] font-medium mt-1">
          #{customerData.orderId || "N/A"} / Dine in
        </p>

        <p className="text-xs text-[#ababab] font-medium mt-2">
          {formatDate(dateTime)}
        </p>
      </div>

      <button
        className="bg-[#f6b100] w-14 h-14 text-xl font-bold rounded-lg shrink-0"
        type="button"
      >
        {getAvatarName(customerData.customerName) || "CN"}
      </button>
    </div>
  );
};

export default CustomerInfo;