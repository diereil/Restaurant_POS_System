import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { addOrder, getStripeCheckoutSession } from "../https";
import { enqueueSnackbar } from "notistack";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const finalizeOrder = async () => {
      try {
        const sessionId = searchParams.get("session_id");
        const raw = localStorage.getItem("pendingStripeOrder");

        if (!sessionId) {
          enqueueSnackbar("Missing Stripe session ID!", { variant: "warning" });
          navigate("/menu");
          return;
        }

        if (!raw) {
          enqueueSnackbar("No pending order found!", { variant: "warning" });
          navigate("/menu");
          return;
        }

        const processedKey = `stripeOrderProcessed_${sessionId}`;
        if (sessionStorage.getItem(processedKey)) {
          navigate("/orders");
          return;
        }

        const sessionRes = await getStripeCheckoutSession(sessionId);
        const session = sessionRes?.data?.session;

        if (session?.payment_status !== "paid") {
          enqueueSnackbar("Payment not completed!", { variant: "warning" });
          navigate("/menu");
          return;
        }

        const orderData = JSON.parse(raw);

        await addOrder({
          ...orderData,
          paymentData: {
            provider: "stripe",
            status: "paid",
            stripe_session_id: session.id,
            stripe_payment_status: session.payment_status,
          },
        });

        sessionStorage.setItem(processedKey, "true");
        localStorage.removeItem("pendingStripeOrder");

        enqueueSnackbar("Payment successful and order saved!", {
          variant: "success",
        });

        navigate("/orders");
      } catch (error) {
        console.log(error);
        enqueueSnackbar("Failed to finalize order!", { variant: "error" });
        navigate("/menu");
      }
    };

    finalizeOrder();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-[#1f1f1f] flex items-center justify-center text-white text-2xl">
      Processing payment success...
    </div>
  );
};

export default PaymentSuccess;