/**
 * Main entry point for the Uptime Watcher React application.
 * Sets up React root and renders the main App component with strict mode enabled.
 */

import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./index.css";

/**
 * Initialize and render the React application.
 * Creates the React root and renders the App component with StrictMode for development benefits.
 */
ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
