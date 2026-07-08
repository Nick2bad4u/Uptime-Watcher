import { describe, expect, it, vi } from "vitest";

import { fireAndForget, fireAndForgetLogged } from "../../utils/fireAndForget";

async function flushBackgroundTask(): Promise<void> {
    await Promise.resolve();
    await Promise.resolve();
}

describe("fireAndForget", () => {
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

describe("fireAndForgetLogged", () => {
    it("logs task failures with optional structured context", async () => {
        const error = new Error("logged failure");
        const logger = { error: vi.fn() };

        fireAndForgetLogged({
            logger,
            loggerArgs: [{ operation: "background" }],
            message: "Background task failed",
            task: () => {
                throw error;
            },
        });
        await flushBackgroundTask();

        expect(logger.error).toHaveBeenCalledWith(
            "Background task failed",
            error,
            { operation: "background" }
        );
    });
});
