/**
 * Basic logger service tests.
 */

import { describe, expect, it } from "vitest";

import logger from "../../services/logger";

describe("Logger Service - Basic Tests", () => {
    it("should have logger instance available", () => {
        expect(logger).toBeDefined();
        expect(typeof logger.info).toBe("function");
        expect(typeof logger.error).toBe("function");
        expect(typeof logger.warn).toBe("function");
        expect(typeof logger.debug).toBe("function");
    });

    it("should log messages without throwing", () => {
        expect(() => {
            logger.info("Test info message");
            logger.error("Test error message");
            logger.warn("Test warning message");
            logger.debug("Test debug message");
        }).not.toThrow();
    });
});
