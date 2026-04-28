import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { menus } from "../constants";
import { enqueueSnackbar } from "notistack";
import { addOrder, createStripeCheckoutSession } from "../https";

const CustomerMenu = () => {
  const { tableNo } = useParams();

  const [selected, setSelected] = useState(menus[0]);
  const [counts, setCounts] = useState({});
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = `Table ${tableNo} Menu`;
  }, [tableNo]);

  const increment = (id) => {
    setCounts((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const decrement = (id) => {
    setCounts((prev) => ({
      ...prev,
      [id]: Math.max((prev[id] || 0) - 1, 0),
    }));
  };

  const handleAddToCart = (item) => {
    const qty = counts[item.id] || 0;

    if (qty <= 0) {
      enqueueSnackbar("Select quantity first!", { variant: "warning" });
      return;
    }

    setCart((prev) => {
      const existing = prev.find((cartItem) => cartItem.id === item.id);

      if (existing) {
        return prev.map((cartItem) =>
          cartItem.id === item.id
            ? {
                ...cartItem,
                quantity: cartItem.quantity + qty,
              }
            : cartItem
        );
      }

      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: qty,
        },
      ];
    });

    setCounts((prev) => ({
      ...prev,
      [item.id]: 0,
    }));

    enqueueSnackbar(`${item.name} added to cart`, { variant: "success" });
  };

  const totalItems = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const handleCashOrder = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/table/number/${tableNo}`);
    const tableData = await res.json();
    const tableId = tableData?.data?._id;

    if (!tableId) {
      enqueueSnackbar("Table not found!", { variant: "error" });
      return;
    }

    await addOrder({
      customerDetails: {
        name: "Guest",
        phone: "N/A",
        guests: 1,
      },
      orderStatus: "In Progress",
      items: cart,
      bills: {
        total,
        tax: 0,
        totalWithTax: total,
      },
      table: tableId,
      paymentMethod: "Cash",
      paymentData: {
        provider: null,
        status: "pending",
        stripe_session_id: null,
      },
      orderSource: "customer",
    });

    enqueueSnackbar("Cash order placed!", { variant: "success" });
    setCart([]);
    setCounts({});
    setPaymentMethod("Cash");
  };

  const handleOnlineOrder = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/table/number/${tableNo}`);
    const tableData = await res.json();
    const tableId = tableData?.data?._id;

    if (!tableId) {
      enqueueSnackbar("Table not found!", { variant: "error" });
      return;
    }

    const pendingOrder = {
      customerDetails: {
        name: "Guest",
        phone: "N/A",
        guests: 1,
      },
      orderStatus: "In Progress",
      items: cart,
      bills: {
        total,
        tax: 0,
        totalWithTax: total,
      },
      table: tableId,
      paymentMethod: "Online",
      paymentData: {
        provider: "stripe",
        status: "pending",
        stripe_session_id: null,
      },
      orderSource: "customer",
      tableNo,
    };

    localStorage.setItem(
      "pendingCustomerStripeOrder",
      JSON.stringify(pendingOrder)
    );

    let response;

try {
  response = await createStripeCheckoutSession({
    amount: total.toFixed(2),
    description: `Customer Order - Table ${tableNo}`,
    customer: {
      name: "Guest",
      email: "guest@example.com",
      phone: "N/A",
    },
    successPath: "/customer-payment-success",
    cancelPath: `/customer-menu/${tableNo}`,
  });
} catch (err) {
  console.log(err);
  enqueueSnackbar("Stripe request failed!", { variant: "error" });
  return;
}

const data = response?.data;

if (!data?.url) {
  enqueueSnackbar("Stripe URL missing!", { variant: "error" });
  return;
}

window.location.href = data.url;

    if (!data?.url) {
      enqueueSnackbar("Failed to start online payment!", {
        variant: "error",
      });
      return;
    }

    window.location.href = data.url;
  };

  const handlePlaceOrder = async () => {
    try {
      if (isSubmitting) return;

      if (cart.length === 0) {
        enqueueSnackbar("No items in cart!", { variant: "warning" });
        return;
      }

      setIsSubmitting(true);

      if (paymentMethod === "Cash") {
        await handleCashOrder();
      } else {
        await handleOnlineOrder();
      }
    } catch (err) {
      console.log(err);
      enqueueSnackbar("Order failed!", { variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#1f1f1f] min-h-screen text-white">
      <div className="px-5 pt-5 pb-[220px]">
        <h1 className="text-3xl font-bold mb-5">Table {tableNo} Menu</h1>

        <div className="flex gap-3 mb-5 overflow-x-auto scrollbar-hide">
          {menus.map((menu) => (
            <button
              key={menu.id}
              onClick={() => setSelected(menu)}
              className={`px-5 py-3 rounded-xl whitespace-nowrap font-medium transition ${
                selected.id === menu.id
                  ? "bg-yellow-500 text-black"
                  : "bg-[#2a2a2a] text-white"
              }`}
              type="button"
            >
              {menu.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {selected.items.map((item) => {
            const qty = counts[item.id] || 0;

            return (
              <div
                key={item.id}
                className="bg-[#2a2a2a] rounded-2xl p-5 flex items-center justify-between gap-4 min-h-[170px]"
              >
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-2xl leading-tight break-words">
                    {item.name}
                  </h2>

                  <p className="text-green-400 font-bold text-2xl mt-2">
                    ₱{item.price}
                  </p>

                  <div className="flex items-center gap-3 mt-5">
                    <button
                      onClick={() => decrement(item.id)}
                      className="w-12 h-12 rounded-xl bg-[#1a1a1a] text-2xl font-bold flex items-center justify-center"
                      type="button"
                    >
                      −
                    </button>

                    <span className="text-2xl min-w-[28px] text-center">
                      {qty}
                    </span>

                    <button
                      onClick={() => increment(item.id)}
                      className="w-12 h-12 rounded-xl bg-[#1a1a1a] text-2xl font-bold flex items-center justify-center"
                      type="button"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => handleAddToCart(item)}
                  className="bg-green-500 hover:bg-green-600 transition px-6 py-4 rounded-xl font-semibold text-2xl shrink-0"
                  type="button"
                >
                  Add
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-[#111] border-t border-[#2a2a2a] px-5 py-4 z-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-400 text-sm">Items</p>
            <p className="text-white text-2xl font-semibold">{totalItems}</p>
          </div>

          <div className="text-right">
            <p className="text-gray-400 text-sm">Total</p>
            <p className="text-white text-3xl font-bold">₱{total.toFixed(2)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <button
            onClick={() => setPaymentMethod("Cash")}
            className={`py-3 rounded-xl font-semibold text-lg transition ${
              paymentMethod === "Cash"
                ? "bg-green-500 text-white"
                : "bg-[#2a2a2a] text-white"
            }`}
            type="button"
          >
            Cash
          </button>

          <button
            onClick={() => setPaymentMethod("Online")}
            className={`py-3 rounded-xl font-semibold text-lg transition ${
              paymentMethod === "Online"
                ? "bg-blue-500 text-white"
                : "bg-[#2a2a2a] text-white"
            }`}
            type="button"
          >
            Online
          </button>
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={isSubmitting}
          className={`w-full py-4 rounded-xl font-bold text-xl ${
            isSubmitting
              ? "bg-yellow-300 text-black opacity-70 cursor-not-allowed"
              : "bg-yellow-500 text-black"
          }`}
          type="button"
        >
          {isSubmitting ? "Placing Order..." : "Place Order"}
        </button>
      </div>
    </div>
  );
};

export default CustomerMenu;