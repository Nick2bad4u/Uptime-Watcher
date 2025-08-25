/**
 * Tests for interfaces utility - Interface type validation and contract testing
 * Tests interface definitions and ensures they match expected contracts.
 */

import { describe, it, expect, vi } from "vitest";
import type { Logger } from "../../utils/interfaces";

describe("Interfaces Utility", () => {
    describe("Logger Interface", () => {
        it("should define Logger interface with required methods", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: interfaces", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Create a mock implementation that satisfies the Logger interface
            const mockLogger: Logger = {
                debug: vi.fn(),
                error: vi.fn(),
                info: vi.fn(),
                warn: vi.fn(),
            };

            // Verify interface compliance
            expect(typeof mockLogger.debug).toBe("function");
            expect(typeof mockLogger.error).toBe("function");
            expect(typeof mockLogger.info).toBe("function");
            expect(typeof mockLogger.warn).toBe("function");
        });

        it("should allow debug method with message and args", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: interfaces", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const mockLogger: Logger = {
                debug: vi.fn(),
                error: vi.fn(),
                info: vi.fn(),
                warn: vi.fn(),
            };

            // Test debug method signature
            mockLogger.debug("test message");
            mockLogger.debug("test message", { data: "value" });
            mockLogger.debug("test message", "arg1", "arg2", {
                complex: "object",
            });

            expect(mockLogger.debug).toHaveBeenCalledTimes(3);
            expect(mockLogger.debug).toHaveBeenCalledWith("test message");
            expect(mockLogger.debug).toHaveBeenCalledWith("test message", {
                data: "value",
            });
            expect(mockLogger.debug).toHaveBeenCalledWith(
                "test message",
                "arg1",
                "arg2",
                { complex: "object" }
            );
        });

        it("should allow info method with message and args", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: interfaces", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const mockLogger: Logger = {
                debug: vi.fn(),
                error: vi.fn(),
                info: vi.fn(),
                warn: vi.fn(),
            };

            // Test info method signature
            mockLogger.info("info message");
            mockLogger.info("info message", { id: 123 });
            mockLogger.info("info message", "context", {
                timestamp: Date.now(),
            });

            expect(mockLogger.info).toHaveBeenCalledTimes(3);
            expect(mockLogger.info).toHaveBeenCalledWith("info message");
            expect(mockLogger.info).toHaveBeenCalledWith("info message", {
                id: 123,
            });
            expect(mockLogger.info).toHaveBeenCalledWith(
                "info message",
                "context",
                { timestamp: expect.any(Number) }
            );
        });

        it("should allow warn method with message and args", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: interfaces", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const mockLogger: Logger = {
                debug: vi.fn(),
                error: vi.fn(),
                info: vi.fn(),
                warn: vi.fn(),
            };

            // Test warn method signature
            mockLogger.warn("warning message");
            mockLogger.warn("warning message", { severity: "medium" });
            mockLogger.warn("warning message", "details", { code: 404 });

            expect(mockLogger.warn).toHaveBeenCalledTimes(3);
            expect(mockLogger.warn).toHaveBeenCalledWith("warning message");
            expect(mockLogger.warn).toHaveBeenCalledWith("warning message", {
                severity: "medium",
            });
            expect(mockLogger.warn).toHaveBeenCalledWith(
                "warning message",
                "details",
                { code: 404 }
            );
        });

        it("should allow error method with message, optional error, and args", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: interfaces", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const mockLogger: Logger = {
                debug: vi.fn(),
                error: vi.fn(),
                info: vi.fn(),
                warn: vi.fn(),
            };

            const testError = new Error("Test error");

            // Test error method signature variations
            mockLogger.error("error message");
            mockLogger.error("error message", testError);
            mockLogger.error("error message", "string error");
            mockLogger.error("error message", { custom: "error" });
            mockLogger.error(
                "error message",
                testError,
                "additional",
                "context"
            );
            mockLogger.error("error message", undefined, "context");

            expect(mockLogger.error).toHaveBeenCalledTimes(6);
            expect(mockLogger.error).toHaveBeenCalledWith("error message");
            expect(mockLogger.error).toHaveBeenCalledWith(
                "error message",
                testError
            );
            expect(mockLogger.error).toHaveBeenCalledWith(
                "error message",
                "string error"
            );
            expect(mockLogger.error).toHaveBeenCalledWith("error message", {
                custom: "error",
            });
            expect(mockLogger.error).toHaveBeenCalledWith(
                "error message",
                testError,
                "additional",
                "context"
            );
            expect(mockLogger.error).toHaveBeenCalledWith(
                "error message",
                undefined,
                "context"
            );
        });

        it("should accept various argument types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: interfaces", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const mockLogger: Logger = {
                debug: vi.fn(),
                error: vi.fn(),
                info: vi.fn(),
                warn: vi.fn(),
            };

            // Test with different argument types
            const complexArgs = [
                "string",
                123,
                true,
                null,
                undefined,
                { object: "value" },
                [
                    1,
                    2,
                    3,
                ],
                new Date(),
                Symbol("test"),
            ];

            mockLogger.debug("test", ...complexArgs);
            mockLogger.info("test", ...complexArgs);
            mockLogger.warn("test", ...complexArgs);
            mockLogger.error("test", undefined, ...complexArgs);

            expect(mockLogger.debug).toHaveBeenCalledWith(
                "test",
                ...complexArgs
            );
            expect(mockLogger.info).toHaveBeenCalledWith(
                "test",
                ...complexArgs
            );
            expect(mockLogger.warn).toHaveBeenCalledWith(
                "test",
                ...complexArgs
            );
            expect(mockLogger.error).toHaveBeenCalledWith(
                "test",
                undefined,
                ...complexArgs
            );
        });

        it("should work with real logger implementations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: interfaces", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Test that the interface can be implemented by actual logger
            const consoleLogger: Logger = {
                debug: (message: string, ...args: unknown[]) => {
                    console.debug(`DEBUG: ${message}`, ...args);
                },
                error: (
                    message: string,
                    error?: unknown,
                    ...args: unknown[]
                ) => {
                    console.error(`ERROR: ${message}`, error, ...args);
                },
                info: (message: string, ...args: unknown[]) => {
                    console.info(`INFO: ${message}`, ...args);
                },
                warn: (message: string, ...args: unknown[]) => {
                    console.warn(`WARN: ${message}`, ...args);
                },
            };

            // Should compile and work without type errors
            expect(typeof consoleLogger.debug).toBe("function");
            expect(typeof consoleLogger.error).toBe("function");
            expect(typeof consoleLogger.info).toBe("function");
            expect(typeof consoleLogger.warn).toBe("function");
        });

        it("should work with partial implementations (for testing)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: interfaces", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Sometimes in tests we only need specific methods
            const partialLogger = {
                debug: vi.fn(),
                error: vi.fn(),
                info: vi.fn(),
                warn: vi.fn(),
            } satisfies Logger;

            expect(partialLogger).toBeDefined();
            expect(typeof partialLogger.debug).toBe("function");
        });

        it("should handle edge cases in method signatures", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: interfaces", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const mockLogger: Logger = {
                debug: vi.fn(),
                error: vi.fn(),
                info: vi.fn(),
                warn: vi.fn(),
            };

            // Test edge cases
            mockLogger.debug(""); // Empty message
            mockLogger.info("test"); // No additional args
            mockLogger.warn("test", undefined); // Undefined arg
            mockLogger.error("test", null); // Null error
            // eslint-disable-next-line unicorn/error-message
            mockLogger.error("test", new Error()); // Error without message

            expect(mockLogger.debug).toHaveBeenCalledWith("");
            expect(mockLogger.info).toHaveBeenCalledWith("test");
            expect(mockLogger.warn).toHaveBeenCalledWith("test", undefined);
            expect(mockLogger.error).toHaveBeenCalledWith("test", null);
            expect(mockLogger.error).toHaveBeenCalledWith(
                "test",
                expect.any(Error)
            );
        });
    });

    describe("Interface Type Constraints", () => {
        it("should ensure all methods return void", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: interfaces", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const mockLogger: Logger = {
                debug: (message: string, ...args: unknown[]): void => {
                    console.debug(message, ...args);
                },
                error: (
                    message: string,
                    error?: unknown,
                    ...args: unknown[]
                ): void => {
                    console.error(message, error, ...args);
                },
                info: (message: string, ...args: unknown[]): void => {
                    console.info(message, ...args);
                },
                warn: (message: string, ...args: unknown[]): void => {
                    console.warn(message, ...args);
                },
            };

            // All methods should return void (undefined)
            expect(mockLogger.debug("test")).toBeUndefined();
            expect(mockLogger.info("test")).toBeUndefined();
            expect(mockLogger.warn("test")).toBeUndefined();
            expect(mockLogger.error("test")).toBeUndefined();
        });

        it("should allow flexible argument types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: interfaces", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const flexibleLogger: Logger = {
                debug: (_message: string, ..._args: unknown[]) => {
                    // Should accept any unknown types
                    // Implementation removed for test clarity
                },
                error: (
                    _message: string,
                    _error?: unknown,
                    ..._args: unknown[]
                ) => {
                    // Error can be anything
                    // Implementation removed for test clarity
                },
                info: (_message: string, ..._args: unknown[]) => {
                    // Info accepts any additional args
                },
                warn: (_message: string, ..._args: unknown[]) => {
                    // Warn accepts any additional args
                },
            };

            expect(flexibleLogger).toBeDefined();
        });
    });

    describe("Interface Extension Compatibility", () => {
        it("should allow interface extension", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: interfaces", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Extended logger interface
            interface ExtendedLogger extends Logger {
                trace: (message: string, ...args: unknown[]) => void;
                fatal: (
                    message: string,
                    error?: unknown,
                    ...args: unknown[]
                ) => void;
            }

            const extendedLogger: ExtendedLogger = {
                debug: vi.fn(),
                error: vi.fn(),
                info: vi.fn(),
                warn: vi.fn(),
                trace: vi.fn(),
                fatal: vi.fn(),
            };

            // Should have all Logger methods plus extended ones
            expect(typeof extendedLogger.debug).toBe("function");
            expect(typeof extendedLogger.error).toBe("function");
            expect(typeof extendedLogger.info).toBe("function");
            expect(typeof extendedLogger.warn).toBe("function");
            expect(typeof extendedLogger.trace).toBe("function");
            expect(typeof extendedLogger.fatal).toBe("function");
        });

        it("should work with logger implementations that have additional methods", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: interfaces", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            class AdvancedLogger implements Logger {
                debug(message: string, ...args: unknown[]): void {
                    this.log("DEBUG", message, ...args);
                }

                error(
                    message: string,
                    error?: unknown,
                    ...args: unknown[]
                ): void {
                    this.log("ERROR", message, error, ...args);
                }

                info(message: string, ...args: unknown[]): void {
                    this.log("INFO", message, ...args);
                }

                warn(message: string, ...args: unknown[]): void {
                    this.log("WARN", message, ...args);
                }

                // Additional method not in interface
                private log(
                    level: string,
                    message: string,
                    ...args: unknown[]
                ): void {
                    console.log(`[${level}] ${message}`, ...args);
                }

                // Additional public method
                public setLevel(_level: string): void {
                    // Implementation
                }
            }

            const logger = new AdvancedLogger();

            // Can be used as Logger interface
            const loggerInterface: Logger = logger;
            expect(loggerInterface).toBeDefined();

            // But also has additional methods
            expect(typeof logger.setLevel).toBe("function");
        });
    });
});
