/**
 * Test coverage for utils.ts waitForElectronAPI function
 * Targeting missing lines 87-105
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { waitForElectronAPI } from "../stores/utils";

// Mock window and setTimeout
interface MockWindow {
    electronAPI?: {
        sites?: {
            getSites?: (() => void) | string;
        };
    } | undefined;
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

    it("should wait and retry when electronAPI is not available initially", async () => {
        // Start with no electronAPI
        (global.window as MockWindow).electronAPI = undefined;

        const promise = waitForElectronAPI(3, 100); // 3 attempts, 100ms base delay

        // Advance timers for first attempt
        vi.advanceTimersByTime(100);

        // Still no API, should continue waiting
        expect(promise).toBeInstanceOf(Promise);

        // Make API available after some time
        setTimeout(() => {
            (global.window as MockWindow).electronAPI = {
                sites: {
                    getSites: vi.fn(),
                },
            };
        }, 150);

        // Advance timers to trigger the setTimeout
        vi.advanceTimersByTime(150);
        
        // Advance for the next polling attempt
        vi.advanceTimersByTime(200); // exponential backoff

        await expect(promise).resolves.toBeUndefined();
    });

    it("should throw error after maximum attempts", async () => {
        // Use real timers for this test since it involves setTimeout
        vi.useRealTimers();
        
        // Never make electronAPI available
        (global.window as MockWindow).electronAPI = undefined;

        const promise = waitForElectronAPI(2, 50); // 2 attempts, 50ms base delay

        // Wait for the promise to complete naturally
        await expect(promise).rejects.toThrow(
            "ElectronAPI not available after maximum attempts. The application may not be running in an Electron environment."
        );
        
        // Restore fake timers
        vi.useFakeTimers();
    }, 5000); // 5 second timeout should be enough

    it("should handle exponential backoff with maximum delay", async () => {
        (global.window as MockWindow).electronAPI = undefined;

        const promise = waitForElectronAPI(5, 100);

        // Test that delay doesn't exceed 2000ms
        // After several attempts, delay should be capped at 2000ms
        
        for (let i = 0; i < 4; i++) {
            const expectedDelay = Math.min(100 * Math.pow(1.5, i), 2000);
            vi.advanceTimersByTime(expectedDelay);
        }

        // Make API available before final attempt
        (global.window as MockWindow).electronAPI = {
            sites: {
                getSites: vi.fn(),
            },
        };

        vi.advanceTimersByTime(2000); // Final attempt with max delay

        await expect(promise).resolves.toBeUndefined();
    });

    it("should handle window being undefined", async () => {
        // Set window to undefined
        (global as { window?: MockWindow | undefined }).window = undefined;

        const promise = waitForElectronAPI(1, 50);

        vi.advanceTimersByTime(50);

        await expect(promise).rejects.toThrow(
            "ElectronAPI not available after maximum attempts"
        );

        // Restore window
        (global as { window?: MockWindow | undefined }).window = {} as MockWindow;
    });

    it("should handle electronAPI.sites being undefined", async () => {
        (global.window as MockWindow).electronAPI = {
            // sites is undefined
        };

        const promise = waitForElectronAPI(1, 50);

        vi.advanceTimersByTime(50);

        await expect(promise).rejects.toThrow(
            "ElectronAPI not available after maximum attempts"
        );
    });

    it("should handle electronAPI.sites.getSites not being a function", async () => {
        (global.window as MockWindow).electronAPI = {
            sites: {
                getSites: "not a function",
            },
        };

        const promise = waitForElectronAPI(1, 50);

        vi.advanceTimersByTime(50);

        await expect(promise).rejects.toThrow(
            "ElectronAPI not available after maximum attempts"
        );
    });
});
