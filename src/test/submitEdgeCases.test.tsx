/**
 * Submit Function Edge Cases Tests
 * Tests for edge cases and error scenarios in Submit handleSubmit function
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

import { handleSubmit } from "../components/AddSiteForm/Submit";
import logger from "../services/logger";

// Mock the logger
vi.mock("../services/logger", () => ({
    default: {
        app: {
            error: vi.fn(),
            performance: vi.fn(),
            started: vi.fn(),
            stopped: vi.fn(),
        },
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        raw: {} as Record<string, unknown>,
        silly: vi.fn(),
        site: {
            added: vi.fn(),
            check: vi.fn(),
            error: vi.fn(),
            removed: vi.fn(),
            statusChange: vi.fn(),
        },
        system: {
            notification: vi.fn(),
            tray: vi.fn(),
            window: vi.fn(),
        },
        user: {
            action: vi.fn(),
            settingsChange: vi.fn(),
        },
        verbose: vi.fn(),
        warn: vi.fn(),
    },
}));

describe("Submit Edge Cases", () => {
    const mockCreateSite = vi.fn();
    const mockAddMonitorToSite = vi.fn();
    const mockOnSuccess = vi.fn();
    const mockSetFormError = vi.fn();
    const mockClearError = vi.fn();
    const mockGenerateUuid = vi.fn(() => "test-uuid");

    const mockEvent = {
        preventDefault: vi.fn(),
    } as unknown as React.FormEvent;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("handleSubmit edge cases", () => {
        it("should handle error during site creation", async () => {
            const props = {
                addMode: "new" as const,
                addMonitorToSite: mockAddMonitorToSite,
                checkInterval: 60000,
                clearError: mockClearError,
                // Store actions
                createSite: mockCreateSite,
                formError: undefined,
                // Dependencies
                generateUuid: mockGenerateUuid,
                host: "example.com",
                logger: logger,
                monitorType: "http" as const,
                name: "Test Site",
                onSuccess: mockOnSuccess,
                port: "443",
                selectedExistingSite: "",
                // Actions
                setFormError: mockSetFormError,
                siteId: "test-site-id",
                // Form state
                url: "https://example.com",
            };

            const error = new Error("Network error");
            mockCreateSite.mockRejectedValue(error);

            await handleSubmit(mockEvent, props);

            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(mockClearError).toHaveBeenCalled();
            expect(logger.error).toHaveBeenCalledWith("Failed to add site/monitor from form", error);
            expect(mockSetFormError).toHaveBeenCalledWith("Failed to add site/monitor. Please try again.");
        });

        it("should handle adding monitor to existing site", async () => {
            const props = {
                addMode: "existing" as const,
                addMonitorToSite: mockAddMonitorToSite,
                checkInterval: 30000,
                clearError: mockClearError,
                // Store actions
                createSite: mockCreateSite,
                formError: undefined,
                // Dependencies
                generateUuid: mockGenerateUuid,
                host: "example.com",
                logger: logger,
                monitorType: "http" as const,
                name: "Test Site",
                onSuccess: mockOnSuccess,
                port: "80",
                selectedExistingSite: "existing-site-id",
                // Actions
                setFormError: mockSetFormError,
                siteId: "new-site-id",
                // Form state
                url: "https://example.com",
            };

            mockAddMonitorToSite.mockResolvedValue(undefined);

            await handleSubmit(mockEvent, props);

            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(mockClearError).toHaveBeenCalled();
            expect(mockAddMonitorToSite).toHaveBeenCalledWith(
                "existing-site-id",
                expect.objectContaining({
                    checkInterval: 30000,
                    type: "http",
                    url: "https://example.com",
                })
            );

            expect(logger.info).toHaveBeenCalledWith(
                "Monitor added to site successfully",
                expect.objectContaining({
                    identifier: "existing-site-id",
                    monitorType: "http",
                })
            );

            expect(mockOnSuccess).toHaveBeenCalled();
        });
    });
});
