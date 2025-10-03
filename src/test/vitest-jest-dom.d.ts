/**
 * Type definitions for Vitest with jest-dom matchers. This file extends
 * Vitest's expect interface with jest-dom matchers.
 */

import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";

// Extend Vitest's Assertion interface with jest-dom matchers
declare module "vitest" {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface Assertion<T = any> extends TestingLibraryMatchers<T, void> {
        // Provides jest-dom matchers like toBeInTheDocument, toHaveTextContent, etc.
    }
}

declare module "@vitest/expect" {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface Assertion<T = any> extends TestingLibraryMatchers<T, void> {}
}
