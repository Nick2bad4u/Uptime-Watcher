/**
 * @file Tests to reach 100% coverage for useMount.ts lines 97 and 113 Targeting
 *   the strict mode duplicate mount handling and error handling
 */

import { describe, expect, test, vi } from "vitest";
import { renderHook } from "@testing-library/react";

// Mock the logger at module level
vi.mock("../../services/logger", () => ({
    logger: {
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
        debug: vi.fn(),
    },
}));

import { logger } from "../../services/logger";
import { useMount } from "../../hooks/useMount";

const mockLogger = vi.mocked(logger);

describe("useMount - 100% Coverage Tests", () => {
    describe("Targeting Lines 97,113", () => {
        test("should handle strict mode duplicate mount (line 97)", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: useMount.100-coverage", "component");
            annotate("Category: Hook", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: useMount.100-coverage", "component");
            annotate("Category: Hook", "category");
            annotate("Type: Business Logic", "type");

            const mountCallback = vi.fn();
            const unmountCallback = vi.fn();

            // First render - should execute mount callback
            const { rerender } = renderHook(() =>
                useMount(mountCallback, unmountCallback));

            expect(mountCallback).toHaveBeenCalledTimes(1);

            // Simulate StrictMode double mount by re-rendering
            // This should trigger the hasMountedRef.current check on line 97
            rerender();

            // Mount callback should not be called again due to duplicate prevention
            expect(mountCallback).toHaveBeenCalledTimes(1);
        });

        test("should handle async mount callback errors (line 113)", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: useMount.100-coverage", "component");
            annotate("Category: Hook", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: useMount.100-coverage", "component");
            annotate("Category: Hook", "category");
            annotate("Type: Error Handling", "type");

            const errorMessage = "Mount callback error";
            const asyncMountCallback = vi
                .fn()
                .mockRejectedValue(new Error(errorMessage));
            const unmountCallback = vi.fn();

            const { unmount } = renderHook(() =>
                useMount(asyncMountCallback, unmountCallback));

            // Wait for async error handling
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(asyncMountCallback).toHaveBeenCalledTimes(1);
            // The error should be caught and logged
            expect(mockLogger.error).toHaveBeenCalledWith(
                "Error in useMount callback:",
                expect.any(Error)
            );

            unmount();
        });

        test("should handle promise-returning mount callback", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: useMount.100-coverage", "component");
            annotate("Category: Hook", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: useMount.100-coverage", "component");
            annotate("Category: Hook", "category");
            annotate("Type: Business Logic", "type");

            const promiseMountCallback = vi.fn().mockResolvedValue("success");
            const unmountCallback = vi.fn();

            renderHook(() => useMount(promiseMountCallback, unmountCallback));

            // Wait for promise resolution
            await new Promise((resolve) => setTimeout(resolve, 0));

            expect(promiseMountCallback).toHaveBeenCalledTimes(1);
        });

        test("should handle unmount callback execution", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: useMount.100-coverage", "component");
            annotate("Category: Hook", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: useMount.100-coverage", "component");
            annotate("Category: Hook", "category");
            annotate("Type: Business Logic", "type");

            const mountCallback = vi.fn();
            const unmountCallback = vi.fn();

            const { unmount } = renderHook(() =>
                useMount(mountCallback, unmountCallback));

            expect(mountCallback).toHaveBeenCalledTimes(1);

            // Unmount the component to trigger cleanup
            unmount();

            expect(unmountCallback).toHaveBeenCalledTimes(1);
        });

        test("should handle synchronous mount callback", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: useMount.100-coverage", "component");
            annotate("Category: Hook", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: useMount.100-coverage", "component");
            annotate("Category: Hook", "category");
            annotate("Type: Business Logic", "type");

            const syncMountCallback = vi.fn(() => {
                // Synchronous callback that returns void
            });
            const unmountCallback = vi.fn();

            renderHook(() => useMount(syncMountCallback, unmountCallback));

            expect(syncMountCallback).toHaveBeenCalledTimes(1);
        });
    });
});
