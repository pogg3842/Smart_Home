import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider } from "./auth/AuthProvider.jsx";
import BaoVeUngDung from "./auth/BaoVeUngDung.jsx";
import "./style.css";

// Điểm khởi chạy chính của giao diện.
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <BaoVeUngDung />
    </AuthProvider>
  </React.StrictMode>,
);
