/**
 * Main entry point for the Uptime Watcher React app.
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
 * Initializes and renders the Uptime Watcher React app.
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
    const rootElement = document.querySelector<HTMLElement>("#root");
    if (!rootElement) {
        throw new Error("Root element not found");
    }

    createRoot(rootElement).render(
        <StrictMode>
            <App />
        </StrictMode>
    );
}

function renderStartupFailure(error: Error): void {
    const fallbackHost =
        document.querySelector<HTMLElement>("#root") ?? document.body;
    const container = document.createElement("main");
    const title = document.createElement("h1");
    const message = document.createElement("p");
    const detail = document.createElement("p");

    container.className =
        "flex min-h-screen flex-col items-center justify-center gap-3 bg-primary p-6 text-center text-primary";
    container.setAttribute("role", "alert");

    title.className = "font-semibold text-2xl";
    title.textContent = "Uptime Watcher could not start";

    message.className = "max-w-md text-secondary text-sm";
    message.textContent = "The app failed before the interface loaded.";

    detail.className = "max-w-md text-error-default text-xs";
    detail.textContent = error.message;

    container.append(title, message, detail);
    fallbackHost.replaceChildren(container);
}

// Initialize the app
try {
    initializeApp();
} catch (error) {
    const normalizedError = ensureError(error);
    logger.app.error("initializeApp", normalizedError);

    try {
        renderStartupFailure(normalizedError);
    } catch (fallbackError) {
        logger.app.error("renderStartupFailure", ensureError(fallbackError));
    }
}
