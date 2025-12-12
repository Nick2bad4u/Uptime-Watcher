import { describe, expect, it, vi } from "vitest";

vi.mock("@shared/utils/environment", () => ({
    isDevelopment: vi.fn(() => true),
}));

vi.mock("../../services/logger", () => ({
    logger: {
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
    },
}));

import { isDevelopment } from "@shared/utils/environment";

import { logger } from "../../services/logger";
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
        it("does not log when not in development", () => {
            vi.mocked(isDevelopment).mockReturnValue(false);

            logStoreAction("Store", "action", { ok: true });

            expect(logger.info).not.toHaveBeenCalled();
        });

        it("logs when in development", () => {
            vi.mocked(isDevelopment).mockReturnValue(true);

            logStoreAction("Store", "action", { ok: true });

            expect(logger.info).toHaveBeenCalledWith("[Store] action", {
                ok: true,
            });
        });

        it("logs without metadata when undefined", () => {
            vi.mocked(isDevelopment).mockReturnValue(true);

            logStoreAction("Store", "action");

            expect(logger.info).toHaveBeenCalledWith("[Store] action");
        });
    });
});
