import React, { useState } from "react";
import { FaSearch, FaUserCircle, FaBell } from "react-icons/fa";
import logo from "../../assets/images/logo.png";
import { useDispatch, useSelector } from "react-redux";
import { IoLogOut } from "react-icons/io5";
import { useMutation } from "@tanstack/react-query";
import { logout, getOrderById, updateOrderStatus } from "../../https";
import { removeUser } from "../../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
import { MdDashboard } from "react-icons/md";
import { useNotifications } from "../../context/NotificationContext";
import Modal from "./Modal";
import Receipt from "../receipt/Receipt";
import { useReactToPrint } from "react-to-print";
import { useRef } from "react";
import { enqueueSnackbar } from "notistack";

const Header = () => {
  const userData = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { notifications, clearNotifications, isMuted, toggleMute } =
    useNotifications();

  const [open, setOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  const logoutMutation = useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      dispatch(removeUser());
      navigate("/auth");
    },
  });

  const handleViewOrder = async (notification) => {
    try {
      const res = await getOrderById(notification.orderId);
      const order = res?.data?.data;

      // 🔥 mark as seen
      if (order?.isNewOrder) {
        await updateOrderStatus({
          orderId: order._id,
          isNewOrder: false,
        });
      }

      setSelectedOrder(order);
    } catch (err) {
      enqueueSnackbar("Failed to load order", { variant: "error" });
    }
  };

  return (
    <>
      <header className="flex justify-between items-center py-4 px-8 bg-[#1a1a1a]">
        <div onClick={() => navigate("/")} className="flex items-center gap-2 cursor-pointer">
          <img src={logo} className="h-8 w-8" alt="restro logo" />
          <h1 className="text-lg font-semibold text-[#f5f5f5]">ServeX</h1>
        </div>

        <div className="flex items-center gap-4 bg-[#1f1f1f] rounded px-5 py-2 w-[500px]">
          <FaSearch className="text-[#f5f5f5]" />
          <input placeholder="Search" className="bg-transparent text-white w-full outline-none" />
        </div>

        <div className="flex items-center gap-4">
          {userData.role === "Admin" && (
            <div onClick={() => navigate("/dashboard")} className="p-3 bg-[#1f1f1f] rounded cursor-pointer">
              <MdDashboard className="text-white text-2xl" />
            </div>
          )}

          {/* 🔔 NOTIFICATION */}
          <div className="relative">
            <div onClick={() => setOpen(!open)} className="p-3 bg-[#1f1f1f] rounded cursor-pointer relative">
              <FaBell className="text-white text-2xl" />

              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 rounded-full">
                  {notifications.length}
                </span>
              )}
            </div>

            {open && (
              <div className="absolute right-0 mt-2 w-96 bg-[#1f1f1f] p-3 rounded shadow-lg z-50">
                <div className="flex justify-between mb-3">
                  <h1 className="text-white font-semibold">Notifications</h1>

                  <div className="flex gap-2">
                    <button onClick={toggleMute} className="text-yellow-400 text-sm">
                      {isMuted ? "Unmute" : "Mute"}
                    </button>
                    <button onClick={clearNotifications} className="text-red-400 text-sm">
                      Clear
                    </button>
                  </div>
                </div>

                {notifications.length === 0 ? (
                  <p className="text-gray-400">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="border-b border-gray-700 py-3">
                      <p className="text-white text-sm">{n.message}</p>
                      <p className="text-gray-400 text-xs">{n.createdAt}</p>

                      {/* 🔥 VIEW BUTTON */}
                      {n.orderId && (
                        <button
                          onClick={() => handleViewOrder(n)}
                          className="mt-2 bg-blue-600 px-3 py-1 rounded text-xs text-white"
                        >
                          View Order
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* USER */}
          <div className="flex items-center gap-3">
            <FaUserCircle className="text-white text-4xl" />
            <div>
              <h1 className="text-white">{userData.name}</h1>
              <p className="text-gray-400 text-xs">{userData.role}</p>
            </div>
            <IoLogOut onClick={() => logoutMutation.mutate()} className="text-white cursor-pointer" size={30} />
          </div>
        </div>
      </header>

      {/* 🔥 MODAL */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title="Order Details"
      >
        {selectedOrder && (
          <div className="text-white space-y-3">
            {selectedOrder.items.map((item, i) => (
              <div key={i} className="flex justify-between">
                <span>{item.name} x {item.quantity}</span>
                <span>₱{item.price * item.quantity}</span>
              </div>
            ))}

            <div className="font-bold flex justify-between">
              <span>Total</span>
              <span>₱{selectedOrder.bills.totalWithTax}</span>
            </div>

            <button
              onClick={handlePrint}
              className="w-full bg-yellow-500 py-2 rounded text-black"
            >
              Print Receipt
            </button>
          </div>
        )}
      </Modal>

      {/* hidden receipt */}
      <div className="fixed -left-[9999px]">
        {selectedOrder && <Receipt ref={printRef} order={selectedOrder} />}
      </div>
    </>
  );
};

export default Header;