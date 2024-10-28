import React from "react";
import App from "./App";
import "./index.css";
import ReactDOM from "react-dom/client";
import { UnitsProvider } from "./UnitsContext";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <UnitsProvider>
      <App />
    </UnitsProvider>
  </React.StrictMode>
);
