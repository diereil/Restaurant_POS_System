import React, { useEffect } from "react";
import BottomNav from "../components/shared/BottomNav";
import Greetings from "../components/home/Greetings";
import { BsCashCoin } from "react-icons/bs";
import { GrInProgress } from "react-icons/gr";
import MiniCard from "../components/home/MiniCard";
import RecentOrders from "../components/home/RecentOrders";
import PopularDishes from "../components/home/PopularDishes";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getOrders } from "../https";
import socket from "../socket";

const Home = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    document.title = "POS | Home";
  }, []);

  useEffect(() => {
    const handleRealtimeUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    };

    socket.on("ordersUpdated", handleRealtimeUpdate);
    socket.on("new-order", handleRealtimeUpdate);

    return () => {
      socket.off("ordersUpdated", handleRealtimeUpdate);
      socket.off("new-order", handleRealtimeUpdate);
    };
  }, [queryClient]);

  const { data: resData, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  });

  const orders = resData?.data?.data || [];

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

        <div className="flex items-center w-full gap-3 px-8 mt-8">
          <MiniCard
            title="Total Earnings"
            icon={<BsCashCoin />}
            number={isLoading ? "..." : `₱${totalEarnings.toFixed(2)}`}
            footerNum={"Completed orders"}
          />

          <MiniCard
            title="In Progress"
            icon={<GrInProgress />}
            number={isLoading ? "..." : inProgressCount}
            footerNum={"orders"}
          />
        </div>

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