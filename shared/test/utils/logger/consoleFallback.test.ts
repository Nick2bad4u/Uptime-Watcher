import { describe, expect, it, vi } from "vitest";

import {
    createConsoleFallbackLogger,
    sharedFallbackLogger,
    type ConsoleFallbackTransport,
} from "../../../utils/logger/consoleFallback";

function createTransport(): ConsoleFallbackTransport {
    return {
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
    };
}

describe(createConsoleFallbackLogger, () => {
    it("formats non-error log messages with the provided prefix", () => {
        expect.assertions(2);

        const transport = createTransport();
        const logger = createConsoleFallbackLogger("TEST", transport);
        const context = { feature: "fallback" };

        logger.info("initialized", context);

        expect(transport.info).toHaveBeenCalledTimes(1);
        expect(transport.info).toHaveBeenCalledWith(
            "[TEST] initialized",
            context
        );
    });

    it("serializes Error instances passed to error logs", () => {
        expect.assertions(2);

        const transport = createTransport();
        const logger = createConsoleFallbackLogger("TEST", transport);
        const error = new Error("boom");

        logger.error("failed", error);

        expect(transport.error).toHaveBeenCalledTimes(1);
        expect(transport.error).toHaveBeenCalledWith(
            "[TEST] failed",
            expect.objectContaining({
                message: "boom",
                name: "Error",
            })
        );
    });

    it("does not throw when the fallback transport itself fails", () => {
        expect.assertions(1);

        const transport = createTransport();
        vi.mocked(transport.warn).mockImplementation(() => {
            throw new Error("transport failed");
        });
        const logger = createConsoleFallbackLogger("TEST", transport);

        expect(() => {
            logger.warn("best effort diagnostic");
        }).not.toThrow();
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
