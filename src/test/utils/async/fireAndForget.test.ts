import { describe, expect, it, vi } from "vitest";

import { fireAndForget } from "../../../utils/async/fireAndForget";

async function flushBackgroundTask(): Promise<void> {
    await Promise.resolve();
    await Promise.resolve();
}

describe(fireAndForget, () => {
    it("runs synchronous tasks without reporting an error", async () => {
        const task = vi.fn(() => undefined);
        const onError = vi.fn();

        fireAndForget(task, { onError });
        await flushBackgroundTask();

        expect(task).toHaveBeenCalledTimes(1);
        expect(onError).not.toHaveBeenCalled();
    });

    it("reports synchronous task failures", async () => {
        const error = new Error("sync failure");
        const onError = vi.fn();

        fireAndForget(
            () => {
                throw error;
            },
            { onError }
        );
        await flushBackgroundTask();

        expect(onError).toHaveBeenCalledWith(error);
    });

    it("reports asynchronous task failures", async () => {
        const error = new Error("async failure");
        const onError = vi.fn();

        fireAndForget(
            async () => {
                throw error;
            },
            { onError }
        );
        await flushBackgroundTask();

        expect(onError).toHaveBeenCalledWith(error);
    });
});
