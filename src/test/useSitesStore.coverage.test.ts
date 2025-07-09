/**
 * Test coverage for utils.ts waitForElectronAPI function
 * Targeting missing lines 87-105
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { waitForElectronAPI } from "../stores/utils";

// Mock window and setTimeout
interface MockWindow {
    electronAPI?:
        | {
              sites?: {
                  getSites?: (() => void) | string;
              };
          }
        | undefined;
}

Object.defineProperty(global, "window", {
    value: {} as MockWindow,
    writable: true,
});

describe("waitForElectronAPI - Complete Coverage", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        // Reset window.electronAPI
        (global.window as MockWindow).electronAPI = undefined;
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("should return immediately when electronAPI is available", async () => {
        // Setup electronAPI as available
        (global.window as MockWindow).electronAPI = {
            sites: {
                getSites: vi.fn(),
            },
        };

        const promise = waitForElectronAPI();

        // Should resolve immediately
        await expect(promise).resolves.toBeUndefined();
    });
});
