import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { addOrder, getStripeCheckoutSession } from "../https";
import { enqueueSnackbar } from "notistack";

const CustomerPaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const finalizeCustomerOrder = async () => {
      try {
        const sessionId = searchParams.get("session_id");
        const raw = localStorage.getItem("pendingCustomerStripeOrder");

        if (!sessionId) {
          enqueueSnackbar("Missing Stripe session ID!", { variant: "warning" });
          navigate("/");
          return;
        }

        if (!raw) {
          enqueueSnackbar("No pending customer order found!", { variant: "warning" });
          navigate("/");
          return;
        }

        const processedKey = `customerStripeProcessed_${sessionId}`;
        if (sessionStorage.getItem(processedKey)) {
          navigate("/");
          return;
        }

        const sessionRes = await getStripeCheckoutSession(sessionId);
        const session = sessionRes?.data?.session;

        if (session?.payment_status !== "paid") {
          enqueueSnackbar("Payment not completed!", { variant: "warning" });
          navigate("/");
          return;
        }

        const orderData = JSON.parse(raw);

        await addOrder({
          ...orderData,
          paymentData: {
            provider: "stripe",
            status: "paid",
            stripe_session_id: session.id,
          },
        });

        sessionStorage.setItem(processedKey, "true");
        localStorage.removeItem("pendingCustomerStripeOrder");

        enqueueSnackbar("Online payment successful! Order placed.", {
          variant: "success",
        });

        navigate(`/customer-menu/${orderData.tableNo}`);
      } catch (error) {
        console.log(error);
        enqueueSnackbar("Failed to finalize customer order!", {
          variant: "error",
        });
        navigate("/");
      }
    };

    finalizeCustomerOrder();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-[#1f1f1f] flex items-center justify-center text-white text-2xl">
      Processing customer payment...
    </div>
  );
};

export default CustomerPaymentSuccess;