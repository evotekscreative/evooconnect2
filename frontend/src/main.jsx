import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./index.css";
import router from "./routes.jsx";
import NotificationSound from "./components/NotificationSound";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <NotificationSound />
    <RouterProvider router={router} />
  </StrictMode>
);
