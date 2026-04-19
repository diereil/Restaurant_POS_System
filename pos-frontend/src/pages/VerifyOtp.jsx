import React, { useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../https/axiosWrapper";
import { enqueueSnackbar } from "notistack";
import logo from "../assets/images/logo.png";
import restaurant from "../assets/images/restaurant-img.jpg";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef([]);

  const maskedEmail = useMemo(() => {
    if (!email || !email.includes("@")) return email;
    const [name, domain] = email.split("@");
    if (name.length <= 2) return `${name[0] || ""}***@${domain}`;
    return `${name.slice(0, 2)}***@${domain}`;
  }, [email]);

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim();

    if (!/^\d{6}$/.test(pasted)) return;

    const newOtp = pasted.split("");
    setOtp(newOtp);

    newOtp.forEach((digit, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = digit;
      }
    });

    inputRefs.current[5]?.focus();
  };

  const handleVerify = async () => {
    const otpValue = otp.join("");

    if (!email) {
      enqueueSnackbar("Missing email. Please register again.", {
        variant: "error",
      });
      navigate("/auth");
      return;
    }

    if (otpValue.length !== 6) {
      enqueueSnackbar("Please enter the 6-digit OTP.", {
        variant: "warning",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      await axios.post("/api/user/verify-otp", {
        email,
        otp: otpValue,
      });

      enqueueSnackbar("Email verified successfully!", {
        variant: "success",
      });

      navigate("/auth");
    } catch (err) {
      enqueueSnackbar(
        err?.response?.data?.message || "Failed to verify OTP",
        {
          variant: "error",
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#111]">
      <div className="hidden md:flex w-1/2 relative">
        <img
          src={restaurant}
          alt="Restaurant"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/75" />

        <div className="absolute bottom-12 left-10 right-10">
          <h1 className="text-white text-4xl font-bold mb-4">
            Verify Your Account
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed">
            Enter the 6-digit OTP sent to your email to activate your employee
            account securely.
          </p>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-10 bg-[#1a1a1a]">
        <div className="w-full max-w-md bg-[#222] rounded-2xl p-8 shadow-2xl border border-[#2f2f2f]">
          <div className="flex flex-col items-center mb-8">
            <img
              src={logo}
              alt="Restro Logo"
              className="h-16 w-16 rounded-full border border-yellow-400 p-1 mb-3"
            />
            <h1 className="text-white text-3xl font-bold">Verify OTP</h1>
            <p className="text-gray-400 text-sm mt-3 text-center">
              We sent a 6-digit code to
            </p>
            <p className="text-yellow-400 font-medium text-center break-all">
              {maskedEmail || "your email"}
            </p>
          </div>

          <div
            className="flex justify-between gap-2 mb-6"
            onPaste={handlePaste}
          >
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-12 h-14 md:w-14 md:h-16 rounded-xl bg-[#111] border border-[#333] text-white text-center text-2xl font-bold outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
              />
            ))}
          </div>

          <button
            onClick={handleVerify}
            disabled={isSubmitting}
            className={`w-full rounded-xl py-3 text-lg font-bold transition ${
              isSubmitting
                ? "bg-yellow-300 text-black opacity-70 cursor-not-allowed"
                : "bg-yellow-400 hover:bg-yellow-500 text-black"
            }`}
          >
            {isSubmitting ? "Verifying..." : "Verify OTP"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/auth")}
            className="w-full mt-4 text-gray-400 hover:text-white transition text-sm"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;