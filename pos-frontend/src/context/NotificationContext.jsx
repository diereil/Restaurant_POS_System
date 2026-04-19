import { createContext, useContext, useEffect, useRef, useState } from "react";
import socket from "../socket";
import cashAlertSound from "../assets/sounds/cash-alert.mp3";
import onlineAlertSound from "../assets/sounds/online-alert.mp3";

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
    cashAudioRef.current.preload = "auto";

    onlineAudioRef.current = new Audio(onlineAlertSound);
    onlineAudioRef.current.preload = "auto";
  }, []);

  useEffect(() => {
    localStorage.setItem("notificationsMuted", String(isMuted));
  }, [isMuted]);

  useEffect(() => {
    const handleNewOrder = (data) => {
      const notification = {
        id: Date.now() + Math.random(),
        type: data?.type || "new_order",
        message: data?.message || "New notification",
        table: data?.table || null,
        paymentMethod: data?.paymentMethod || null,
        orderId: data?.orderId || null,
        orderSource: data?.orderSource || null,
        createdAt: new Date().toLocaleTimeString(),
      };

      setNotifications((prev) => [notification, ...prev]);

      const isCustomerOrder = notification.orderSource === "customer";
      const isNewOrderId =
        notification.orderId && !seenOrderIdsRef.current.has(notification.orderId);

      if (notification.orderId) {
        seenOrderIdsRef.current.add(notification.orderId);
      }

      if (!isMuted && isCustomerOrder && isNewOrderId) {
        try {
          if (notification.type === "online_paid") {
            if (onlineAudioRef.current) {
              onlineAudioRef.current.currentTime = 0;
              onlineAudioRef.current.play().catch((error) => {
                console.log("Online audio blocked:", error);
              });
            }
          } else if (notification.type === "cash_order") {
            if (cashAudioRef.current) {
              cashAudioRef.current.currentTime = 0;
              cashAudioRef.current.play().catch((error) => {
                console.log("Cash audio blocked:", error);
              });
            }
          }
        } catch (error) {
          console.log("Audio error:", error);
        }
      }
    };

    socket.on("new-order", handleNewOrder);

    return () => {
      socket.off("new-order", handleNewOrder);
    };
  }, [isMuted]);

  const clearNotifications = () => {
    setNotifications([]);
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        clearNotifications,
        isMuted,
        toggleMute,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};