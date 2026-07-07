import { describe, expect, it, vi } from "vitest";

import { sharedFallbackLogger } from "../../../utils/logger/consoleFallback";

describe("sharedFallbackLogger", () => {
    it("formats non-error log messages with the shared prefix", () => {
        expect.assertions(2);

        const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
        const context = { feature: "fallback" };

        sharedFallbackLogger.info("initialized", context);

        expect(infoSpy).toHaveBeenCalledTimes(1);
        expect(infoSpy).toHaveBeenCalledWith(
            "[SHARED] initialized",
            context
        );

        infoSpy.mockRestore();
    });

    it("serializes Error instances passed to error logs", () => {
        expect.assertions(2);

        const errorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => {});
        const error = new Error("boom");

        sharedFallbackLogger.error("failed", error);

        expect(errorSpy).toHaveBeenCalledTimes(1);
        expect(errorSpy).toHaveBeenCalledWith(
            "[SHARED] failed",
            expect.objectContaining({
                message: "boom",
                name: "Error",
            })
        );

        errorSpy.mockRestore();
    });

    it("does not throw when the fallback transport itself fails", () => {
        expect.assertions(1);

        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {
            throw new Error("transport failed");
        });

        expect(() => {
            sharedFallbackLogger.warn("best effort diagnostic");
        }).not.toThrow();

        warnSpy.mockRestore();
    });

    it("exports a shared fallback logger instance", () => {
        expect.assertions(1);

        expect(sharedFallbackLogger).toEqual(
            expect.objectContaining({
                debug: expect.any(Function),
                error: expect.any(Function),
                info: expect.any(Function),
                warn: expect.any(Function),
            })
        );
    });
});
