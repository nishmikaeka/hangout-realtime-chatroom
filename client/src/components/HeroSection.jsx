import React, { useContext } from "react";
import AppContext from "../context/AppContext.jsx";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const HeroSection = () => {
  const navigate = useNavigate();
  const { userData, backendUrl, setIsLoggedIn, setUserData } =
    useContext(AppContext);

  const logOut = async () => {
    try {
      const { data } = await axios.post(backendUrl + "/api/auth/logout");
      data.success && setIsLoggedIn(false);
      data.success && setUserData(false);
      navigate("/");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const sendVerificationOtp = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(
        backendUrl + "/api/auth/send-verify-otp"
      );
      if (data.success) {
        navigate("/email-verify");
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="absolute inset-0 -z-10 min-h-screen w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px]">
      {/* Navbar */}
      <section>
        <div className="w-full flex justify-between items-center p-4 sm:px-20">
          {/* Logo */}
          <div className="flex justify-between items-center w-full">
            <div>
              <img
                src="/full_logo.svg"
                alt="logo"
                className="w-32 sm:w-36 h-auto"
              />
            </div>
            {/*Mobile view*/}
            <div className="cursor-pointer font-medium sm:hidden text-sm hover:text-ghost">
              {userData ? (
                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center cursor-pointer relative group ">
                  <img src="/avatar.png" alt="Avatar" />
                  <div className="absolute hidden group-hover:block top-0 right-o z-10 text-black rounded-3xl pt-10">
                    <ul className="list-none m-0 p-2 bg-gray-100 text-sm">
                      {!userData.isAccountVerified && (
                        <li
                          onClick={sendVerificationOtp}
                          className="py-1 px-2 hover:bg-gray-200 cursor-pointer"
                        >
                          Verify Email
                        </li>
                      )}
                      <li
                        onClick={logOut}
                        className="py-1 px-2 hover:bg-gray-200 cursor-pointer pr-10"
                      >
                        LogOut
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="cursor-pointer text-sm hover:text-ghost"
                >
                  Login
                </button>
              )}
            </div>
          </div>

          {/* Nav Links (hidden on mobile) */}
          <div className="hidden sm:flex w-full justify-end items-center gap-6 text-[#2c2c2c]">
            <button
              className="cursor-pointer text-sm hover:text-ghost"
              onClick={() => navigate("/create-chatroom")}
            >
              Create a Room
            </button>
            <button className="cursor-pointer text-sm hover:text-ghost">
              Join a Room
            </button>

            {userData ? (
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center cursor-pointer relative group ">
                <img src="/avatar.png" alt="Avatar" />
                <div className="absolute hidden group-hover:block top-0 right-o z-10 text-black rounded-3xl pt-10">
                  <ul className="list-none m-0 p-2 bg-gray-100 text-sm">
                    {!userData.isAccountVerified && (
                      <li
                        onClick={sendVerificationOtp}
                        className="py-1 px-2 hover:bg-gray-200 cursor-pointer"
                      >
                        Verify Email
                      </li>
                    )}
                    <li
                      onClick={logOut}
                      className="py-1 px-2 hover:bg-gray-200 cursor-pointer pr-10"
                    >
                      LogOut
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="cursor-pointer text-sm hover:text-ghost"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="flex flex-col-reverse lg:flex-row gap-10 sm:px-20 p-4 items-center text-center sm:text-left">
        {/* Left Side (Text) */}
        <div className="w-full lg:w-6/12 sm:ml-20">
          <h1 className="text-3xl sm:text-4xl font-semibold leading-snug sm:leading-11 mt-5">
            Create Instant <span className="text-ghost">Chatrooms</span>{" "}
            <br className="hidden sm:block" />
            For Events, Friends <br className="hidden sm:block" /> or Teams
          </h1>
          <h2 className="text-gray-600 mt-3 text-sm sm:text-md max-w-md mx-auto sm:mx-0">
            Create temporary chatrooms, share a link or QR, and chat instantly
            with anyone—no signup needed.
          </h2>

          <div className="flex flex-col sm:flex-row gap-3 mt-5 justify-center sm:justify-start">
            <button
              className="bg-ghost text-sm text-white p-2 px-4 rounded-xl w-auto sm:w-45 cursor-pointer"
              onClick={() => navigate("/create-chatroom")}
            >
              Create a Chatroom
            </button>
            <button className="bg-ghost text-sm text-white p-2 px-4 rounded-xl w-auto sm:w-45 cursor-pointer">
              Join a Chatroom
            </button>
          </div>
        </div>

        {/* Right Side (Image) — hidden on small screens, BIGGER now */}
        <div className="w-full lg:w-6/12 h-auto hidden sm:block">
          <img
            src="/hero_bg.png"
            alt="hero_bg"
            className="w-full h-auto scale-110 lg:scale-125"
          />
        </div>
      </section>
    </div>
  );
};

export default HeroSection;
