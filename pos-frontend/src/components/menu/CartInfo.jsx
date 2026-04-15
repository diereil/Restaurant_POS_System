import React, { useEffect, useRef } from "react";
import { RiDeleteBin2Fill } from "react-icons/ri";
import { FaNotesMedical } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { removeItem } from "../../redux/slices/cartSlice";

const CartInfo = () => {
  const cartData = useSelector((state) => state.cart);
  const scrollRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [cartData]);

  const handleRemove = (itemId) => {
    dispatch(removeItem(itemId));
  };

  return (
    <div className="px-4 py-2 h-full flex flex-col min-h-0">
      <h1 className="text-lg text-[#e4e4e4] font-semibold tracking-wide shrink-0">
        Order Details
      </h1>

      <div
        className="mt-4 flex-1 min-h-0 overflow-y-auto scrollbar-hide pr-1"
        ref={scrollRef}
      >
        {cartData.length === 0 ? (
          <p className="text-[#ababab] text-sm flex justify-center items-center h-full">
            Your cart is empty. Start adding items!
          </p>
        ) : (
          cartData.map((item, index) => (
            <div
              key={item.id || item._id || `${item.name}-${index}`}
              className="bg-[#1f1f1f] rounded-lg px-4 py-4 mb-2"
            >
              <div className="flex items-center justify-between gap-3">
                <h1 className="text-[#ababab] font-semibold tracking-wide text-md">
                  {item.name}
                </h1>
                <p className="text-[#ababab] font-semibold shrink-0">
                  x{item.quantity}
                </p>
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-3">
                  <RiDeleteBin2Fill
                    onClick={() => handleRemove(item.id || item._id)}
                    className="text-[#ababab] cursor-pointer"
                    size={20}
                  />
                  <FaNotesMedical
                    className="text-[#ababab] cursor-pointer"
                    size={20}
                  />
                </div>

                <p className="text-[#f5f5f5] text-md font-bold">
                  ₱{item.price}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CartInfo;