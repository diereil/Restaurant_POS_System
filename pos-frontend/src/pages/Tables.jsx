import React, { useState, useEffect } from "react";
import BottomNav from "../components/shared/BottomNav";
import BackButton from "../components/shared/BackButton";
import TableCard from "../components/tables/TableCard";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { getTables } from "../https";
import { enqueueSnackbar } from "notistack";
import socket from "../socket";

const Tables = () => {
  const [status, setStatus] = useState("all");
  const queryClient = useQueryClient();

  useEffect(() => {
    document.title = "POS | Tables";
  }, []);

  useEffect(() => {
    const handleTablesUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    };

    socket.on("ordersUpdated", handleTablesUpdated);
    socket.on("new-order", handleTablesUpdated);

    return () => {
      socket.off("ordersUpdated", handleTablesUpdated);
      socket.off("new-order", handleTablesUpdated);
    };
  }, [queryClient]);

  const { data: resData, isError, isLoading } = useQuery({
    queryKey: ["tables"],
    queryFn: async () => await getTables(),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (isError) {
      enqueueSnackbar("Something went wrong!", { variant: "error" });
    }
  }, [isError]);

  const tables = resData?.data?.data || [];

  const filteredTables =
    status === "booked"
      ? tables.filter((table) => table.status === "Booked")
      : tables;

  return (
    <section className="bg-[#1f1f1f] min-h-screen pb-20">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-white text-2xl font-bold">Tables</h1>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setStatus("all")}
            className={`px-4 py-2 rounded-lg ${
              status === "all" ? "bg-[#383838] text-white" : "text-gray-400"
            }`}
          >
            All
          </button>

          <button
            onClick={() => setStatus("booked")}
            className={`px-4 py-2 rounded-lg ${
              status === "booked" ? "bg-[#383838] text-white" : "text-gray-400"
            }`}
          >
            Booked
          </button>
        </div>
      </div>

      <div className="px-6">
        {isLoading ? (
          <p className="text-gray-400">Loading tables...</p>
        ) : (
          <div
            className="grid gap-4 
            grid-cols-2 
            md:grid-cols-3 
            lg:grid-cols-4 
            xl:grid-cols-5"
          >
            {filteredTables.map((table) => (
              <TableCard
                key={table._id}
                id={table._id}
                name={table.tableNo}
                status={table.status}
                initials={table?.currentOrder?.customerDetails?.name}
                seats={table.seats}
                orderId={table?.currentOrder?._id || null}
                onTableUpdated={() => {
                  queryClient.invalidateQueries({ queryKey: ["tables"] });
                  queryClient.invalidateQueries({ queryKey: ["orders"] });
                }}
              />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </section>
  );
};

export default Tables;