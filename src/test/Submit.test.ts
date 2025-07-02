/**
 * Tests for AddSiteForm Submit module.
 * Validates form submission handling, validation, and error handling.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi, beforeEach } from "vitest";
import validator from "validator";

import { handleSubmit } from "../components/AddSiteForm/Submit";

// Mock validator - defined inline to avoid hoisting issues
vi.mock("validator", () => ({
    default: {
        isURL: vi.fn(),
        isIP: vi.fn(),
        isFQDN: vi.fn(),
        isPort: vi.fn(),
    },
}));

const mockValidator = vi.mocked(validator);

// Mock constants
vi.mock("../constants", () => ({
    DEFAULT_REQUEST_TIMEOUT: 5000,
    RETRY_CONSTRAINTS: {
        DEFAULT: 3,
    },
}));

describe("AddSiteForm Submit", () => {
    const mockLogger = {
        app: {
            error: vi.fn(),
            performance: vi.fn(),
            started: vi.fn(),
            stopped: vi.fn(),
        },
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        raw: {} as any,
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
    } as any;

    const mockGenerateUuid = vi.fn();
    const mockClearError = vi.fn();
    const mockSetFormError = vi.fn();
    const mockCreateSite = vi.fn();
    const mockAddMonitorToSite = vi.fn();
    const mockOnSuccess = vi.fn();

    const baseProps = {
        // Form state
        addMode: "new" as const,
        checkInterval: 300000,
        host: "",
        monitorType: "http" as const,
        name: "Test Site",
        port: "",
        selectedExistingSite: "",
        siteId: "test-site-id",
        url: "https://example.com",
        formError: undefined,
        
        // Form actions
        setFormError: mockSetFormError,
        
        // Store actions
        addMonitorToSite: mockAddMonitorToSite,
        clearError: mockClearError,
        createSite: mockCreateSite,
        
        // Dependencies
        generateUuid: mockGenerateUuid,
        logger: mockLogger,
        onSuccess: mockOnSuccess,
    };

    const mockEvent = {
        preventDefault: vi.fn(),
    } as any;

    beforeEach(() => {
        vi.clearAllMocks();
        mockGenerateUuid.mockReturnValue("mock-monitor-id");
        
        // Setup validator mocks with defaults
        mockValidator.isURL.mockReturnValue(true);
        mockValidator.isIP.mockReturnValue(false);
        mockValidator.isFQDN.mockReturnValue(true);
        mockValidator.isPort.mockReturnValue(true);
        
        // Ensure store actions resolve successfully
        mockCreateSite.mockResolvedValue(undefined);
        mockAddMonitorToSite.mockResolvedValue(undefined);
    });

    describe("HTTP Monitor Validation", () => {
        it("should validate successful HTTP monitor creation", async () => {
            await handleSubmit(mockEvent, baseProps);

            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(mockSetFormError).toHaveBeenCalledWith(undefined);
            expect(mockClearError).toHaveBeenCalled();
            expect(mockCreateSite).toHaveBeenCalledWith({
                identifier: "test-site-id",
                monitors: [expect.objectContaining({
                    id: "mock-monitor-id",
                    type: "http",
                    url: "https://example.com",
                    status: "pending",
                    checkInterval: 300000,
                    timeout: 5000,
                    retryAttempts: 3,
                    history: [],
                })],
                name: "Test Site",
            });
            expect(mockOnSuccess).toHaveBeenCalled();
        });

        it("should reject empty URL", async () => {
            await handleSubmit(mockEvent, {
                ...baseProps,
                url: "",
            });

            expect(mockSetFormError).toHaveBeenCalledWith("Website URL is required for HTTP monitor");
            expect(mockCreateSite).not.toHaveBeenCalled();
        });

        it("should reject URL without protocol", async () => {
            await handleSubmit(mockEvent, {
                ...baseProps,
                url: "example.com",
            });

            expect(mockSetFormError).toHaveBeenCalledWith("HTTP monitor requires a URL starting with http:// or https://");
            expect(mockCreateSite).not.toHaveBeenCalled();
        });

        it("should reject invalid URL format", async () => {
            mockValidator.isURL.mockReturnValue(false);

            await handleSubmit(mockEvent, {
                ...baseProps,
                url: "https://invalid..url",
            });

            expect(mockSetFormError).toHaveBeenCalledWith("Please enter a valid URL with a proper domain");
            expect(mockCreateSite).not.toHaveBeenCalled();
        });

        it("should accept valid HTTPS URL", async () => {
            await handleSubmit(mockEvent, {
                ...baseProps,
                url: "https://example.com/path",
            });

            expect(mockCreateSite).toHaveBeenCalled();
            expect(mockSetFormError).not.toHaveBeenCalledWith(expect.stringContaining("URL"));
        });
    });

    describe("Port Monitor Validation", () => {
        const portProps = {
            ...baseProps,
            monitorType: "port" as const,
            host: "example.com",
            port: "80",
            url: "",
        };

        it("should validate successful port monitor creation", async () => {
            await handleSubmit(mockEvent, portProps);

            expect(mockCreateSite).toHaveBeenCalledWith({
                identifier: "test-site-id",
                monitors: [expect.objectContaining({
                    id: "mock-monitor-id",
                    type: "port",
                    host: "example.com",
                    port: 80,
                    status: "pending",
                })],
                name: "Test Site",
            });
        });

        it("should reject empty host", async () => {
            await handleSubmit(mockEvent, {
                ...portProps,
                host: "",
            });

            expect(mockSetFormError).toHaveBeenCalledWith("Host is required for port monitor");
            expect(mockCreateSite).not.toHaveBeenCalled();
        });

        it("should reject empty port", async () => {
            await handleSubmit(mockEvent, {
                ...portProps,
                port: "",
            });

            expect(mockSetFormError).toHaveBeenCalledWith("Port is required for port monitor");
            expect(mockCreateSite).not.toHaveBeenCalled();
        });

        it("should reject invalid host", async () => {
            mockValidator.isIP.mockReturnValue(false);
            mockValidator.isFQDN.mockReturnValue(false);

            await handleSubmit(mockEvent, {
                ...portProps,
                host: "invalid host with spaces",
            });

            expect(mockSetFormError).toHaveBeenCalledWith("Host must be a valid IP address or domain name");
            expect(mockCreateSite).not.toHaveBeenCalled();
        });

        it("should reject invalid port", async () => {
            mockValidator.isPort.mockReturnValue(false);

            await handleSubmit(mockEvent, {
                ...portProps,
                port: "99999",
            });

            expect(mockSetFormError).toHaveBeenCalledWith("Port must be a valid port number (1-65535)");
            expect(mockCreateSite).not.toHaveBeenCalled();
        });

        it("should accept valid IP address", async () => {
            mockValidator.isIP.mockReturnValue(true);
            mockValidator.isFQDN.mockReturnValue(false);

            await handleSubmit(mockEvent, {
                ...portProps,
                host: "192.168.1.1",
            });

            expect(mockCreateSite).toHaveBeenCalled();
            expect(mockSetFormError).not.toHaveBeenCalledWith(expect.stringContaining("Host"));
        });

        it("should accept valid domain name", async () => {
            mockValidator.isIP.mockReturnValue(false);
            mockValidator.isFQDN.mockReturnValue(true);

            await handleSubmit(mockEvent, {
                ...portProps,
                host: "api.example.com",
            });

            expect(mockCreateSite).toHaveBeenCalled();
            expect(mockSetFormError).not.toHaveBeenCalledWith(expect.stringContaining("Host"));
        });
    });

    describe("Add Mode Validation", () => {
        it("should reject new site without name", async () => {
            await handleSubmit(mockEvent, {
                ...baseProps,
                addMode: "new",
                name: "",
            });

            expect(mockSetFormError).toHaveBeenCalledWith("Site name is required");
            expect(mockCreateSite).not.toHaveBeenCalled();
        });

        it("should reject existing site without selection", async () => {
            await handleSubmit(mockEvent, {
                ...baseProps,
                addMode: "existing",
                selectedExistingSite: "",
            });

            expect(mockSetFormError).toHaveBeenCalledWith("Please select a site to add the monitor to");
            expect(mockAddMonitorToSite).not.toHaveBeenCalled();
        });

        it("should handle existing site mode successfully", async () => {
            await handleSubmit(mockEvent, {
                ...baseProps,
                addMode: "existing",
                selectedExistingSite: "existing-site-id",
            });

            expect(mockAddMonitorToSite).toHaveBeenCalledWith(
                "existing-site-id",
                expect.objectContaining({
                    id: "mock-monitor-id",
                    type: "http",
                    url: "https://example.com",
                })
            );
            expect(mockOnSuccess).toHaveBeenCalled();
        });
    });

    describe("Check Interval Validation", () => {
        it("should reject zero check interval", async () => {
            await handleSubmit(mockEvent, {
                ...baseProps,
                checkInterval: 0,
            });

            expect(mockSetFormError).toHaveBeenCalledWith("Check interval must be a positive number");
            expect(mockCreateSite).not.toHaveBeenCalled();
        });

        it("should reject negative check interval", async () => {
            await handleSubmit(mockEvent, {
                ...baseProps,
                checkInterval: -1000,
            });

            expect(mockSetFormError).toHaveBeenCalledWith("Check interval must be a positive number");
            expect(mockCreateSite).not.toHaveBeenCalled();
        });

        it("should accept positive check interval", async () => {
            await handleSubmit(mockEvent, {
                ...baseProps,
                checkInterval: 60000,
            });

            expect(mockCreateSite).toHaveBeenCalled();
            expect(mockSetFormError).not.toHaveBeenCalledWith(expect.stringContaining("interval"));
        });
    });

    describe("Error Handling", () => {
        it("should handle createSite errors", async () => {
            mockCreateSite.mockRejectedValue(new Error("Network error"));

            await handleSubmit(mockEvent, baseProps);

            expect(mockLogger.error).toHaveBeenCalledWith("Failed to add site/monitor from form", expect.any(Error));
            expect(mockSetFormError).toHaveBeenCalledWith("Failed to add site/monitor. Please try again.");
            expect(mockOnSuccess).not.toHaveBeenCalled();
        });

        it("should handle addMonitorToSite errors", async () => {
            mockAddMonitorToSite.mockRejectedValue(new Error("Database error"));

            await handleSubmit(mockEvent, {
                ...baseProps,
                addMode: "existing",
                selectedExistingSite: "existing-site-id",
            });

            expect(mockLogger.error).toHaveBeenCalledWith("Failed to add site/monitor from form", expect.any(Error));
            expect(mockSetFormError).toHaveBeenCalledWith("Failed to add site/monitor. Please try again.");
            expect(mockOnSuccess).not.toHaveBeenCalled();
        });
    });

    describe("Logging", () => {
        it("should log submission start", async () => {
            await handleSubmit(mockEvent, baseProps);

            expect(mockLogger.debug).toHaveBeenCalledWith("Form submission started", {
                addMode: "new",
                hasHost: false,
                hasName: true,
                hasPort: false,
                hasUrl: true,
                monitorType: "http",
                selectedExistingSite: false,
            });
        });

        it("should log validation failures", async () => {
            await handleSubmit(mockEvent, {
                ...baseProps,
                name: "",
            });

            expect(mockLogger.debug).toHaveBeenCalledWith("Form validation failed", {
                errors: ["Site name is required"],
                formData: {
                    addMode: "new",
                    checkInterval: 300000,
                    host: "",
                    monitorType: "http",
                    name: "",
                    port: "",
                    url: "https://example.com",
                },
            });
        });

        it("should log successful site creation", async () => {
            await handleSubmit(mockEvent, baseProps);

            expect(mockLogger.info).toHaveBeenCalledWith("Site created successfully", {
                identifier: "test-site-id",
                monitorId: "mock-monitor-id",
                monitorType: "http",
                name: "Test Site",
            });
            
            expect(mockLogger.info).toHaveBeenCalledWith("Successfully created site: test-site-id");
        });

        it("should log successful monitor addition", async () => {
            await handleSubmit(mockEvent, {
                ...baseProps,
                addMode: "existing",
                selectedExistingSite: "existing-site-id",
            });

            expect(mockLogger.info).toHaveBeenCalledWith("Monitor added to site successfully", {
                identifier: "existing-site-id",
                monitorId: "mock-monitor-id",
                monitorType: "http",
            });
            
            expect(mockLogger.info).toHaveBeenCalledWith("Successfully added monitor: existing-site-id");
        });
    });

    describe("Data Sanitization", () => {
        it("should trim whitespace from string inputs", async () => {
            await handleSubmit(mockEvent, {
                ...baseProps,
                name: "  Test Site  ",
                url: "  https://example.com  ",
            });

            expect(mockCreateSite).toHaveBeenCalledWith({
                identifier: "test-site-id",
                monitors: [expect.objectContaining({
                    url: "https://example.com", // trimmed
                })],
                name: "Test Site", // trimmed
            });
        });

        it("should handle empty name gracefully", async () => {
            await handleSubmit(mockEvent, {
                ...baseProps,
                name: "   ", // only whitespace
            });

            expect(mockSetFormError).toHaveBeenCalledWith("Site name is required");
        });

        it("should convert port to number for port monitors", async () => {
            await handleSubmit(mockEvent, {
                ...baseProps,
                monitorType: "port",
                host: "example.com",
                port: "8080",
                url: "",
            });

            expect(mockCreateSite).toHaveBeenCalledWith({
                identifier: "test-site-id",
                monitors: [expect.objectContaining({
                    host: "example.com",
                    port: 8080, // converted to number
                })],
                name: "Test Site",
            });
        });
    });

    describe("Monitor Creation", () => {
        it("should create monitor with correct default properties", async () => {
            await handleSubmit(mockEvent, baseProps);

            expect(mockCreateSite).toHaveBeenCalledWith({
                identifier: "test-site-id",
                monitors: [expect.objectContaining({
                    id: "mock-monitor-id",
                    type: "http",
                    status: "pending",
                    checkInterval: 300000,
                    timeout: 5000,
                    retryAttempts: 3,
                    history: [],
                })],
                name: "Test Site",
            });
        });

        it("should create HTTP monitor with URL", async () => {
            await handleSubmit(mockEvent, baseProps);

            const monitor = mockCreateSite.mock.calls[0][0].monitors[0];
            expect(monitor).toHaveProperty("url", "https://example.com");
            expect(monitor).not.toHaveProperty("host");
            expect(monitor).not.toHaveProperty("port");
        });

        it("should create port monitor with host and port", async () => {
            await handleSubmit(mockEvent, {
                ...baseProps,
                monitorType: "port",
                host: "api.example.com",
                port: "3000",
                url: "",
            });

            const monitor = mockCreateSite.mock.calls[0][0].monitors[0];
            expect(monitor).toHaveProperty("host", "api.example.com");
            expect(monitor).toHaveProperty("port", 3000);
            expect(monitor).not.toHaveProperty("url");
        });
    });

    describe("Edge Cases", () => {
        it("should handle missing onSuccess callback", async () => {
            await handleSubmit(mockEvent, {
                ...baseProps,
                onSuccess: undefined,
            });

            expect(mockCreateSite).toHaveBeenCalled();
            // Should not throw error when onSuccess is not provided
        });

        it("should show only first validation error", async () => {
            await handleSubmit(mockEvent, {
                ...baseProps,
                name: "", // First error
                checkInterval: 0, // Second error
            });

            expect(mockSetFormError).toHaveBeenCalledWith("Site name is required");
            expect(mockSetFormError).not.toHaveBeenCalledWith("Check interval must be a positive number");
        });

        it("should truncate long values in debug logs", async () => {
            const longValue = "https://example.com/" + "a".repeat(100);
            
            await handleSubmit(mockEvent, {
                ...baseProps,
                name: "",
                url: longValue,
            });

            expect(mockLogger.debug).toHaveBeenCalledWith("Form validation failed", {
                errors: ["Site name is required"],
                formData: expect.objectContaining({
                    url: longValue.substring(0, 50), // truncated
                }),
            });
        });
    });

    describe("Monitor Type Validation", () => {
        it("should handle unknown monitor type gracefully", async () => {
            await handleSubmit(mockEvent, {
                ...baseProps,
                monitorType: "unknown" as any,
                url: "https://example.com",
            });

            // Should not throw an error and proceed with validation
            // The validateMonitorType function should return an empty array for unknown types
            expect(mockCreateSite).toHaveBeenCalled();
        });
    });
});
