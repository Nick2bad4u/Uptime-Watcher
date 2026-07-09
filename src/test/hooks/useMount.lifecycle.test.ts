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

describe("useMount - lifecycle behavior", () => {
    it("does not re-run mount callback on rerender", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: useMount.lifecycle", "component");
        await annotate("Category: Hook", "category");
        await annotate("Type: Business Logic", "type");

        const initialMountCallback = vi.fn();
        const rerenderMountCallback = vi.fn();
        const initialUnmountCallback = vi.fn();
        const latestUnmountCallback = vi.fn();

        const { rerender, unmount } = renderHook(
            ({ mountCallback, unmountCallback }) => {
                useMount(mountCallback, unmountCallback);
            },
            {
                initialProps: {
                    mountCallback: initialMountCallback,
                    unmountCallback: initialUnmountCallback,
                },
            }
        );

        expect(initialMountCallback).toHaveBeenCalledTimes(1);

        rerender({
            mountCallback: rerenderMountCallback,
            unmountCallback: latestUnmountCallback,
        });
        expect(initialMountCallback).toHaveBeenCalledTimes(1);
        expect(rerenderMountCallback).not.toHaveBeenCalled();

        unmount();
        expect(initialUnmountCallback).not.toHaveBeenCalled();
        expect(latestUnmountCallback).toHaveBeenCalledTimes(1);
    });

    it("should handle async mount callback errors", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: useMount.lifecycle", "component");
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
        await annotate("Component: useMount.lifecycle", "component");
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
        await annotate("Component: useMount.lifecycle", "component");
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
