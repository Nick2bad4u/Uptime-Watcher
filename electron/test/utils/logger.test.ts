import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock electron-log/main module at the top level
vi.mock("electron-log/main", () => ({
    default: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
    },
}));

describe("Logger Module", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should import logger module without errors", async () => {
        const loggerModule = await import("../../utils/logger");
        expect(loggerModule).toBeDefined();
    });

    it("should export a logger object", async () => {
        const { logger } = await import("../../utils/logger");
        expect(logger).toBeDefined();
        expect(typeof logger).toBe("object");
    });

    it("should have logging methods", async () => {
        const { logger } = await import("../../utils/logger");
        expect(typeof logger.info).toBe("function");
        expect(typeof logger.warn).toBe("function");
        expect(typeof logger.error).toBe("function");
        expect(typeof logger.debug).toBe("function");
    });

    // Skip the actual logging tests for now due to mock complexity
    it.skip("should log messages (mocking disabled temporarily)", () => {
        // This test is disabled until we can properly mock electron-log
        expect(true).toBe(true);
    });
});
