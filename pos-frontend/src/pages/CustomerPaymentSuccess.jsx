import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { addOrder } from "../https";
import { enqueueSnackbar } from "notistack";

const CustomerPaymentSuccess = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const processPayment = async () => {
      try {
        const sessionId = params.get("session_id");

        const pending = JSON.parse(
          localStorage.getItem("pendingCustomerStripeOrder")
        );

        if (!pending || !sessionId) {
          enqueueSnackbar("Missing payment data!", { variant: "error" });
          return;
        }

        pending.paymentData = {
          provider: "stripe",
          status: "paid",
          stripe_session_id: sessionId,
        };

        pending.paymentMethod = "Online";

        await addOrder(pending);

        localStorage.removeItem("pendingCustomerStripeOrder");

        enqueueSnackbar("Payment successful!", { variant: "success" });

        navigate(`/customer-menu/${pending.tableNo}`);
      } catch (err) {
        console.log(err);
        enqueueSnackbar("Failed to finalize order!", { variant: "error" });
      }
    };

    processPayment();
  }, []);

  return <div>Processing payment...</div>;
};

export default CustomerPaymentSuccess;