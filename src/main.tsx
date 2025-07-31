/**
 * Main entry point for the Uptime Watcher React application.
 *
 * @remarks
 * This module initializes the React root and renders the main {@link App} component.
 * React StrictMode is enabled for highlighting potential problems in development.
 * The root element is located by its DOM ID ("root").
 *
 * @throws {@link Error} If the root element with ID "root" is not found in the DOM.
 */

import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./index.css";

/**
 * Initializes and renders the Uptime Watcher React application.
 *
 * @remarks
 * - Locates the root DOM element by ID ("root").
 * - Throws an error if the root element is missing.
 * - Creates a React root and renders the {@link App} component inside {@link React.StrictMode}.
 *
 * @throws {@link Error} If the root element with ID "root" is not found.
 *
 * @example
 * ```typescript
 * // This function is called automatically when the module loads.
 * initializeApp();
 * ```
 */
function initializeApp(): void {
    // eslint-disable-next-line unicorn/prefer-query-selector -- getElementById is more performant for single ID lookups
    const rootElement = document.getElementById("root");
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
try {
    initializeApp();
} catch (error) {
    console.error("Failed to initialize application:", error);
    // Could show an error boundary or fallback UI here
}
