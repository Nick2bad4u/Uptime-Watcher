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
 *
 * @remarks
 * Creates the React root and renders the App component with StrictMode for development benefits.
 * Throws an error if the root element is not found in the DOM.
 *
 * @throws Error when the root element (#root) is not found in the DOM
 */
function initializeApp(): void {
    const rootElement = document.querySelector("#root");
    if (!rootElement) {
        throw new Error("Root element not found");
    }

    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}

// Initialize the application
initializeApp();
