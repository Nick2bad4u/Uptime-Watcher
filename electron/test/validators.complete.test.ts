/**
 * Provides complete test coverage for all exported validator groups in the
 * validators.ts module using isolated testing with comprehensive dependency
 * mocking. Tests the actual validator behavior and parameter validation logic.
 *
 * @module ValidatorsTest
 *
 * @version 1.0.0
 *
 * @file Comprehensive isolated tests for IPC parameter validators
 *
 * @author Uptime-Watcher
 */

import { describe, it, expect } from "vitest";

// Import all exported validator groups
import {
    SiteHandlerValidators,
    MonitoringHandlerValidators,
    DataHandlerValidators,
    MonitorTypeHandlerValidators,
    StateSyncHandlerValidators,
} from "../services/ipc/validators";

/**
 * Helper function to check if validation result indicates success
 */
function isValidationSuccess(result: null | string[]): boolean {
    return result === null;
}

/**
 * Helper function to check if validation result indicates failure
 */
function isValidationFailure(result: null | string[]): boolean {
    return Array.isArray(result) && result.length > 0;
}

describe("IPC Validators - Exported Validator Groups", () => {
    describe("SiteHandlerValidators", () => {
        it("should have all required validator properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            expect(SiteHandlerValidators).toHaveProperty("addSite");
            expect(SiteHandlerValidators).toHaveProperty("getSites");
            expect(SiteHandlerValidators).toHaveProperty("removeMonitor");
            expect(SiteHandlerValidators).toHaveProperty("removeSite");
            expect(SiteHandlerValidators).toHaveProperty("updateSite");
        });

        it("should have validators as functions", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            expect(typeof SiteHandlerValidators.addSite).toBe("function");
            expect(typeof SiteHandlerValidators.getSites).toBe("function");
            expect(typeof SiteHandlerValidators.removeMonitor).toBe("function");
            expect(typeof SiteHandlerValidators.removeSite).toBe("function");
            expect(typeof SiteHandlerValidators.updateSite).toBe("function");
        });

        describe("addSite validator", () => {
            it("should return null for valid single object parameter", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

                const siteObject = {
                    name: "Test Site",
                    url: "https://example.com",
                };
                const result = SiteHandlerValidators.addSite([siteObject]);

                expect(isValidationSuccess(result)).toBe(true);
            });

            it("should return error array for invalid parameter count", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

                const result = SiteHandlerValidators.addSite([
                    "param1",
                    "param2",
                ]);

                expect(isValidationFailure(result)).toBe(true);
                expect(Array.isArray(result)).toBe(true);
            });

            it("should return error array for empty parameters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

                const result = SiteHandlerValidators.addSite([]);

                expect(isValidationFailure(result)).toBe(true);
            });

            it("should return error array for invalid object parameter", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

                const result = SiteHandlerValidators.addSite([null]);

                expect(isValidationFailure(result)).toBe(true);
            });
        });

        describe("getSites validator", () => {
            it("should return null for empty parameters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

                const result = SiteHandlerValidators.getSites([]);

                expect(isValidationSuccess(result)).toBe(true);
            });

            it("should return error array for non-empty parameters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

                const result = SiteHandlerValidators.getSites(["unexpected"]);

                expect(isValidationFailure(result)).toBe(true);
            });
        });

        describe("removeMonitor validator", () => {
            it("should return null for valid two string parameters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

                const result = SiteHandlerValidators.removeMonitor([
                    "site-id",
                    "monitor-id",
                ]);

                expect(isValidationSuccess(result)).toBe(true);
            });

            it("should return error array for invalid parameter count", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

                const result = SiteHandlerValidators.removeMonitor([
                    "only-one",
                ]);

                expect(isValidationFailure(result)).toBe(true);
            });

            it("should return error array for invalid parameter types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

                const result = SiteHandlerValidators.removeMonitor([123, 456]);

                expect(isValidationFailure(result)).toBe(true);
            });
        });

        describe("removeSite validator", () => {
            it("should return null for valid single string parameter", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

                const result = SiteHandlerValidators.removeSite([
                    "site-identifier",
                ]);

                expect(isValidationSuccess(result)).toBe(true);
            });

            it("should return error array for invalid parameter count", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

                const result = SiteHandlerValidators.removeSite([]);

                expect(isValidationFailure(result)).toBe(true);
            });

            it("should return error array for invalid parameter type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

                const result = SiteHandlerValidators.removeSite([123]);

                expect(isValidationFailure(result)).toBe(true);
            });
        });

        describe("updateSite validator", () => {
            it("should return null for valid string and object parameters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

                const updates = { name: "Updated Site" };
                const result = SiteHandlerValidators.updateSite([
                    "site-id",
                    updates,
                ]);

                expect(isValidationSuccess(result)).toBe(true);
            });

            it("should return error array for invalid parameter count", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

                const result = SiteHandlerValidators.updateSite([
                    "only-string",
                ]);

                expect(isValidationFailure(result)).toBe(true);
            });

            it("should return error array for invalid parameter types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

                const result = SiteHandlerValidators.updateSite([
                    123,
                    "not-object",
                ]);

                expect(isValidationFailure(result)).toBe(true);
            });
        });
    });

    describe("MonitoringHandlerValidators", () => {
        it("should have all required validator properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            expect(MonitoringHandlerValidators).toHaveProperty("checkSiteNow");
            expect(MonitoringHandlerValidators).toHaveProperty(
                "startMonitoring"
            );
            expect(MonitoringHandlerValidators).toHaveProperty(
                "startMonitoringForSite"
            );
            expect(MonitoringHandlerValidators).toHaveProperty(
                "stopMonitoring"
            );
            expect(MonitoringHandlerValidators).toHaveProperty(
                "stopMonitoringForSite"
            );
        });

        it("should have validators as functions", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            expect(typeof MonitoringHandlerValidators.checkSiteNow).toBe(
                "function"
            );
            expect(typeof MonitoringHandlerValidators.startMonitoring).toBe(
                "function"
            );
            expect(
                typeof MonitoringHandlerValidators.startMonitoringForSite
            ).toBe("function");
            expect(typeof MonitoringHandlerValidators.stopMonitoring).toBe(
                "function"
            );
            expect(
                typeof MonitoringHandlerValidators.stopMonitoringForSite
            ).toBe("function");
        });

        describe("checkSiteNow validator", () => {
            it("should return null for valid two string parameters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

                const result = MonitoringHandlerValidators.checkSiteNow([
                    "site-id",
                    "monitor-id",
                ]);
                expect(isValidationSuccess(result)).toBe(true);
            });

            it("should return error array for invalid parameter count", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

                const result = MonitoringHandlerValidators.checkSiteNow([
                    "only-one",
                ]);
                expect(isValidationFailure(result)).toBe(true);
            });
        });

        describe("startMonitoring validator", () => {
            it("should return null for empty parameters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

                const result = MonitoringHandlerValidators.startMonitoring([]);
                expect(isValidationSuccess(result)).toBe(true);
            });

            it("should return error array for non-empty parameters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

                const result = MonitoringHandlerValidators.startMonitoring([
                    "unexpected",
                ]);
                expect(isValidationFailure(result)).toBe(true);
            });
        });

        describe("startMonitoringForSite validator", () => {
            it("should return null for valid parameters with both strings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

                const result =
                    MonitoringHandlerValidators.startMonitoringForSite([
                        "site-id",
                        "monitor-id",
                    ]);
                expect(isValidationSuccess(result)).toBe(true);
            });

            it("should return null for valid parameters with single string", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

                const result =
                    MonitoringHandlerValidators.startMonitoringForSite([
                        "site-id",
                    ]);
                expect(isValidationSuccess(result)).toBe(true);
            });

            it("should return error array for invalid parameter count", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

                const result =
                    MonitoringHandlerValidators.startMonitoringForSite([
                        "one",
                        "two",
                        "three",
                    ]);
                expect(isValidationFailure(result)).toBe(true);
            });
        });

        describe("stopMonitoring validator", () => {
            it("should return null for empty parameters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

                const result = MonitoringHandlerValidators.stopMonitoring([]);
                expect(isValidationSuccess(result)).toBe(true);
            });

            it("should return error array for non-empty parameters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

                const result = MonitoringHandlerValidators.stopMonitoring([
                    "unexpected",
                ]);
                expect(isValidationFailure(result)).toBe(true);
            });
        });

        describe("stopMonitoringForSite validator", () => {
            it("should return null for valid parameters with both strings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

                const result =
                    MonitoringHandlerValidators.stopMonitoringForSite([
                        "site-id",
                        "monitor-id",
                    ]);
                expect(isValidationSuccess(result)).toBe(true);
            });

            it("should return null for valid parameters with single string", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

                const result =
                    MonitoringHandlerValidators.stopMonitoringForSite([
                        "site-id",
                    ]);
                expect(isValidationSuccess(result)).toBe(true);
            });

            it("should return error array for invalid parameter count", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

                const result =
                    MonitoringHandlerValidators.stopMonitoringForSite([]);
                expect(isValidationFailure(result)).toBe(true);
            });
        });
    });

    describe("DataHandlerValidators", () => {
        it("should have all required validator properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            expect(DataHandlerValidators).toHaveProperty(
                "downloadSqliteBackup"
            );
            expect(DataHandlerValidators).toHaveProperty("exportData");
            expect(DataHandlerValidators).toHaveProperty("getHistoryLimit");
            expect(DataHandlerValidators).toHaveProperty("importData");
            expect(DataHandlerValidators).toHaveProperty("resetSettings");
            expect(DataHandlerValidators).toHaveProperty("updateHistoryLimit");
        });

        it("should have validators as functions", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            expect(typeof DataHandlerValidators.downloadSqliteBackup).toBe(
                "function"
            );
            expect(typeof DataHandlerValidators.exportData).toBe("function");
            expect(typeof DataHandlerValidators.getHistoryLimit).toBe(
                "function"
            );
            expect(typeof DataHandlerValidators.importData).toBe("function");
            expect(typeof DataHandlerValidators.resetSettings).toBe("function");
            expect(typeof DataHandlerValidators.updateHistoryLimit).toBe(
                "function"
            );
        });

        describe("downloadSqliteBackup validator", () => {
            it("should return null for empty parameters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

                const result = DataHandlerValidators.downloadSqliteBackup([]);
                expect(isValidationSuccess(result)).toBe(true);
            });

            it("should return error array for non-empty parameters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

                const result = DataHandlerValidators.downloadSqliteBackup([
                    "unexpected",
                ]);
                expect(isValidationFailure(result)).toBe(true);
            });
        });

        describe("exportData validator", () => {
            it("should return null for empty parameters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

                const result = DataHandlerValidators.exportData([]);
                expect(isValidationSuccess(result)).toBe(true);
            });

            it("should return error array for non-empty parameters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

                const result = DataHandlerValidators.exportData(["unexpected"]);
                expect(isValidationFailure(result)).toBe(true);
            });
        });

        describe("getHistoryLimit validator", () => {
            it("should return null for empty parameters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

                const result = DataHandlerValidators.getHistoryLimit([]);
                expect(isValidationSuccess(result)).toBe(true);
            });

            it("should return error array for non-empty parameters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

                const result = DataHandlerValidators.getHistoryLimit([
                    "unexpected",
                ]);
                expect(isValidationFailure(result)).toBe(true);
            });
        });

        describe("importData validator", () => {
            it("should return null for valid single string parameter", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

                const dataString = '{"sites": [], "monitors": []}';
                const result = DataHandlerValidators.importData([dataString]);
                expect(isValidationSuccess(result)).toBe(true);
            });

            it("should return error array for invalid parameter count", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

                const result = DataHandlerValidators.importData([]);
                expect(isValidationFailure(result)).toBe(true);
            });

            it("should return error array for invalid parameter type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

                const result = DataHandlerValidators.importData([123]);
                expect(isValidationFailure(result)).toBe(true);
            });
        });

        describe("resetSettings validator", () => {
            it("should return null for empty parameters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

                const result = DataHandlerValidators.resetSettings([]);
                expect(isValidationSuccess(result)).toBe(true);
            });

            it("should return error array for non-empty parameters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

                const result = DataHandlerValidators.resetSettings([
                    "unexpected",
                ]);
                expect(isValidationFailure(result)).toBe(true);
            });
        });

        describe("updateHistoryLimit validator", () => {
            it("should return null for valid single number parameter", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

                const result = DataHandlerValidators.updateHistoryLimit([100]);
                expect(isValidationSuccess(result)).toBe(true);
            });

            it("should return error array for invalid parameter count", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

                const result = DataHandlerValidators.updateHistoryLimit([]);
                expect(isValidationFailure(result)).toBe(true);
            });

            it("should return error array for invalid parameter type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

                const result = DataHandlerValidators.updateHistoryLimit([
                    "not-a-number",
                ]);
                expect(isValidationFailure(result)).toBe(true);
            });
        });
    });

    describe("MonitorTypeHandlerValidators", () => {
        it("should have all required validator properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            expect(MonitorTypeHandlerValidators).toHaveProperty(
                "formatMonitorDetail"
            );
            expect(MonitorTypeHandlerValidators).toHaveProperty(
                "formatMonitorTitleSuffix"
            );
            expect(MonitorTypeHandlerValidators).toHaveProperty(
                "getMonitorTypes"
            );
            expect(MonitorTypeHandlerValidators).toHaveProperty(
                "validateMonitorData"
            );
        });

        it("should have validators as functions", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            expect(
                typeof MonitorTypeHandlerValidators.formatMonitorDetail
            ).toBe("function");
            expect(
                typeof MonitorTypeHandlerValidators.formatMonitorTitleSuffix
            ).toBe("function");
            expect(typeof MonitorTypeHandlerValidators.getMonitorTypes).toBe(
                "function"
            );
            expect(
                typeof MonitorTypeHandlerValidators.validateMonitorData
            ).toBe("function");
        });

        describe("formatMonitorDetail validator", () => {
            it("should return null for valid two string parameters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

                const result = MonitorTypeHandlerValidators.formatMonitorDetail(
                    ["http", "details"]
                );
                expect(isValidationSuccess(result)).toBe(true);
            });

            it("should return error array for invalid parameter count", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

                const result = MonitorTypeHandlerValidators.formatMonitorDetail(
                    ["only-one"]
                );
                expect(isValidationFailure(result)).toBe(true);
            });
        });

        describe("formatMonitorTitleSuffix validator", () => {
            it("should return null for valid string and object parameters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

                const monitor = { name: "Test Monitor" };
                const result =
                    MonitorTypeHandlerValidators.formatMonitorTitleSuffix([
                        "http",
                        monitor,
                    ]);
                expect(isValidationSuccess(result)).toBe(true);
            });

            it("should return error array for invalid parameter count", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

                const result =
                    MonitorTypeHandlerValidators.formatMonitorTitleSuffix([
                        "only-string",
                    ]);
                expect(isValidationFailure(result)).toBe(true);
            });
        });

        describe("getMonitorTypes validator", () => {
            it("should return null for empty parameters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

                const result = MonitorTypeHandlerValidators.getMonitorTypes([]);
                expect(isValidationSuccess(result)).toBe(true);
            });

            it("should return error array for non-empty parameters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

                const result = MonitorTypeHandlerValidators.getMonitorTypes([
                    "unexpected",
                ]);
                expect(isValidationFailure(result)).toBe(true);
            });
        });

        describe("validateMonitorData validator", () => {
            it("should return null for valid string and unvalidated second parameter", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Validation", "type");

                const data = { url: "https://example.com", timeout: 30 };
                const result = MonitorTypeHandlerValidators.validateMonitorData(
                    ["http", data]
                );
                expect(isValidationSuccess(result)).toBe(true);
            });

            it("should accept any type for second parameter", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

                const result1 =
                    MonitorTypeHandlerValidators.validateMonitorData([
                        "http",
                        null,
                    ]);
                const result2 =
                    MonitorTypeHandlerValidators.validateMonitorData([
                        "ping",
                        42,
                    ]);
                const result3 =
                    MonitorTypeHandlerValidators.validateMonitorData([
                        "dns",
                        "string",
                    ]);

                expect(isValidationSuccess(result1)).toBe(true);
                expect(isValidationSuccess(result2)).toBe(true);
                expect(isValidationSuccess(result3)).toBe(true);
            });

            it("should return error array for invalid parameter count", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

                const result = MonitorTypeHandlerValidators.validateMonitorData(
                    ["only-one"]
                );
                expect(isValidationFailure(result)).toBe(true);
            });
        });
    });

    describe("StateSyncHandlerValidators", () => {
        it("should have all required validator properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            expect(StateSyncHandlerValidators).toHaveProperty("getSyncStatus");
            expect(StateSyncHandlerValidators).toHaveProperty(
                "requestFullSync"
            );
        });

        it("should have validators as functions", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            expect(typeof StateSyncHandlerValidators.getSyncStatus).toBe(
                "function"
            );
            expect(typeof StateSyncHandlerValidators.requestFullSync).toBe(
                "function"
            );
        });

        describe("getSyncStatus validator", () => {
            it("should return null for empty parameters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

                const result = StateSyncHandlerValidators.getSyncStatus([]);
                expect(isValidationSuccess(result)).toBe(true);
            });

            it("should return error array for non-empty parameters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

                const result = StateSyncHandlerValidators.getSyncStatus([
                    "unexpected",
                ]);
                expect(isValidationFailure(result)).toBe(true);
            });
        });

        describe("requestFullSync validator", () => {
            it("should return null for empty parameters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

                const result = StateSyncHandlerValidators.requestFullSync([]);
                expect(isValidationSuccess(result)).toBe(true);
            });

            it("should return error array for non-empty parameters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

                const result = StateSyncHandlerValidators.requestFullSync([
                    "unexpected",
                ]);
                expect(isValidationFailure(result)).toBe(true);
            });
        });
    });
});

describe("IPC Validators - Edge Cases and Error Handling", () => {
    describe("Parameter validation edge cases", () => {
        it("should handle null parameters correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const result = SiteHandlerValidators.addSite([null]);
            expect(isValidationFailure(result)).toBe(true);
        });

        it("should handle undefined parameters correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const result = SiteHandlerValidators.removeSite([undefined]);
            expect(isValidationFailure(result)).toBe(true);
        });

        it("should handle empty array parameters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const result = SiteHandlerValidators.updateSite([]);
            expect(isValidationFailure(result)).toBe(true);
        });

        it("should handle mixed type parameters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const result = SiteHandlerValidators.removeMonitor([123, true]);
            expect(isValidationFailure(result)).toBe(true);
        });
    });

    describe("Boundary conditions", () => {
        it("should handle maximum parameter counts", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const manyParams = Array.from({ length: 100 }).fill("param");
            const result = SiteHandlerValidators.getSites(manyParams);
            expect(isValidationFailure(result)).toBe(true);
        });

        it("should handle empty string parameters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const result = SiteHandlerValidators.removeSite([""]);
            expect(isValidationFailure(result)).toBe(true);
        });

        it("should handle zero number parameters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const result = DataHandlerValidators.updateHistoryLimit([0]);
            expect(isValidationSuccess(result)).toBe(true);
        });

        it("should handle negative number parameters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const result = DataHandlerValidators.updateHistoryLimit([-1]);
            expect(isValidationSuccess(result)).toBe(true);
        });
    });

    describe("Complex object validation", () => {
        it("should handle nested objects", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const complexSite = {
                name: "Complex Site",
                config: {
                    nested: {
                        deep: "value",
                    },
                },
            };
            const result = SiteHandlerValidators.addSite([complexSite]);
            expect(isValidationSuccess(result)).toBe(true);
        });

        it("should handle arrays as objects", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const arrayParam = [
                "item1",
                "item2",
                "item3",
            ];
            const result = SiteHandlerValidators.addSite([arrayParam]);
            expect(isValidationFailure(result)).toBe(true);
        });

        it("should handle objects with functions", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const objWithFunction = {
                name: "Site",
                callback: () => console.log("test"),
            };
            const result = SiteHandlerValidators.addSite([objWithFunction]);
            expect(isValidationSuccess(result)).toBe(true);
        });
    });

    describe("Validation consistency", () => {
        it("should produce consistent results for same inputs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const params = ["test-site", "test-monitor"];

            const result1 = SiteHandlerValidators.removeMonitor(params);
            const result2 = SiteHandlerValidators.removeMonitor(params);
            const result3 = MonitoringHandlerValidators.checkSiteNow(params);

            expect(result1).toEqual(result2);
            expect(isValidationSuccess(result1)).toBe(
                isValidationSuccess(result3)
            );
        });

        it("should handle parameter mutations correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const params = ["original"];
            const result1 = SiteHandlerValidators.removeSite(params);

            params[0] = "modified";
            const result2 = SiteHandlerValidators.removeSite(["original"]);

            expect(result1).toEqual(result2);
        });
    });

    describe("Type-specific validation behavior", () => {
        it("should validate string parameters with different formats", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Validation", "type");

            const validStrings = [
                "simple",
                "with spaces",
                "with-dashes",
                "with_underscores",
                "123",
                "special!@#",
            ];

            for (const str of validStrings) {
                const result = SiteHandlerValidators.removeSite([str]);
                expect(isValidationSuccess(result)).toBe(true);
            }

            // Empty string should fail
            const emptyResult = SiteHandlerValidators.removeSite([""]);
            expect(isValidationFailure(emptyResult)).toBe(true);
        });

        it("should validate number parameters with different values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Validation", "type");

            const validNumbers = [
                0,
                -1,
                1,
                100,
                -100,
                1.5,
                -1.5,
                Number.MAX_SAFE_INTEGER,
                Number.MIN_SAFE_INTEGER,
            ];

            for (const num of validNumbers) {
                const result = DataHandlerValidators.updateHistoryLimit([num]);
                expect(isValidationSuccess(result)).toBe(true);
            }
        });

        it("should validate object parameters with different structures", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Validation", "type");

            const validObjects = [
                {},
                { simple: "value" },
                { nested: { deep: { value: "test" } } },
                {
                    array: [
                        1,
                        2,
                        3,
                    ],
                },
                {
                    mixed: {
                        string: "test",
                        number: 42,
                        boolean: true,
                        null: null,
                    },
                },
                new Date(),
                new Map(),
                new Set(),
            ];

            for (const obj of validObjects) {
                const result = SiteHandlerValidators.addSite([obj]);
                expect(isValidationSuccess(result)).toBe(true);
            }
        });

        it("should reject primitive types for object parameters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const invalidObjects = [
                null,
                undefined,
                "string",
                123,
                true,
                Symbol("test"),
            ];

            for (const invalid of invalidObjects) {
                const result = SiteHandlerValidators.addSite([invalid]);
                expect(isValidationFailure(result)).toBe(true);
            }
        });

        it("should reject non-string types for string parameters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const invalidStrings = [
                null,
                undefined,
                123,
                true,
                {},
                [],
                Symbol("test"),
            ];

            for (const invalid of invalidStrings) {
                const result = SiteHandlerValidators.removeSite([invalid]);
                expect(isValidationFailure(result)).toBe(true);
            }
        });

        it("should reject non-number types for number parameters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validators.complete", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const invalidNumbers = [
                null,
                undefined,
                "123",
                true,
                {},
                [],
                Symbol("test"),
                "not-a-number",
            ];

            for (const invalid of invalidNumbers) {
                const result = DataHandlerValidators.updateHistoryLimit([
                    invalid,
                ]);
                expect(isValidationFailure(result)).toBe(true);
            }
        });
    });
});
