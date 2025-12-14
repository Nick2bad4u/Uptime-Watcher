/**
 * @remarks
 * Tests all logger service operations with property-based testing using
 * fast-check to discover edge cases in logging functionality, structured
 * logging patterns, and error handling. Validates log formatting, context
 * handling, and performance logging scenarios with arbitrary inputs.
 *
 * Coverage areas:
 *
 * - Structured logging with arbitrary messages and contexts
 * - Error logging with arbitrary error objects
 * - Performance logging with arbitrary operation data
 * - Application lifecycle logging
 * - Site and monitor domain logging
 * - Store operation logging
 * - Log level handling and filtering
 * - Concurrent logging operations
 *
 * @file Comprehensive property-based fuzzing tests for logger service
 *
 * @author AI Assistant
 */

import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { test as fcTest } from "@fast-check/vitest";
import * as fc from "fast-check";

// Mock electron-log/renderer
vi.mock("electron-log/renderer", () => ({
    default: {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        verbose: vi.fn(),
        silly: vi.fn(),
        transports: {
            console: {
                level: "debug",
                format: "[{h}:{i}:{s}.{ms}] [{level}] {text}",
            },
            file: {
                level: "info",
            },
        },
    },
}));

type ElectronLogRenderer = (typeof import("electron-log/renderer"))["default"];

let logger: (typeof import("../../services/logger"))["logger"];
let mockLog: ElectronLogRenderer;
let mockDebug: ReturnType<typeof vi.fn>;
let mockInfo: ReturnType<typeof vi.fn>;
let mockWarn: ReturnType<typeof vi.fn>;
let mockError: ReturnType<typeof vi.fn>;

beforeAll(async () => {
    // Other suites can import the logger early. Reset the module cache and
    // import logger after our electron-log mock is registered.
    vi.resetModules();

    const logModule = await import("electron-log/renderer");
    mockLog = vi.mocked(logModule.default);
    mockDebug = mockLog.debug as unknown as ReturnType<typeof vi.fn>;
    mockInfo = mockLog.info as unknown as ReturnType<typeof vi.fn>;
    mockWarn = mockLog.warn as unknown as ReturnType<typeof vi.fn>;
    mockError = mockLog.error as unknown as ReturnType<typeof vi.fn>;

    const loggerModule = await import("../../services/logger");
    logger = loggerModule.logger;
});

// Property-based test arbitraries for logger service
const arbitraries = {
    /** Generate log message */
    logMessage: fc.string({ minLength: 1, maxLength: 1000 }),

    /** Generate empty or whitespace message */
    emptyMessage: fc.constantFrom("", "   ", "\n", "\t", "  \n  "),

    /** Generate context string */
    contextString: fc
        .string({ minLength: 1, maxLength: 100 })
        .filter((s) => s.trim().length > 0),

    /** Generate operation name */
    operationName: fc.constantFrom(
        "fetchSites",
        "createSite",
        "updateSite",
        "deleteSite",
        "startMonitoring",
        "stopMonitoring",
        "checkStatus",
        "syncData",
        "backupData",
        "loadSettings",
        "saveSettings",
        "authenticate",
        "refreshToken",
        "clearCache",
        "validateData",
        "processUpdates",
        "generateReports",
        "exportData",
        "importData"
    ),

    /** Generate performance duration in milliseconds */
    performanceDuration: fc.integer({ min: 0, max: 60_000 }),

    /** Generate error object */
    errorObject: fc
        .record({
            name: fc.constantFrom(
                "Error",
                "TypeError",
                "ReferenceError",
                "SyntaxError",
                "RangeError"
            ),
            message: fc.string({ minLength: 1, maxLength: 500 }),
            stack: fc.option(fc.string({ minLength: 10, maxLength: 2000 })),
        })
        .map((config) => {
            const error = new Error(config.message);
            error.name = config.name;
            if (config.stack) {
                error.stack = config.stack;
            }
            return error;
        }),

    /** Generate site identifier */
    siteIdentifier: fc
        .string({ minLength: 1, maxLength: 50 })
        .filter((s) => s.trim().length > 0),

    /** Generate monitor ID */
    monitorId: fc
        .string({ minLength: 1, maxLength: 50 })
        .filter((s) => s.trim().length > 0),

    /** Generate store name */
    storeName: fc.constantFrom(
        "sites",
        "ui",
        "settings",
        "error",
        "monitor",
        "analytics"
    ),

    /** Generate action name */
    actionName: fc.constantFrom(
        "add",
        "remove",
        "update",
        "clear",
        "reset",
        "sync",
        "load",
        "save",
        "start",
        "stop",
        "pause",
        "resume",
        "check",
        "validate",
        "process"
    ),

    /** Generate arbitrary unknown arguments */
    arbitraryArgs: fc.array(
        fc.oneof(
            fc.string(),
            fc.integer(),
            fc.float(),
            fc.boolean(),
            fc.constant(null),
            fc.constant(undefined),
            fc.record({
                key: fc.string(),
                value: fc.oneof(fc.string(), fc.integer(), fc.boolean()),
            })
        ),
        { maxLength: 10 }
    ),

    /** Generate structured log data */
    structuredData: fc.record({
        userId: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
        sessionId: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
        timestamp: fc.option(fc.date()),
        operation: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
        metadata: fc.option(
            fc.record({
                source: fc.string({ minLength: 1, maxLength: 50 }),
                target: fc.string({ minLength: 1, maxLength: 50 }),
                count: fc.integer({ min: 0, max: 1000 }),
            })
        ),
    }),
};

describe("Logger Service - Property-Based Fuzzing Tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Basic Logging Operations", () => {
        fcTest.prop([arbitraries.logMessage])(
            "should handle debug logging with arbitrary messages",
            (message) => {
                // Act
                logger.debug(message);

                // Assert
                expect(mockLog.debug).toHaveBeenCalledWith(
                    `[UPTIME-WATCHER] ${message}`
                );
            }
        );

        fcTest.prop([arbitraries.logMessage])(
            "should handle info logging with arbitrary messages",
            (message) => {
                // Act
                logger.info(message);

                // Assert
                expect(mockInfo).toHaveBeenCalledWith(
                    `[UPTIME-WATCHER] ${message}`
                );
            }
        );

        fcTest.prop([arbitraries.logMessage])(
            "should handle warning logging with arbitrary messages",
            (message) => {
                // Act
                logger.warn(message);

                // Assert
                expect(mockWarn).toHaveBeenCalledWith(
                    `[UPTIME-WATCHER] ${message}`
                );
            }
        );

        fcTest.prop([arbitraries.logMessage, arbitraries.errorObject])(
            "should handle error logging with message and error object",
            (message, error) => {
                // Act
                logger.error(message, error);

                // Assert
                expect(mockError).toHaveBeenCalledWith(
                    `[UPTIME-WATCHER] ${message}`,
                    {
                        message: error.message,
                        name: error.name,
                        stack: error.stack,
                    }
                );
            }
        );

        fcTest.prop([arbitraries.logMessage])(
            "should handle error logging with message only",
            (message) => {
                // Act
                logger.error(message);

                // Assert
                expect(mockError).toHaveBeenCalledWith(
                    `[UPTIME-WATCHER] ${message}`
                );
            }
        );

        fcTest.prop([arbitraries.emptyMessage])(
            "should handle empty or whitespace messages",
            (emptyMessage) => {
                // Act & Assert - should not crash with empty messages
                expect(() => logger.info(emptyMessage)).not.toThrowError();
                expect(() => logger.debug(emptyMessage)).not.toThrowError();
                expect(() => logger.warn(emptyMessage)).not.toThrowError();
                expect(() => logger.error(emptyMessage)).not.toThrowError();

                expect(mockInfo).toHaveBeenCalledWith(
                    `[UPTIME-WATCHER] ${emptyMessage}`
                );
                expect(mockDebug).toHaveBeenCalledWith(
                    `[UPTIME-WATCHER] ${emptyMessage}`
                );
                expect(mockWarn).toHaveBeenCalledWith(
                    `[UPTIME-WATCHER] ${emptyMessage}`
                );
                expect(mockError).toHaveBeenCalledWith(
                    `[UPTIME-WATCHER] ${emptyMessage}`
                );
            }
        );
    });

    describe("Logging with Additional Arguments", () => {
        fcTest.prop([arbitraries.logMessage, arbitraries.arbitraryArgs])(
            "should handle debug logging with arbitrary additional arguments",
            (message, args) => {
                // Act
                logger.debug(message, ...args);

                // Assert
                expect(mockDebug).toHaveBeenCalledWith(
                    `[UPTIME-WATCHER] ${message}`,
                    ...args
                );
            }
        );

        fcTest.prop([arbitraries.logMessage, arbitraries.arbitraryArgs])(
            "should handle info logging with arbitrary additional arguments",
            (message, args) => {
                // Act
                logger.info(message, ...args);

                // Assert
                expect(mockInfo).toHaveBeenCalledWith(
                    `[UPTIME-WATCHER] ${message}`,
                    ...args
                );
            }
        );

        fcTest.prop([
            arbitraries.logMessage,
            arbitraries.errorObject,
            arbitraries.arbitraryArgs,
        ])("should handle error logging with error and additional arguments", (
            message,
            error,
            args
        ) => {
            // Act
            logger.error(message, error, ...args);

            // Assert
            expect(mockError).toHaveBeenCalledWith(
                `[UPTIME-WATCHER] ${message}`,
                {
                    message: error.message,
                    name: error.name,
                    stack: error.stack,
                },
                ...args
            );
        });

        fcTest.prop([arbitraries.logMessage, arbitraries.structuredData])(
            "should handle logging with structured data",
            (message, data) => {
                // Act
                logger.info(message, data);

                // Assert
                expect(mockInfo).toHaveBeenCalledWith(
                    `[UPTIME-WATCHER] ${message}`,
                    data
                );
            }
        );
    });

    describe("Application Lifecycle Logging", () => {
        it("should handle application started logging", () => {
            // Act
            logger.app.started();

            // Assert - verify the logger was called (exact message may vary)
            expect(mockInfo).toHaveBeenCalled();
        });

        it("should handle application stopped logging", () => {
            // Act
            logger.app.stopped();

            // Assert
            expect(mockInfo).toHaveBeenCalled();
        });

        fcTest.prop([arbitraries.contextString, arbitraries.errorObject])(
            "should handle application error logging",
            (context, error) => {
                // Act
                logger.app.error(context, error);

                // Assert
                expect(mockError).toHaveBeenCalled();

                // Verify context and error are included
                const calls = mockError.mock.calls;
                const lastCall = calls.at(-1);
                expect(lastCall).toBeDefined();
                expect(
                    lastCall?.some(
                        (arg: any) =>
                            typeof arg === "string" && arg.includes(context)
                    )
                ).toBeTruthy();
            }
        );

        fcTest.prop([
            arbitraries.operationName,
            arbitraries.performanceDuration,
        ])("should handle performance logging", (operation, duration) => {
            // Act
            logger.app.performance(operation, duration);

            // Assert
            expect(mockDebug).toHaveBeenCalled();

            // Verify operation and duration are logged
            const calls = mockDebug.mock.calls;
            const lastCall = calls.at(-1);
            expect(lastCall).toBeDefined();
            expect(
                lastCall?.some(
                    (arg: any) =>
                        typeof arg === "string" &&
                        (arg.includes(operation) ||
                            arg.includes(duration.toString()))
                )
            ).toBeTruthy();
        });
    });

    describe("Site Domain Logging", () => {
        fcTest.prop([arbitraries.siteIdentifier])(
            "should handle site added logging",
            (siteIdentifier) => {
                // Act
                logger.site.added(siteIdentifier);

                // Assert
                expect(mockInfo).toHaveBeenCalledWith(
                    `[UPTIME-WATCHER] Site added: ${siteIdentifier}`
                );
            }
        );

        fcTest.prop([arbitraries.siteIdentifier])(
            "should handle site removed logging",
            (siteIdentifier) => {
                // Act
                logger.site.removed(siteIdentifier);

                // Assert
                expect(mockInfo).toHaveBeenCalledWith(
                    `[UPTIME-WATCHER] Site removed: ${siteIdentifier}`
                );
            }
        );

        fcTest.prop([arbitraries.siteIdentifier, arbitraries.errorObject])(
            "should handle site error logging",
            (siteIdentifier, error) => {
                // Act
                logger.site.error(siteIdentifier, error);

                // Assert
                expect(mockError).toHaveBeenCalled();
            }
        );

        fcTest.prop([
            arbitraries.siteIdentifier,
            arbitraries.logMessage,
            arbitraries.logMessage,
        ])("should handle site status change logging", (
            siteIdentifier,
            oldStatus,
            newStatus
        ) => {
            // Act
            logger.site.statusChange(siteIdentifier, oldStatus, newStatus);

            // Assert
            expect(mockInfo).toHaveBeenCalledWith(
                `[UPTIME-WATCHER] Site status change: ${siteIdentifier} - ${oldStatus} -> ${newStatus}`
            );
        });

        fcTest.prop([
            arbitraries.siteIdentifier,
            arbitraries.logMessage,
            arbitraries.performanceDuration,
        ])("should handle site check logging", (
            siteIdentifier,
            status,
            responseTime
        ) => {
            // Act
            logger.site.check(siteIdentifier, status, responseTime);

            // Assert
            expect(mockInfo).toHaveBeenCalled();
        });
    });

    describe("System Domain Logging", () => {
        fcTest.prop([arbitraries.logMessage, arbitraries.logMessage])(
            "should handle system notification logging",
            (title, body) => {
                // Act
                logger.system.notification(title, body);

                // Assert
                expect(mockDebug).toHaveBeenCalledWith(
                    `[UPTIME-WATCHER] Notification sent: ${title} - ${body}`
                );
            }
        );

        fcTest.prop([arbitraries.actionName])(
            "should handle system tray logging",
            (action) => {
                // Act
                logger.system.tray(action);

                // Assert
                expect(mockDebug).toHaveBeenCalledWith(
                    `[UPTIME-WATCHER] Tray action: ${action}`
                );
            }
        );

        fcTest.prop([
            arbitraries.actionName,
            fc.option(arbitraries.logMessage),
        ])("should handle system window logging", (action, windowName) => {
            // Act
            logger.system.window(action, windowName ?? undefined);

            // Assert
            const nameInfo = windowName ? ` (${windowName})` : "";
            expect(mockDebug).toHaveBeenCalledWith(
                `[UPTIME-WATCHER] Window ${action}${nameInfo}`
            );
        });
    });

    describe("User Domain Logging", () => {
        fcTest.prop([arbitraries.actionName, arbitraries.structuredData])(
            "should handle user action logging",
            (actionName, details) => {
                // Act
                logger.user.action(actionName, details);

                // Assert
                expect(mockInfo).toHaveBeenCalled();
            }
        );

        fcTest.prop([arbitraries.actionName])(
            "should handle user action logging without details",
            (actionName) => {
                // Act
                logger.user.action(actionName);

                // Assert
                expect(mockInfo).toHaveBeenCalledWith(
                    `[UPTIME-WATCHER] User action: ${actionName}`,
                    ""
                );
            }
        );

        fcTest.prop([
            arbitraries.logMessage,
            arbitraries.logMessage,
            arbitraries.logMessage,
        ])("should handle user settings change logging", (
            setting,
            oldValue,
            newValue
        ) => {
            // Act
            logger.user.settingsChange(setting, oldValue, newValue);

            // Assert
            expect(mockInfo).toHaveBeenCalledWith(
                `[UPTIME-WATCHER] Settings change: ${setting} - ${oldValue} -> ${newValue}`
            );
        });
    });

    describe("Concurrent Logging Operations", () => {
        fcTest.prop([
            fc.array(arbitraries.logMessage, { minLength: 1, maxLength: 20 }),
        ])("should handle concurrent info logging", (messages) => {
            // Clear mock before starting
            mockInfo.mockClear();

            // Act - log all messages rapidly
            for (const message of messages) {
                logger.info(message);
            }

            // Assert - all messages should be logged
            expect(mockInfo).toHaveBeenCalledTimes(messages.length);
            for (const message of messages) {
                expect(mockInfo).toHaveBeenCalledWith(
                    `[UPTIME-WATCHER] ${message}`
                );
            }
        });

        fcTest.prop([
            fc.array(arbitraries.logMessage, { minLength: 1, maxLength: 10 }),
            fc.array(arbitraries.errorObject, { minLength: 1, maxLength: 10 }),
        ])("should handle concurrent mixed logging", (infoMessages, errors) => {
            // Clear mocks before starting
            mockInfo.mockClear();
            mockError.mockClear();

            // Act - interleave info and error logging
            for (
                let i = 0;
                i < Math.max(infoMessages.length, errors.length);
                i++
            ) {
                if (i < infoMessages.length) {
                    logger.info(infoMessages[i]!);
                }
                if (i < errors.length) {
                    logger.error("Error occurred", errors[i]!);
                }
            }

            // Assert
            expect(mockInfo).toHaveBeenCalledTimes(infoMessages.length);
            expect(mockError).toHaveBeenCalledTimes(errors.length);
        });

        fcTest.prop([
            fc.array(arbitraries.siteIdentifier, {
                minLength: 1,
                maxLength: 5,
            }),
            fc.array(arbitraries.actionName, { minLength: 1, maxLength: 5 }),
        ])("should handle concurrent domain logging", (
            siteIdentifiers,
            actions
        ) => {
            // Clear mock before starting
            mockInfo.mockClear();

            // Act - mix site and user logging
            for (const siteIdentifier of siteIdentifiers) {
                logger.site.added(siteIdentifier);
            }
            for (const action of actions) {
                logger.user.action(action);
            }

            // Assert - verify all logging calls were made
            expect(mockInfo).toHaveBeenCalledTimes(
                siteIdentifiers.length + actions.length
            );
        });
    });

    describe("Edge Cases and Error Scenarios", () => {
        fcTest.prop([fc.constant(null), fc.constant(undefined)])(
            "should handle null/undefined messages gracefully",
            (nullishMessage) => {
                // Act & Assert - should not crash with null/undefined
                expect(() =>
                    logger.info(nullishMessage as any)).not.toThrowError();
                expect(() =>
                    logger.debug(nullishMessage as any)).not.toThrowError();
                expect(() =>
                    logger.error(nullishMessage as any)).not.toThrowError();
            }
        );

        fcTest.prop([arbitraries.logMessage])(
            "should handle logging when underlying logger throws",
            (message) => {
                // Arrange - make underlying logger throw
                mockInfo.mockImplementationOnce(() => {
                    throw new Error("Logger failed");
                });

                // Act & Assert - should not propagate the error
                expect(() => logger.info(message)).not.toThrowError();
            }
        );

        fcTest.prop([fc.string({ minLength: 10_000, maxLength: 50_000 })])(
            "should handle very long log messages",
            (longMessage) => {
                // Act
                logger.info(longMessage);

                // Assert
                expect(mockInfo).toHaveBeenCalledWith(
                    `[UPTIME-WATCHER] ${longMessage}`
                );
            }
        );

        fcTest.prop([arbitraries.errorObject])(
            "should handle error objects with circular references",
            (baseError) => {
                // Arrange - create circular reference
                const circularError = baseError as any;
                circularError.circular = circularError;

                // Act & Assert - should not crash with circular references
                expect(() =>
                    logger.error(
                        "Circular error",
                        circularError
                    )).not.toThrowError();
                expect(mockError).toHaveBeenCalled();
            }
        );

        fcTest.prop([arbitraries.performanceDuration])(
            "should handle extreme performance durations",
            (duration) => {
                // Test with very large and very small durations
                const extremeDuration =
                    Math.random() > 0.5
                        ? duration * 1_000_000
                        : duration / 1_000_000;

                // Act
                logger.app.performance("extreme-operation", extremeDuration);

                // Assert
                expect(mockDebug).toHaveBeenCalled();
            }
        );
    });

    describe("Raw Logger Access", () => {
        fcTest.prop([arbitraries.logMessage])(
            "should provide raw logger access",
            (message) => {
                // Act - use raw logger access
                logger.raw.info(message);

                // Assert
                expect(mockInfo).toHaveBeenCalledWith(message);
            }
        );

        fcTest.prop([arbitraries.logMessage, arbitraries.arbitraryArgs])(
            "should handle raw logger with arbitrary arguments",
            (message, args) => {
                // Act
                logger.raw.debug(message, ...args);

                // Assert
                expect(mockDebug).toHaveBeenCalledWith(message, ...args);
            }
        );
    });

    describe("Logging State Consistency", () => {
        fcTest.prop([
            fc.array(arbitraries.logMessage, { minLength: 1, maxLength: 100 }),
            fc.array(arbitraries.errorObject, { minLength: 1, maxLength: 10 }),
        ])("should maintain consistent state across high-volume logging", (
            messages,
            errors
        ) => {
            // Clear mocks before starting
            mockInfo.mockClear();
            mockDebug.mockClear();
            mockError.mockClear();

            // Act - high volume logging
            for (const [index, message] of messages.entries()) {
                if (index % 2 === 0) {
                    logger.info(message);
                } else {
                    logger.debug(message);
                }
            }

            for (const error of errors) {
                logger.error("Error occurred", error);
            }

            // Assert - verify all calls were made
            const infoCount = Math.ceil(messages.length / 2);
            const debugCount = Math.floor(messages.length / 2);

            expect(mockInfo).toHaveBeenCalledTimes(infoCount);
            expect(mockDebug).toHaveBeenCalledTimes(debugCount);
            expect(mockError).toHaveBeenCalledTimes(errors.length);
        });

        fcTest.prop([
            arbitraries.operationName,
            arbitraries.performanceDuration,
        ])("should handle performance logging edge cases", (
            operation,
            duration
        ) => {
            // Test with negative duration
            const negativeDuration = -Math.abs(duration);

            // Act & Assert - should handle negative durations gracefully
            expect(() =>
                logger.app.performance(
                    operation,
                    negativeDuration
                )).not.toThrowError();
            expect(mockDebug).toHaveBeenCalled();
        });
    });
});
