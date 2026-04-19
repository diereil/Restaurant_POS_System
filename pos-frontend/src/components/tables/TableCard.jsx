import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAvatarName, getBgColor } from "../../utils";
import { useDispatch } from "react-redux";
import { updateTable as setCustomerTable } from "../../redux/slices/customerSlice";
import { updateTable, getOrderById } from "../../https";
import { enqueueSnackbar } from "notistack";
import { QRCodeCanvas } from "qrcode.react";
import Modal from "../shared/Modal";

const TableCard = ({
  id,
  name,
  status,
  initials,
  seats,
  orderId,
  onTableUpdated,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showQR, setShowQR] = useState(false);
  const [showOrder, setShowOrder] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(false);

  const handleClick = () => {
    if (status === "Booked") return;

    dispatch(setCustomerTable({ table: { tableId: id, tableNo: name } }));
    navigate("/menu");
  };

  const handleFreeTable = async (e) => {
    e.stopPropagation();

    try {
      await updateTable({
        tableId: id,
        status: "Available",
        orderId: null,
      });

      enqueueSnackbar("Table set to Available", { variant: "success" });

      if (onTableUpdated) {
        onTableUpdated();
      }
    } catch (err) {
      enqueueSnackbar("Failed to update table", { variant: "error" });
    }
  };

  const handleViewOrder = async (e) => {
    e.stopPropagation();

    if (!orderId) {
      enqueueSnackbar("No active order found for this table", {
        variant: "warning",
      });
      return;
    }

    try {
      setLoadingOrder(true);
      const res = await getOrderById(orderId);
      setOrderData(res?.data?.data || null);
      setShowOrder(true);
    } catch (err) {
      enqueueSnackbar("Failed to fetch order details", { variant: "error" });
    } finally {
      setLoadingOrder(false);
    }
  };

  const statusStyle =
    status === "Booked"
      ? "bg-red-500/20 text-red-400"
      : "bg-green-500/20 text-green-400";

  const qrUrl = `http://localhost:5173/customer-menu/${name}`;

  const total =
    orderData?.bills?.totalWithTax ??
    orderData?.bills?.total ??
    0;

  return (
    <>
      <div
        onClick={handleClick}
        className="bg-[#262626] hover:bg-[#2c2c2c] rounded-xl p-5 cursor-pointer transition flex flex-col justify-between"
      >
        <div className="flex justify-between items-center">
          <h1 className="text-white font-semibold text-lg">Table {name}</h1>

          <span className={`px-2 py-1 text-xs rounded ${statusStyle}`}>
            {status}
          </span>
        </div>

        <div className="flex justify-center mt-6 mb-6">
          <div
            className="w-16 h-16 flex items-center justify-center rounded-full text-white text-lg"
            style={{
              backgroundColor: initials ? getBgColor() : "#1f1f1f",
            }}
          >
            {getAvatarName(initials) || "N/A"}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="text-gray-400 text-sm">
            Seats: <span className="text-white">{seats}</span>
          </p>

          {status === "Booked" && (
            <>
              <button
                onClick={handleViewOrder}
                disabled={loadingOrder}
                className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded disabled:opacity-60"
              >
                {loadingOrder ? "Loading..." : "View Order"}
              </button>

              <button
                onClick={handleFreeTable}
                className="mt-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded"
              >
                Free Table
              </button>
            </>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowQR(true);
            }}
            className="mt-2 px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-black text-xs rounded"
          >
            Show QR
          </button>
        </div>
      </div>

      {showQR && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl text-center relative">
            <button
              onClick={() => setShowQR(false)}
              className="absolute top-2 right-2 text-black text-lg"
            >
              ✕
            </button>

            <h1 className="text-lg font-bold mb-4">Table {name} QR Code</h1>

            <QRCodeCanvas value={qrUrl} size={200} />

            <p className="text-xs mt-3 text-gray-600">Scan to order</p>
          </div>
        </div>
      )}

      <Modal
        isOpen={showOrder}
        onClose={() => {
          setShowOrder(false);
          setOrderData(null);
        }}
        title={`Table ${name} Order Details`}
      >
        {orderData ? (
          <div className="text-white space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#262626] rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Customer</p>
                <p className="font-semibold">
                  {orderData.customerDetails?.name || "Guest"}
                </p>
              </div>

              <div className="bg-[#262626] rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Phone</p>
                <p className="font-semibold">
                  {orderData.customerDetails?.phone || "N/A"}
                </p>
              </div>

              <div className="bg-[#262626] rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Guests</p>
                <p className="font-semibold">
                  {orderData.customerDetails?.guests || 1}
                </p>
              </div>

              <div className="bg-[#262626] rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Payment</p>
                <span
                  className={`inline-block px-3 py-1 rounded text-sm ${
                    orderData.paymentMethod === "Cash"
                      ? "bg-green-600"
                      : "bg-blue-600"
                  }`}
                >
                  {orderData.paymentMethod || "N/A"}
                </span>
              </div>
            </div>

            <div className="bg-[#262626] rounded-lg p-4">
              <p className="text-sm font-semibold mb-3">Items Ordered</p>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {orderData.items?.length > 0 ? (
                  orderData.items.map((item, index) => (
                    <div
                      key={`${item.id || item.name}-${index}`}
                      className="flex justify-between items-center border-b border-[#3a3a3a] pb-2"
                    >
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-gray-400">
                          Qty: {item.quantity} × ₱{item.price}
                        </p>
                      </div>

                      <p className="font-semibold">
                        ₱{(Number(item.price || 0) * Number(item.quantity || 0)).toFixed(2)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">No items found</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between bg-[#262626] rounded-lg p-4">
              <div>
                <p className="text-xs text-gray-400">Order Status</p>
                <p className="font-semibold text-yellow-400">
                  {orderData.orderStatus || "In Progress"}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-gray-400">Total</p>
                <p className="text-xl font-bold">₱{Number(total).toFixed(2)}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-white">No order details found.</p>
        )}
      </Modal>
    </>
  );
};

export default TableCard;