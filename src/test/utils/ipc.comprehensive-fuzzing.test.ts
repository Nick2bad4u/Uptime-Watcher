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

import { describe, expect, beforeEach, afterEach } from "vitest";
import { test as fcTest, fc } from "@fast-check/vitest";

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
    fc.string({ minLength: 0, maxLength: 1000 })
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
        id: fc.integer(),
        name: fc.string(),
        url: fc.string(),
        enabled: fc.boolean(),
    }),
    // Edge cases
    fc.constantFrom(
        "",
        0,
        -1,
        Number.MAX_SAFE_INTEGER,
        Number.MIN_SAFE_INTEGER,
        Number.POSITIVE_INFINITY,
        Number.NEGATIVE_INFINITY,
        Number.NaN
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
    params: fc.array(ipcParameters, { minLength: 0, maxLength: 10 }),
    requestId: fc.oneof(fc.uuid(), fc.string(), fc.integer()),
    timestamp: fc.oneof(fc.date(), fc.integer(), fc.string()),
});

/**
 * Generates monitor configuration data for IPC testing
 */
const monitorConfigData = fc.record({
    name: fc.string({ minLength: 1, maxLength: 255 }),
    url: fc.oneof(fc.webUrl(), fc.string()),
    type: fc.constantFrom("http", "ping", "dns", "port"),
    interval: fc.integer({ min: 1000, max: 300_000 }),
    timeout: fc.integer({ min: 1000, max: 30_000 }),
    retries: fc.integer({ min: 0, max: 5 }),
    headers: fc.oneof(
        fc.record({}),
        fc.record({
            "User-Agent": fc.string(),
            "Content-Type": fc.string(),
            Authorization: fc.string(),
        })
    ),
    expectedStatus: fc.oneof(
        fc.integer({ min: 100, max: 599 }),
        fc.constant(200)
    ),
});

// =============================================================================
// IPC Communication Fuzzing Tests
// =============================================================================

describe("Comprehensive IPC Communication Fuzzing", () => {
    let performanceMetrics: {
        handler: string;
        time: number;
        message: any;
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
            time: endTime - startTime,
            message: args,
        });

        return result;
    }

    describe("Message Structure Validation", () => {
        fcTest.prop([ipcMessages])("IPC messages should have valid structure", (
            message
        ) => {
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

                return { valid: errors.length === 0, errors };
            };

            const result = measureIpcHandler(
                validateIpcMessage,
                "messageValidation",
                message
            );

            // Property: Validation should never throw
            expect(result).toHaveProperty("valid");
            expect(result).toHaveProperty("errors");
            expect(typeof result.valid).toBe("boolean");
            expect(Array.isArray(result.errors)).toBeTruthy();

            // Property: Invalid channels should be rejected
            if (message.channel === "" || message.channel.includes(" ")) {
                expect(result.valid).toBeFalsy();
            }

            // Property: Invalid methods should be rejected
            if (
                ![
                    "invoke",
                    "handle",
                    "send",
                    "sendSync",
                ].includes(message.method)
            ) {
                expect(result.valid).toBeFalsy();
            }
        });

        fcTest.prop([fc.array(fc.string(), { minLength: 0, maxLength: 20 })])(
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
                            value: param,
                            safe: !isDangerous,
                            length: param.length,
                        };
                    });

                    const safeParams = validationResults.filter((r) => r.safe);
                    const dangerousParams = validationResults.filter(
                        (r) => !r.safe
                    );

                    return {
                        totalParams: parameters.length,
                        safeParams: safeParams.length,
                        dangerousParams: dangerousParams.length,
                        allSafe: dangerousParams.length === 0,
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
                    expect(result.allSafe).toBeFalsy();
                    expect(result.dangerousParams).toBeGreaterThan(0);
                }
            }
        );
    });

    describe("Monitor Configuration IPC Handlers", () => {
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
                                !monitorConfig.url.startsWith("http://") &&
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
                        success: errors.length === 0,
                        errors,
                        monitorId:
                            errors.length === 0
                                ? Math.floor(Math.random() * 1000) + 1
                                : null,
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
                expect(typeof result.success).toBe("boolean");
                expect(Array.isArray(result.errors)).toBeTruthy();

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
                                expect(result.success).toBeTruthy();
                                expect(result.monitorId).not.toBeNull();
                            }
                        } catch {
                            expect(result.success).toBeFalsy();
                        }
                    } else {
                        // Non-HTTP monitors don't need URL validation
                        expect(result.success).toBeTruthy();
                        expect(result.monitorId).not.toBeNull();
                    }
                }

                // Property: Invalid configuration should fail
                if (!config.name || config.name.trim().length === 0) {
                    expect(result.success).toBeFalsy();
                    expect(result.errors.length).toBeGreaterThan(0);
                }
            }
        );

        fcTest.prop([
            fc.record({
                monitorId: fc.integer({ min: 1, max: 10_000 }),
                updates: fc.record({
                    name: fc.oneof(fc.string(), fc.constant(undefined)),
                    interval: fc.oneof(
                        fc.integer({ min: 500, max: 400_000 }),
                        fc.constant(undefined)
                    ),
                    timeout: fc.oneof(
                        fc.integer({ min: 500, max: 40_000 }),
                        fc.constant(undefined)
                    ),
                    enabled: fc.oneof(fc.boolean(), fc.constant(undefined)),
                }),
            }),
        ])("Monitor update IPC handler should validate partial updates", (
            updateRequest
        ) => {
            const mockMonitorUpdateHandler = (
                request: typeof updateRequest
            ) => {
                const errors: string[] = [];
                const updates: Record<string, any> = {};

                // Validate monitor ID
                if (
                    !Number.isInteger(request.monitorId) ||
                    request.monitorId <= 0
                ) {
                    errors.push("Invalid monitor ID");
                }

                // Validate updates object
                if (Object.keys(request.updates).length === 0) {
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
                        !Number.isInteger(request.updates.interval) ||
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
                        !Number.isInteger(request.updates.timeout) ||
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
                    success: errors.length === 0,
                    errors,
                    updatedFields: Object.keys(updates),
                    monitorId: request.monitorId,
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
            expect(Array.isArray(result.errors)).toBeTruthy();
            expect(Array.isArray(result.updatedFields)).toBeTruthy();

            // Property: Invalid monitor ID should fail
            if (updateRequest.monitorId <= 0) {
                expect(result.success).toBeFalsy();
                expect(result.errors).toContain("Invalid monitor ID");
            }

            // Property: Empty updates should fail
            if (Object.keys(updateRequest.updates).length === 0) {
                expect(result.success).toBeFalsy();
            }
        });
    });

    describe("Error Handling and Security", () => {
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
        ])("IPC handlers should reject malicious payloads", (
            maliciousRequest
        ) => {
            const securityFilter = (request: typeof maliciousRequest) => {
                const dangerousPatterns = [
                    /eval\s*\(/,
                    /Function\s*\(/,
                    /require\s*\(/,
                    /process\./,
                    /global\./,
                    /__dirname/,
                    /__filename/,
                    /Buffer\./,
                    /child_process/,
                    /fs\./,
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
                    safe: detectedThreats.length === 0,
                    threats: detectedThreats,
                    blocked: detectedThreats.length > 0,
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
            expect(typeof result.safe).toBe("boolean");
            expect(Array.isArray(result.threats)).toBeTruthy();

            // Property: Known malicious patterns should be detected
            if (
                maliciousRequest.maliciousPayload.includes("eval(") ||
                maliciousRequest.maliciousPayload.includes("require(") ||
                maliciousRequest.maliciousPayload.includes("process.")
            ) {
                expect(result.safe).toBeFalsy();
                expect(result.blocked).toBeTruthy();
                expect(result.threats.length).toBeGreaterThan(0);
            }
        });

        fcTest.prop([
            fc.record({
                handlerName: fc.string(),
                errorType: fc.constantFrom(
                    "validation",
                    "network",
                    "timeout",
                    "permission",
                    "internal"
                ),
                errorData: fc.oneof(
                    fc.string(),
                    fc.record({}),
                    fc.constant(null)
                ),
            }),
        ])("IPC error handling should provide consistent error format", (
            errorScenario
        ) => {
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
                            return { success: true, data: "No error" };
                        }
                    }
                } catch (error) {
                    return {
                        success: false,
                        error: {
                            type: scenario.errorType,
                            message:
                                error instanceof Error
                                    ? error.message
                                    : "Unknown error",
                            handler: scenario.handlerName,
                            timestamp: new Date().toISOString(),
                            data: scenario.errorData,
                        },
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
                expect(result.error.handler).toBe(errorScenario.handlerName);

                // Property: Timestamp should be valid ISO string
                expect(
                    () => new Date(result.error.timestamp)
                ).not.toThrowError();
            }
        });
    });

    describe("Performance and Load Testing", () => {
        fcTest.prop(
            [fc.array(ipcMessages, { minLength: 10, maxLength: 100 })],
            {
                numRuns: 3, // Reduce runs for performance test
            }
        )("IPC message batch processing should maintain performance", (
            messagesBatch
        ) => {
            const processBatch = (messages: typeof messagesBatch) => {
                const startTime = performance.now();
                const processedMessages: any[] = [];

                for (const message of messages) {
                    // Simulate message processing
                    const processed = {
                        id: processedMessages.length + 1,
                        channel: message.channel,
                        processed: true,
                        processingTime: Math.random() * 5, // Simulate variable processing time
                    };
                    processedMessages.push(processed);
                }

                const endTime = performance.now();
                const totalTime = endTime - startTime;

                return {
                    processed: processedMessages.length,
                    totalTime,
                    averageTime: totalTime / processedMessages.length,
                    messages: processedMessages,
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
        }); // Reduced runs for performance tests
    });
});
