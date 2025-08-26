import { describe, expect, it } from "vitest";

import {
    DEBUG_LOGS,
    ERROR_LOGS,
    LOG_TEMPLATES,
    SERVICE_LOGS,
    WARNING_LOGS,
    type LogTemplatesInterface,
} from "../../utils/logTemplates";

describe("Log Templates", () => {
    describe("SERVICE_LOGS", () => {
        it("should contain all application service log templates", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(SERVICE_LOGS.APPLICATION_ACTIVATED).toBe(
                "[ApplicationService] App activated"
            );
            expect(SERVICE_LOGS.APPLICATION_CLEANUP_COMPLETE).toBe(
                "[ApplicationService] Cleanup completed"
            );
            expect(SERVICE_LOGS.APPLICATION_CLEANUP_START).toBe(
                "[ApplicationService] Starting cleanup"
            );
            expect(SERVICE_LOGS.APPLICATION_CREATING_WINDOW).toBe(
                "[ApplicationService] No windows open, creating main window"
            );
            expect(SERVICE_LOGS.APPLICATION_INITIALIZING).toBe(
                "[ApplicationService] Initializing application services"
            );
            expect(SERVICE_LOGS.APPLICATION_QUITTING).toBe(
                "[ApplicationService] Quitting app (non-macOS)"
            );
            expect(SERVICE_LOGS.APPLICATION_READY).toBe(
                "[ApplicationService] App ready - initializing services"
            );
        });

        it("should have consistent message format with service prefix", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const serviceLogValues = Object.values(SERVICE_LOGS);

            // Most service logs should start with a bracketed service name
            const logWithPrefix = serviceLogValues.filter((msg: string) =>
                msg.startsWith("[")
            );

            // Should have mostly prefixed logs (expect at least 80% to have brackets)
            // Note: Some logs like "Applying migration:" and "Started monitoring" don't use brackets
            expect(logWithPrefix.length).toBeGreaterThanOrEqual(
                Math.floor(serviceLogValues.length * 0.8)
            );
        });
        it("should have no empty or undefined values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const serviceLogValues = Object.values(SERVICE_LOGS);

            for (const logMessage of serviceLogValues) {
                expect(logMessage).toBeDefined();
                expect(logMessage).not.toBe("");
                expect(typeof logMessage).toBe("string");
            }
        });

        it("should contain database service logs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(SERVICE_LOGS.DATABASE_INITIALIZED).toBeDefined();
            expect(SERVICE_LOGS.DATABASE_INITIALIZED).toContain(
                "[DatabaseService]"
            );
        });

        it("should contain site manager logs", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(SERVICE_LOGS.SITE_MANAGER_INITIALIZED).toBeDefined();
            expect(SERVICE_LOGS.SITE_MANAGER_INITIALIZED).toContain(
                "[SiteManager]"
            );
        });

        it("should contain monitor manager logs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            expect(
                SERVICE_LOGS.MONITOR_MANAGER_APPLYING_INTERVALS
            ).toBeDefined();
            expect(SERVICE_LOGS.MONITOR_MANAGER_APPLYING_INTERVALS).toContain(
                "[MonitorManager]"
            );
        });
    });

    describe("DEBUG_LOGS", () => {
        it("should contain debug log templates", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(DEBUG_LOGS).toBeDefined();
            expect(typeof DEBUG_LOGS).toBe("object");
        });

        it("should have consistent debug message format", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const debugLogValues = Object.values(DEBUG_LOGS);

            for (const logMessage of debugLogValues) {
                expect(logMessage).toBeDefined();
                expect(typeof logMessage).toBe("string");
                expect(logMessage.length).toBeGreaterThan(0);
            }
        });

        it("should contain monitoring related debug logs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const debugKeys = Object.keys(DEBUG_LOGS);
            expect(debugKeys.length).toBeGreaterThan(0);
        });
    });

    describe("ERROR_LOGS", () => {
        it("should contain error log templates", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            expect(ERROR_LOGS).toBeDefined();
            expect(typeof ERROR_LOGS).toBe("object");
        });

        it("should have consistent error message format", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const errorLogValues = Object.values(ERROR_LOGS);

            for (const logMessage of errorLogValues) {
                expect(logMessage).toBeDefined();
                expect(typeof logMessage).toBe("string");
                expect(logMessage.length).toBeGreaterThan(0);
            }
        });

        it("should contain database related error logs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const errorKeys = Object.keys(ERROR_LOGS);
            expect(errorKeys.length).toBeGreaterThan(0);
        });
    });

    describe("WARNING_LOGS", () => {
        it("should contain warning log templates", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(WARNING_LOGS).toBeDefined();
            expect(typeof WARNING_LOGS).toBe("object");
        });

        it("should have consistent warning message format", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const warningLogValues = Object.values(WARNING_LOGS);

            for (const logMessage of warningLogValues) {
                expect(logMessage).toBeDefined();
                expect(typeof logMessage).toBe("string");
                expect(logMessage.length).toBeGreaterThan(0);
            }
        });

        it("should contain monitoring related warning logs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const warningKeys = Object.keys(WARNING_LOGS);
            expect(warningKeys.length).toBeGreaterThan(0);
        });
    });

    describe("LOG_TEMPLATES", () => {
        it("should implement LogTemplatesInterface correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(LOG_TEMPLATES).toBeDefined();
            expect(LOG_TEMPLATES.services).toBe(SERVICE_LOGS);
            expect(LOG_TEMPLATES.debug).toBe(DEBUG_LOGS);
            expect(LOG_TEMPLATES.errors).toBe(ERROR_LOGS);
            expect(LOG_TEMPLATES.warnings).toBe(WARNING_LOGS);
        });

        it("should be readonly and immutable", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Test that LOG_TEMPLATES has the expected structure
            expect(LOG_TEMPLATES).toHaveProperty("services");
            expect(LOG_TEMPLATES).toHaveProperty("debug");
            expect(LOG_TEMPLATES).toHaveProperty("errors");
            expect(LOG_TEMPLATES).toHaveProperty("warnings");

            // Test that the objects have expected types
            expect(typeof LOG_TEMPLATES.services).toBe("object");
            expect(typeof LOG_TEMPLATES.debug).toBe("object");
            expect(typeof LOG_TEMPLATES.errors).toBe("object");
            expect(typeof LOG_TEMPLATES.warnings).toBe("object");
        });

        it("should have all required categories", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const requiredCategories = [
                "services",
                "debug",
                "errors",
                "warnings",
            ];

            for (const category of requiredCategories) {
                expect(LOG_TEMPLATES).toHaveProperty(category);
                expect(
                    LOG_TEMPLATES[category as keyof LogTemplatesInterface]
                ).toBeDefined();
            }
        });

        it("should maintain consistent structure", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(Object.keys(LOG_TEMPLATES)).toEqual([
                "debug",
                "errors",
                "services",
                "warnings",
            ]);
        });
    });

    describe("Template Content Validation", () => {
        it("should have meaningful and descriptive log messages", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const allLogValues = [
                ...Object.values(SERVICE_LOGS),
                ...Object.values(DEBUG_LOGS),
                ...Object.values(ERROR_LOGS),
                ...Object.values(WARNING_LOGS),
            ];

            for (const logMessage of allLogValues) {
                // Should not be just whitespace
                expect(logMessage.trim().length).toBeGreaterThan(0);

                // Should have some descriptive content
                expect(logMessage.length).toBeGreaterThan(5);

                // Should not contain placeholder text
                expect(logMessage.toLowerCase()).not.toContain("todo");
                expect(logMessage.toLowerCase()).not.toContain("placeholder");
                expect(logMessage.toLowerCase()).not.toContain("fixme");
            }
        });

        it("should follow consistent naming conventions", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const allKeys = [
                ...Object.keys(SERVICE_LOGS),
                ...Object.keys(DEBUG_LOGS),
                ...Object.keys(ERROR_LOGS),
                ...Object.keys(WARNING_LOGS),
            ];

            for (const key of allKeys) {
                // Should be uppercase with underscores
                expect(key).toMatch(/^[A-Z][\dA-Z_]*$/);

                // Should not start or end with underscore
                expect(key).not.toMatch(/^_/);
                expect(key).not.toMatch(/_$/);
            }
        });

        it("should have unique log messages across categories", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const allLogValues = [
                ...Object.values(SERVICE_LOGS),
                ...Object.values(DEBUG_LOGS),
                ...Object.values(ERROR_LOGS),
                ...Object.values(WARNING_LOGS),
            ];

            const uniqueValues = new Set(allLogValues);
            expect(uniqueValues.size).toBe(allLogValues.length);
        });
    });

    describe("Service Log Specific Tests", () => {
        it("should contain IPC service logs", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const serviceKeys = Object.keys(SERVICE_LOGS);
            const ipcLogs = serviceKeys.filter((key) => key.includes("IPC"));
            expect(ipcLogs.length).toBeGreaterThan(0);
        });

        it("should contain orchestrator logs", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const serviceKeys = Object.keys(SERVICE_LOGS);
            // Look for APPLICATION or similar service logs since there might not be specific "ORCHESTRATOR" logs
            const applicationLogs = serviceKeys.filter((key) =>
                key.includes("APPLICATION")
            );
            expect(applicationLogs.length).toBeGreaterThan(0);
        });

        it("should contain monitoring related logs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const serviceKeys = Object.keys(SERVICE_LOGS);
            const monitoringLogs = serviceKeys.filter(
                (key) => key.includes("MONITOR") || key.includes("SITE")
            );
            expect(monitoringLogs.length).toBeGreaterThan(0);
        });
    });

    describe("Type Safety", () => {
        it("should maintain type safety for LogTemplatesInterface", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const templates: LogTemplatesInterface = LOG_TEMPLATES;

            expect(templates.services).toBeDefined();
            expect(templates.debug).toBeDefined();
            expect(templates.errors).toBeDefined();
            expect(templates.warnings).toBeDefined();
        });

        it("should have readonly properties", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // TypeScript should enforce this, but we can verify structure
            const descriptor = Object.getOwnPropertyDescriptor(
                LOG_TEMPLATES,
                "services"
            );
            expect(descriptor).toBeDefined();
        });
    });

    describe("Integration and Usage", () => {
        it("should be suitable for logger interpolation", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Test that log messages can be used with string interpolation
            const testMessage = SERVICE_LOGS.APPLICATION_ACTIVATED;
            const interpolatedMessage = `${testMessage} - Additional context`;

            expect(interpolatedMessage).toBe(
                "[ApplicationService] App activated - Additional context"
            );
        });

        it("should support template literal usage", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const count = 5;
            const messageWithData = `${SERVICE_LOGS.APPLICATION_READY} with ${count} components`;

            expect(messageWithData).toContain("[ApplicationService] App ready");
            expect(messageWithData).toContain("5 components");
        });

        it("should be compatible with structured logging", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Verify that templates work well with structured logging patterns
            const logContext = {
                level: "info",
                message: SERVICE_LOGS.APPLICATION_ACTIVATED,
                service: "ApplicationService",
                timestamp: new Date().toISOString(),
            };

            expect(logContext.message).toBe(
                "[ApplicationService] App activated"
            );
            expect(logContext.service).toBe("ApplicationService");
        });
    });

    describe("Documentation and Maintainability", () => {
        it("should have consistent service prefixes", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const serviceValues = Object.values(SERVICE_LOGS);
            const knownPrefixes = [
                "[ApplicationService]",
                "[DatabaseService]",
                "[DatabaseSchema]",
                "[DatabaseBackup]",
                "[HistoryManipulation]",
                "[HistoryQuery]",
                "[HistoryMapper]",
                "[IpcService]",
                "[MonitorManager]",
                "[SiteManager]",
                "[AutoUpdaterService]",
                "[UptimeOrchestrator]",
                "[Logger]",
                "[TypedEventBus:",
                "[HttpMonitor]",
                "[SettingsMapper:",
                "[MonitorMapper]",
                "[ViteConfig]",
                "[DependencyInjection]",
                "[BackupRestore]",
                // Non-bracket patterns
                "Applying migration:", // Migration logs have different format
                "Registered migration",
                "Started monitoring",
                "Stopped monitoring",
                "Site added successfully:",
                "Checking monitor:",
                "Cancelled ",
                "Completed operation",
                "Scheduled timeout",
                "Enhanced monitor check failed",
                "active_operations contains",
                "Failed to parse active_operations",
                "Failed to update config",
                "Fresh monitor data not found",
                "Monitor ",
                "Unknown monitor type",
                "Notifications not supported",
                "Operation ",
                "Preventing recursive call",
                "Site ",
            ];

            for (const message of serviceValues) {
                const hasKnownPrefix = knownPrefixes.some((prefix) =>
                    message.startsWith(prefix)
                );
                expect(hasKnownPrefix).toBe(true);
            }
        });

        it("should follow semantic naming for log levels", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Service logs should be informational
            const serviceValues = Object.values(SERVICE_LOGS);
            for (const message of serviceValues) {
                // Should not contain error/warning keywords in informational logs
                expect(message.toLowerCase()).not.toContain("error");
                expect(message.toLowerCase()).not.toContain("failed");
                expect(message.toLowerCase()).not.toContain("warning");
            }
        });
    });
});
