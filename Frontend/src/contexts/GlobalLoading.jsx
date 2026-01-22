import React, { createContext, useContext, useState, useCallback } from "react";

const GlobalLoadingContext = createContext(null);

export const GlobalLoadingProvider = ({ children }) => {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState("");

  const showLoading = useCallback((msg) => {
    setMessage(msg || "");
    setCount((c) => c + 1);
  }, []);

  const hideLoading = useCallback(() => {
    setCount((c) => Math.max(0, c - 1));
    if (count <= 1) setMessage("");
  }, [count]);

  const value = {
    loading: count > 0,
    message,
    showLoading,
    hideLoading,
  };

  return (
    <GlobalLoadingContext.Provider value={value}>
      {children}
    </GlobalLoadingContext.Provider>
  );
};

export const useGlobalLoading = () => {
  const ctx = useContext(GlobalLoadingContext);
  if (!ctx)
    throw new Error(
      "useGlobalLoading must be used within GlobalLoadingProvider",
    );
  return ctx;
};

export default GlobalLoadingContext;
