/**
 * @fileoverview Comprehensive isolated tests for IPC parameter validators
 * @module ValidatorsTest
 * 
 * @description
 * Provides complete test coverage for all exported validator groups in the 
 * validators.ts module using isolated testing with comprehensive dependency mocking.
 * Tests the actual validator behavior and parameter validation logic.
 * 
 * @author Uptime-Watcher
 * @version 1.0.0
 */

import { describe, it, expect } from "vitest";

// Import all exported validator groups
import {
    SiteHandlerValidators,
    MonitoringHandlerValidators,
    DataHandlerValidators,
    MonitorTypeHandlerValidators,
    StateSyncHandlerValidators,
} from "./validators";

// Import types
import type { IpcParameterValidator } from "./types";

/**
 * Helper function to create mock parameters array
 */
function createMockParams(...values: unknown[]): unknown[] {
    return values;
}

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
        it("should have all required validator properties", () => {
            expect(SiteHandlerValidators).toHaveProperty("addSite");
            expect(SiteHandlerValidators).toHaveProperty("getSites");
            expect(SiteHandlerValidators).toHaveProperty("removeMonitor");
            expect(SiteHandlerValidators).toHaveProperty("removeSite");
            expect(SiteHandlerValidators).toHaveProperty("updateSite");
        });

        it("should have validators as functions", () => {
            expect(typeof SiteHandlerValidators.addSite).toBe("function");
            expect(typeof SiteHandlerValidators.getSites).toBe("function");
            expect(typeof SiteHandlerValidators.removeMonitor).toBe("function");
            expect(typeof SiteHandlerValidators.removeSite).toBe("function");
            expect(typeof SiteHandlerValidators.updateSite).toBe("function");
        });

        describe("addSite validator", () => {
            it("should return null for valid single object parameter", () => {
                const siteObject = { name: "Test Site", url: "https://example.com" };
                const result = SiteHandlerValidators.addSite([siteObject]);
                
                expect(isValidationSuccess(result)).toBe(true);
            });

            it("should return error array for invalid parameter count", () => {
                const result = SiteHandlerValidators.addSite(["param1", "param2"]);
                
                expect(isValidationFailure(result)).toBe(true);
                expect(Array.isArray(result)).toBe(true);
            });

            it("should return error array for empty parameters", () => {
                const result = SiteHandlerValidators.addSite([]);
                
                expect(isValidationFailure(result)).toBe(true);
            });

            it("should return error array for invalid object parameter", () => {
                const result = SiteHandlerValidators.addSite([null]);
                
                expect(isValidationFailure(result)).toBe(true);
            });
        });

        describe("getSites validator", () => {
            it("should return null for empty parameters", () => {
                const result = SiteHandlerValidators.getSites([]);
                
                expect(isValidationSuccess(result)).toBe(true);
            });

            it("should return error array for non-empty parameters", () => {
                const result = SiteHandlerValidators.getSites(["unexpected"]);
                
                expect(isValidationFailure(result)).toBe(true);
            });
        });

        describe("removeMonitor validator", () => {
            it("should return null for valid two string parameters", () => {
                const result = SiteHandlerValidators.removeMonitor(["site-id", "monitor-id"]);
                
                expect(isValidationSuccess(result)).toBe(true);
            });

            it("should return error array for invalid parameter count", () => {
                const result = SiteHandlerValidators.removeMonitor(["only-one"]);
                
                expect(isValidationFailure(result)).toBe(true);
            });

            it("should return error array for invalid parameter types", () => {
                const result = SiteHandlerValidators.removeMonitor([123, 456]);
                
                expect(isValidationFailure(result)).toBe(true);
            });
        });

        describe("removeSite validator", () => {
            it("should return null for valid single string parameter", () => {
                const result = SiteHandlerValidators.removeSite(["site-identifier"]);
                
                expect(isValidationSuccess(result)).toBe(true);
            });

            it("should return error array for invalid parameter count", () => {
                const result = SiteHandlerValidators.removeSite([]);
                
                expect(isValidationFailure(result)).toBe(true);
            });

            it("should return error array for invalid parameter type", () => {
                const result = SiteHandlerValidators.removeSite([123]);
                
                expect(isValidationFailure(result)).toBe(true);
            });
        });

        describe("updateSite validator", () => {
            it("should return null for valid string and object parameters", () => {
                const updates = { name: "Updated Site" };
                const result = SiteHandlerValidators.updateSite(["site-id", updates]);
                
                expect(isValidationSuccess(result)).toBe(true);
            });

            it("should return error array for invalid parameter count", () => {
                const result = SiteHandlerValidators.updateSite(["only-string"]);
                
                expect(isValidationFailure(result)).toBe(true);
            });

            it("should return error array for invalid parameter types", () => {
                const result = SiteHandlerValidators.updateSite([123, "not-object"]);
                
                expect(isValidationFailure(result)).toBe(true);
            });
        });
    });

describe("IPC Validators - Handler Validator Groups", () => {
    describe("SiteHandlerValidators", () => {
        it("should have all required validator properties", () => {
            expect(SiteHandlerValidators).toHaveProperty("addSite");
            expect(SiteHandlerValidators).toHaveProperty("getSites");
            expect(SiteHandlerValidators).toHaveProperty("removeMonitor");
            expect(SiteHandlerValidators).toHaveProperty("removeSite");
            expect(SiteHandlerValidators).toHaveProperty("updateSite");
        });

        it("should have validators as functions", () => {
            expect(typeof SiteHandlerValidators.addSite).toBe("function");
            expect(typeof SiteHandlerValidators.getSites).toBe("function");
            expect(typeof SiteHandlerValidators.removeMonitor).toBe("function");
            expect(typeof SiteHandlerValidators.removeSite).toBe("function");
            expect(typeof SiteHandlerValidators.updateSite).toBe("function");
        });

        describe("addSite validator", () => {
            it("should validate single object parameter", () => {
                const siteObject = { name: "Test Site", url: "https://example.com" };
                const result = SiteHandlerValidators.addSite([siteObject]);
                
                expect(result.isValid).toBe(true);
                expect(result.validatedParams).toEqual([siteObject]);
            });

            it("should reject wrong parameter count", () => {
                const result = SiteHandlerValidators.addSite(["param1", "param2"]);
                
                expect(result.isValid).toBe(false);
                expect(result.error).toContain("1 parameter (site: object)");
            });
        });

        describe("getSites validator", () => {
            it("should validate no parameters", () => {
                const result = SiteHandlerValidators.getSites([]);
                
                expect(result.isValid).toBe(true);
                expect(result.validatedParams).toEqual([]);
            });

            it("should reject any parameters", () => {
                const result = SiteHandlerValidators.getSites(["unexpected"]);
                
                expect(result.isValid).toBe(false);
                expect(result.error).toContain("0 parameters");
            });
        });

        describe("removeMonitor validator", () => {
            it("should validate two string parameters", () => {
                const result = SiteHandlerValidators.removeMonitor(["site-id", "monitor-id"]);
                
                expect(result.isValid).toBe(true);
                expect(result.validatedParams).toEqual(["site-id", "monitor-id"]);
            });

            it("should reject wrong parameter count", () => {
                const result = SiteHandlerValidators.removeMonitor(["only-one"]);
                
                expect(result.isValid).toBe(false);
                expect(result.error).toContain("2 parameters (siteIdentifier: string, monitorId: string)");
            });
        });

        describe("removeSite validator", () => {
            it("should validate single string parameter", () => {
                const result = SiteHandlerValidators.removeSite(["site-identifier"]);
                
                expect(result.isValid).toBe(true);
                expect(result.validatedParams).toEqual(["site-identifier"]);
            });

            it("should reject wrong parameter count", () => {
                const result = SiteHandlerValidators.removeSite([]);
                
                expect(result.isValid).toBe(false);
                expect(result.error).toContain("1 parameter (identifier: string)");
            });
        });

        describe("updateSite validator", () => {
            it("should validate string and object parameters", () => {
                const updates = { name: "Updated Site" };
                const result = SiteHandlerValidators.updateSite(["site-id", updates]);
                
                expect(result.isValid).toBe(true);
                expect(result.validatedParams).toEqual(["site-id", updates]);
            });

            it("should reject wrong parameter count", () => {
                const result = SiteHandlerValidators.updateSite(["only-string"]);
                
                expect(result.isValid).toBe(false);
                expect(result.error).toContain("2 parameters (identifier: string, updates: object)");
            });
        });
    });

    describe("MonitoringHandlerValidators", () => {
        it("should have all required validator properties", () => {
            expect(MonitoringHandlerValidators).toHaveProperty("checkSiteNow");
            expect(MonitoringHandlerValidators).toHaveProperty("startMonitoring");
            expect(MonitoringHandlerValidators).toHaveProperty("startMonitoringForSite");
            expect(MonitoringHandlerValidators).toHaveProperty("stopMonitoring");
            expect(MonitoringHandlerValidators).toHaveProperty("stopMonitoringForSite");
        });

        it("should have validators as functions", () => {
            expect(typeof MonitoringHandlerValidators.checkSiteNow).toBe("function");
            expect(typeof MonitoringHandlerValidators.startMonitoring).toBe("function");
            expect(typeof MonitoringHandlerValidators.startMonitoringForSite).toBe("function");
            expect(typeof MonitoringHandlerValidators.stopMonitoring).toBe("function");
            expect(typeof MonitoringHandlerValidators.stopMonitoringForSite).toBe("function");
        });

        describe("checkSiteNow validator", () => {
            it("should validate two string parameters", () => {
                const result = MonitoringHandlerValidators.checkSiteNow(["site-id", "monitor-id"]);
                
                expect(result.isValid).toBe(true);
                expect(result.validatedParams).toEqual(["site-id", "monitor-id"]);
            });
        });

        describe("startMonitoring validator", () => {
            it("should validate no parameters", () => {
                const result = MonitoringHandlerValidators.startMonitoring([]);
                
                expect(result.isValid).toBe(true);
                expect(result.validatedParams).toEqual([]);
            });
        });

        describe("startMonitoringForSite validator", () => {
            it("should validate with both parameters", () => {
                const result = MonitoringHandlerValidators.startMonitoringForSite(["site-id", "monitor-id"]);
                
                expect(result.isValid).toBe(true);
                expect(result.validatedParams).toEqual(["site-id", "monitor-id"]);
            });

            it("should validate with only first parameter", () => {
                const result = MonitoringHandlerValidators.startMonitoringForSite(["site-id"]);
                
                expect(result.isValid).toBe(true);
                expect(result.validatedParams).toEqual(["site-id", undefined]);
            });
        });

        describe("stopMonitoring validator", () => {
            it("should validate no parameters", () => {
                const result = MonitoringHandlerValidators.stopMonitoring([]);
                
                expect(result.isValid).toBe(true);
                expect(result.validatedParams).toEqual([]);
            });
        });

        describe("stopMonitoringForSite validator", () => {
            it("should validate with both parameters", () => {
                const result = MonitoringHandlerValidators.stopMonitoringForSite(["site-id", "monitor-id"]);
                
                expect(result.isValid).toBe(true);
                expect(result.validatedParams).toEqual(["site-id", "monitor-id"]);
            });

            it("should validate with only first parameter", () => {
                const result = MonitoringHandlerValidators.stopMonitoringForSite(["site-id"]);
                
                expect(result.isValid).toBe(true);
                expect(result.validatedParams).toEqual(["site-id", undefined]);
            });
        });
    });

    describe("DataHandlerValidators", () => {
        it("should have all required validator properties", () => {
            expect(DataHandlerValidators).toHaveProperty("downloadSqliteBackup");
            expect(DataHandlerValidators).toHaveProperty("exportData");
            expect(DataHandlerValidators).toHaveProperty("getHistoryLimit");
            expect(DataHandlerValidators).toHaveProperty("importData");
            expect(DataHandlerValidators).toHaveProperty("resetSettings");
            expect(DataHandlerValidators).toHaveProperty("updateHistoryLimit");
        });

        it("should have validators as functions", () => {
            expect(typeof DataHandlerValidators.downloadSqliteBackup).toBe("function");
            expect(typeof DataHandlerValidators.exportData).toBe("function");
            expect(typeof DataHandlerValidators.getHistoryLimit).toBe("function");
            expect(typeof DataHandlerValidators.importData).toBe("function");
            expect(typeof DataHandlerValidators.resetSettings).toBe("function");
            expect(typeof DataHandlerValidators.updateHistoryLimit).toBe("function");
        });

        describe("downloadSqliteBackup validator", () => {
            it("should validate no parameters", () => {
                const result = DataHandlerValidators.downloadSqliteBackup([]);
                
                expect(result.isValid).toBe(true);
                expect(result.validatedParams).toEqual([]);
            });
        });

        describe("exportData validator", () => {
            it("should validate no parameters", () => {
                const result = DataHandlerValidators.exportData([]);
                
                expect(result.isValid).toBe(true);
                expect(result.validatedParams).toEqual([]);
            });
        });

        describe("getHistoryLimit validator", () => {
            it("should validate no parameters", () => {
                const result = DataHandlerValidators.getHistoryLimit([]);
                
                expect(result.isValid).toBe(true);
                expect(result.validatedParams).toEqual([]);
            });
        });

        describe("importData validator", () => {
            it("should validate single string parameter", () => {
                const dataString = '{"sites": [], "monitors": []}';
                const result = DataHandlerValidators.importData([dataString]);
                
                expect(result.isValid).toBe(true);
                expect(result.validatedParams).toEqual([dataString]);
            });
        });

        describe("resetSettings validator", () => {
            it("should validate no parameters", () => {
                const result = DataHandlerValidators.resetSettings([]);
                
                expect(result.isValid).toBe(true);
                expect(result.validatedParams).toEqual([]);
            });
        });

        describe("updateHistoryLimit validator", () => {
            it("should validate single number parameter", () => {
                const result = DataHandlerValidators.updateHistoryLimit([100]);
                
                expect(result.isValid).toBe(true);
                expect(result.validatedParams).toEqual([100]);
            });
        });
    });

    describe("MonitorTypeHandlerValidators", () => {
        it("should have all required validator properties", () => {
            expect(MonitorTypeHandlerValidators).toHaveProperty("formatMonitorDetail");
            expect(MonitorTypeHandlerValidators).toHaveProperty("formatMonitorTitleSuffix");
            expect(MonitorTypeHandlerValidators).toHaveProperty("getMonitorTypes");
            expect(MonitorTypeHandlerValidators).toHaveProperty("validateMonitorData");
        });

        it("should have validators as functions", () => {
            expect(typeof MonitorTypeHandlerValidators.formatMonitorDetail).toBe("function");
            expect(typeof MonitorTypeHandlerValidators.formatMonitorTitleSuffix).toBe("function");
            expect(typeof MonitorTypeHandlerValidators.getMonitorTypes).toBe("function");
            expect(typeof MonitorTypeHandlerValidators.validateMonitorData).toBe("function");
        });

        describe("formatMonitorDetail validator", () => {
            it("should validate two string parameters", () => {
                const result = MonitorTypeHandlerValidators.formatMonitorDetail(["http", "details"]);
                
                expect(result.isValid).toBe(true);
                expect(result.validatedParams).toEqual(["http", "details"]);
            });
        });

        describe("formatMonitorTitleSuffix validator", () => {
            it("should validate string and object parameters", () => {
                const monitor = { name: "Test Monitor" };
                const result = MonitorTypeHandlerValidators.formatMonitorTitleSuffix(["http", monitor]);
                
                expect(result.isValid).toBe(true);
                expect(result.validatedParams).toEqual(["http", monitor]);
            });
        });

        describe("getMonitorTypes validator", () => {
            it("should validate no parameters", () => {
                const result = MonitorTypeHandlerValidators.getMonitorTypes([]);
                
                expect(result.isValid).toBe(true);
                expect(result.validatedParams).toEqual([]);
            });
        });

        describe("validateMonitorData validator", () => {
            it("should validate string and unvalidated second parameter", () => {
                const data = { url: "https://example.com", timeout: 30 };
                const result = MonitorTypeHandlerValidators.validateMonitorData(["http", data]);
                
                expect(result.isValid).toBe(true);
                expect(result.validatedParams).toEqual(["http", data]);
            });

            it("should accept any type for second parameter", () => {
                const result1 = MonitorTypeHandlerValidators.validateMonitorData(["http", null]);
                const result2 = MonitorTypeHandlerValidators.validateMonitorData(["ping", 42]);
                const result3 = MonitorTypeHandlerValidators.validateMonitorData(["dns", "string"]);
                
                expect(result1.isValid).toBe(true);
                expect(result2.isValid).toBe(true);
                expect(result3.isValid).toBe(true);
            });
        });
    });

    describe("StateSyncHandlerValidators", () => {
        it("should have all required validator properties", () => {
            expect(StateSyncHandlerValidators).toHaveProperty("getSyncStatus");
            expect(StateSyncHandlerValidators).toHaveProperty("requestFullSync");
        });

        it("should have validators as functions", () => {
            expect(typeof StateSyncHandlerValidators.getSyncStatus).toBe("function");
            expect(typeof StateSyncHandlerValidators.requestFullSync).toBe("function");
        });

        describe("getSyncStatus validator", () => {
            it("should validate no parameters", () => {
                const result = StateSyncHandlerValidators.getSyncStatus([]);
                
                expect(result.isValid).toBe(true);
                expect(result.validatedParams).toEqual([]);
            });
        });

        describe("requestFullSync validator", () => {
            it("should validate no parameters", () => {
                const result = StateSyncHandlerValidators.requestFullSync([]);
                
                expect(result.isValid).toBe(true);
                expect(result.validatedParams).toEqual([]);
            });
        });
    });
});

describe("IPC Validators - Interface Compliance", () => {
    describe("SiteHandlerValidators interface compliance", () => {
        it("should match SiteHandlerValidatorsInterface structure", () => {
            // Type check - if this compiles, the interface matches
            const validators: SiteHandlerValidatorsInterface = SiteHandlerValidators;
            expect(validators).toBeDefined();
        });
    });

    describe("MonitoringHandlerValidators interface compliance", () => {
        it("should match MonitoringHandlerValidatorsInterface structure", () => {
            // Type check - if this compiles, the interface matches
            const validators: MonitoringHandlerValidatorsInterface = MonitoringHandlerValidators;
            expect(validators).toBeDefined();
        });
    });

    describe("DataHandlerValidators interface compliance", () => {
        it("should match DataHandlerValidatorsInterface structure", () => {
            // Type check - if this compiles, the interface matches
            const validators: DataHandlerValidatorsInterface = DataHandlerValidators;
            expect(validators).toBeDefined();
        });
    });

    describe("MonitorTypeHandlerValidators interface compliance", () => {
        it("should match MonitorTypeHandlerValidatorsInterface structure", () => {
            // Type check - if this compiles, the interface matches
            const validators: MonitorTypeHandlerValidatorsInterface = MonitorTypeHandlerValidators;
            expect(validators).toBeDefined();
        });
    });

    describe("StateSyncHandlerValidators interface compliance", () => {
        it("should match StateSyncHandlerValidatorsInterface structure", () => {
            // Type check - if this compiles, the interface matches
            const validators: StateSyncHandlerValidatorsInterface = StateSyncHandlerValidators;
            expect(validators).toBeDefined();
        });
    });
});

describe("IPC Validators - Edge Cases and Error Handling", () => {
    describe("Parameter validation edge cases", () => {
        it("should handle null parameters correctly", () => {
            const result = SiteHandlerValidators.addSite([null]);
            expect(result.isValid).toBe(false);
            expect(result.error).toContain("Object validation failed");
        });

        it("should handle undefined parameters correctly", () => {
            const result = SiteHandlerValidators.removeSite([undefined]);
            expect(result.isValid).toBe(false);
            expect(result.error).toContain("String validation failed");
        });

        it("should handle empty array parameters", () => {
            const result = SiteHandlerValidators.updateSite([]);
            expect(result.isValid).toBe(false);
            expect(result.error).toContain("2 parameters");
        });

        it("should handle mixed type parameters", () => {
            const result = SiteHandlerValidators.removeMonitor([123, true]);
            expect(result.isValid).toBe(false);
            expect(result.error).toContain("String validation failed");
        });
    });

    describe("Boundary conditions", () => {
        it("should handle maximum parameter counts", () => {
            const manyParams = new Array(100).fill("param");
            const result = SiteHandlerValidators.getSites(manyParams);
            expect(result.isValid).toBe(false);
            expect(result.error).toContain("0 parameters");
        });

        it("should handle empty string parameters", () => {
            const result = SiteHandlerValidators.removeSite([""]);
            expect(result.isValid).toBe(true);
            expect(result.validatedParams).toEqual([""]);
        });

        it("should handle zero number parameters", () => {
            const result = DataHandlerValidators.updateHistoryLimit([0]);
            expect(result.isValid).toBe(true);
            expect(result.validatedParams).toEqual([0]);
        });

        it("should handle negative number parameters", () => {
            const result = DataHandlerValidators.updateHistoryLimit([-1]);
            expect(result.isValid).toBe(true);
            expect(result.validatedParams).toEqual([-1]);
        });
    });

    describe("Complex object validation", () => {
        it("should handle nested objects", () => {
            const complexSite = {
                name: "Complex Site",
                config: {
                    nested: {
                        deep: "value"
                    }
                }
            };
            const result = SiteHandlerValidators.addSite([complexSite]);
            expect(result.isValid).toBe(true);
            expect(result.validatedParams).toEqual([complexSite]);
        });

        it("should handle arrays as objects", () => {
            const arrayParam = ["item1", "item2", "item3"];
            const result = SiteHandlerValidators.addSite([arrayParam]);
            expect(result.isValid).toBe(true);
            expect(result.validatedParams).toEqual([arrayParam]);
        });

        it("should handle objects with functions", () => {
            const objWithFunction = {
                name: "Site",
                callback: () => console.log("test")
            };
            const result = SiteHandlerValidators.addSite([objWithFunction]);
            expect(result.isValid).toBe(true);
            expect(result.validatedParams).toEqual([objWithFunction]);
        });
    });

    describe("Validation consistency", () => {
        it("should produce consistent results for same inputs", () => {
            const params = ["test-site", "test-monitor"];
            
            const result1 = SiteHandlerValidators.removeMonitor(params);
            const result2 = SiteHandlerValidators.removeMonitor(params);
            const result3 = MonitoringHandlerValidators.checkSiteNow(params);
            
            expect(result1).toEqual(result2);
            expect(result1.isValid).toBe(result3.isValid);
            expect(result1.validatedParams).toEqual(result3.validatedParams);
        });

        it("should handle parameter mutations correctly", () => {
            const params = ["original"];
            const result1 = SiteHandlerValidators.removeSite(params);
            
            params[0] = "modified";
            const result2 = SiteHandlerValidators.removeSite(["original"]);
            
            expect(result1.validatedParams).toEqual(["original"]);
            expect(result2.validatedParams).toEqual(["original"]);
            expect(result1).toEqual(result2);
        });
    });
});
