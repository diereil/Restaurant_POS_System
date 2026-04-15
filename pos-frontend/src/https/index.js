import axios from "./axiosWrapper";

// =========================
// AUTH ENDPOINTS
// =========================
export const login = (data) => axios.post("/api/user/login", data);
export const register = (data) => axios.post("/api/user/register", data);
export const getUserData = () => axios.get("/api/user");
export const logout = () => axios.post("/api/user/logout");

// =========================
// TABLE ENDPOINTS
// =========================
export const addTable = (data) => axios.post("/api/table/", data);
export const getTables = () => axios.get("/api/table");
export const updateTable = ({ tableId, ...tableData }) =>
  axios.put(`/api/table/${tableId}`, tableData);

// =========================
// ORDER ENDPOINTS
// =========================
export const addOrder = (data) => axios.post("/api/order/", data);
export const getOrders = () => axios.get("/api/order");
export const getOrderById = (id) => axios.get(`/api/order/${id}`);
export const updateOrderStatus = ({ orderId, orderStatus }) =>
  axios.put(`/api/order/${orderId}`, { orderStatus });
export const deleteOrder = (orderId) => axios.delete(`/api/order/${orderId}`);

// =========================
// STRIPE PAYMENT ENDPOINTS
// =========================
export const createStripeCheckoutSession = (data) =>
  axios.post("/api/payment/checkout-session", data);

export const getStripeCheckoutSession = (sessionId) =>
  axios.get(`/api/payment/checkout-session/${sessionId}`);

// =========================
// OPTIONAL LEGACY EXPORTS
// =========================
export const createOrderRazorpay = (data) =>
  axios.post("/api/payment/checkout-session", data);

export const verifyPaymentRazorpay = async () => ({
  data: { message: "Stripe flow in use." },
});