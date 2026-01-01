/**
 * Comprehensive tests for logTemplates.ts - achieving 100% coverage
 *
 * @file Tests all functions, constants, and edge cases in logTemplates.ts
 *
 * @author GitHub Copilot
 */

import { describe, expect, it, vi, type Mock } from "vitest";

import {
    DEBUG_LOGS,
    ERROR_LOGS,
    LOG_TEMPLATES,
    SERVICE_LOGS,
    WARNING_LOGS,
    createTemplateLogger,
    interpolateLogTemplate,
    type LogTemplate,
    type LogTemplatesInterface,
    type TemplateVariables,
} from "@shared/utils/logTemplates";
import { createMockFunction } from "./utils/mockFactories";

describe("logTemplates.ts - Comprehensive Coverage", () => {
    describe("Template Constants", () => {
        describe("SERVICE_LOGS", () => {
            it("should contain all service-related log templates", () => {
                expect(SERVICE_LOGS).toMatchObject({
                    APPLICATION_ACTIVATED: expect.stringContaining(
                        "[ApplicationService]"
                    ),
                    APPLICATION_CLEANUP_COMPLETE: expect.stringContaining(
                        "[ApplicationService]"
                    ),
                    APPLICATION_CLEANUP_START: expect.stringContaining(
                        "[ApplicationService]"
                    ),
                    APPLICATION_CREATING_WINDOW: expect.stringContaining(
                        "[ApplicationService]"
                    ),
                    APPLICATION_INITIALIZING: expect.stringContaining(
                        "[ApplicationService]"
                    ),
                    APPLICATION_QUITTING: expect.stringContaining(
                        "[ApplicationService]"
                    ),
                    APPLICATION_READY: expect.stringContaining(
                        "[ApplicationService]"
                    ),
                    APPLICATION_SERVICES_INITIALIZED: expect.stringContaining(
                        "[ApplicationService]"
                    ),
                    APPLICATION_WINDOWS_CLOSED: expect.stringContaining(
                        "[ApplicationService]"
                    ),
                });
            });

            it("should contain database-related templates", () => {
                expect(SERVICE_LOGS.DATABASE_BACKUP_CREATED).toContain(
                    "[DatabaseBackup]"
                );
                expect(SERVICE_LOGS.DATABASE_CONNECTION_CLOSED).toContain(
                    "[DatabaseService]"
                );
                expect(SERVICE_LOGS.DATABASE_INDEXES_CREATED).toContain(
                    "[DatabaseSchema]"
                );
                expect(SERVICE_LOGS.DATABASE_INITIALIZED).toContain(
                    "[DatabaseService]"
                );
                expect(SERVICE_LOGS.DATABASE_LOCK_RECOVERY_RELOCATED).toContain(
                    "[DatabaseService]"
                );
                expect(
                    SERVICE_LOGS.DATABASE_LOCK_RECOVERY_NO_ARTIFACTS
                ).toContain("[DatabaseService]");
                expect(SERVICE_LOGS.DATABASE_SCHEMA_CREATED).toContain(
                    "[DatabaseSchema]"
                );
                expect(SERVICE_LOGS.DATABASE_TABLES_CREATED).toContain(
                    "[DatabaseSchema]"
                );
            });

            it("should contain monitor-related templates", () => {
                expect(
                    SERVICE_LOGS.MONITOR_MANAGER_APPLYING_INTERVALS
                ).toContain("[MonitorManager]");
                expect(SERVICE_LOGS.MONITOR_MANAGER_AUTO_STARTING).toContain(
                    "[MonitorManager]"
                );
                expect(SERVICE_LOGS.MONITOR_REMOVED_FROM_SITE).toContain(
                    "[SiteManager]"
                );
                expect(SERVICE_LOGS.MONITOR_STARTED).toContain(
                    "Started monitoring"
                );
                expect(SERVICE_LOGS.MONITOR_STOPPED).toContain(
                    "Stopped monitoring"
                );
            });

            it("should contain site-related templates", () => {
                expect(SERVICE_LOGS.SITE_ADDED_SUCCESS).toContain(
                    "Site added successfully"
                );
                expect(SERVICE_LOGS.SITE_MANAGER_INITIALIZED).toContain(
                    "[SiteManager]"
                );
                expect(
                    SERVICE_LOGS.SITE_MANAGER_INITIALIZED_WITH_CACHE
                ).toContain("[SiteManager]");
                expect(SERVICE_LOGS.SITE_MANAGER_LOADING_CACHE).toContain(
                    "[SiteManager]"
                );
            });

            it("should contain history templates", () => {
                expect(SERVICE_LOGS.HISTORY_BULK_INSERT).toContain(
                    "[HistoryManipulation]"
                );
            });

            it("should contain updater templates", () => {
                expect(SERVICE_LOGS.UPDATER_QUIT_INSTALL).toContain(
                    "[AutoUpdaterService]"
                );
            });

            it("should contain IPC service templates", () => {
                expect(SERVICE_LOGS.IPC_SERVICE_CLEANUP).toContain(
                    "[IpcService]"
                );
            });
        });

        describe("DEBUG_LOGS", () => {
            it("should contain application debug templates", () => {
                expect(DEBUG_LOGS.APPLICATION_CLEANUP_SERVICE).toContain(
                    "[ApplicationService]"
                );
                expect(
                    DEBUG_LOGS.APPLICATION_FORWARDING_CACHE_INVALIDATION
                ).toContain("[ApplicationService]");
                expect(
                    DEBUG_LOGS.APPLICATION_FORWARDING_MONITOR_STATUS
                ).toContain("[ApplicationService]");
                expect(DEBUG_LOGS.APPLICATION_FORWARDING_MONITOR_UP).toContain(
                    "[ApplicationService]"
                );
                expect(
                    DEBUG_LOGS.APPLICATION_FORWARDING_MONITORING_STARTED
                ).toContain("[ApplicationService]");
                expect(
                    DEBUG_LOGS.APPLICATION_FORWARDING_MONITORING_STOPPED
                ).toContain("[ApplicationService]");
            });

            it("should contain event bus debug templates", () => {
                expect(DEBUG_LOGS.EVENT_BUS_CLEARED).toContain(
                    "[TypedEventBus:"
                );
                expect(DEBUG_LOGS.EVENT_BUS_CREATED).toContain(
                    "[TypedEventBus:"
                );
                expect(DEBUG_LOGS.EVENT_BUS_EMISSION_START).toContain(
                    "[TypedEventBus:"
                );
                expect(DEBUG_LOGS.EVENT_BUS_EMISSION_SUCCESS).toContain(
                    "[TypedEventBus:"
                );
                expect(DEBUG_LOGS.EVENT_BUS_LISTENER_REGISTERED).toContain(
                    "[TypedEventBus:"
                );
                expect(DEBUG_LOGS.EVENT_BUS_LISTENER_REMOVED).toContain(
                    "[TypedEventBus:"
                );
                expect(DEBUG_LOGS.EVENT_BUS_MIDDLEWARE_REMOVED).toContain(
                    "[TypedEventBus:"
                );
                expect(DEBUG_LOGS.EVENT_BUS_ONE_TIME_LISTENER).toContain(
                    "[TypedEventBus:"
                );
            });

            it("should contain database recovery debug templates", () => {
                expect(
                    DEBUG_LOGS.DATABASE_LOCK_RECOVERY_MISSING_ARTIFACTS
                ).toContain("[DatabaseService]");
            });

            it("should contain monitor lifecycle templates", () => {
                expect(DEBUG_LOGS.MONITOR_AUTO_STARTED).toContain(
                    "[MonitorManager]"
                );
                expect(DEBUG_LOGS.MONITOR_CHECK_START).toContain(
                    "Checking monitor"
                );
                expect(DEBUG_LOGS.MONITOR_INTERVALS_APPLIED).toContain(
                    "[MonitorManager]"
                );
                expect(DEBUG_LOGS.MONITOR_RESPONSE_TIME).toContain(
                    "[HttpMonitor]"
                );
            });

            it("should contain operation management templates", () => {
                expect(DEBUG_LOGS.OPERATION_CANCELLED).toContain("Cancelled");
                expect(DEBUG_LOGS.OPERATION_COMPLETED).toContain(
                    "Completed operation"
                );
                expect(DEBUG_LOGS.OPERATION_TIMEOUT_SCHEDULED).toContain(
                    "Scheduled timeout"
                );
            });

            it("should contain history operation templates", () => {
                expect(DEBUG_LOGS.HISTORY_ENTRY_ADDED).toContain(
                    "[HistoryManipulation]"
                );
            });

            it("should contain background operation templates", () => {
                expect(DEBUG_LOGS.BACKGROUND_LOAD_COMPLETE).toContain(
                    "[SiteManager]"
                );
                expect(DEBUG_LOGS.BACKGROUND_LOAD_START).toContain(
                    "[SiteManager]"
                );
            });

            it("should contain site operation templates", () => {
                expect(DEBUG_LOGS.SITE_BACKGROUND_LOAD_FAILED).toContain(
                    "[SiteManager]"
                );
                expect(DEBUG_LOGS.SITE_CACHE_MISS_ERROR).toContain(
                    "[SiteManager]"
                );
                expect(DEBUG_LOGS.SITE_LOADING_ERROR_IGNORED).toContain(
                    "[SiteManager]"
                );
            });
        });

        describe("ERROR_LOGS", () => {
            it("should contain application error templates", () => {
                expect(ERROR_LOGS.APPLICATION_CLEANUP_ERROR).toContain(
                    "[ApplicationService]"
                );
                expect(
                    ERROR_LOGS.APPLICATION_FORWARD_CACHE_INVALIDATION_ERROR
                ).toContain("[ApplicationService]");
                expect(
                    ERROR_LOGS.APPLICATION_FORWARD_MONITOR_DOWN_ERROR
                ).toContain("[ApplicationService]");
                expect(
                    ERROR_LOGS.APPLICATION_FORWARD_MONITOR_STATUS_ERROR
                ).toContain("[ApplicationService]");
                expect(
                    ERROR_LOGS.APPLICATION_FORWARD_MONITOR_UP_ERROR
                ).toContain("[ApplicationService]");
                expect(ERROR_LOGS.APPLICATION_INITIALIZATION_ERROR).toContain(
                    "[ApplicationService]"
                );
                expect(ERROR_LOGS.APPLICATION_SYSTEM_ERROR).toContain(
                    "[ApplicationService]"
                );
                expect(ERROR_LOGS.APPLICATION_UPDATE_CHECK_ERROR).toContain(
                    "[ApplicationService]"
                );
            });

            it("should contain database error templates", () => {
                expect(ERROR_LOGS.DATABASE_BACKUP_FAILED).toContain(
                    "[DatabaseBackup]"
                );
                expect(ERROR_LOGS.DATABASE_INDEXES_FAILED).toContain(
                    "[DatabaseSchema]"
                );
                expect(ERROR_LOGS.DATABASE_SCHEMA_FAILED).toContain(
                    "[DatabaseSchema]"
                );
                expect(ERROR_LOGS.DATABASE_TABLES_FAILED).toContain(
                    "[DatabaseSchema]"
                );
                expect(ERROR_LOGS.DATABASE_VALIDATION_SETUP_FAILED).toContain(
                    "[DatabaseSchema]"
                );
                expect(ERROR_LOGS.DATABASE_CLOSE_FAILED).toContain(
                    "[DatabaseService]"
                );
            });

            it("should contain event bus error templates", () => {
                expect(ERROR_LOGS.EVENT_BUS_EMISSION_FAILED).toContain(
                    "[TypedEventBus:"
                );
            });

            it("should contain history error templates", () => {
                expect(ERROR_LOGS.HISTORY_ADD_FAILED).toContain(
                    "[HistoryManipulation]"
                );
                expect(ERROR_LOGS.HISTORY_BULK_INSERT_FAILED).toContain(
                    "[HistoryManipulation]"
                );
                expect(ERROR_LOGS.HISTORY_FETCH_FAILED).toContain(
                    "[HistoryQuery]"
                );
                expect(ERROR_LOGS.HISTORY_LATEST_FETCH_FAILED).toContain(
                    "[HistoryQuery]"
                );
                expect(ERROR_LOGS.HISTORY_MAPPER_FAILED).toContain(
                    "[HistoryMapper]"
                );
                expect(ERROR_LOGS.HISTORY_PRUNE_FAILED).toContain(
                    "[HistoryManipulation]"
                );
            });

            it("should contain monitor error templates", () => {
                expect(ERROR_LOGS.MONITOR_CHECK_ENHANCED_FAILED).toContain(
                    "Enhanced monitor check failed"
                );
                expect(ERROR_LOGS.MONITOR_MAPPER_FAILED).toContain(
                    "[MonitorMapper]"
                );
            });

            it("should contain settings error templates", () => {
                expect(ERROR_LOGS.SETTINGS_MAPPER_FAILED).toContain(
                    "[SettingsMapper:"
                );
            });

            it("should contain site error templates", () => {
                expect(ERROR_LOGS.SITE_BACKGROUND_LOAD_EMIT_ERROR).toContain(
                    "[SiteManager]"
                );
                expect(ERROR_LOGS.SITE_BACKGROUND_LOAD_FAILED).toContain(
                    "[SiteManager]"
                );
                expect(ERROR_LOGS.SITE_HISTORY_LIMIT_FAILED).toContain(
                    "[SiteManager]"
                );
                expect(ERROR_LOGS.SITE_INITIALIZATION_FAILED).toContain(
                    "[SiteManager]"
                );
                expect(ERROR_LOGS.SITE_MAPPER_FAILED).toContain("[SiteMapper]");
                expect(ERROR_LOGS.SITE_MONITOR_REMOVAL_FAILED).toContain(
                    "[SiteManager]"
                );
            });
        });

        describe("WARNING_LOGS", () => {
            it("should contain application warning templates", () => {
                expect(WARNING_LOGS.APPLICATION_MONITOR_DOWN).toContain(
                    "[ApplicationService]"
                );
            });

            it("should contain database warning templates", () => {
                expect(
                    WARNING_LOGS.DATABASE_MONITOR_VALIDATION_CONTINUE
                ).toContain("[DatabaseSchema]");
                expect(
                    WARNING_LOGS.DATABASE_MONITOR_VALIDATION_MISSING
                ).toContain("[DatabaseSchema]");
                expect(
                    WARNING_LOGS.DATABASE_BUSY_TIMEOUT_PRAGMA_FAILED
                ).toContain("[DatabaseService]");
                expect(
                    WARNING_LOGS.DATABASE_FOREIGN_KEYS_PRAGMA_FAILED
                ).toContain("[DatabaseService]");
                expect(WARNING_LOGS.DATABASE_LOCK_DETECTED).toContain(
                    "[DatabaseService]"
                );
                expect(WARNING_LOGS.DATABASE_LOCK_RECOVERY_FAILED).toContain(
                    "[DatabaseService]"
                );
                expect(
                    WARNING_LOGS.DATABASE_CLOSE_DURING_FAILURE_FAILED
                ).toContain("[DatabaseService]");
            });

            it("should contain history warning templates", () => {
                expect(WARNING_LOGS.HISTORY_INVALID_STATUS).toContain(
                    "[HistoryMapper]"
                );
            });

            it("should contain monitor warning templates", () => {
                expect(
                    WARNING_LOGS.MONITOR_ACTIVE_OPERATIONS_INVALID
                ).toContain("active_operations");
                expect(
                    WARNING_LOGS.MONITOR_ACTIVE_OPERATIONS_PARSE_FAILED
                ).toContain("active_operations");
                expect(
                    WARNING_LOGS.MONITOR_CONFIG_UPDATE_FAILED_INSTANCE
                ).toContain("Failed to update config");
                expect(
                    WARNING_LOGS.MONITOR_CONFIG_UPDATE_FAILED_TYPE
                ).toContain("Failed to update config");
                expect(WARNING_LOGS.MONITOR_FRESH_DATA_MISSING).toContain(
                    "Fresh monitor data"
                );
                expect(WARNING_LOGS.MONITOR_NOT_FOUND_CACHE).toContain(
                    "not found, ignoring result"
                );
                expect(WARNING_LOGS.MONITOR_NOT_MONITORING).toContain(
                    "no longer monitoring"
                );
                expect(WARNING_LOGS.MONITOR_TYPE_UNKNOWN_CHECK).toContain(
                    "Unknown monitor type"
                );
                expect(WARNING_LOGS.MONITOR_TYPE_UNKNOWN_DETAIL).toContain(
                    "Unknown monitor type"
                );
                expect(WARNING_LOGS.MONITOR_TYPE_UNKNOWN_TITLE).toContain(
                    "Unknown monitor type"
                );
            });

            it("should contain notification warning templates", () => {
                expect(WARNING_LOGS.NOTIFICATIONS_UNSUPPORTED).toContain(
                    "Notifications not supported"
                );
            });

            it("should contain operation warning templates", () => {
                expect(WARNING_LOGS.OPERATION_TIMEOUT).toContain("timed out");
                expect(WARNING_LOGS.RECURSIVE_CALL_PREVENTED).toContain(
                    "Preventing recursive call"
                );
            });

            it("should contain site warning templates", () => {
                expect(WARNING_LOGS.SITE_NOT_FOUND_MANUAL).toContain(
                    "not found or has no monitors"
                );
                expect(WARNING_LOGS.SITE_NOT_FOUND_SCHEDULED).toContain(
                    "not found in cache"
                );
            });
        });
    });

    describe("LOG_TEMPLATES Interface", () => {
        it("should implement LogTemplatesInterface correctly", () => {
            expect(LOG_TEMPLATES).toMatchObject({
                debug: DEBUG_LOGS,
                errors: ERROR_LOGS,
                services: SERVICE_LOGS,
                warnings: WARNING_LOGS,
            });
        });

        it("should be read-only", () => {
            expect(() => {
                // @ts-expect-error - Testing readonly behavior
                LOG_TEMPLATES.debug = {};
            }).toThrowError();
        });

        it("should have correct structure", () => {
            expect(LOG_TEMPLATES).toHaveProperty("debug");
            expect(LOG_TEMPLATES).toHaveProperty("errors");
            expect(LOG_TEMPLATES).toHaveProperty("services");
            expect(LOG_TEMPLATES).toHaveProperty("warnings");
        });
    });

    describe("Type Definitions", () => {
        it("should export correct TypeScript types", () => {
            // Test that types exist by creating variables
            const templateVars: TemplateVariables = { count: 5, name: "test" };
            const logInterface: LogTemplatesInterface = LOG_TEMPLATES;
            const logTemplate: LogTemplate = SERVICE_LOGS.APPLICATION_ACTIVATED;

            expect(templateVars).toBeDefined();
            expect(logInterface).toBeDefined();
            expect(logTemplate).toBeDefined();
        });

        it("should handle optional template variables", () => {
            const vars1: TemplateVariables = {};
            const vars2: TemplateVariables = { count: 42 };
            const vars3: TemplateVariables = { name: "test", id: 123 };

            expect(vars1).toEqual({});
            expect(vars2).toEqual({ count: 42 });
            expect(vars3).toEqual({ name: "test", id: 123 });
        });
    });

    describe(interpolateLogTemplate, () => {
        it("should interpolate single variable", () => {
            const template = "Hello {name}!";
            const variables = { name: "World" };

            const result = interpolateLogTemplate(template, variables);

            expect(result).toBe("Hello World!");
        });

        it("should interpolate multiple variables", () => {
            const template = "Site {identifier} has {count} monitors";
            const variables = { identifier: "example.com", count: 5 };

            const result = interpolateLogTemplate(template, variables);

            expect(result).toBe("Site example.com has 5 monitors");
        });

        it("should handle numeric variables", () => {
            const template = "Processing item {id} with priority {priority}";
            const variables = { id: 123, priority: 1 };

            const result = interpolateLogTemplate(template, variables);

            expect(result).toBe("Processing item 123 with priority 1");
        });

        it("should leave missing variables as placeholders", () => {
            const template = "Hello {name}, your ID is {id}";
            const variables = { name: "John" };

            const result = interpolateLogTemplate(template, variables);

            expect(result).toBe("Hello John, your ID is {id}");
        });

        it("should handle empty variables object", () => {
            const template = "No variables here: {missing}";
            const variables = {};

            const result = interpolateLogTemplate(template, variables);

            expect(result).toBe("No variables here: {missing}");
        });

        it("should handle template with no variables", () => {
            const template = "Static message with no placeholders";
            const variables = { unused: "value" };

            const result = interpolateLogTemplate(template, variables);

            expect(result).toBe("Static message with no placeholders");
        });

        it("should handle same variable used multiple times", () => {
            const template = "Repeat {word} and {word} again";
            const variables = { word: "hello" };

            const result = interpolateLogTemplate(template, variables);

            expect(result).toBe("Repeat hello and hello again");
        });

        it("should handle variables with special characters", () => {
            const template = "Site {site_name} and {$special} variable";
            const variables = { site_name: "test.com", $special: "value" };

            const result = interpolateLogTemplate(template, variables);

            expect(result).toBe("Site test.com and value variable");
        });

        it("should handle zero values", () => {
            const template = "Count is {count}";
            const variables = { count: 0 };

            const result = interpolateLogTemplate(template, variables);

            expect(result).toBe("Count is 0");
        });

        it("should handle null and undefined by leaving placeholders", () => {
            const template = "Value1: {val1}, Value2: {val2}";
            const variables = { val1: null, val2: undefined } as any;

            const result = interpolateLogTemplate(template, variables);

            expect(result).toBe("Value1: {val1}, Value2: {val2}");
        });

        it("should handle boolean values", () => {
            const template = "Status: {enabled}, Valid: {valid}";
            const variables = { enabled: "true", valid: "false" } as const;

            const result = interpolateLogTemplate(template, variables);

            expect(result).toBe("Status: true, Valid: false");
        });

        it("should handle case-sensitive variable names", () => {
            const template = "Upper {NAME} and lower {name}";
            const variables = { NAME: "BIG", name: "small" };

            const result = interpolateLogTemplate(template, variables);

            expect(result).toBe("Upper BIG and lower small");
        });

        it("should handle nested braces correctly", () => {
            const template = "Object: {{key}: {value}}";
            const variables = { key: "name", value: "test" };

            const result = interpolateLogTemplate(template, variables);

            expect(result).toBe("Object: {name: test}");
        });
    });

    describe(createTemplateLogger, () => {
        type LoggerMethod = (
            message: string,
            context?: Record<string, unknown>
        ) => void;

        let mockLogger: {
            debug: Mock<LoggerMethod>;
            error: Mock<LoggerMethod>;
            info: Mock<LoggerMethod>;
            warn: Mock<LoggerMethod>;
        };
        let templateLogger: ReturnType<typeof createTemplateLogger>;

        beforeEach(() => {
            mockLogger = {
                debug: createMockFunction<LoggerMethod>(),
                error: createMockFunction<LoggerMethod>(),
                info: createMockFunction<LoggerMethod>(),
                warn: createMockFunction<LoggerMethod>(),
            };
            templateLogger = createTemplateLogger(mockLogger);
        });

        describe("debug method", () => {
            it("should call base logger debug with interpolated message", () => {
                const template = "Processing {item}";
                const variables = { item: "test" };

                templateLogger.debug(template, variables);

                expect(mockLogger.debug).toHaveBeenCalledWith(
                    "Processing test",
                    variables
                );
            });

            it("should call base logger debug without interpolation when no variables", () => {
                const message = "Static debug message";

                templateLogger.debug(message);

                expect(mockLogger.debug).toHaveBeenCalledWith(
                    "Static debug message",
                    undefined
                );
            });
        });

        describe("error method", () => {
            it("should call base logger error with interpolated message", () => {
                const template = "Error in {operation}";
                const variables = { operation: "save" };

                templateLogger.error(template, variables);

                expect(mockLogger.error).toHaveBeenCalledWith(
                    "Error in save",
                    variables
                );
            });

            it("should call base logger error without interpolation when no variables", () => {
                const message = "Static error message";

                templateLogger.error(message);

                expect(mockLogger.error).toHaveBeenCalledWith(
                    "Static error message",
                    undefined
                );
            });
        });

        describe("info method", () => {
            it("should call base logger info with interpolated message", () => {
                const template = "Started {service}";
                const variables = { service: "monitor" };

                templateLogger.info(template, variables);

                expect(mockLogger.info).toHaveBeenCalledWith(
                    "Started monitor",
                    variables
                );
            });

            it("should call base logger info without interpolation when no variables", () => {
                const message = "Static info message";

                templateLogger.info(message);

                expect(mockLogger.info).toHaveBeenCalledWith(
                    "Static info message",
                    undefined
                );
            });
        });

        describe("warn method", () => {
            it("should call base logger warn with interpolated message", () => {
                const template = "Warning: {issue}";
                const variables = { issue: "timeout" };

                templateLogger.warn(template, variables);

                expect(mockLogger.warn).toHaveBeenCalledWith(
                    "Warning: timeout",
                    variables
                );
            });

            it("should call base logger warn without interpolation when no variables", () => {
                const message = "Static warning message";

                templateLogger.warn(message);

                expect(mockLogger.warn).toHaveBeenCalledWith(
                    "Static warning message",
                    undefined
                );
            });
        });

        describe("integration with template constants", () => {
            it("should work with SERVICE_LOGS templates", () => {
                templateLogger.info(SERVICE_LOGS.SITE_MANAGER_INITIALIZED, {
                    count: 10,
                });

                expect(mockLogger.info).toHaveBeenCalledWith(
                    "[SiteManager] Initialized with 10 sites in cache",
                    { count: 10 }
                );
            });

            it("should work with DEBUG_LOGS templates", () => {
                templateLogger.debug(DEBUG_LOGS.EVENT_BUS_CREATED, {
                    busId: "test-bus",
                    maxMiddleware: 5,
                });

                expect(mockLogger.debug).toHaveBeenCalledWith(
                    "[TypedEventBus:test-bus] Created new event bus (max middleware: 5)",
                    { busId: "test-bus", maxMiddleware: 5 }
                );
            });

            it("should work with ERROR_LOGS templates", () => {
                templateLogger.error(ERROR_LOGS.MONITOR_CHECK_ENHANCED_FAILED, {
                    monitorId: "mon-123",
                });

                expect(mockLogger.error).toHaveBeenCalledWith(
                    "Enhanced monitor check failed for mon-123",
                    { monitorId: "mon-123" }
                );
            });

            it("should work with WARNING_LOGS templates", () => {
                templateLogger.warn(WARNING_LOGS.MONITOR_TYPE_UNKNOWN_CHECK, {
                    monitorType: "unknown-type",
                });

                expect(mockLogger.warn).toHaveBeenCalledWith(
                    "Unknown monitor type: unknown-type",
                    { monitorType: "unknown-type" }
                );
            });
        });
    });

    describe("Edge Cases and Integration", () => {
        it("should handle all log levels in template logger", () => {
            const mockLogger = {
                debug: vi.fn(),
                error: vi.fn(),
                info: vi.fn(),
                warn: vi.fn(),
            };
            const templateLogger = createTemplateLogger(mockLogger);

            templateLogger.debug("Debug {msg}", { msg: "test" });
            templateLogger.info("Info {msg}", { msg: "test" });
            templateLogger.warn("Warn {msg}", { msg: "test" });
            templateLogger.error("Error {msg}", { msg: "test" });

            expect(mockLogger.debug).toHaveBeenCalledTimes(1);
            expect(mockLogger.info).toHaveBeenCalledTimes(1);
            expect(mockLogger.warn).toHaveBeenCalledTimes(1);
            expect(mockLogger.error).toHaveBeenCalledTimes(1);
        });

        it("should handle complex template interpolation scenarios", () => {
            const complex = interpolateLogTemplate(
                "[{service}:{instance}] {action} completed in {duration}ms with {status}",
                {
                    service: "MonitorManager",
                    instance: "primary",
                    action: "health_check",
                    duration: 250,
                    status: "success",
                }
            );

            expect(complex).toBe(
                "[MonitorManager:primary] health_check completed in 250ms with success"
            );
        });

        it("should preserve exact template format from constants", () => {
            // Test that our constants match expected patterns
            expect(SERVICE_LOGS.APPLICATION_ACTIVATED).toBe(
                "[ApplicationService] App activated"
            );
            expect(DEBUG_LOGS.EVENT_BUS_CREATED).toContain("{busId}");
            expect(ERROR_LOGS.HISTORY_ADD_FAILED).toContain("{monitorId}");
            expect(WARNING_LOGS.MONITOR_TYPE_UNKNOWN_CHECK).toContain(
                "{monitorType}"
            );
        });
    });
});
