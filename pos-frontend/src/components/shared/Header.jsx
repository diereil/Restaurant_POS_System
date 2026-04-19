import React, { useState } from "react";
import { FaSearch, FaUserCircle, FaBell } from "react-icons/fa";
import logo from "../../assets/images/logo.png";
import { useDispatch, useSelector } from "react-redux";
import { IoLogOut } from "react-icons/io5";
import { useMutation } from "@tanstack/react-query";
import { logout } from "../../https";
import { removeUser } from "../../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
import { MdDashboard } from "react-icons/md";
import { useNotifications } from "../../context/NotificationContext";

const Header = () => {
  const userData = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { notifications, clearNotifications, isMuted, toggleMute } =
    useNotifications();
  const [open, setOpen] = useState(false);

  const logoutMutation = useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      dispatch(removeUser());
      navigate("/auth");
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="flex justify-between items-center py-4 px-8 bg-[#1a1a1a]">
      <div
        onClick={() => navigate("/")}
        className="flex items-center gap-2 cursor-pointer"
      >
        <img src={logo} className="h-8 w-8" alt="restro logo" />
        <h1 className="text-lg font-semibold text-[#f5f5f5] tracking-wide">
          Restro
        </h1>
      </div>

      <div className="flex items-center gap-4 bg-[#1f1f1f] rounded-[15px] px-5 py-2 w-[500px]">
        <FaSearch className="text-[#f5f5f5]" />
        <input
          type="text"
          placeholder="Search"
          className="bg-[#1f1f1f] outline-none text-[#f5f5f5] w-full"
        />
      </div>

      <div className="flex items-center gap-4">
        {userData.role === "Admin" && (
          <div
            onClick={() => navigate("/dashboard")}
            className="bg-[#1f1f1f] rounded-[15px] p-3 cursor-pointer"
          >
            <MdDashboard className="text-[#f5f5f5] text-2xl" />
          </div>
        )}

        <div className="relative">
          <div
            onClick={() => setOpen(!open)}
            className="bg-[#1f1f1f] rounded-[15px] p-3 cursor-pointer relative"
          >
            <FaBell className="text-[#f5f5f5] text-2xl" />

            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 py-[2px] rounded-full">
                {notifications.length}
              </span>
            )}
          </div>

          {open && (
            <div className="absolute right-0 mt-2 w-96 max-h-[400px] overflow-y-auto bg-[#1f1f1f] rounded-lg shadow-lg p-3 z-50 border border-[#2a2a2a]">
              <div className="flex justify-between items-center mb-3">
                <h1 className="text-white font-semibold text-lg">
                  Notifications
                </h1>

                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleMute}
                    className={`text-sm ${
                      isMuted ? "text-yellow-400" : "text-green-400"
                    }`}
                  >
                    {isMuted ? "Unmute" : "Mute"}
                  </button>

                  <button
                    onClick={clearNotifications}
                    className="text-sm text-red-400"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {notifications.length === 0 ? (
                <p className="text-gray-400 text-sm">No notifications</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className="py-3 border-b border-gray-700"
                  >
                    <p className="text-white text-sm font-medium">
                      {n.message}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      {n.createdAt}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 cursor-pointer">
          <FaUserCircle className="text-[#f5f5f5] text-4xl" />
          <div className="flex flex-col items-start">
            <h1 className="text-md text-[#f5f5f5] font-semibold tracking-wide">
              {userData.name || "TEST USER"}
            </h1>
            <p className="text-xs text-[#ababab] font-medium">
              {userData.role || "Role"}
            </p>
          </div>
          <IoLogOut
            onClick={handleLogout}
            className="text-[#f5f5f5] ml-2"
            size={40}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;