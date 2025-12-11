import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom";
import { handleSubmit } from "../../../components/AddSiteForm/Submit";
import type { FormSubmitProperties } from "../../../components/AddSiteForm/Submit";
import type { Logger } from "../../../services/logger";
import {
    sampleOne,
    siteIdentifierArbitrary,
    siteNameArbitrary,
    siteUrlArbitrary,
} from "@shared/test/arbitraries/siteArbitraries";

// Mock the validation functions
vi.mock("../../../utils/monitorValidation", () => ({
    validateMonitorFormData: vi.fn(),
    validateMonitorFieldClientSide: vi.fn(),
}));

// Mock the error handling utility
vi.mock("../../../utils/errorHandling", () => ({
    withUtilityErrorHandling: vi.fn(),
}));

// Mock the fallbacks
vi.mock("../../../utils/fallbacks", () => ({
    truncateForLogging: vi.fn((str) => str),
}));

// Create a mock logger that properly matches the Logger interface
const createMockLogger = () => vi.fn() as unknown as Logger;

beforeEach(() => {
    vi.clearAllMocks();
});

describe("Submit.tsx - Comprehensive Coverage", () => {
    const createMockProperties = (
        overrides: Partial<FormSubmitProperties> = {}
    ): FormSubmitProperties => {
        const generatedName = sampleOne(siteNameArbitrary);
        const generatedUrl = sampleOne(siteUrlArbitrary);
        const generatedIdentifier = sampleOne(siteIdentifierArbitrary);
        const deriveHost = (urlValue: string): string => {
            try {
                return new URL(urlValue).hostname;
            } catch {
                return "localhost";
            }
        };

        const baseProperties: FormSubmitProperties = {
            addMode: "new",
            baselineUrl: generatedUrl,
            bodyKeyword: "",
            certificateWarningDays: "30",
            checkInterval: 300_000,
            edgeLocations: "",
            expectedHeaderValue: "",
            expectedJsonValue: "",
            expectedStatusCode: "200",
            expectedValue: "",
            formError: undefined,
            headerName: "",
            heartbeatExpectedStatus: "",
            heartbeatMaxDriftSeconds: "",
            heartbeatStatusField: "",
            heartbeatTimestampField: "",
            host: deriveHost(generatedUrl),
            jsonPath: "",
            maxPongDelayMs: "",
            maxReplicationLagSeconds: "",
            maxResponseTime: "",
            monitorType: "http",
            name: generatedName,
            port: "80",
            primaryStatusUrl: "",
            recordType: "A",
            replicaStatusUrl: "",
            replicationTimestampField: "",
            selectedExistingSite: "",
            siteIdentifier: generatedIdentifier,
            url: generatedUrl,
            setFormError: vi.fn(),
            addMonitorToSite: vi.fn(),
            clearError: vi.fn(),
            createSite: vi.fn().mockResolvedValue(undefined),
            generateUuid: vi.fn(() => "test-uuid"),
            logger: createMockLogger(),
            onSuccess: vi.fn(),
        };

        const merged = {
            ...baseProperties,
            ...overrides,
        } satisfies FormSubmitProperties;

        if (overrides.host === undefined) {
            merged.host = deriveHost(merged.url);
        }

        if (overrides.certificateWarningDays === undefined) {
            merged.certificateWarningDays = "30";
        }

        return merged;
    };

    describe("handleSubmit - New Site Creation", () => {
        it("should handle successful new site submission with HTTP monitor", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: Submit.comprehensive.test.fixed.tsx",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: Submit.comprehensive.test.fixed.tsx",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            const mockEvent = { preventDefault: vi.fn() } as any;
            const properties = createMockProperties();

            // Mock successful validation
            const { validateMonitorFormData, validateMonitorFieldClientSide } =
                await import("../../../utils/monitorValidation");
            vi.mocked(validateMonitorFormData).mockResolvedValue({
                errors: [],
                metadata: {},
                success: true,
                warnings: [],
            });

            vi.mocked(validateMonitorFieldClientSide).mockResolvedValue({
                errors: [],
                metadata: {},
                success: true,
                warnings: [],
            });

            // Call with correct signature (event, properties)
            await handleSubmit(mockEvent, properties);

            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(properties.createSite).toHaveBeenCalled();
            expect(properties.onSuccess).toHaveBeenCalled();
        });

        it("should handle validation errors", async ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: Submit.comprehensive.test.fixed.tsx",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: Submit.comprehensive.test.fixed.tsx",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            const mockEvent = { preventDefault: vi.fn() } as any;
            const properties = createMockProperties();

            // Mock validation failure
            const { validateMonitorFormData } =
                await import("../../../utils/monitorValidation");
            vi.mocked(validateMonitorFormData).mockResolvedValue({
                errors: ["Invalid URL format"],
                metadata: {},
                success: false,
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
        it("should handle adding monitor to existing site", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: Submit.comprehensive.test.fixed.tsx",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: Submit.comprehensive.test.fixed.tsx",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            const mockEvent = { preventDefault: vi.fn() } as any;
            const properties = createMockProperties({
                addMode: "existing",
                selectedExistingSite: "existing-site-id",
            });

            // Mock successful validation
            const { validateMonitorFormData, validateMonitorFieldClientSide } =
                await import("../../../utils/monitorValidation");
            vi.mocked(validateMonitorFormData).mockResolvedValue({
                errors: [],
                metadata: {},
                success: true,
                warnings: [],
            });

            vi.mocked(validateMonitorFieldClientSide).mockResolvedValue({
                errors: [],
                metadata: {},
                success: true,
                warnings: [],
            });

            await handleSubmit(mockEvent, properties);

            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(properties.addMonitorToSite).toHaveBeenCalled();
            expect(properties.onSuccess).toHaveBeenCalled();
        });
    });
});
