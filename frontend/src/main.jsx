import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { GlobalLoadingProvider } from "./contexts/GlobalLoading";
import GlobalSkeleton from "./components/GlobalSkeleton";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GlobalLoadingProvider>
      <App />
      <GlobalSkeleton />
    </GlobalLoadingProvider>
  </StrictMode>,
);
