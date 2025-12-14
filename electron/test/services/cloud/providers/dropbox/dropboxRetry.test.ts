import { AxiosError, type AxiosResponse } from "axios";
import { describe, expect, it, vi } from "vitest";

import { withDropboxRetry } from "@electron/services/cloud/providers/dropbox/dropboxRetry";

function createAxiosError(args: {
    headers?: Record<string, string>;
    status?: number;
}): AxiosError {
    const response: Partial<AxiosResponse> = {
        data: {},
        headers: args.headers ?? {},
        status: args.status ?? 0,
        statusText: "",
    };

    return new AxiosError(
        "boom",
        undefined,
        undefined,
        undefined,
        response as AxiosResponse
    );
}

describe(withDropboxRetry, () => {
    it("retries on 429 and respects Retry-After", async () => {
        vi.useFakeTimers();

        const error = createAxiosError({
            headers: { "retry-after": "1" },
            status: 429,
        });

        const fn = vi
            .fn<() => Promise<string>>()
            .mockRejectedValueOnce(error)
            .mockResolvedValueOnce("ok");

        const promise = withDropboxRetry({
            fn,
            operationName: "test",
            maxAttempts: 3,
            initialDelayMs: 10,
            maxDelayMs: 50,
        });

        await vi.advanceTimersByTimeAsync(1000);
        await expect(promise).resolves.toBe("ok");
        expect(fn).toHaveBeenCalledTimes(2);

        vi.useRealTimers();
    });

    it("retries on 500 and eventually succeeds", async () => {
        vi.useFakeTimers();

        const error = createAxiosError({ status: 500 });
        const fn = vi
            .fn<() => Promise<string>>()
            .mockRejectedValueOnce(error)
            .mockResolvedValueOnce("ok");

        const promise = withDropboxRetry({
            fn,
            operationName: "test",
            maxAttempts: 3,
            initialDelayMs: 10,
            maxDelayMs: 50,
        });

        await vi.runOnlyPendingTimersAsync();
        await expect(promise).resolves.toBe("ok");
        expect(fn).toHaveBeenCalledTimes(2);

        vi.useRealTimers();
    });

    it("does not retry on non-retryable 4xx", async () => {
        vi.useFakeTimers();

        const error = createAxiosError({ status: 400 });
        const fn = vi.fn<() => Promise<string>>().mockRejectedValueOnce(error);

        await expect(
            withDropboxRetry({
                fn,
                operationName: "test",
                maxAttempts: 3,
                initialDelayMs: 10,
                maxDelayMs: 50,
            })
        ).rejects.toBeInstanceOf(Error);

        expect(fn).toHaveBeenCalledTimes(1);

        vi.useRealTimers();
    });
});
