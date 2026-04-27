import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getAvatarName, getBgColor } from "../../utils";
import { useDispatch } from "react-redux";
import { updateTable as setCustomerTable } from "../../redux/slices/customerSlice";
import { updateTable, getOrderById, updateOrderStatus } from "../../https";
import { enqueueSnackbar } from "notistack";
import { QRCodeCanvas } from "qrcode.react";
import Modal from "../shared/Modal";
import { useReactToPrint } from "react-to-print";
import Receipt from "../receipt/Receipt";

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

  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: orderData ? `Receipt-Table-${name}` : "Receipt",
  });

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

      if (onTableUpdated) onTableUpdated();
    } catch (err) {
      enqueueSnackbar("Failed to update table", { variant: "error" });
    }
  };

  const handleViewOrder = async (e) => {
    e.stopPropagation();

    if (!orderId) {
      enqueueSnackbar("No active order found", { variant: "warning" });
      return;
    }

    try {
      setLoadingOrder(true);
      const res = await getOrderById(orderId);
      const fetchedOrder = res?.data?.data || null;

      if (fetchedOrder?.isNewOrder) {
        await updateOrderStatus({
          orderId,
          isNewOrder: false,
        });
        fetchedOrder.isNewOrder = false;
      }

      setOrderData(fetchedOrder);
      setShowOrder(true);

      if (onTableUpdated) onTableUpdated();
    } catch (err) {
      enqueueSnackbar("Failed to fetch order", { variant: "error" });
    } finally {
      setLoadingOrder(false);
    }
  };

  const handlePrintReceipt = () => {
    if (!orderData) {
      enqueueSnackbar("No receipt data found", { variant: "warning" });
      return;
    }
    handlePrint();
  };

  const statusStyle =
    status === "Booked"
      ? "bg-red-500/20 text-red-400"
      : "bg-green-500/20 text-green-400";

  const qrUrl = `http://localhost:5173/customer-menu/${name}`;
  const total = orderData?.bills?.totalWithTax ?? orderData?.bills?.total ?? 0;

  return (
    <>
      <div
        onClick={handleClick}
        className="relative bg-[#262626] hover:bg-[#2c2c2c] rounded-xl p-5 cursor-pointer transition flex flex-col justify-between"
      >
        {/* {status === "Booked" && orderId && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow">
              ACTIVE
            </span>
          </div>
        )} */}

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

            <h1 className="text-lg font-bold mb-4">Table {name} QR</h1>
            <QRCodeCanvas value={qrUrl} size={200} />
          </div>
        </div>
      )}

      <Modal
        isOpen={showOrder}
        onClose={() => {
          setShowOrder(false);
          setOrderData(null);
        }}
        title={`Table ${name} Order`}
      >
        {orderData ? (
          <div className="text-white space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#262626] p-3 rounded">
                <p className="text-xs text-gray-400">Customer</p>
                <p className="font-semibold">
                  {orderData.customerDetails?.name || "Guest"}
                </p>
              </div>

              <div className="bg-[#262626] p-3 rounded">
                <p className="text-xs text-gray-400">Phone</p>
                <p className="font-semibold">
                  {orderData.customerDetails?.phone || "N/A"}
                </p>
              </div>

              <div className="bg-[#262626] p-3 rounded">
                <p className="text-xs text-gray-400">Guests</p>
                <p className="font-semibold">
                  {orderData.customerDetails?.guests || 1}
                </p>
              </div>

              <div className="bg-[#262626] p-3 rounded">
                <p className="text-xs text-gray-400">Payment</p>
                <p className="font-semibold">{orderData.paymentMethod}</p>
              </div>
            </div>

            {orderData.isNewOrder && (
              <div className="bg-red-600/20 border border-red-500 text-red-300 px-3 py-2 rounded text-sm font-semibold">
                This is a NEW order
              </div>
            )}

            <div className="bg-[#262626] p-4 rounded">
              <p className="text-sm font-semibold mb-3">Items Ordered</p>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {orderData.items?.length > 0 ? (
                  orderData.items.map((item, i) => (
                    <div
                      key={`${item.id || item.name}-${i}`}
                      className="flex justify-between text-sm border-b border-[#333] py-2"
                    >
                      <span>
                        {item.name} x {item.quantity}
                      </span>
                      <span>
                        ₱
                        {(
                          Number(item.price || 0) * Number(item.quantity || 0)
                        ).toFixed(2)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">No items found</p>
                )}
              </div>
            </div>

            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>₱{Number(total).toFixed(2)}</span>
            </div>

            <button
              onClick={handlePrintReceipt}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black py-2 rounded font-bold"
            >
              Print Receipt
            </button>
          </div>
        ) : (
          <p className="text-white">No data</p>
        )}
      </Modal>

      <div className="fixed -left-[9999px] top-0">
        {orderData && <Receipt ref={printRef} order={orderData} />}
      </div>
    </>
  );
};

export default TableCard;