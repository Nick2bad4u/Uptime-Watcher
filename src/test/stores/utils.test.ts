import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
    resetProcessSnapshotOverrideForTesting,
    setProcessSnapshotOverrideForTesting,
} from "@shared/utils/environment";

import { logger } from "@app/services/logger";
import {
    createPersistConfig,
    debounce,
    logStoreAction,
} from "../../stores/utils";

describe("src/stores/utils", () => {
    describe(createPersistConfig, () => {
        it("returns a normalized persist key", () => {
            const config = createPersistConfig<{ a: number }>("test-store");
            expect(config).toEqual({ name: "uptime-watcher-test-store" });
        });

        it("includes partialize when provided", () => {
            const partialize = vi.fn((state: { a: number; b: number }) => ({
                a: state.a,
            }));

            const config = createPersistConfig("test-store", partialize);

            expect(config.name).toBe("uptime-watcher-test-store");
            expect(config.partialize).toBe(partialize);
        });
    });

    describe(debounce, () => {
        it("executes after wait window", () => {
            vi.useFakeTimers();

            const fn = vi.fn();
            const debounced = debounce(fn, 25);

            debounced("a");

            expect(fn).not.toHaveBeenCalled();

            vi.advanceTimersByTime(25);

            expect(fn).toHaveBeenCalledWith("a");

            vi.useRealTimers();
        });
    });

    describe(logStoreAction, () => {
        beforeEach(() => {
            setProcessSnapshotOverrideForTesting({
                env: {
                    NODE_ENV: "development",
                },
            });

            vi.spyOn(logger, "info").mockImplementation(() => undefined);
        });

        afterEach(() => {
            resetProcessSnapshotOverrideForTesting();

            vi.restoreAllMocks();
        });

        it("does not log when not in development", () => {
            setProcessSnapshotOverrideForTesting({
                env: {
                    NODE_ENV: "production",
                },
            });

            logStoreAction("Store", "action", { ok: true });

            expect(logger.info).not.toHaveBeenCalled();
        });

        it("logs when in development", () => {
            logStoreAction("Store", "action", { ok: true });

            expect(logger.info).toHaveBeenCalledWith("[Store] action", {
                ok: true,
            });
        });

        it("logs without metadata when undefined", () => {
            logStoreAction("Store", "action");

            expect(logger.info).toHaveBeenCalledWith("[Store] action");
        });
    });
});
