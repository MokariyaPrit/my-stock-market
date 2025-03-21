import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store";
import App from "./App";
import "./index.css"
import { AuthProvider } from "./context/AuthContext"; // Import AuthProvider
import { SpeedInsights } from "@vercel/speed-insights/react"


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
     <AuthProvider>
    <Provider store={store}>
      <App />
    </Provider>
     </AuthProvider>
  </React.StrictMode>
);
