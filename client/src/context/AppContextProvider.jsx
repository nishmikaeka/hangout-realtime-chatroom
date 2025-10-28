import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import AppContext from "../context/AppContext.jsx";

const AppContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  const getAuthState = async () => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/auth/is-auth`,
        {},
        { withCredentials: true }
      );
      setIsLoggedIn(data.success);
      if (data.success) getUserData();
    } catch (error) {
      setIsLoggedIn(false);
      console.error(error);
    }
  };

  const getUserData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/data`, {
        withCredentials: true,
      });
      if (data.success) setUserData(data.userData);
      else toast.error(data.message);
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    }
  };

  useEffect(() => {
    getAuthState();
  }, []);

  return (
    <AppContext.Provider
      value={{
        backendUrl,
        isLoggedIn,
        setIsLoggedIn,
        userData,
        setUserData,
        getUserData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
