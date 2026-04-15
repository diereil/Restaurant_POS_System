import React from "react";
import { useNavigate } from "react-router-dom";
import { getAvatarName, getBgColor } from "../../utils";
import { useDispatch } from "react-redux";
import { updateTable as setCustomerTable } from "../../redux/slices/customerSlice";
import { updateTable } from "../../https";
import { enqueueSnackbar } from "notistack";

const TableCard = ({ id, name, status, initials, seats }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 👉 CLICK TABLE (go to menu)
  const handleClick = () => {
    if (status === "Booked") return;

    dispatch(setCustomerTable({ table: { tableId: id, tableNo: name } }));
    navigate("/menu");
  };

  // 👉 FREE TABLE BUTTON
  const handleFreeTable = async (e) => {
    e.stopPropagation(); // prevent card click

    try {
      await updateTable({
        tableId: id,
        status: "Available",
        orderId: null,
      });

      enqueueSnackbar("Table set to Available", { variant: "success" });

      window.location.reload(); // simple refresh (later we can optimize)
    } catch (err) {
      enqueueSnackbar("Failed to update table", { variant: "error" });
    }
  };

  // 🎨 STATUS COLORS
  const statusStyle =
    status === "Booked"
      ? "bg-red-500/20 text-red-400"
      : status === "Available"
      ? "bg-green-500/20 text-green-400"
      : "bg-yellow-500/20 text-yellow-400";

  return (
    <div
      onClick={handleClick}
      className="bg-[#262626] hover:bg-[#2c2c2c] rounded-xl p-5 cursor-pointer transition flex flex-col justify-between"
    >
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-white font-semibold text-lg">
          Table {name}
        </h1>

        <span className={`px-2 py-1 text-xs rounded ${statusStyle}`}>
          {status}
        </span>
      </div>

      {/* AVATAR */}
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

      {/* FOOTER */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-gray-400 text-sm">
          Seats: <span className="text-white">{seats}</span>
        </p>

        {/* ✅ FREE BUTTON (only if booked) */}
        {status === "Booked" && (
          <button
            onClick={handleFreeTable}
            className="mt-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded"
          >
            Free Table
          </button>
        )}
      </div>
    </div>
  );
};

export default TableCard;