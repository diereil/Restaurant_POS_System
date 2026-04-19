import { useDispatch } from "react-redux";
import { getUserData } from "../https";
import { useEffect, useState } from "react";
import { removeUser, setUser } from "../redux/slices/userSlice";
import { useLocation, useNavigate } from "react-router-dom";

const PUBLIC_ROUTES = ["/auth", "/verify-otp"];

const useLoadData = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const isCustomerRoute =
      location.pathname.startsWith("/customer-menu") ||
      location.pathname.startsWith("/customer-payment-success");

    const isPublicRoute =
      PUBLIC_ROUTES.includes(location.pathname) || isCustomerRoute;

    const fetchUser = async () => {
      try {
        const { data } = await getUserData();

        const { _id, name, email, phone, role } = data.data;
        dispatch(setUser({ _id, name, email, phone, role }));
      } catch (error) {
        dispatch(removeUser());

        // ✅ only redirect to /auth for protected pages
        if (!isPublicRoute) {
          navigate("/auth");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [dispatch, navigate, location.pathname]);

  return isLoading;
};

export default useLoadData;