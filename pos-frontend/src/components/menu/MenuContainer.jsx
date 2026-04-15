import React, { useMemo, useState } from "react";
import { menus } from "../../constants";
import { GrRadialSelected } from "react-icons/gr";
import { FaShoppingCart } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { addItems } from "../../redux/slices/cartSlice";
import { enqueueSnackbar } from "notistack";

const MenuContainer = () => {
  const [selected, setSelected] = useState(menus[0]);
  const [itemCounts, setItemCounts] = useState({});
  const dispatch = useDispatch();

  const selectedCounts = useMemo(() => itemCounts, [itemCounts]);

  const increment = (id) => {
    setItemCounts((prev) => {
      const current = prev[id] || 0;
      if (current >= 10) return prev;
      return { ...prev, [id]: current + 1 };
    });
  };

  const decrement = (id) => {
    setItemCounts((prev) => {
      const current = prev[id] || 0;
      if (current <= 0) return prev;
      return { ...prev, [id]: current - 1 };
    });
  };

  const handleSelectMenu = (menu) => {
    setSelected(menu);
  };

  const handleAddToCart = (item) => {
    const quantity = selectedCounts[item.id] || 0;

    if (quantity === 0) {
      enqueueSnackbar("Please select quantity first!", { variant: "warning" });
      return;
    }

    const { name, price } = item;

    const newObj = {
      id: `${item.id}-${Date.now()}`,
      name,
      pricePerQuantity: price,
      quantity,
      price: price * quantity,
    };

    dispatch(addItems(newObj));

    setItemCounts((prev) => ({
      ...prev,
      [item.id]: 0,
    }));

    enqueueSnackbar(`${name} added to cart`, { variant: "success" });
  };

  return (
    <>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 px-6 py-4 w-full">
        {menus.map((menu) => (
          <div
            key={menu.id}
            className="flex flex-col items-start justify-between p-4 rounded-xl h-[120px] cursor-pointer transition hover:brightness-110"
            style={{ backgroundColor: menu.bgColor }}
            onClick={() => handleSelectMenu(menu)}
          >
            <div className="flex items-center justify-between w-full gap-3">
              <h1 className="text-[#f5f5f5] text-lg font-semibold break-words">
                {menu.icon} {menu.name}
              </h1>

              {selected.id === menu.id && (
                <GrRadialSelected className="text-white shrink-0" size={20} />
              )}
            </div>

            <p className="text-[#d1d1d1] text-sm font-semibold">
              {menu.items.length} Items
            </p>
          </div>
        ))}
      </div>

      <hr className="border-[#2a2a2a] border-t mt-2" />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 px-6 py-4 w-full">
        {selected?.items.map((item) => {
          const quantity = selectedCounts[item.id] || 0;

          return (
            <div
              key={item.id}
              className="flex flex-col items-start justify-between p-4 rounded-xl min-h-[190px] cursor-pointer hover:bg-[#222] bg-[#1a1a1a] transition"
            >
              <div className="flex items-start justify-between w-full gap-3">
                <h1 className="text-[#f5f5f5] text-lg font-semibold leading-snug">
                  {item.name}
                </h1>

                <button
                  onClick={() => handleAddToCart(item)}
                  className="bg-[#2e4a40] text-[#02ca3a] p-2 rounded-lg shrink-0 hover:brightness-110"
                  type="button"
                >
                  <FaShoppingCart size={18} />
                </button>
              </div>

              <div className="flex items-center justify-between w-full mt-5">

                {/* PRICE */}
                <p className="text-[#f5f5f5] text-2xl font-bold">
                  ₱{item.price}
                </p>

                {/* QUANTITY CONTROL */}
                <div className="flex items-center bg-[#1f1f1f] rounded-lg overflow-hidden border border-[#2a2a2a]">

                  <button
                    onClick={() => decrement(item.id)}
                    className="px-3 py-2 text-yellow-500 text-xl hover:bg-[#2a2a2a]"
                  >
                    −
                  </button>

                  <span className="px-4 text-white font-semibold min-w-[30px] text-center">
                    {quantity}
                  </span>

                  <button
                    onClick={() => increment(item.id)}
                    className="px-3 py-2 text-yellow-500 text-xl hover:bg-[#2a2a2a]"
                  >
                    +
                  </button>

                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default MenuContainer;