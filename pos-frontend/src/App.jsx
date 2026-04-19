import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { Home, Auth, Orders, Tables, Menu, Dashboard } from "./pages";
import Header from "./components/shared/Header";
import { useSelector } from "react-redux";
import useLoadData from "./hooks/useLoadData";
import FullScreenLoader from "./components/shared/FullScreenLoader";
import PaymentSuccess from "./pages/PaymentSuccess";
import CustomerMenu from "./pages/CustomerMenu";
import CustomerPaymentSuccess from "./pages/CustomerPaymentSuccess";
import VerifyOtp from "./pages/VerifyOtp";

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuth, role } = useSelector((state) => state.user);

  if (!isAuth) return <Navigate to="/auth" />;

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" />;
  }

  return children;
}

function Layout() {
  const location = useLocation();
  const isLoading = useLoadData();

  const hideHeaderRoutes = ["/auth", "/verify-otp"];

  const shouldHideHeader =
    hideHeaderRoutes.includes(location.pathname) ||
    location.pathname.startsWith("/customer-menu") ||
    location.pathname.startsWith("/customer-payment-success");

  const isCustomerRoute =
    location.pathname.startsWith("/customer-menu") ||
    location.pathname.startsWith("/customer-payment-success");

  const isPublicRoute =
    hideHeaderRoutes.includes(location.pathname) || isCustomerRoute;

  if (isLoading && !isPublicRoute) return <FullScreenLoader />;

  return (
    <>
      {!shouldHideHeader && <Header />}

      <Routes>
        {/* PUBLIC */}
        <Route path="/auth" element={<Auth />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route
          path="/customer-payment-success"
          element={<CustomerPaymentSuccess />}
        />
        <Route path="/customer-menu/:tableNo" element={<CustomerMenu />} />

        {/* ALL ROLES */}
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Cashier", "Waiter"]}>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/menu"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Cashier", "Waiter"]}>
              <Menu />
            </ProtectedRoute>
          }
        />

        {/* CASHIER + ADMIN */}
        <Route
          path="/orders"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Cashier"]}>
              <Orders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tables"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Cashier", "Waiter"]}>
              <Tables />
            </ProtectedRoute>
          }
        />

        {/* ADMIN ONLY */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<div>Not Found</div>} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;