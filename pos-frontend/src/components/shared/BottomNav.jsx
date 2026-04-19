import React, { useState } from "react";
import { FaHome } from "react-icons/fa";
import { MdOutlineReorder, MdTableBar } from "react-icons/md";
import { CiCircleMore } from "react-icons/ci";
import { BiSolidDish } from "react-icons/bi";
import { useNavigate, useLocation } from "react-router-dom";
import Modal from "./Modal";
import { useDispatch, useSelector } from "react-redux";
import { setCustomer } from "../../redux/slices/customerSlice";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [guestCount, setGuestCount] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const increment = () => {
    if (guestCount >= 10) return;
    setGuestCount((prev) => prev + 1);
  };

  const decrement = () => {
    if (guestCount <= 1) return;
    setGuestCount((prev) => prev - 1);
  };

  const isActive = (path) => location.pathname === path;

  const handleCreateOrder = () => {
    if (!name || !phone) return;

    dispatch(setCustomer({ name, phone, guests: guestCount }));
    closeModal();
    navigate("/tables");
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#262626] p-2 h-16 flex justify-around items-center">

      {/* HOME */}
      <button onClick={() => navigate("/")}
        className={`${isActive("/") ? "text-white" : "text-gray-400"}`}>
        <FaHome size={20} />
      </button>

      {/* ORDERS */}
      {user.role !== "Waiter" && (
        <button onClick={() => navigate("/orders")}
          className={`${isActive("/orders") ? "text-white" : "text-gray-400"}`}>
          <MdOutlineReorder size={22} />
        </button>
      )}

      {/* TABLES */}
      <button onClick={() => navigate("/tables")}
        className={`${isActive("/tables") ? "text-white" : "text-gray-400"}`}>
        <MdTableBar size={22} />
      </button>

      {/* DASHBOARD */}
      {user.role === "Admin" && (
        <button onClick={() => navigate("/dashboard")}
          className="text-gray-400">
          <CiCircleMore size={22} />
        </button>
      )}

      {/* CREATE ORDER BUTTON */}
      {user.role !== "Waiter" && (
        <button
          onClick={openModal}
          className="absolute bottom-6 bg-[#F6B100] rounded-full p-4 shadow-lg"
        >
          <BiSolidDish size={30} />
        </button>
      )}

      {/* MODAL */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title="Create Order">

        <div className="flex flex-col gap-4">

          {/* NAME */}
          <input
            type="text"
            placeholder="Customer Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 rounded bg-[#2a2a2a] text-white outline-none"
          />

          {/* PHONE */}
          <input
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-3 rounded bg-[#2a2a2a] text-white outline-none"
          />

          {/* GUEST COUNT */}
          <div className="flex justify-between items-center bg-[#2a2a2a] p-3 rounded">
            <p className="text-white">Guests</p>

            <div className="flex items-center gap-3">
              <button
                onClick={decrement}
                className="px-3 py-1 bg-black text-white rounded"
              >
                -
              </button>

              <span className="text-white text-lg">{guestCount}</span>

              <button
                onClick={increment}
                className="px-3 py-1 bg-black text-white rounded"
              >
                +
              </button>
            </div>
          </div>

          {/* BUTTON */}
          <button
            onClick={handleCreateOrder}
            className="w-full bg-[#F6B100] py-3 rounded font-semibold text-black hover:opacity-90"
          >
            Create Order
          </button>

        </div>

      </Modal>

    </div>
  );
};

export default BottomNav;