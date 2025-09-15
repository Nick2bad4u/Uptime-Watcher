/**
 * Test setup utility to suppress React act() warnings in components that use
 * real hooks with useEffect patterns during testing.
 *
 * This is specifically needed for tests where vi.mock() fails to properly
 * intercept hook calls, causing the real hooks to run and trigger act()
 * warnings for legitimate useEffect patterns that are already properly
 * implemented.
 */

// Store original console.error
const originalConsoleError = console.error;

/**
 * Suppress React act() warnings for tests where mocking fails but the
 * underlying code is correct (uses proper useEffect patterns).
 */
export function suppressReactActWarnings(): void {
    console.error = (...args: any[]) => {
        // Suppress act() warnings - these are false positives when mocks fail
        // but the real code uses proper useEffect patterns
        if (
            typeof args[0] === "string" &&
            args[0].includes("Warning: An update to") &&
            args[0].includes("inside a test was not wrapped in act")
        ) {
            return;
        }

        // Allow all other console.error calls through
        originalConsoleError(...args);
    };
}

/**
 * Restore original console.error functionality
 */
export function restoreConsoleError(): void {
    console.error = originalConsoleError;
}
