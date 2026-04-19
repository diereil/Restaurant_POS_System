import React, { forwardRef } from "react";

const Receipt = forwardRef(({ order }, ref) => {
  if (!order) return null;

  return (
    <div ref={ref} className="p-6 text-black bg-white w-[300px]">
      <h1 className="text-center font-bold text-lg">RESTRO POS</h1>
      <p className="text-center text-sm">Receipt</p>

      <hr className="my-2" />

      <p>Order ID: #{order._id.slice(-6)}</p>
      <p>Table: {order.table?.tableNo}</p>
      <p>Customer: {order.customerDetails?.name}</p>

      <hr className="my-2" />

      {order.items.map((item, i) => (
        <div key={i} className="flex justify-between text-sm">
          <span>
            {item.name} x {item.quantity}
          </span>
          <span>₱{item.price * item.quantity}</span>
        </div>
      ))}

      <hr className="my-2" />

      <div className="flex justify-between font-bold">
        <span>Total</span>
        <span>₱{order.bills?.totalWithTax?.toFixed(2)}</span>
      </div>

      <p className="text-sm mt-2">
        Payment: {order.paymentMethod || "N/A"}
      </p>

      <p className="text-center text-xs mt-4">
        Thank you! Come again.
      </p>
    </div>
  );
});

export default Receipt;