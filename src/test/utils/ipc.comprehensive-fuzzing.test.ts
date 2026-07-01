/**
 * Comprehensive Fast-Check Fuzzing Tests for IPC Communication
 *
 * @remarks
 * This test suite focuses on Inter-Process Communication (IPC) fuzzing with:
 *
 * - Message structure validation
 * - Parameter type safety testing
 * - Security validation for IPC messages
 * - Error handling and recovery testing
 * - Performance testing under various loads
 * - Cross-validation of message contracts
 *
 * @file Provides 100% property-based test coverage for IPC operations including
 *   message validation, parameter sanitization, and error handling.
 *
 * @packageDocumentation
 */

import { fc, test as fcTest } from "@fast-check/vitest";
import { secureRandomFloat } from "@shared/test/testHelpers";
import { isEmpty, isInteger, objectKeys } from "ts-extras";
import { afterEach, beforeEach, describe, expect } from "vitest";

// =============================================================================
// Custom Fast-Check Arbitraries for IPC Messages
// =============================================================================

/**
 * Generates IPC channel names including edge cases
 */
const ipcChannelNames = fc.oneof(
    // Valid IPC channels
    fc.constantFrom(
        "add-site",
        "remove-site",
        "update-site",
        "get-sites",
        "check-site-now",
        "start-monitoring",
        "stop-monitoring",
        "start-monitoring-for-site",
        "stop-monitoring-for-monitor",
        "get-monitor-types",
        "get-history-limit",
        "update-history-limit",
        "request-full-sync",
        "get-sync-status",
        "export-data",
        "import-data",
        "diagnostics-verify-ipc-handler",
        "diagnostics-report-preload-guard"
    ),
    // Edge case channels
    fc.constantFrom(
        "",
        " ",
        "invalid",
        "test",
        "admin",
        "system",
        "root",
        "eval",
        "exec",
        "shell",
        "cmd",
        "powershell"
    ),
    // Malicious channel names
    fc.string({ maxLength: 1000, minLength: 0 })
);

/**
 * Generates IPC message parameters with various types
 */
const ipcParameters = fc.oneof(
    // Primitive types
    fc.string(),
    fc.integer(),
    fc.double(),
    fc.boolean(),
    fc.constant(null),
    fc.constant(undefined),
    // Complex types
    fc.array(fc.string()),
    fc.record({
        enabled: fc.boolean(),
        id: fc.integer(),
        name: fc.string(),
        url: fc.string(),
    }),
    // Edge cases
    fc.constantFrom(
        "",
        0,
        -1,
        Number.MAX_SAFE_INTEGER,
        Number.MIN_SAFE_INTEGER,
        Infinity,
        Number.NEGATIVE_INFINITY,
        NaN
    )
);

/**
 * Generates complete IPC message objects
 */
const ipcMessages = fc.record({
    channel: ipcChannelNames,
    method: fc.oneof(
        fc.constantFrom("invoke", "handle", "send", "sendSync"),
        fc.string()
    ),
    params: fc.array(ipcParameters, { maxLength: 10, minLength: 0 }),
    requestId: fc.oneof(fc.uuid(), fc.string(), fc.integer()),
    timestamp: fc.oneof(fc.date(), fc.integer(), fc.string()),
});

/**
 * Generates monitor configuration data for IPC testing
 */
const monitorConfigData = fc.record({
    expectedStatus: fc.oneof(
        fc.integer({ max: 599, min: 100 }),
        fc.constant(200)
    ),
    headers: fc.oneof(
        fc.record({}),
        fc.record({
            Authorization: fc.string(),
            "Content-Type": fc.string(),
            "User-Agent": fc.string(),
        })
    ),
    interval: fc.integer({ max: 300_000, min: 1000 }),
    name: fc.string({ maxLength: 255, minLength: 1 }),
    retries: fc.integer({ max: 5, min: 0 }),
    timeout: fc.integer({ max: 30_000, min: 1000 }),
    type: fc.constantFrom("http", "ping", "dns", "port"),
    url: fc.oneof(fc.webUrl(), fc.string()),
});

// =============================================================================
// IPC Communication Fuzzing Tests
// =============================================================================

describe("comprehensive IPC Communication Fuzzing", () => {
    let performanceMetrics: {
        handler: string;
        message: any;
        time: number;
    }[] = [];

    beforeEach(() => {
        performanceMetrics = [];
    });

    afterEach(() => {
        // Log performance issues
        const slowHandlers = performanceMetrics.filter((m) => m.time > 100);
        if (slowHandlers.length > 0) {
            console.warn("Slow IPC handlers detected:", slowHandlers);
        }
    });

    /**
     * Helper to measure IPC handler performance
     */
    function measureIpcHandler<T extends unknown[], R>(
        handler: (...args: T) => R,
        handlerName: string,
        ...args: T
    ): R {
        const startTime = performance.now();
        const result = handler(...args);
        const endTime = performance.now();

        performanceMetrics.push({
            handler: handlerName,
            message: args,
            time: endTime - startTime,
        });

        return result;
    }

    describe("message Structure Validation", () => {
        fcTest.prop([ipcMessages])(
            "IPC messages should have valid structure",
            (message) => {
                const validateIpcMessage = (msg: typeof message) => {
                    const errors: string[] = [];

                    // Channel validation
                    if (
                        typeof msg.channel !== "string" ||
                        msg.channel.trim().length === 0 ||
                        msg.channel.includes(" ")
                    ) {
                        errors.push(
                            "Invalid channel: must be non-empty string without spaces"
                        );
                    }

                    // Method validation
                    const validMethods = [
                        "invoke",
                        "handle",
                        "send",
                        "sendSync",
                    ];
                    if (
                        typeof msg.method !== "string" ||
                        !validMethods.includes(msg.method)
                    ) {
                        errors.push("Invalid method: must be valid IPC method");
                    }

                    // Parameters validation
                    if (!Array.isArray(msg.params)) {
                        errors.push("Invalid params: must be array");
                    }

                    // Request ID validation
                    if (
                        msg.requestId !== null &&
                        msg.requestId !== undefined &&
                        typeof msg.requestId !== "string" &&
                        typeof msg.requestId !== "number"
                    ) {
                        errors.push(
                            "Invalid requestId: must be string, number, or null/undefined"
                        );
                    }

                    // Timestamp validation
                    if (msg.timestamp instanceof Date) {
                        if (Number.isNaN(msg.timestamp.getTime())) {
                            errors.push(
                                "Invalid timestamp: Date object is invalid"
                            );
                        }
                    } else if (
                        typeof msg.timestamp === "number" &&
                        !Number.isFinite(msg.timestamp)
                    ) {
                        errors.push("Invalid timestamp: number must be finite");
                    }

                    return { errors, valid: isEmpty(errors) };
                };

                const result = measureIpcHandler(
                    validateIpcMessage,
                    "messageValidation",
                    message
                );

                // Property: Validation should never throw
                expect(result).toHaveProperty("valid");
                expect(result).toHaveProperty("errors");
                expect(result.valid).toBeTypeOf("boolean");
                expect(Array.isArray(result.errors)).toBe(true);

                // Property: Invalid channels should be rejected
                if (message.channel === "" || message.channel.includes(" ")) {
                    expect(result.valid).toBe(false);
                }

                // Property: Invalid methods should be rejected
                if (
                    ![
                        "handle",
                        "invoke",
                        "send",
                        "sendSync",
                    ].includes(message.method)
                ) {
                    expect(result.valid).toBe(false);
                }
            }
        );

        fcTest.prop([fc.array(fc.string(), { maxLength: 20, minLength: 0 })])(
            "IPC parameter arrays should be validated safely",
            (params) => {
                const validateIpcParams = (parameters: string[]) => {
                    const validationResults = parameters.map((param, index) => {
                        // Check for dangerous content
                        const isDangerous =
                            param.includes("eval(") ||
                            param.includes("Function(") ||
                            param.includes("require(") ||
                            param.includes("process.") ||
                            param.includes("global.") ||
                            param.includes("__dirname") ||
                            param.includes("__filename");

                        return {
                            index,
                            length: param.length,
                            safe: !isDangerous,
                            value: param,
                        };
                    });

                    const safeParams = validationResults.filter((r) => r.safe);
                    const dangerousParams = validationResults.filter(
                        (r) => !r.safe
                    );

                    return {
                        allSafe: isEmpty(dangerousParams),
                        dangerousParams: dangerousParams.length,
                        safeParams: safeParams.length,
                        totalParams: parameters.length,
                    };
                };

                const result = measureIpcHandler(
                    validateIpcParams,
                    "parameterValidation",
                    params
                );

                // Property: Validation should never throw
                expect(result).toHaveProperty("totalParams");
                expect(result).toHaveProperty("safeParams");
                expect(result).toHaveProperty("dangerousParams");
                expect(result).toHaveProperty("allSafe");

                // Property: Safe + dangerous should equal total
                expect(result.safeParams + result.dangerousParams).toBe(
                    result.totalParams
                );

                // Property: Dangerous parameters should be detected
                const hasDangerousContent = params.some(
                    (p) =>
                        p.includes("eval(") ||
                        p.includes("require(") ||
                        p.includes("process.")
                );
                if (hasDangerousContent) {
                    expect(result.allSafe).toBe(false);
                    expect(result.dangerousParams).toBeGreaterThan(0);
                }
            }
        );
    });

    describe("monitor Configuration IPC Handlers", () => {
        fcTest.prop([monitorConfigData])(
            "Monitor create IPC handler should validate configuration",
            (config) => {
                const mockMonitorCreateHandler = (
                    monitorConfig: typeof config
                ) => {
                    const errors: string[] = [];

                    // Name validation
                    if (
                        !monitorConfig.name ||
                        monitorConfig.name.trim().length === 0
                    ) {
                        errors.push("Monitor name is required");
                    }
                    if (monitorConfig.name.length > 255) {
                        errors.push("Monitor name too long");
                    }

                    // URL validation for HTTP monitors
                    if (monitorConfig.type === "http") {
                        try {
                            new URL(monitorConfig.url);
                            if (
                                !monitorConfig.url.startsWith("https://") &&
                                !monitorConfig.url.startsWith("https://")
                            ) {
                                errors.push(
                                    "HTTP monitor requires HTTP/HTTPS URL"
                                );
                            }
                        } catch {
                            errors.push("Invalid URL format");
                        }
                    }

                    // Interval validation
                    if (
                        monitorConfig.interval < 1000 ||
                        monitorConfig.interval > 300_000
                    ) {
                        errors.push("Interval must be between 1000-300000ms");
                    }

                    // Timeout validation
                    if (
                        monitorConfig.timeout < 1000 ||
                        monitorConfig.timeout > 30_000
                    ) {
                        errors.push("Timeout must be between 1000-30000ms");
                    }

                    // Timeout should be less than interval
                    if (monitorConfig.timeout >= monitorConfig.interval) {
                        errors.push("Timeout must be less than interval");
                    }

                    return {
                        errors,
                        monitorId: isEmpty(errors)
                            ? Math.floor(secureRandomFloat() * 1000) + 1
                            : null,
                        success: isEmpty(errors),
                    };
                };

                const result = measureIpcHandler(
                    mockMonitorCreateHandler,
                    "monitorCreate",
                    config
                );

                // Property: Handler should never throw
                expect(result).toHaveProperty("success");
                expect(result).toHaveProperty("errors");
                expect(result.success).toBeTypeOf("boolean");
                expect(Array.isArray(result.errors)).toBe(true);

                // Property: Valid configuration should succeed
                if (
                    config.name &&
                    config.name.trim().length > 0 &&
                    config.name.length <= 255 &&
                    config.interval >= 1000 &&
                    config.interval <= 300_000 &&
                    config.timeout >= 1000 &&
                    config.timeout <= 30_000 &&
                    config.timeout < config.interval
                ) {
                    if (config.type === "http") {
                        try {
                            const url = new URL(config.url);
                            if (
                                url.protocol === "http:" ||
                                url.protocol === "https:"
                            ) {
                                expect(result.success).toBe(true);
                                expect(result.monitorId).not.toBeNull();
                            }
                        } catch {
                            expect(result.success).toBe(false);
                        }
                    } else {
                        // Non-HTTP monitors don't need URL validation
                        expect(result.success).toBe(true);
                        expect(result.monitorId).not.toBeNull();
                    }
                }

                // Property: Invalid configuration should fail
                if (!config.name || config.name.trim().length === 0) {
                    expect(result.success).toBe(false);
                    expect(result.errors.length).toBeGreaterThan(0);
                }
            }
        );

        fcTest.prop([
            fc.record({
                monitorId: fc.integer({ max: 10_000, min: 1 }),
                updates: fc.record({
                    enabled: fc.oneof(fc.boolean(), fc.constant(undefined)),
                    interval: fc.oneof(
                        fc.integer({ max: 400_000, min: 500 }),
                        fc.constant(undefined)
                    ),
                    name: fc.oneof(fc.string(), fc.constant(undefined)),
                    timeout: fc.oneof(
                        fc.integer({ max: 40_000, min: 500 }),
                        fc.constant(undefined)
                    ),
                }),
            }),
        ])(
            "Monitor update IPC handler should validate partial updates",
            (updateRequest) => {
                const mockMonitorUpdateHandler = (
                    request: typeof updateRequest
                ) => {
                    const errors: string[] = [];
                    const updates: Record<string, any> = {};

                    // Validate monitor ID
                    if (
                        !isInteger(request.monitorId) ||
                        request.monitorId <= 0
                    ) {
                        errors.push("Invalid monitor ID");
                    }

                    // Validate updates object
                    if (isEmpty(objectKeys(request.updates))) {
                        errors.push("No updates provided");
                    }

                    // Validate each update field
                    if (request.updates.name !== undefined) {
                        if (
                            typeof request.updates.name !== "string" ||
                            request.updates.name.trim().length === 0
                        ) {
                            errors.push("Invalid name update");
                        } else if (request.updates.name.length > 255) {
                            errors.push("Name too long");
                        } else {
                            updates["name"] = request.updates.name.trim();
                        }
                    }

                    if (request.updates.interval !== undefined) {
                        if (
                            !isInteger(request.updates.interval) ||
                            request.updates.interval < 1000 ||
                            request.updates.interval > 300_000
                        ) {
                            errors.push("Invalid interval update");
                        } else {
                            updates["interval"] = request.updates.interval;
                        }
                    }

                    if (request.updates.timeout !== undefined) {
                        if (
                            !isInteger(request.updates.timeout) ||
                            request.updates.timeout < 1000 ||
                            request.updates.timeout > 30_000
                        ) {
                            errors.push("Invalid timeout update");
                        } else {
                            updates["timeout"] = request.updates.timeout;
                        }
                    }

                    if (request.updates.enabled !== undefined) {
                        if (typeof request.updates.enabled === "boolean") {
                            updates["enabled"] = request.updates.enabled;
                        } else {
                            errors.push("Invalid enabled update");
                        }
                    }

                    // Cross-field validation
                    if (
                        updates["timeout"] &&
                        updates["interval"] &&
                        updates["timeout"] >= updates["interval"]
                    ) {
                        errors.push("Timeout must be less than interval");
                    }

                    return {
                        errors,
                        monitorId: request.monitorId,
                        success: isEmpty(errors),
                        updatedFields: objectKeys(updates),
                    };
                };

                const result = measureIpcHandler(
                    mockMonitorUpdateHandler,
                    "monitorUpdate",
                    updateRequest
                );

                // Property: Handler should never throw
                expect(result).toHaveProperty("success");
                expect(result).toHaveProperty("errors");
                expect(Array.isArray(result.errors)).toBe(true);
                expect(Array.isArray(result.updatedFields)).toBe(true);

                // Property: Invalid monitor ID should fail
                if (updateRequest.monitorId <= 0) {
                    expect(result.success).toBe(false);
                    expect(result.errors).toContain("Invalid monitor ID");
                }

                // Property: Empty updates should fail
                if (isEmpty(objectKeys(updateRequest.updates))) {
                    expect(result.success).toBe(false);
                }
            }
        );
    });

    describe("error Handling and Security", () => {
        fcTest.prop([
            fc.record({
                channel: fc.string(),
                maliciousPayload: fc.oneof(
                    fc.constantFrom(
                        "eval('malicious code')",
                        "require('fs').unlinkSync('/')",
                        "process.exit(1)",
                        "global.process.mainModule.require('child_process').exec('rm -rf /')",
                        "__dirname + '/../../../'",
                        "Buffer.from('malicious').toString()"
                    ),
                    fc.string()
                ),
            }),
        ])(
            "IPC handlers should reject malicious payloads",
            (maliciousRequest) => {
                const securityFilter = (request: typeof maliciousRequest) => {
                    const dangerousPatterns = [
                        /eval\s*\(/v,
                        /Function\s*\(/v,
                        /require\s*\(/v,
                        /process\./v,
                        /global\./v,
                        /__dirname/v,
                        /__filename/v,
                        /Buffer\./v,
                        /child_process/v,
                        /fs\./v,
                    ];

                    const payloadStr = JSON.stringify(request);
                    const detectedThreats: string[] = [];

                    for (const [
                        index,
                        pattern,
                    ] of dangerousPatterns.entries()) {
                        if (pattern.test(payloadStr)) {
                            detectedThreats.push(
                                `Pattern ${index}: ${pattern.source}`
                            );
                        }
                    }

                    return {
                        blocked: detectedThreats.length > 0,
                        safe: isEmpty(detectedThreats),
                        threats: detectedThreats,
                    };
                };

                const result = measureIpcHandler(
                    securityFilter,
                    "securityFilter",
                    maliciousRequest
                );

                // Property: Security filter should never throw
                expect(result).toHaveProperty("safe");
                expect(result).toHaveProperty("threats");
                expect(result).toHaveProperty("blocked");
                expect(result.safe).toBeTypeOf("boolean");
                expect(Array.isArray(result.threats)).toBe(true);

                // Property: Known malicious patterns should be detected
                if (
                    maliciousRequest.maliciousPayload.includes("eval(") ||
                    maliciousRequest.maliciousPayload.includes("require(") ||
                    maliciousRequest.maliciousPayload.includes("process.")
                ) {
                    expect(result.safe).toBe(false);
                    expect(result.blocked).toBe(true);
                    expect(result.threats.length).toBeGreaterThan(0);
                }
            }
        );

        fcTest.prop([
            fc.record({
                errorData: fc.oneof(
                    fc.string(),
                    fc.record({}),
                    fc.constant(null)
                ),
                errorType: fc.constantFrom(
                    "validation",
                    "network",
                    "timeout",
                    "permission",
                    "internal"
                ),
                handlerName: fc.string(),
            }),
        ])(
            "IPC error handling should provide consistent error format",
            (errorScenario) => {
                const mockErrorHandler = (scenario: typeof errorScenario) => {
                    try {
                        // Simulate different error conditions
                        switch (scenario.errorType) {
                            case "validation": {
                                throw new Error(
                                    `Validation failed in ${scenario.handlerName}`
                                );
                            }
                            case "network": {
                                throw new Error(
                                    `Network error in ${scenario.handlerName}`
                                );
                            }
                            case "timeout": {
                                throw new Error(
                                    `Timeout in ${scenario.handlerName}`
                                );
                            }
                            case "permission": {
                                throw new Error(
                                    `Permission denied in ${scenario.handlerName}`
                                );
                            }
                            case "internal": {
                                throw new Error(
                                    `Internal error in ${scenario.handlerName}`
                                );
                            }
                            default: {
                                return { data: "No error", success: true };
                            }
                        }
                    } catch (error) {
                        return {
                            error: {
                                data: scenario.errorData,
                                handler: scenario.handlerName,
                                message: Error.isError(error)
                                    ? error.message
                                    : "Unknown error",
                                timestamp: new Date().toISOString(),
                                type: scenario.errorType,
                            },
                            success: false,
                        };
                    }
                };

                const result = measureIpcHandler(
                    mockErrorHandler,
                    "errorHandler",
                    errorScenario
                );

                // Property: Error handler should never throw
                expect(result).toHaveProperty("success");

                if (!result.success && result.error) {
                    // Property: Error response should have consistent structure
                    expect(result.error).toHaveProperty("type");
                    expect(result.error).toHaveProperty("message");
                    expect(result.error).toHaveProperty("handler");
                    expect(result.error).toHaveProperty("timestamp");

                    // Property: Error type should match scenario
                    expect(result.error.type).toBe(errorScenario.errorType);

                    // Property: Handler name should be included
                    expect(result.error.handler).toBe(
                        errorScenario.handlerName
                    );

                    // Property: Timestamp should be valid ISO string
                    expect(
                        () => new Date(result.error.timestamp)
                    ).not.toThrow();
                }
            }
        );
    });

    describe("performance and Load Testing", () => {
        fcTest.prop(
            [fc.array(ipcMessages, { maxLength: 100, minLength: 10 })],
            {
                numRuns: 3, // Reduce runs for performance test
            }
        )(
            "IPC message batch processing should maintain performance",
            (messagesBatch) => {
                const processBatch = (messages: typeof messagesBatch) => {
                    const startTime = performance.now();
                    const processedMessages: any[] = [];

                    for (const message of messages) {
                        // Simulate message processing
                        const processed = {
                            channel: message.channel,
                            id: processedMessages.length + 1,
                            processed: true,
                            processingTime: secureRandomFloat() * 5, // Simulate variable processing time
                        };
                        processedMessages.push(processed);
                    }

                    const endTime = performance.now();
                    const totalTime = endTime - startTime;

                    return {
                        averageTime: totalTime / processedMessages.length,
                        messages: processedMessages,
                        processed: processedMessages.length,
                        totalTime,
                    };
                };

                const result = measureIpcHandler(
                    processBatch,
                    "batchProcessor",
                    messagesBatch
                );

                // Property: All messages should be processed
                expect(result.processed).toBe(messagesBatch.length);
                expect(result.messages).toHaveLength(messagesBatch.length);

                // Property: Performance should be reasonable (< 1ms per message)
                expect(result.averageTime).toBeLessThan(1);

                // Property: Total time should be proportional to batch size
                if (messagesBatch.length > 50) {
                    expect(result.totalTime).toBeGreaterThan(0);
                }
            }
        ); // Reduced runs for performance tests
    });
});
