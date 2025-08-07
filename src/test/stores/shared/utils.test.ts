/**
 * Tests for shared store utilities
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the logger
vi.mock("../../../services/logger", () => ({
    default: {
        debug: vi.fn(),
    },
}));

// Mock environment functions
vi.mock("../../../../shared/utils/environment", () => ({
    isDevelopment: vi.fn(),
}));

import { logStoreAction } from "../../../stores/shared/utils";
import { isDevelopment } from "../../../../shared/utils/environment";
import logger from "../../../services/logger";

// Get the mocked versions
const mockIsDevelopment = vi.mocked(isDevelopment);
const mockLogger = vi.mocked(logger);

describe("Store Utils", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("logStoreAction", () => {
        it("should log action without payload in development", () => {
            mockIsDevelopment.mockReturnValue(true);

            logStoreAction("TestStore", "testAction");

            expect(mockLogger.debug).toHaveBeenCalledWith(
                "[TestStore] testAction"
            );
        });

        it("should log action with payload in development", () => {
            mockIsDevelopment.mockReturnValue(true);
            const payload = { test: "data" };

            logStoreAction("TestStore", "testAction", payload);

            expect(mockLogger.debug).toHaveBeenCalledWith(
                "[TestStore] testAction",
                payload
            );
        });

        it("should not log action in production", () => {
            mockIsDevelopment.mockReturnValue(false);

            logStoreAction("TestStore", "testAction");

            expect(mockLogger.debug).not.toHaveBeenCalled();
        });

        it("should not log action with payload in production", () => {
            mockIsDevelopment.mockReturnValue(false);
            const payload = { test: "data" };

            logStoreAction("TestStore", "testAction", payload);

            expect(mockLogger.debug).not.toHaveBeenCalled();
        });

        it("should handle undefined payload explicitly", () => {
            mockIsDevelopment.mockReturnValue(true);

            logStoreAction("TestStore", "testAction", undefined);

            expect(mockLogger.debug).toHaveBeenCalledWith(
                "[TestStore] testAction"
            );
        });

        it("should handle null payload", () => {
            mockIsDevelopment.mockReturnValue(true);

            logStoreAction("TestStore", "testAction", null);

            expect(mockLogger.debug).toHaveBeenCalledWith(
                "[TestStore] testAction",
                null
            );
        });

        it("should handle empty string payload", () => {
            mockIsDevelopment.mockReturnValue(true);

            logStoreAction("TestStore", "testAction", "");

            expect(mockLogger.debug).toHaveBeenCalledWith(
                "[TestStore] testAction",
                ""
            );
        });

        it("should handle number payload", () => {
            mockIsDevelopment.mockReturnValue(true);

            logStoreAction("TestStore", "testAction", 42);

            expect(mockLogger.debug).toHaveBeenCalledWith(
                "[TestStore] testAction",
                42
            );
        });

        it("should handle boolean payload", () => {
            mockIsDevelopment.mockReturnValue(true);

            logStoreAction("TestStore", "testAction", true);

            expect(mockLogger.debug).toHaveBeenCalledWith(
                "[TestStore] testAction",
                true
            );
        });
    });
});
