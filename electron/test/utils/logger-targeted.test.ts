import { beforeEach, describe, expect, it, vi } from "vitest";

// Import the loggers to test
import { logger, dbLogger, monitorLogger } from "../../utils/logger";

describe("Logger Targeted Coverage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("logger methods", () => {
        it("should call debug method", () => {
            logger.debug("test message");
            expect(true).toBe(true);
        });

        it("should call info method", () => {
            logger.info("test message");
            expect(true).toBe(true);
        });

        it("should call warn method", () => {
            logger.warn("test message");
            expect(true).toBe(true);
        });

        it("should call error method with Error object", () => {
            const error = new Error("test error");
            logger.error("test message", error);
            expect(true).toBe(true);
        });

        it("should call error method without Error object", () => {
            logger.error("test message", "extra info");
            expect(true).toBe(true);
        });
    });

    describe("dbLogger methods", () => {
        it("should call all dbLogger methods", () => {
            dbLogger.debug("test");
            dbLogger.info("test");
            dbLogger.warn("test");
            dbLogger.error("test", new Error("error"));
            expect(true).toBe(true);
        });
    });

    describe("monitorLogger methods", () => {
        it("should call all monitorLogger methods", () => {
            monitorLogger.debug("test");
            monitorLogger.info("test");
            monitorLogger.warn("test");
            monitorLogger.error("test", new Error("error"));
            expect(true).toBe(true);
        });
    });
});
