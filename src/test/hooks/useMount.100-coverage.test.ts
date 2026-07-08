/**
 * Tests for {@link useMount} focusing on rerender semantics and error handling.
 */

import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useMount } from "../../hooks/useMount";
import { logger } from "../../services/logger";

vi.mock("../../services/logger", () => ({
    logger: {
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
    },
}));

const mockLogger = vi.mocked(logger);

describe("useMount - 100% Coverage Tests", () => {
    it("does not re-run mount callback on rerender", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: useMount.100-coverage", "component");
        await annotate("Category: Hook", "category");
        await annotate("Type: Business Logic", "type");

        const mountCallback = vi.fn();
        const unmountCallback = vi.fn();

        const { rerender, unmount } = renderHook(() => {
            useMount(mountCallback, unmountCallback);
        });

        expect(mountCallback).toHaveBeenCalledTimes(1);

        // Rerender should not re-run the mount callback because the hook uses
        // an effect with an empty dependency array.
        rerender();
        expect(mountCallback).toHaveBeenCalledTimes(1);

        unmount();
        expect(unmountCallback).toHaveBeenCalledTimes(1);
    });

    it("should handle async mount callback errors", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: useMount.100-coverage", "component");
        await annotate("Category: Hook", "category");
        await annotate("Type: Error Handling", "type");

        const errorMessage = "Mount callback error";
        const asyncMountCallback = vi
            .fn()
            .mockRejectedValue(new Error(errorMessage));
        const unmountCallback = vi.fn();

        const { unmount } = renderHook(() => {
            useMount(asyncMountCallback, unmountCallback);
        });

        // Wait for async error handling without introducing fixed delays.
        await waitFor(() => {
            expect(asyncMountCallback).toHaveBeenCalledTimes(1);
            expect(mockLogger.error).toHaveBeenCalledWith(
                "Error in useMount callback:",
                expect.any(Error)
            );
        });

        unmount();
    });

    it("logs unmount callback errors without throwing", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: useMount.100-coverage", "component");
        await annotate("Category: Hook", "category");
        await annotate("Type: Error Handling", "type");

        const cleanupError = new Error("Unmount callback error");
        const mountCallback = vi.fn();
        const unmountCallback = vi.fn(() => {
            throw cleanupError;
        });

        const { unmount } = renderHook(() => {
            useMount(mountCallback, unmountCallback);
        });

        expect(() => {
            unmount();
        }).not.toThrow();

        expect(unmountCallback).toHaveBeenCalledTimes(1);
        expect(mockLogger.error).toHaveBeenCalledWith(
            "Error in useMount cleanup:",
            cleanupError
        );
    });

    it("aborts the mount signal before running cleanup", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: useMount.100-coverage", "component");
        await annotate("Category: Hook", "category");
        await annotate("Type: Lifecycle", "type");

        let receivedSignal: AbortSignal | undefined;
        const mountCallback = vi.fn((signal: AbortSignal) => {
            receivedSignal = signal;
        });
        const unmountCallback = vi.fn(() => {
            expect(receivedSignal?.aborted).toBeTruthy();
        });

        const { unmount } = renderHook(() => {
            useMount(mountCallback, unmountCallback);
        });

        expect(receivedSignal?.aborted).toBeFalsy();

        unmount();

        expect(mountCallback).toHaveBeenCalledTimes(1);
        expect(unmountCallback).toHaveBeenCalledTimes(1);
        expect(receivedSignal?.aborted).toBeTruthy();
    });
});
