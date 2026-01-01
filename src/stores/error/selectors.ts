import type { ErrorStore } from "./types";

/** Selects the global loading state for error-managed operations. */
export const selectErrorIsLoading = (state: ErrorStore): boolean =>
    state.isLoading;

/** Selects the most recent error message (if any). */
export const selectLastError = (state: ErrorStore): string | undefined =>
    state.lastError;

/** Selects the action used to clear the current error. */
export const selectClearError = (state: ErrorStore): ErrorStore["clearError"] =>
    state.clearError;
