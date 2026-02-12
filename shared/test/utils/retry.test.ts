/**
 * Tests for the shared retry utility.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../utils/abortUtils", async () => {
    const actual = await vi.importActual<
        typeof import("../../utils/abortUtils")
    >("../../utils/abortUtils");

    return {
        ...actual,
        sleep: vi.fn().mockResolvedValue(undefined),
        sleepUnref: vi.fn().mockResolvedValue(undefined),
    };
});

import { sleep, sleepUnref } from "../../utils/abortUtils";
import {
    isRetryNonErrorThrownError,
    withRetry,
    type RetryOptions,
} from "../../utils/retry";

describe("shared/utils/retry", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns immediately when the first attempt succeeds", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: retry", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Success", "type");

        const operation = vi
            .fn<() => Promise<string>>()
            .mockResolvedValue("ok");

        await expect(withRetry(operation)).resolves.toBe("ok");
        expect(operation).toHaveBeenCalledTimes(1);
        expect(vi.mocked(sleep)).not.toHaveBeenCalled();
        expect(vi.mocked(sleepUnref)).not.toHaveBeenCalled();
    });

    it("retries with the configured delay and eventually succeeds", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: retry", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Reliability", "type");

        const operation = vi
            .fn<() => Promise<string>>()
            .mockRejectedValueOnce(new Error("fail-1"))
            .mockRejectedValueOnce(new Error("fail-2"))
            .mockResolvedValueOnce("ok");

        const onError = vi.fn<Required<RetryOptions>["onError"]>();
        const onFailedAttempt =
            vi.fn<Required<RetryOptions>["onFailedAttempt"]>();

        const result = await withRetry(operation, {
            delayMs: 123,
            maxRetries: 5,
            onError,
            onFailedAttempt,
        });

        expect(result).toBe("ok");
        expect(operation).toHaveBeenCalledTimes(3);

        // Two failed attempts -> two sleeps.
        expect(vi.mocked(sleep)).toHaveBeenCalledTimes(2);
        expect(vi.mocked(sleep)).toHaveBeenNthCalledWith(1, 123);
        expect(vi.mocked(sleep)).toHaveBeenNthCalledWith(2, 123);

        expect(onError).toHaveBeenCalledTimes(2);
        expect(onError).toHaveBeenNthCalledWith(1, expect.any(Error), 1);
        expect(onError).toHaveBeenNthCalledWith(2, expect.any(Error), 2);

        expect(onFailedAttempt).toHaveBeenCalledTimes(2);
        expect(onFailedAttempt).toHaveBeenNthCalledWith(1, {
            attempt: 1,
            delayMs: 123,
            error: expect.any(Error),
        });
    });

    it("uses sleepUnref when unrefDelay=true", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: retry", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Resource Management", "type");

        const operation = vi
            .fn<() => Promise<string>>()
            .mockRejectedValueOnce(new Error("fail"))
            .mockResolvedValueOnce("ok");

        await expect(
            withRetry(operation, {
                delayMs: 10,
                maxRetries: 2,
                unrefDelay: true,
            })
        ).resolves.toBe("ok");

        expect(vi.mocked(sleepUnref)).toHaveBeenCalledTimes(1);
        expect(vi.mocked(sleepUnref)).toHaveBeenCalledWith(10);
        expect(vi.mocked(sleep)).not.toHaveBeenCalled();
    });

    it("respects shouldRetry=false to stop early", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: retry", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Control Flow", "type");

        const error = new Error("do-not-retry");
        const operation = vi
            .fn<() => Promise<string>>()
            .mockRejectedValue(error);
        const shouldRetry = vi
            .fn<NonNullable<RetryOptions["shouldRetry"]>>()
            .mockReturnValue(false);

        await expect(
            withRetry(operation, {
                delayMs: 10,
                maxRetries: 5,
                shouldRetry,
            })
        ).rejects.toThrowError("do-not-retry");

        expect(operation).toHaveBeenCalledTimes(1);
        expect(shouldRetry).toHaveBeenCalledTimes(1);
        expect(vi.mocked(sleep)).not.toHaveBeenCalled();
    });

    it("throws a helpful error when maxRetries is invalid", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: retry", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Validation", "type");

        const operation = vi
            .fn<() => Promise<string>>()
            .mockResolvedValue("ok");

        await expect(
            withRetry(operation, {
                // Runtime contract: non-positive maxRetries is rejected.
                maxRetries: 0,
            })
        ).rejects.toThrowError(/maxretries must be a positive number/i);

        expect(operation).not.toHaveBeenCalled();
    });

    it("wraps non-Error thrown values and exposes the original via cause", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: retry", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Error Handling", "type");

        const operation = vi
            .fn<() => Promise<never>>()
            .mockRejectedValue("nope");

        try {
            await withRetry(operation, { maxRetries: 1 });
            throw new Error("expected withRetry to throw");
        } catch (error: unknown) {
            expect(isRetryNonErrorThrownError(error)).toBeTruthy();
            const wrapped = error as Error & { readonly cause: unknown };
            expect(wrapped.cause).toBe("nope");
        }
    });
});
