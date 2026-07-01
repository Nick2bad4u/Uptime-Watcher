import type { ValidationResult } from "@shared/types/validation";
import type { UnknownRecord } from "type-fest";

import "@testing-library/jest-dom";
import { fc, test } from "@fast-check/vitest";
import {
    sampleOne,
    siteIdentifierArbitrary,
    siteNameArbitrary,
    siteUrlArbitrary,
} from "@shared/test/arbitraries/siteArbitraries";
import { arrayAt, arrayJoin, safeCastTo, objectEntries } from "ts-extras";
import {
    beforeEach,
    describe,
    expect,
    it,
    type MockedFunction,
    vi,
} from "vitest";

import type { FormSubmitProperties } from "../../../components/AddSiteForm/Submit";
import type { Logger } from "../../../services/logger";

import { handleSubmit } from "../../../components/AddSiteForm/Submit";

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
    validateMonitorFieldClientSide: vi.fn(),
}));

// Mock the error handling utility
vi.mock("../../../utils/errorHandling", () => ({
    withUtilityErrorHandling: vi.fn(
        async (fn, operationName, fallbackValue, shouldThrow = false) => {
            try {
                return await fn();
            } catch (error) {
                // Mock the logging behavior but don't actually log
                // console.log(`${operationName} failed`, error);

                if (shouldThrow) {
                    throw error;
                }

                if (fallbackValue === undefined) {
                    throw new Error(
                        `${operationName} failed and no fallback value provided`,
                        { cause: error }
                    );
                }

                return fallbackValue;
            }
        }
    ),
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

type MonitorValidationModule =
    typeof import("../../../utils/monitorValidation");

interface ValidationModuleMock {
    createMonitorObject: MockedFunction<
        MonitorValidationModule["createMonitorObject"]
    >;
    validateMonitorFieldClientSide: MockedFunction<
        MonitorValidationModule["validateMonitorFieldClientSide"]
    >;
    validateMonitorFormData: MockedFunction<
        MonitorValidationModule["validateMonitorFormData"]
    >;
}

let validationModule: ValidationModuleMock;

const validationSuccessResult: ValidationResult = {
    errors: [],
    metadata: {},
    success: true,
    warnings: [],
};

const applyValidationResult = (result: ValidationResult): void => {
    validationModule.validateMonitorFormData.mockImplementation(
        async () => result
    );
};

const applyFieldValidationResult = (result: ValidationResult): void => {
    validationModule.validateMonitorFieldClientSide.mockImplementation(
        async () => result
    );
};

beforeEach(async () => {
    vi.clearAllMocks();
    validationModule =
        (await import("../../../utils/monitorValidation")) as unknown as ValidationModuleMock;
    validationModule.validateMonitorFormData.mockReset();
    validationModule.validateMonitorFieldClientSide.mockReset();
    validationModule.createMonitorObject.mockReset();
    applyValidationResult(validationSuccessResult);
    applyFieldValidationResult(validationSuccessResult);
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
            checkIntervalMs: 300_000,
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
            maxResponseTimeMs: "",
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
            annotate("Component: Submit", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Submit", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            const mockEvent = { preventDefault: vi.fn() } as any;
            const properties = createMockProperties();

            // Mock successful validation
            applyValidationResult(validationSuccessResult);
            applyFieldValidationResult(validationSuccessResult);

            // Call with correct signature (event, properties)
            await handleSubmit(mockEvent, properties);

            expect(mockEvent.preventDefault).toHaveBeenCalledWith();
            expect(properties.createSite).toHaveBeenCalledWith();
            expect(properties.onSuccess).toHaveBeenCalledWith();
            expect(validationModule.createMonitorObject).toHaveBeenCalledWith(
                properties.monitorType,
                expect.objectContaining({ url: properties.url })
            );
        });

        it("should handle validation errors", async ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Submit", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Submit", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            const mockEvent = { preventDefault: vi.fn() } as any;
            const properties = createMockProperties();

            // Mock validation failure
            applyValidationResult({
                success: false,
                errors: ["Invalid URL format"],
                warnings: [],
            });

            await handleSubmit(mockEvent, properties);

            expect(mockEvent.preventDefault).toHaveBeenCalledWith();
            expect(properties.setFormError).toHaveBeenCalledWith(
                "Invalid URL format"
            );
            expect(properties.createSite).not.toHaveBeenCalled();
            expect(properties.onSuccess).not.toHaveBeenCalled();
            expect(validationModule.createMonitorObject).not.toHaveBeenCalled();
        });
    });

    describe("handleSubmit - Existing Site", () => {
        it("should handle adding monitor to existing site", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Submit", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Submit", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            const mockEvent = { preventDefault: vi.fn() } as any;
            const properties = createMockProperties({
                addMode: "existing",
                selectedExistingSite: "existing-site-id",
            });

            // Mock successful validation
            applyValidationResult(validationSuccessResult);
            applyFieldValidationResult(validationSuccessResult);

            await handleSubmit(mockEvent, properties);

            expect(mockEvent.preventDefault).toHaveBeenCalledWith();
            expect(properties.addMonitorToSite).toHaveBeenCalledWith();
            expect(properties.onSuccess).toHaveBeenCalledWith();
            expect(validationModule.createMonitorObject).toHaveBeenCalledWith(
                properties.monitorType,
                expect.objectContaining({ url: properties.url })
            );
        });
    });

    describe("Property-Based Form Submission Testing", () => {
        const propertyTimeoutMs = 20_000;
        const basePropertyParameters = {
            interruptAfterTimeLimit: 12_000,
            maxSkipsPerRun: 1000,
            numRuns: 10,
            timeout: propertyTimeoutMs,
        } as const;

        const terminalCharacters = [
            ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ",
            ..."abcdefghijklmnopqrstuvwxyz",
            ..."0123456789",
        ] as const;

        const intermediateCharacters = [
            ...terminalCharacters,
            " ",
            "#",
            "+",
            "-",
            ".",
            "/",
            ":",
            "@",
            "_",
        ] as const;

        const nonBlankSiteNameArbitrary = fc
            .tuple(
                fc.array(fc.constantFrom(...intermediateCharacters), {
                    maxLength: 99,
                }),
                fc.constantFrom(...terminalCharacters)
            )
            .map(
                ([prefixChars, lastChar]) =>
                    `${arrayJoin(prefixChars, "")}${lastChar}`
            );

        const whitespaceCharacters = [
            " ",
            "\t",
            "\n",
            "\r",
            "\u{A0}",
        ] as const;

        const whitespaceOnlyStringArbitrary = fc
            .array(fc.constantFrom(...whitespaceCharacters), {
                maxLength: 50,
                minLength: 1,
            })
            .map((chars) => arrayJoin(chars, ""));

        const nonWhitespaceTerminalCharacters = [
            ...terminalCharacters,
            "!",
            "#",
            ")",
            ".",
            "?",
        ] as const;

        const errorMessageBodyCharacters = [
            ...terminalCharacters,
            " ",
            "#",
            "(",
            ")",
            "-",
            ".",
            "/",
            ":",
            "@",
            "_",
        ] as const;

        const validationErrorMessageArbitrary = fc
            .tuple(
                fc.array(fc.constantFrom(...errorMessageBodyCharacters), {
                    maxLength: 119,
                }),
                fc.constantFrom(...nonWhitespaceTerminalCharacters)
            )
            .map(
                ([bodyChars, lastChar]) =>
                    `${arrayJoin(bodyChars, "")}${lastChar}`
            );

        const submissionFailureMessageArbitrary = fc
            .tuple(
                fc.array(fc.constantFrom(...errorMessageBodyCharacters), {
                    minLength: 4,
                    maxLength: 199,
                }),
                fc.constantFrom(...nonWhitespaceTerminalCharacters)
            )
            .map(
                ([bodyChars, lastChar]) =>
                    `${arrayJoin(bodyChars, "")}${lastChar}`
            );

        const concurrencyPropertyParameters = {
            ...basePropertyParameters,
            numRuns: 8,
        } as const;

        test.prop(
            [
                fc.record({
                    siteName: nonBlankSiteNameArbitrary,
                    url: fc.webUrl(),
                    monitorType: fc.constantFrom("http", "port", "ping", "dns"),
                    checkIntervalMs: fc.constantFrom(
                        30_000,
                        60_000,
                        300_000,
                        600_000
                    ),
                }),
            ],
            basePropertyParameters
        )(
            "should handle valid form submissions with various data combinations",
            async (formData) => {
                const mockEvent = { preventDefault: vi.fn() } as any;
                const properties = createMockProperties({
                    name: formData.siteName,
                    url: formData.url,
                    monitorType: formData.monitorType,
                    checkIntervalMs: formData.checkIntervalMs,
                });

                // Mock successful validation
                applyValidationResult(validationSuccessResult);
                applyFieldValidationResult(validationSuccessResult);

                await handleSubmit(mockEvent, properties);

                expect(mockEvent.preventDefault).toHaveBeenCalledWith();
                expect(properties.createSite).toHaveBeenCalledWith();
                expect(properties.onSuccess).toHaveBeenCalledWith();
                expect(
                    validationModule.createMonitorObject
                ).toHaveBeenCalledWith(
                    properties.monitorType,
                    expect.objectContaining({ url: properties.url })
                );

                // Verify form data characteristics
                expect(formData.siteName.trim().length).toBeGreaterThan(0);
                expect(formData.siteName.length).toBeLessThanOrEqual(100);
                expect(formData.url).toMatch(/^https?:\/\//v);
                expect([
                    "http",
                    "port",
                    "ping",
                    "dns",
                ]).toContain(formData.monitorType);
                expect([
                    30_000,
                    60_000,
                    300_000,
                    600_000,
                ]).toContain(formData.checkIntervalMs);
            },
            propertyTimeoutMs
        );

        test.prop(
            [
                fc.array(validationErrorMessageArbitrary, {
                    maxLength: 5,
                    minLength: 1,
                }),
            ],
            basePropertyParameters
        )(
            "should handle validation errors with various error messages",
            async (errorMessages) => {
                const mockEvent = { preventDefault: vi.fn() } as any;
                const properties = createMockProperties();

                // Mock validation failure
                applyValidationResult({
                    success: false,
                    errors: errorMessages,
                    warnings: [],
                });

                await handleSubmit(mockEvent, properties);

                expect(mockEvent.preventDefault).toHaveBeenCalledWith();
                expect(properties.setFormError).toHaveBeenCalledWith();
                expect(properties.createSite).not.toHaveBeenCalled();
                expect(
                    validationModule.createMonitorObject
                ).not.toHaveBeenCalled();

                // Verify error characteristics
                expect(Array.isArray(errorMessages)).toBeTruthy();
                expect(errorMessages.length).toBeGreaterThanOrEqual(1);
                expect(errorMessages.length).toBeLessThanOrEqual(5);
            },
            propertyTimeoutMs
        );

        test.prop(
            [
                fc.record({
                    host: fc.oneof(
                        fc.domain(),
                        fc.ipV4(),
                        fc.constant("localhost")
                    ),
                    port: fc.integer({ min: 1, max: 65_535 }),
                    timeout: fc.integer({ min: 1000, max: 60_000 }),
                    retries: fc.integer({ min: 0, max: 10 }),
                }),
            ],
            basePropertyParameters
        )(
            "should handle Port monitor submissions with various configurations",
            async (portConfig) => {
                const mockEvent = { preventDefault: vi.fn() } as any;
                const properties = createMockProperties({
                    monitorType: "port",
                    host: portConfig.host,
                    port: portConfig.port.toString(),
                });

                // Mock successful validation
                applyValidationResult(validationSuccessResult);
                applyFieldValidationResult(validationSuccessResult);

                await handleSubmit(mockEvent, properties);

                expect(mockEvent.preventDefault).toHaveBeenCalledWith();
                expect(properties.createSite).toHaveBeenCalledWith();

                // Verify Port config characteristics
                expect(portConfig.port).toBeGreaterThanOrEqual(1);
                expect(portConfig.port).toBeLessThanOrEqual(65_535);
                expect(portConfig.timeout).toBeGreaterThanOrEqual(1000);
                expect(portConfig.timeout).toBeLessThanOrEqual(60_000);
                expect(portConfig.retries).toBeGreaterThanOrEqual(0);
                expect(portConfig.retries).toBeLessThanOrEqual(10);
            },
            propertyTimeoutMs
        );

        test.prop(
            [
                fc.oneof(
                    whitespaceOnlyStringArbitrary,
                    fc.constantFrom("", " ".repeat(3), "\t", "\n"),
                    fc.constant(null),
                    fc.constant(undefined)
                ),
            ],
            basePropertyParameters
        )(
            "should handle invalid form data gracefully",
            async (invalidInput) => {
                const mockEvent = { preventDefault: vi.fn() } as any;
                const properties = createMockProperties({
                    name: invalidInput as any,
                });

                // Mock validation failure for invalid input
                applyValidationResult({
                    success: false,
                    errors: ["Invalid input provided"],
                    warnings: [],
                });

                await handleSubmit(mockEvent, properties);

                expect(mockEvent.preventDefault).toHaveBeenCalledWith();
                expect(properties.setFormError).toHaveBeenCalledWith();
                expect(properties.createSite).not.toHaveBeenCalled();

                // Form should handle invalid input without crashing
                expect(() => {
                    const testValue = invalidInput;
                    expect(
                        testValue === null ||
                            testValue === undefined ||
                            (typeof testValue === "string" &&
                                testValue.trim().length === 0)
                    ).toBeTruthy();
                }).not.toThrow();
            },
            propertyTimeoutMs
        );

        test.prop(
            [
                fc.record({
                    errorType: fc.constantFrom(
                        "network",
                        "timeout",
                        "validation",
                        "server",
                        "permission"
                    ),
                    statusCode: fc.integer({ min: 400, max: 599 }),
                    message: submissionFailureMessageArbitrary,
                }),
            ],
            basePropertyParameters
        )(
            "should handle different types of submission failures",
            async (error) => {
                const mockEvent = { preventDefault: vi.fn() } as any;

                // Mock different error scenarios
                const mockError = new Error(
                    `${error.errorType}: ${error.message}`
                );

                // Create a mock that can be rejected
                const rejectedCreateSite = vi.fn().mockRejectedValue(mockError);
                const propertiesWithReject = createMockProperties();
                propertiesWithReject.createSite = rejectedCreateSite;

                // Mock successful validation but failed submission
                applyValidationResult(validationSuccessResult);
                applyFieldValidationResult(validationSuccessResult);

                await handleSubmit(mockEvent, propertiesWithReject);

                expect(mockEvent.preventDefault).toHaveBeenCalledWith();
                expect(propertiesWithReject.createSite).toHaveBeenCalledWith();
                expect(
                    propertiesWithReject.setFormError
                ).toHaveBeenCalledWith();

                // Verify error characteristics
                expect([
                    "network",
                    "timeout",
                    "validation",
                    "server",
                    "permission",
                ]).toContain(error.errorType);
                expect(error.statusCode).toBeGreaterThanOrEqual(400);
                expect(error.statusCode).toBeLessThanOrEqual(599);
                expect(error.message.length).toBeGreaterThanOrEqual(5);
                expect(error.message.length).toBeLessThanOrEqual(200);
            },
            propertyTimeoutMs
        );

        test.prop([fc.constantFrom("new", "existing")], basePropertyParameters)(
            "should handle different form modes correctly",
            async (addMode) => {
                const mockEvent = { preventDefault: vi.fn() } as any;
                const properties = createMockProperties({
                    addMode: addMode,
                    // Provide valid selectedExistingSite for "existing" mode to pass validation
                    ...(addMode === "existing" && {
                        selectedExistingSite: "existing-site-id",
                    }),
                });

                // Mock successful validation
                applyValidationResult(validationSuccessResult);
                applyFieldValidationResult(validationSuccessResult);

                await handleSubmit(mockEvent, properties);

                expect(mockEvent.preventDefault).toHaveBeenCalledWith();
                expect(properties.onSuccess).toHaveBeenCalledWith();

                // Verify mode-specific behavior
                if (addMode === "new") {
                    expect(properties.createSite).toHaveBeenCalledWith();
                } else {
                    expect(properties.addMonitorToSite).toHaveBeenCalledWith();
                }

                expect(["new", "existing"]).toContain(addMode);
            },
            propertyTimeoutMs
        );

        test.prop(
            [
                fc.array(fc.string({ minLength: 1, maxLength: 50 }), {
                    maxLength: 10,
                    minLength: 1,
                }),
            ],
            concurrencyPropertyParameters
        )(
            "should handle multiple concurrent form submissions",
            async (submissionData) => {
                const submissions = submissionData.map((_data, index) => {
                    const mockEvent = { preventDefault: vi.fn() } as any;
                    const properties = createMockProperties({
                        name: `Site ${index}`,
                        siteIdentifier: `site-${index}`,
                    });

                    return { mockEvent, properties };
                });

                // Mock successful validation for all submissions
                applyValidationResult(validationSuccessResult);
                applyFieldValidationResult(validationSuccessResult);

                // Process all submissions
                for (const { mockEvent, properties } of submissions) {
                    await handleSubmit(mockEvent, properties);
                    expect(mockEvent.preventDefault).toHaveBeenCalledWith();
                }

                // Verify submission characteristics
                expect(Array.isArray(submissionData)).toBeTruthy();
                expect(submissionData.length).toBeGreaterThanOrEqual(1);
                expect(submissionData.length).toBeLessThanOrEqual(10);
                expect(submissions).toHaveLength(submissionData.length);
            },
            propertyTimeoutMs
        );
    });

    describe("handleSubmit - monitor builder normalization", () => {
        const monitorBuilderScenarios = [
            {
                monitorType: "cdn-edge-consistency" as const,
                overrides: {
                    baselineUrl: "  https://edge.example.com  ",
                    edgeLocations: "us-east-1",
                },
                expectation: {
                    baselineUrl: "https://edge.example.com",
                    edgeLocations: "us-east-1",
                },
            },
            {
                monitorType: "dns" as const,
                overrides: {
                    expectedValue: "  1.2.3.4  ",
                    host: "example.com",
                    recordType: "A",
                },
                expectation: {
                    expectedValue: "1.2.3.4",
                    host: "example.com",
                    recordType: "A",
                },
            },
            {
                monitorType: "dns" as const,
                overrides: {
                    expectedValue: "should be dropped",
                    host: "",
                    recordType: "ANY",
                },
                expectation: {
                    expectedValue: undefined,
                    host: undefined,
                    recordType: "ANY",
                },
            },
            {
                monitorType: "http-header" as const,
                overrides: {
                    expectedHeaderValue: " application/json ",
                    headerName: "  X-Test  ",
                    url: "https://headers.example.com ",
                },
                expectation: {
                    expectedHeaderValue: "application/json",
                    headerName: "X-Test",
                    url: "https://headers.example.com",
                },
            },
            {
                monitorType: "http-json" as const,
                overrides: {
                    expectedJsonValue: "42",
                    jsonPath: " $.data.value ",
                    url: "https://json.example.com",
                },
                expectation: {
                    expectedJsonValue: "42",
                    jsonPath: "$.data.value",
                },
            },
            {
                monitorType: "http-keyword" as const,
                overrides: {
                    bodyKeyword: " uptime ",
                    url: "https://keyword.example.com",
                },
                expectation: {
                    bodyKeyword: "uptime",
                },
            },
            {
                monitorType: "http-latency" as const,
                overrides: {
                    maxResponseTimeMs: " 2500 ",
                    url: "https://latency.example.com",
                },
                expectation: {
                    maxResponseTime: 2500,
                },
            },
            {
                monitorType: "http-status" as const,
                overrides: {
                    expectedStatusCode: " 204 ",
                    url: "https://status.example.com",
                },
                expectation: {
                    expectedStatusCode: 204,
                },
            },
            {
                monitorType: "ping" as const,
                overrides: {
                    host: " ping.example.com ",
                },
                expectation: {
                    host: "ping.example.com",
                },
            },
            {
                monitorType: "port" as const,
                overrides: {
                    host: " port.example.com ",
                    port: " 8080 ",
                },
                expectation: {
                    host: "port.example.com",
                    port: 8080,
                },
            },
            {
                monitorType: "replication" as const,
                overrides: {
                    maxReplicationLagSeconds: " 90 ",
                    primaryStatusUrl: " https://primary.example.com",
                    replicaStatusUrl: "https://replica.example.com ",
                    replicationTimestampField: " updatedAt ",
                },
                expectation: {
                    maxReplicationLagSeconds: 90,
                    primaryStatusUrl: "https://primary.example.com",
                    replicaStatusUrl: "https://replica.example.com",
                    replicationTimestampField: "updatedAt",
                },
            },
            {
                monitorType: "server-heartbeat" as const,
                overrides: {
                    heartbeatExpectedStatus: "OK",
                    heartbeatMaxDriftSeconds: "120",
                    heartbeatStatusField: "status",
                    heartbeatTimestampField: "timestamp",
                    url: "https://heartbeat.example.com",
                },
                expectation: {
                    heartbeatExpectedStatus: "OK",
                    heartbeatMaxDriftSeconds: 120,
                    heartbeatStatusField: "status",
                    heartbeatTimestampField: "timestamp",
                },
            },
            {
                monitorType: "ssl" as const,
                overrides: {
                    certificateWarningDays: " 15 ",
                    host: " cert.example.com ",
                    port: " 443 ",
                },
                expectation: {
                    certificateWarningDays: 15,
                    host: "cert.example.com",
                    port: 443,
                },
            },
            {
                monitorType: "websocket-keepalive" as const,
                overrides: {
                    maxPongDelayMs: " 5000 ",
                    url: "wss://socket.example.com",
                },
                expectation: {
                    maxPongDelayMs: 5000,
                },
            },
        ] as const;

        it.each(monitorBuilderScenarios)(
            "normalizes %s monitor fields before validation",
            async (scenario) => {
                const mockEvent = { preventDefault: vi.fn() } as any;
                const properties = createMockProperties({
                    monitorType: scenario.monitorType,
                    ...scenario.overrides,
                });

                applyValidationResult(validationSuccessResult);
                applyFieldValidationResult(validationSuccessResult);

                await handleSubmit(mockEvent, properties);

                expect(
                    validationModule.validateMonitorFormData
                ).toHaveBeenCalledWith();
                const calls =
                    validationModule.validateMonitorFormData.mock.calls;
                const lastCall = arrayAt(calls, -1);
                const formData = safeCastTo<UnknownRecord>(lastCall?.[1] ?? {});

                for (const [key, value] of objectEntries(
                    scenario.expectation
                )) {
                    if (value === undefined) {
                        expect(formData[key]).toBeUndefined();
                    } else {
                        expect(formData[key]).toBe(value);
                    }
                }
            }
        );

        it("throws when the monitor type is unsupported", async () => {
            const mockEvent = { preventDefault: vi.fn() } as any;
            const properties = createMockProperties({
                monitorType:
                    "unsupported-type" as unknown as FormSubmitProperties["monitorType"],
            });

            await expect(handleSubmit(mockEvent, properties)).rejects.toThrow(
                "Unsupported monitor type"
            );
        });
    });
});
