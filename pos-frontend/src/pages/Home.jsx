import React, { useEffect, useState } from "react";
import BottomNav from "../components/shared/BottomNav";
import Greetings from "../components/home/Greetings";
import { BsCashCoin } from "react-icons/bs";
import { GrInProgress } from "react-icons/gr";
import MiniCard from "../components/home/MiniCard";
import RecentOrders from "../components/home/RecentOrders";
import PopularDishes from "../components/home/PopularDishes";
import { getOrders } from "../https";

const Home = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    document.title = "POS | Home";
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await getOrders();
      const data = res?.data?.data || [];
      setOrders(data);
    } catch (err) {
      console.log(err);
    }
  };

  const totalEarnings = orders
    .filter((o) => o.orderStatus === "Completed")
    .reduce((acc, o) => acc + (o.bills?.totalWithTax || 0), 0);

  const inProgressCount = orders.filter(
    (o) => o.orderStatus === "In Progress"
  ).length;

  return (
    <section className="bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden flex gap-3 pb-24">
      {/* LEFT SIDE */}
      <div className="flex-[3] min-w-0 overflow-y-auto scrollbar-hide">
        <Greetings />

        {/* DASHBOARD CARDS */}
        <div className="flex items-center w-full gap-3 px-8 mt-8">
          <MiniCard
            title="Total Earnings"
            icon={<BsCashCoin />}
            number={`₱${totalEarnings.toFixed(2)}`}
            footerNum={"Completed orders"}
          />

          <MiniCard
            title="In Progress"
            icon={<GrInProgress />}
            number={inProgressCount}
            footerNum={"orders"}
          />
        </div>

        {/* RECENT ORDERS */}
        <RecentOrders orders={orders} />
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-[2] min-w-0 overflow-y-auto scrollbar-hide pb-6">
        <PopularDishes />
      </div>

      <BottomNav />
    </section>
  );
};

export default Home;