/**
 * Coverage for cleanup handler normalization.
 */

import { describe, expect, it, vi } from "vitest";

import {
    resolveCleanupHandler,
    subscribeWithValidatedCleanup,
    type CleanupResolutionHandlers,
} from "../../../services/utils/cleanupHandlers";

describe(resolveCleanupHandler, () => {
    it("returns an idempotent cleanup when candidate is a function", () => {
        let callCount = 0;
        const cleanupCandidate = () => {
            callCount++;
        };

        const handlers: CleanupResolutionHandlers = {
            handleCleanupError: vi.fn(),
            handleInvalidCleanup: vi.fn(() => () => {
                throw new Error("unexpected");
            }),
        };

        const cleanup = resolveCleanupHandler(cleanupCandidate, handlers);

        cleanup();
        cleanup();

        expect(callCount).toBe(1);
        expect(handlers.handleCleanupError).not.toHaveBeenCalled();
        expect(handlers.handleInvalidCleanup).not.toHaveBeenCalled();
    });

    it("uses fallback cleanup when candidate is invalid", () => {
        let fallbackCalls = 0;

        const handlers: CleanupResolutionHandlers = {
            handleCleanupError: vi.fn(),
            handleInvalidCleanup: vi.fn(() => () => {
                fallbackCalls++;
            }),
        };

        const cleanup = resolveCleanupHandler(123, handlers);

        cleanup();

        expect(handlers.handleInvalidCleanup).toHaveBeenCalledWith(
            expect.objectContaining({
                actualType: "number",
                cleanupCandidate: 123,
            })
        );
        expect(fallbackCalls).toBe(1);
    });

    it("is idempotent for fallback cleanups too", () => {
        let fallbackCalls = 0;

        const handlers: CleanupResolutionHandlers = {
            handleCleanupError: vi.fn(),
            handleInvalidCleanup: vi.fn(() => () => {
                fallbackCalls++;
            }),
        };

        const cleanup = resolveCleanupHandler("not-a-function", handlers);

        cleanup();
        cleanup();

        expect(fallbackCalls).toBe(1);
    });

    it("reports cleanup errors once", () => {
        const error = new Error("boom");
        const cleanupCandidate = () => {
            throw error;
        };

        const handlers: CleanupResolutionHandlers = {
            handleCleanupError: vi.fn(),
            handleInvalidCleanup: vi.fn(() => () => undefined),
        };

        const cleanup = resolveCleanupHandler(cleanupCandidate, handlers);

        cleanup();
        cleanup();

        expect(handlers.handleCleanupError).toHaveBeenCalledTimes(1);
        expect(handlers.handleCleanupError).toHaveBeenCalledWith(error);
    });
});

describe(subscribeWithValidatedCleanup, () => {
    it("normalizes async cleanup candidates", async () => {
        let callCount = 0;

        const handlers: CleanupResolutionHandlers = {
            handleCleanupError: vi.fn(),
            handleInvalidCleanup: vi.fn(() => () => undefined),
        };

        const cleanup = await subscribeWithValidatedCleanup(
            async () => () => {
                callCount++;
            },
            handlers
        );

        cleanup();
        cleanup();

        expect(callCount).toBe(1);
    });
});
