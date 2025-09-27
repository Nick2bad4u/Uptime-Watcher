/**
 * Additional coverage tests for Submit.tsx to cover remaining uncovered lines
 * Targeting specific lines: 109-122, 176, 298-307, 422
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom";
import { handleSubmit } from "../../../components/AddSiteForm/Submit";
import type { FormSubmitProperties } from "../../../components/AddSiteForm/Submit";
import type { Logger } from "../../../services/logger";

// Mock the validation functions
vi.mock("../../../utils/monitorValidation", () => ({
    createMonitorObject: vi.fn(() => ({
        id: "mock-monitor-id",
        type: "http",
        status: "up",
        monitoring: false,
        checkInterval: 60_000,
        lastChecked: new Date(),
        responseTime: 0,
        retryAttempts: 3,
        timeout: 30_000,
        history: [],
        name: "Mock Monitor",
        config: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    })),
    validateMonitorFormData: vi.fn(),
    validateMonitorFieldClientSide: vi.fn(() => ({
        success: true,
        errors: [],
        warnings: [],
    })),
    validateNumericField: vi.fn(() => ({
        success: true,
        errors: [],
        warnings: [],
    })),
    validateRequiredField: vi.fn(() => ({
        success: true,
        errors: [],
        warnings: [],
    })),
    validateUrl: vi.fn(() => ({ success: true, errors: [], warnings: [] })),
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
        validation: {
            error: vi.fn(),
            field: vi.fn(),
            monitor: vi.fn(),
            site: vi.fn(),
        },
        verbose: vi.fn(),
        warn: vi.fn(),
    }) as unknown as Logger;

beforeEach(() => {
    vi.clearAllMocks();
});

describe("Submit.tsx - Additional Coverage Tests", () => {
    const createMockProperties = (
        overrides: Partial<FormSubmitProperties> = {}
    ): FormSubmitProperties =>
        ({
            addMode: "new",
            checkInterval: 300_000,
            expectedValue: "",
            formError: undefined,
            host: "example.com",
            monitorType: "http",
            name: "Test Site",
            port: "80",
            recordType: "A",
            selectedExistingSite: "",
            siteId: "test-site-id",
            url: "https://example.com",

            setFormError: vi.fn(),
            addMonitorToSite: vi.fn(),
            clearError: vi.fn(),
            createSite: vi.fn().mockResolvedValue(undefined),
            generateUuid: vi.fn(() => "test-uuid"),
            logger: createMockLogger(),
            onSuccess: vi.fn(),
            ...overrides,
            certificateWarningDays: overrides.certificateWarningDays ?? "30",
        }) as FormSubmitProperties;

    describe("Coverage for Lines 109-122 (ping and port monitor types)", () => {
        it("should handle ping monitor type submission (lines 109-114)", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Submit.additional-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Submit.additional-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            const mockEvent = { preventDefault: vi.fn() } as any;
            const properties = createMockProperties({
                monitorType: "ping",
                host: "example.com",
            });

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

            expect(properties.createSite).toHaveBeenCalled();
        });

        it("should handle port monitor type submission (lines 115-120)", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Submit.additional-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Submit.additional-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            const mockEvent = { preventDefault: vi.fn() } as any;
            const properties = createMockProperties({
                monitorType: "port",
                host: "example.com",
                port: "80",
            });

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

            expect(properties.createSite).toHaveBeenCalled();
        });

        it("should handle unknown monitor type with default case (lines 121-122)", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Submit.additional-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Submit.additional-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            const mockEvent = { preventDefault: vi.fn() } as any;
            const properties = createMockProperties({
                monitorType: "unknown" as any,
            });

            const { validateMonitorFormData } = await import(
                "../../../utils/monitorValidation"
            );
            vi.mocked(validateMonitorFormData).mockResolvedValue({
                success: true,
                errors: [],
                warnings: [],
            });

            // Expect this to throw an error
            await expect(handleSubmit(mockEvent, properties)).rejects.toThrow(
                "Unsupported monitor type: unknown"
            );
        });
    });

    describe("Coverage for Line 176 (existing site validation)", () => {
        it("should validate selectedExistingSite when in existing mode (line 176)", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Submit.additional-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Validation", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Submit.additional-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Validation", "type");

            const mockEvent = { preventDefault: vi.fn() } as any;
            const properties = createMockProperties({
                addMode: "existing",
                selectedExistingSite: "", // Empty string should trigger validation error
            });

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

            // Should set form error for missing existing site selection
            expect(properties.setFormError).toHaveBeenCalled();
        });
    });

    describe("Coverage for Lines 298-307 (type-specific field assignment in existing mode)", () => {
        it("should handle ping monitor in existing mode field assignment (lines 298-301)", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Submit.additional-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Submit.additional-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            const mockEvent = { preventDefault: vi.fn() } as any;
            const properties = createMockProperties({
                addMode: "existing",
                selectedExistingSite: "site-1",
                monitorType: "ping",
                host: "example.com",
            });

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

            expect(properties.addMonitorToSite).toHaveBeenCalled();
        });

        it("should handle port monitor in existing mode field assignment (lines 302-306)", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Submit.additional-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Submit.additional-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            const mockEvent = { preventDefault: vi.fn() } as any;
            const properties = createMockProperties({
                addMode: "existing",
                selectedExistingSite: "site-1",
                monitorType: "port",
                host: "example.com",
                port: "80",
            });

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

            expect(properties.addMonitorToSite).toHaveBeenCalled();
        });

        it("should handle unsupported monitor type with error (line 307)", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Submit.additional-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Submit.additional-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            const mockEvent = { preventDefault: vi.fn() } as any;
            const properties = createMockProperties({
                addMode: "existing",
                selectedExistingSite: "site-1",
                monitorType: "unsupported" as any,
            });

            const { validateMonitorFormData } = await import(
                "../../../utils/monitorValidation"
            );
            vi.mocked(validateMonitorFormData).mockResolvedValue({
                success: true,
                errors: [],
                warnings: [],
            });

            // Expect this to throw an error for unsupported monitor type
            await expect(handleSubmit(mockEvent, properties)).rejects.toThrow(
                "Unsupported monitor type: unsupported"
            );
        });
    });

    describe("Coverage for Line 422 (result falsy handling)", () => {
        it("should handle when createSite returns no result (line 422)", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Submit.additional-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Constructor", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Submit.additional-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Constructor", "type");

            const mockEvent = { preventDefault: vi.fn() } as any;
            const properties = createMockProperties({
                createSite: vi.fn().mockResolvedValue(undefined), // Returns undefined
            });

            const { validateMonitorFormData } = await import(
                "../../../utils/monitorValidation"
            );
            vi.mocked(validateMonitorFormData).mockResolvedValue({
                success: true,
                errors: [],
                warnings: [],
            });

            await handleSubmit(mockEvent, properties);

            // The createSite method should have been called
            expect(properties.createSite).toHaveBeenCalled();
        });
    });
});
