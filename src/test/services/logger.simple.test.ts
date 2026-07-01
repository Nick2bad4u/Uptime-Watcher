/**
 * Basic logger service tests.
 */

import { describe, expect, it } from "vitest";

import { logger } from "../../services/logger";

describe("logger Service - Basic Tests", () => {
    it("should have logger instance available", async ({ annotate, task }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: logger", "component");
        await annotate("Category: Service", "category");
        await annotate("Type: Business Logic", "type");

        expect(logger).toBeDefined();
        expect(logger.info).toBeTypeOf("function");
        expect(logger.error).toBeTypeOf("function");
        expect(logger.warn).toBeTypeOf("function");
        expect(logger.debug).toBeTypeOf("function");
    });

    it("should log messages without throwing", async ({ annotate, task }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: logger", "component");
        await annotate("Category: Service", "category");
        await annotate("Type: Business Logic", "type");

        expect(() => {
            logger.info("Test info message");
            logger.error("Test error message");
            logger.warn("Test warning message");
            logger.debug("Test debug message");
        }).not.toThrow();
    });
});
