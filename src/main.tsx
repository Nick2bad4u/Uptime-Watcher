/**
 * Main entry point for the Uptime Watcher React application.
 *
 * @remarks
 * This module initializes the React root and renders the main {@link App}
 * component. React StrictMode is enabled for highlighting potential problems in
 * development. The root element is located by its DOM ID ("root").
 *
 * @throws {@link Error} If the root element with ID "root" is not found in the
 *   DOM.
 */

import { ensureError } from "@shared/utils/errorHandling";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App";
import { logger } from "./services/logger";
import "./index.css";

/**
 * Initializes and renders the Uptime Watcher React application.
 *
 * @remarks
 * -
 *
 * Locates the root DOM element by ID ("root").
 *
 * - Throws an error if the root element is missing.
 * - Creates a React root and renders the {@link App} component inside
 *   {@link StrictMode}.
 *
 * @example
 *
 * ```typescript
 * // This function is called automatically when the module loads.
 * initializeApp();
 * ```
 *
 * @throws {@link Error} If the root element with ID "root" is not found.
 */
function initializeApp(): void {
    // eslint-disable-next-line unicorn/prefer-query-selector -- getElementById is measurably faster for single ID lookups and this is the critical app initialization path
    const rootElement = document.getElementById("root");
    if (!rootElement) {
        throw new Error("Root element not found");
    }

    createRoot(rootElement).render(
        <StrictMode>
            <App />
        </StrictMode>
    );
}

// Initialize the application
try {
    initializeApp();
} catch (error) {
    const normalizedError = ensureError(error);
    logger.app.error("initializeApp", normalizedError);
    // Could show an error boundary or fallback UI here
}
