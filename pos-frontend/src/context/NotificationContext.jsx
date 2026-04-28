import { createContext, useContext, useEffect, useRef, useState } from "react";
import cashAlertSound from "../assets/sounds/cash-alert.mp3";
import onlineAlertSound from "../assets/sounds/online-alert.mp3";
import axios from "../https/axiosWrapper";

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem("notificationsMuted") === "true";
  });

  const cashAudioRef = useRef(null);
  const onlineAudioRef = useRef(null);
  const seenOrderIdsRef = useRef(new Set());

  useEffect(() => {
    cashAudioRef.current = new Audio(cashAlertSound);
    onlineAudioRef.current = new Audio(onlineAlertSound);
  }, []);

  useEffect(() => {
    localStorage.setItem("notificationsMuted", String(isMuted));
  }, [isMuted]);

  // 🔥 POLLING INSTEAD OF SOCKET
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get("/api/order");
        const orders = res?.data?.data || [];

        orders.forEach((order) => {
          if (order.orderSource === "customer" && order.isNewOrder) {
            if (!seenOrderIdsRef.current.has(order._id)) {
              seenOrderIdsRef.current.add(order._id);

              const notification = {
                id: Date.now(),
                message: `New ${order.paymentMethod} order - Table ${order.tableNo}`,
                orderId: order._id,
                createdAt: new Date().toLocaleTimeString(),
              };

              setNotifications((prev) => [notification, ...prev]);

              // 🔊 SOUND
              if (!isMuted) {
                if (order.paymentMethod === "Cash") {
                  cashAudioRef.current?.play();
                } else {
                  onlineAudioRef.current?.play();
                }
              }
            }
          }
        });
      } catch (err) {
        console.log("Polling error:", err);
      }
    };

    const interval = setInterval(fetchOrders, 5000);

    return () => clearInterval(interval);
  }, [isMuted]);

  const clearNotifications = () => setNotifications([]);
  const toggleMute = () => setIsMuted((prev) => !prev);

  return (
    <NotificationContext.Provider
      value={{ notifications, clearNotifications, isMuted, toggleMute }}
    >
      {children}
    </NotificationContext.Provider>
  );
};