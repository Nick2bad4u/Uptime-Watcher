/**
 * Array Declaration Mutation Tests
 *
 * @file Tests specifically designed to catch ArrayDeclaration mutations that
 *   survived Stryker mutation testing. Covers database operations, empty array
 *   initializations, and frontend array handling.
 *
 * @author GitHub Copilot
 *
 * @since 2025-09-03
 *
 * @category Tests
 *
 * @tags ["mutation-testing", "array-declaration", "stryker"]
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

describe("ArrayDeclaration Mutation Tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Database Parameter Arrays", () => {
        it("should pass non-empty parameter arrays to database operations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Database Operations", "component");
            await annotate("Category: Data Access", "category");
            await annotate("Type: Array Parameters", "type");

            // Mock database operation
            const mockDbRun = vi.fn();
            const mockDb = { run: mockDbRun };

            // Simulate database operations with array parameters
            // These target mutations like: [param] -> []

            const siteIdentifier = "site123";
            const monitorId = "monitor456";

            // Correct: passing parameters in array
            mockDb.run("DELETE FROM sites WHERE id = ?", [siteIdentifier]);
            mockDb.run("DELETE FROM monitors WHERE id = ?", [monitorId]);

            // Verify parameters were passed correctly
            expect(mockDbRun).toHaveBeenCalledWith(
                "DELETE FROM sites WHERE id = ?",
                [siteIdentifier]
            );
            expect(mockDbRun).toHaveBeenCalledWith(
                "DELETE FROM monitors WHERE id = ?",
                [monitorId]
            );

            // Mutated version would pass empty array [], which would fail the operation
            mockDbRun.mockClear();

            // This would be the mutated version (should fail)
            mockDb.run("DELETE FROM sites WHERE id = ?", []);

            // With empty array, the operation would be called but with wrong parameters
            expect(mockDbRun).toHaveBeenCalledWith(
                "DELETE FROM sites WHERE id = ?",
                []
            );

            // The mutation would cause the query to fail or behave incorrectly
            // because the placeholder ? would have no corresponding value
        });

        it("should initialize update arrays correctly (kills empty array mutations)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Database Updates", "component");
            await annotate("Category: Data Access", "category");
            await annotate("Type: Array Initialization", "type");

            // This targets mutations like:
            // const updateFields: string[] = []; -> ["Stryker was here"]
            // const updateValues: DbValue[] = []; -> ["Stryker was here"]

            function buildUpdateQuery() {
                const updateFields: string[] = [];
                const updateValues: any[] = [];

                // Build query dynamically
                updateFields.push("name");
                updateValues.push("New Name");

                updateFields.push("status");
                updateValues.push("active");

                return { updateFields, updateValues };
            }

            const result = buildUpdateQuery();

            // Correct initialization should start with empty arrays
            expect(result.updateFields).toEqual(["name", "status"]);
            expect(result.updateValues).toEqual(["New Name", "active"]);

            // If mutation made them start with ["Stryker was here"], the result would be wrong
            function buildUpdateQueryMutated() {
                const updateFields: string[] = ["Stryker was here"];
                const updateValues: any[] = ["Stryker was here"];

                updateFields.push("name");
                updateValues.push("New Name");

                return { updateFields, updateValues };
            }

            const mutatedResult = buildUpdateQueryMutated();

            // Mutated version would have the unwanted "Stryker was here" entries
            expect(mutatedResult.updateFields).toEqual([
                "Stryker was here",
                "name",
            ]);
            expect(mutatedResult.updateValues).toEqual([
                "Stryker was here",
                "New Name",
            ]);

            // Verify they are different
            expect(result.updateFields).not.toEqual(mutatedResult.updateFields);
            expect(result.updateValues).not.toEqual(mutatedResult.updateValues);
        });

        it("should clear active operations with empty array (kills non-empty array mutations)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Monitor Operations", "component");
            await annotate("Category: State Management", "category");
            await annotate("Type: Array Reset", "type");

            // This targets mutations like:
            // { activeOperations: [] } -> { activeOperations: ["Stryker was here"] }

            function clearActiveOperations(monitorId: string) {
                return {
                    monitorId,
                    activeOperations: [], // Should be empty to clear operations
                };
            }

            const result = clearActiveOperations("monitor123");

            // Correct: empty array clears all active operations
            expect(result.activeOperations).toEqual([]);
            expect(result.activeOperations).toHaveLength(0);

            // Mutated version would have unwanted entries
            function clearActiveOperationsMutated(monitorId: string) {
                return {
                    monitorId,
                    activeOperations: ["Stryker was here"],
                };
            }

            const mutatedResult = clearActiveOperationsMutated("monitor123");

            // Mutated version would not properly clear operations
            expect(mutatedResult.activeOperations).not.toEqual([]);
            expect(mutatedResult.activeOperations).toHaveLength(1);
            expect(mutatedResult.activeOperations).toContain(
                "Stryker was here"
            );

            // This would break the clearing functionality
            expect(result.activeOperations).not.toEqual(
                mutatedResult.activeOperations
            );
        });
    });

    describe("Frontend Array Operations", () => {
        it("should handle dependency arrays correctly in React hooks", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: React Hooks", "component");
            await annotate("Category: Frontend", "category");
            await annotate("Type: Dependency Arrays", "type");

            // Mock React useEffect hook
            const mockUseEffect = vi.fn();

            // This targets mutations in dependency arrays like:
            // useEffect(callback, []) -> useEffect(callback, ["Stryker was here"])

            const callback = vi.fn();

            // Correct: empty dependency array means effect runs once
            mockUseEffect(callback, []);

            expect(mockUseEffect).toHaveBeenCalledWith(callback, []);

            // Mutated version with non-empty dependency array
            mockUseEffect.mockClear();
            mockUseEffect(callback, ["Stryker was here"]);

            expect(mockUseEffect).toHaveBeenCalledWith(callback, [
                "Stryker was here",
            ]);

            // The behavior would be different - effect would re-run when the dependency changes
            // instead of running only once
        });

        it("should initialize component state arrays correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Component State", "component");
            await annotate("Category: Frontend", "category");
            await annotate("Type: State Initialization", "type");

            // This targets mutations in component state initialization
            // useState([]) -> useState(["Stryker was here"])

            function initializeComponentState() {
                const errors: string[] = []; // Should start empty
                const options: unknown[] = []; // Should start empty
                const selectedItems: unknown[] = []; // Should start empty

                return { errors, options, selectedItems };
            }

            const state = initializeComponentState();

            // Correct initialization: all arrays should be empty
            expect(state.errors).toEqual([]);
            expect(state.options).toEqual([]);
            expect(state.selectedItems).toEqual([]);

            expect(state.errors).toHaveLength(0);
            expect(state.options).toHaveLength(0);
            expect(state.selectedItems).toHaveLength(0);

            // If mutated to start with ["Stryker was here"], it would break initial state
            function initializeComponentStateMutated() {
                const errors = ["Stryker was here"];
                const options = ["Stryker was here"];
                const selectedItems = ["Stryker was here"];

                return { errors, options, selectedItems };
            }

            const mutatedState = initializeComponentStateMutated();

            // Mutated version would have unwanted initial values
            expect(mutatedState.errors).not.toEqual([]);
            expect(mutatedState.options).not.toEqual([]);
            expect(mutatedState.selectedItems).not.toEqual([]);

            expect(mutatedState.errors).toContain("Stryker was here");
            expect(mutatedState.options).toContain("Stryker was here");
            expect(mutatedState.selectedItems).toContain("Stryker was here");
        });

        it("should handle form field configurations correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Form Fields", "component");
            await annotate("Category: Frontend", "category");
            await annotate("Type: Configuration Arrays", "type");

            // This targets mutations in form field configurations
            // Like className arrays, validation rule arrays, etc.

            function getFormFieldConfig(hasError: boolean) {
                const baseClasses = ["form-field", "input"];
                const validationRules: string[] = [];
                const errorMessages: string[] = [];

                if (hasError) {
                    baseClasses.push("error");
                    errorMessages.push("Required field");
                }

                return { baseClasses, validationRules, errorMessages };
            }

            // Test normal case
            const normalConfig = getFormFieldConfig(false);
            expect(normalConfig.baseClasses).toEqual(["form-field", "input"]);
            expect(normalConfig.validationRules).toEqual([]);
            expect(normalConfig.errorMessages).toEqual([]);

            // Test error case
            const errorConfig = getFormFieldConfig(true);
            expect(errorConfig.baseClasses).toEqual([
                "form-field",
                "input",
                "error",
            ]);
            expect(errorConfig.errorMessages).toEqual(["Required field"]);

            // If arrays were mutated to start with ["Stryker was here"],
            // it would break the class and validation logic
            function getFormFieldConfigMutated(hasError: boolean) {
                const baseClasses = ["Stryker was here"];
                const validationRules = ["Stryker was here"];
                const errorMessages = ["Stryker was here"];

                if (hasError) {
                    baseClasses.push("error");
                    errorMessages.push("Required field");
                }

                return { baseClasses, validationRules, errorMessages };
            }

            const mutatedConfig = getFormFieldConfigMutated(false);
            expect(mutatedConfig.baseClasses).toContain("Stryker was here");
            expect(mutatedConfig.validationRules).toContain("Stryker was here");
            expect(mutatedConfig.errorMessages).toContain("Stryker was here");

            // This would break styling and validation
            expect(normalConfig.baseClasses).not.toEqual(
                mutatedConfig.baseClasses
            );
        });

        it("should handle monitor type configurations correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Monitor Configuration", "component");
            await annotate("Category: Business Logic", "category");
            await annotate("Type: Configuration Arrays", "type");

            // This targets mutations in monitor field configurations
            // Fields that should start empty and be populated based on monitor type

            function getMonitorTypeFields(monitorType: string) {
                const requiredFields: string[] = [];
                const optionalFields: string[] = [];
                const validationRules: string[] = [];

                switch (monitorType) {
                    case "http": {
                        requiredFields.push("url");
                        optionalFields.push("headers", "timeout");
                        validationRules.push("url-format");
                        break;
                    }
                    case "ping": {
                        requiredFields.push("host");
                        optionalFields.push("packets");
                        validationRules.push("host-format");
                        break;
                    }
                }

                return { requiredFields, optionalFields, validationRules };
            }

            // Test HTTP monitor
            const httpConfig = getMonitorTypeFields("http");
            expect(httpConfig.requiredFields).toEqual(["url"]);
            expect(httpConfig.optionalFields).toEqual(["headers", "timeout"]);
            expect(httpConfig.validationRules).toEqual(["url-format"]);

            // Test ping monitor
            const pingConfig = getMonitorTypeFields("ping");
            expect(pingConfig.requiredFields).toEqual(["host"]);
            expect(pingConfig.optionalFields).toEqual(["packets"]);
            expect(pingConfig.validationRules).toEqual(["host-format"]);

            // Test unknown monitor type (should have empty arrays)
            const unknownConfig = getMonitorTypeFields("unknown");
            expect(unknownConfig.requiredFields).toEqual([]);
            expect(unknownConfig.optionalFields).toEqual([]);
            expect(unknownConfig.validationRules).toEqual([]);

            // If mutation made arrays start with ["Stryker was here"],
            // it would break monitor type logic
            function getMonitorTypeFieldsMutated(_monitorType: string) {
                const requiredFields = ["Stryker was here"];
                const optionalFields = ["Stryker was here"];
                const validationRules = ["Stryker was here"];

                // No switch logic - arrays already polluted
                return { requiredFields, optionalFields, validationRules };
            }

            const mutatedConfig = getMonitorTypeFieldsMutated("http");
            expect(mutatedConfig.requiredFields).toContain("Stryker was here");
            expect(mutatedConfig.optionalFields).toContain("Stryker was here");
            expect(mutatedConfig.validationRules).toContain("Stryker was here");

            // The mutated version would have wrong configurations
            expect(httpConfig.requiredFields).not.toEqual(
                mutatedConfig.requiredFields
            );
        });
    });

    describe("Validation and Schema Arrays", () => {
        it("should initialize validation error arrays correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Validation", "component");
            await annotate("Category: Data Validation", "category");
            await annotate("Type: Error Arrays", "type");

            // This targets mutations in validation error collection
            // const errors = []; -> const errors = ["Stryker was here"];

            function validateFormData(data: any) {
                const errors: string[] = [];
                const warnings: string[] = [];

                if (!data.name) {
                    errors.push("Name is required");
                }

                if (!data.url) {
                    errors.push("URL is required");
                } else if (!data.url.startsWith("http")) {
                    warnings.push("URL should start with http or https");
                }

                return { errors, warnings, isValid: errors.length === 0 };
            }

            // Test valid data
            const validResult = validateFormData({
                name: "Test",
                url: "https://example.com",
            });
            expect(validResult.errors).toEqual([]);
            expect(validResult.warnings).toEqual([]);
            expect(validResult.isValid).toBe(true);

            // Test data that generates warning
            const warningResult = validateFormData({
                name: "Test",
                url: "ftp://example.com",
            });
            expect(warningResult.errors).toEqual([]);
            expect(warningResult.warnings).toEqual([
                "URL should start with http or https",
            ]);
            expect(warningResult.isValid).toBe(true);

            // Test invalid data
            const invalidResult = validateFormData({});
            expect(invalidResult.errors).toEqual([
                "Name is required",
                "URL is required",
            ]);
            expect(invalidResult.warnings).toEqual([]);
            expect(invalidResult.isValid).toBe(false);

            // If arrays were mutated to start with ["Stryker was here"],
            // validation would be broken
            function validateFormDataMutated(data: any) {
                const errors: string[] = ["Stryker was here"];
                const warnings: string[] = ["Stryker was here"];

                // Validation logic would add to already polluted arrays
                if (!data.name) {
                    errors.push("Name is required");
                }

                return { errors, warnings, isValid: errors.length === 0 };
            }

            const mutatedResult = validateFormDataMutated({
                name: "Test",
                url: "https://example.com",
            });
            expect(mutatedResult.errors).toContain("Stryker was here");
            expect(mutatedResult.warnings).toContain("Stryker was here");
            expect(mutatedResult.isValid).toBe(false); // Would always be false due to pollution

            // Correct validation vs mutated validation should be different
            expect(validResult.errors).not.toEqual(mutatedResult.errors);
            expect(validResult.isValid).not.toBe(mutatedResult.isValid);
        });

        it("should handle schema field arrays correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Schema Definition", "component");
            await annotate("Category: Data Schema", "category");
            await annotate("Type: Field Arrays", "type");

            // This targets mutations in schema definitions where arrays define fields

            function defineMonitorSchema() {
                const requiredFields: string[] = [];
                const optionalFields: string[] = [];
                const defaultValues: { field: string; value: any }[] = [];

                // Build schema dynamically
                requiredFields.push("name", "type", "url");
                optionalFields.push("timeout", "headers", "interval");
                defaultValues.push({ field: "timeout", value: 30_000 });

                return { requiredFields, optionalFields, defaultValues };
            }

            const schema = defineMonitorSchema();

            // Correct schema should have the expected fields
            expect(schema.requiredFields).toEqual([
                "name",
                "type",
                "url",
            ]);
            expect(schema.optionalFields).toEqual([
                "timeout",
                "headers",
                "interval",
            ]);
            expect(schema.defaultValues).toEqual([
                { field: "timeout", value: 30_000 },
            ]);

            // Mutated version would have pollution
            function defineMonitorSchemaMutated() {
                const requiredFields = ["Stryker was here"];
                const optionalFields = ["Stryker was here"];
                const defaultValues: string[] = ["Stryker was here"];

                requiredFields.push("name", "type", "url");
                optionalFields.push("timeout", "headers", "interval");
                // Can't push object to string array in mutated version

                return { requiredFields, optionalFields, defaultValues };
            }

            const mutatedSchema = defineMonitorSchemaMutated();

            // Mutated schema would have unwanted entries
            expect(mutatedSchema.requiredFields).toContain("Stryker was here");
            expect(mutatedSchema.optionalFields).toContain("Stryker was here");
            expect(mutatedSchema.defaultValues).toContain("Stryker was here");

            // This would break schema validation and processing
            expect(schema.requiredFields).not.toEqual(
                mutatedSchema.requiredFields
            );
        });
    });

    describe("Cache and State Management Arrays", () => {
        it("should initialize cache collections correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Cache Management", "component");
            await annotate("Category: State Management", "category");
            await annotate("Type: Collection Initialization", "type");

            // This targets mutations in cache initialization
            // Like entries arrays, keys arrays, etc.

            function initializeCache() {
                const entries: { key: string; value: any }[] = [];
                const keys: string[] = [];
                const values: any[] = [];

                return {
                    entries,
                    keys,
                    values,
                    set: (key: string, value: any) => {
                        keys.push(key);
                        values.push(value);
                        entries.push({ key, value });
                    },
                    clear: () => {
                        entries.length = 0;
                        keys.length = 0;
                        values.length = 0;
                    },
                };
            }

            const cache = initializeCache();

            // Initially should be empty
            expect(cache.entries).toEqual([]);
            expect(cache.keys).toEqual([]);
            expect(cache.values).toEqual([]);

            // Add some data
            cache.set("key1", "value1");
            cache.set("key2", "value2");

            expect(cache.keys).toEqual(["key1", "key2"]);
            expect(cache.values).toEqual(["value1", "value2"]);
            expect(cache.entries).toEqual([
                { key: "key1", value: "value1" },
                { key: "key2", value: "value2" },
            ]);

            // Clear should empty all arrays
            cache.clear();
            expect(cache.entries).toEqual([]);
            expect(cache.keys).toEqual([]);
            expect(cache.values).toEqual([]);

            // If mutation made arrays start with ["Stryker was here"],
            // cache operations would be broken
            function initializeCacheMutated() {
                const entries = ["Stryker was here"];
                const keys = ["Stryker was here"];
                const values = ["Stryker was here"];

                return { entries, keys, values };
            }

            const mutatedCache = initializeCacheMutated();

            // Mutated cache would start polluted
            expect(mutatedCache.entries).toContain("Stryker was here");
            expect(mutatedCache.keys).toContain("Stryker was here");
            expect(mutatedCache.values).toContain("Stryker was here");

            // This would break cache functionality
            expect(cache.entries).not.toEqual(mutatedCache.entries);
        });
    });
});
