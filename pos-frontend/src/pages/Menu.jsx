import React, { useEffect } from "react";
import BottomNav from "../components/shared/BottomNav";
import BackButton from "../components/shared/BackButton";
import { MdRestaurantMenu } from "react-icons/md";
import MenuContainer from "../components/menu/MenuContainer";
import CustomerInfo from "../components/menu/CustomerInfo";
import CartInfo from "../components/menu/CartInfo";
import Bill from "../components/menu/Bill";
import { useSelector } from "react-redux";

const Menu = () => {
  useEffect(() => {
    document.title = "POS | Menu";
  }, []);

  const customerData = useSelector((state) => state.customer);

  return (
    <section className="bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden flex gap-4 px-3 pt-3 pb-24">
      <div className="flex-[3] min-w-0 overflow-y-auto scrollbar-hide bg-[#1a1a1a] rounded-xl">
        <div className="flex items-center justify-between px-6 py-4 sticky top-0 z-10 bg-[#1a1a1a]">
          <div className="flex items-center gap-4">
            <BackButton />
            <h1 className="text-[#f5f5f5] text-2xl font-bold tracking-wider">
              Menu
            </h1>
          </div>

          <div className="flex items-center gap-3 cursor-pointer shrink-0">
            <MdRestaurantMenu className="text-[#f5f5f5] text-4xl" />
            <div className="flex flex-col items-start">
              <h1 className="text-md text-[#f5f5f5] font-semibold tracking-wide">
                {customerData.customerName || "Customer Name"}
              </h1>
              <p className="text-xs text-[#ababab] font-medium">
                Table : {customerData.table?.tableNo || "N/A"}
              </p>
            </div>
          </div>
        </div>

        <MenuContainer />
      </div>

      <div className="flex-[1] min-w-[350px] max-w-[390px] bg-[#1a1a1a] rounded-xl flex flex-col min-h-0 overflow-hidden">
        <div className="shrink-0">
          <CustomerInfo />
          <hr className="border-[#2a2a2a] border-t" />
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          <CartInfo />
        </div>

        <div className="shrink-0">
          <hr className="border-[#2a2a2a] border-t" />
          <Bill />
        </div>
      </div>

      <BottomNav />
    </section>
  );
};

export default Menu;