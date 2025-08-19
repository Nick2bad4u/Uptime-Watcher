import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom";
import { handleSubmit } from "../../../components/AddSiteForm/Submit";
import type { FormSubmitProperties } from "../../../components/AddSiteForm/Submit";
import type { Logger } from "../../../services/logger";

// Mock the validation functions
vi.mock("../../../utils/monitorValidation", () => ({
    validateMonitorFormData: vi.fn(),
    validateMonitorFieldClientSide: vi.fn(),
}));

// Mock the error handling utility
vi.mock("../../../utils/errorHandling", () => ({
    withUtilityErrorHandling: vi.fn((fn) => fn()),
}));

// Mock the fallbacks
vi.mock("../../../utils/fallbacks", () => ({
    truncateForLogging: vi.fn((str) => str),
}));

// Create a mock logger that properly matches the Logger interface
const createMockLogger = (): Logger =>
    ({
        app: {
            error: vi.fn(),
            performance: vi.fn(),
            started: vi.fn(),
            stopped: vi.fn(),
        },
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        monitor: {
            added: vi.fn(),
            error: vi.fn(),
            started: vi.fn(),
            stopped: vi.fn(),
        },
        raw: vi.fn(),
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
    }) as unknown as Logger;

beforeEach(() => {
    vi.clearAllMocks();
});

describe("Submit.tsx - Comprehensive Coverage", () => {
    const createMockProperties = (
        overrides: Partial<FormSubmitProperties> = {}
    ): FormSubmitProperties => ({
        addMode: "new",
        checkInterval: 30_000,
        expectedValue: "",
        formError: undefined,
        clearError: vi.fn(),
        generateUuid: vi.fn(() => "test-uuid"),
        host: "",
        logger: createMockLogger(),
        monitorType: "http",
        name: "Test Site",
        port: "",
        recordType: "A",
        selectedExistingSite: "",
        setFormError: vi.fn(),
        siteId: "test-site-id",
        url: "https://example.com",
        addMonitorToSite: vi.fn(),
        createSite: vi.fn(),
        onSuccess: vi.fn(),
        ...overrides,
    });

    describe("handleSubmit - New Site Creation", () => {
        it("should handle successful new site submission with HTTP monitor", async () => {
            const mockEvent = { preventDefault: vi.fn() } as any;
            const properties = createMockProperties();

            // Mock successful validation
            const { validateMonitorFormData, validateMonitorFieldClientSide } =
                await import("../../../utils/monitorValidation");
            vi.mocked(validateMonitorFormData).mockResolvedValue({
                success: true,
                errors: [],
                warnings: [],
            });

            vi.mocked(validateMonitorFieldClientSide).mockResolvedValue({
                success: true,
                errors: [],
                warnings: [],
            });

            // Call with correct signature (event, properties)
            await handleSubmit(mockEvent, properties);

            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(properties.createSite).toHaveBeenCalled();
            expect(properties.onSuccess).toHaveBeenCalled();
        });

        it("should handle validation errors", async () => {
            const mockEvent = { preventDefault: vi.fn() } as any;
            const properties = createMockProperties();

            // Mock validation failure
            const { validateMonitorFormData } = await import(
                "../../../utils/monitorValidation"
            );
            vi.mocked(validateMonitorFormData).mockResolvedValue({
                success: false,
                errors: ["Invalid URL format"],
                warnings: [],
            });

            await handleSubmit(mockEvent, properties);

            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(properties.setFormError).toHaveBeenCalledWith(
                "Invalid URL format"
            );
            expect(properties.createSite).not.toHaveBeenCalled();
            expect(properties.onSuccess).not.toHaveBeenCalled();
        });
    });

    describe("handleSubmit - Existing Site", () => {
        it("should handle adding monitor to existing site", async () => {
            const mockEvent = { preventDefault: vi.fn() } as any;
            const properties = createMockProperties({
                addMode: "existing",
                selectedExistingSite: "existing-site-id",
            });

            // Mock successful validation
            const { validateMonitorFormData, validateMonitorFieldClientSide } =
                await import("../../../utils/monitorValidation");
            vi.mocked(validateMonitorFormData).mockResolvedValue({
                success: true,
                errors: [],
                warnings: [],
            });

            vi.mocked(validateMonitorFieldClientSide).mockResolvedValue({
                success: true,
                errors: [],
                warnings: [],
            });

            await handleSubmit(mockEvent, properties);

            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(properties.addMonitorToSite).toHaveBeenCalled();
            expect(properties.onSuccess).toHaveBeenCalled();
        });
    });
});
