/**
 * Simple test to verify logger behavior
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

// Create the mock BEFORE any imports
const mockElectronLog = {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
};

// Use hoisted mock
vi.mock("electron-log/main", () => ({
    default: mockElectronLog,
}));

// Import the logger AFTER mocking
const { logger } = await import("../../utils/logger");

describe("Logger Mock Test", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should call the mocked debug function when logger.debug is called", () => {
        logger.debug("test message");
        
        expect(mockElectronLog.debug).toHaveBeenCalledTimes(1);
        expect(mockElectronLog.debug).toHaveBeenCalledWith("[BACKEND] test message");
    });

    it("should call the mocked info function when logger.info is called", () => {
        logger.info("test info");
        
        expect(mockElectronLog.info).toHaveBeenCalledTimes(1);
        expect(mockElectronLog.info).toHaveBeenCalledWith("[BACKEND] test info");
    });
});
