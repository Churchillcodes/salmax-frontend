import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import App from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (import.meta.env.PROD && !API_BASE_URL) {
  const rootEl = document.getElementById("root");
  rootEl.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0f0f0f;color:#f7f3ea;font-family:sans-serif;text-align:center;padding:24px;">
      <div>
        <h1 style="color:#c8a24a;font-size:20px;margin-bottom:8px;">Configuration Error</h1>
        <p style="font-size:13px;opacity:0.7;">VITE_API_BASE_URL is not set for this deployment. Please configure environment variables and rebuild.</p>
      </div>
    </div>
  `;
  throw new Error("Missing required environment variable: VITE_API_BASE_URL");
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <BrowserRouter>
          <AuthProvider>
            <App />
            <ToastContainer
              position="bottom-right"
              autoClose={4000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="dark"
            />
          </AuthProvider>
        </BrowserRouter>
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
