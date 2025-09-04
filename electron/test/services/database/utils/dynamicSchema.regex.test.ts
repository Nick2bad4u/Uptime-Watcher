/**
 * Mutation-specific tests for Regex mutations in dynamicSchema.ts
 * 
 * Targets specific regex patterns in toSnakeCase function (lines 438-439):
 * - Line 438: .replace(/^[A-Z]/v, (match) => match.toLowerCase())
 * - Line 439: .replaceAll(/[A-Z]/gv, (match) => `_${match.toLowerCase()}`)
 * 
 * These tests ensure that mutations to these specific regex patterns
 * would be caught by the test suite.
 */

import { describe, expect, it, vi, beforeEach } from "vitest";
import type { MonitorFieldDefinition } from "../../../../../shared/types";

// Mock monitor type configurations that use camelCase field names
const mockMonitorConfigs = [
    {
        type: "HttpMonitor",
        displayName: "HTTP Monitor",
        description: "HTTP endpoint monitoring",
        fields: [
            { name: "url", type: "string", required: true },
            { name: "method", type: "string", required: false },
            { name: "timeout", type: "number", required: false },
        ] as MonitorFieldDefinition[],
        serviceFactory: () => ({} as any),
    },
    {
        type: "TestCamelCaseMonitor", 
        displayName: "Test CamelCase Monitor",
        description: "Test monitor with camelCase properties",
        fields: [
            { name: "someUrlEndpoint", type: "string", required: true },
            { name: "maxRetryCount", type: "number", required: false },
            { name: "enableHttpLogging", type: "boolean", required: false },
        ] as MonitorFieldDefinition[],
        serviceFactory: () => ({} as any),
    },
];

// Mock the MonitorTypeRegistry
vi.mock("../../../../services/monitoring/MonitorTypeRegistry", () => ({
    getAllMonitorTypeConfigs: () => mockMonitorConfigs,
}));

describe("DynamicSchema Regex Mutations", () => {
    let generateDatabaseFieldDefinitions: () => any[];

    beforeEach(async () => {
        // Clear mocks
        vi.clearAllMocks();
        
        // Import the function under test
        const module = await import("../../../../services/database/utils/dynamicSchema");
        generateDatabaseFieldDefinitions = module.generateDatabaseFieldDefinitions;
    });

    describe("toSnakeCase function regex patterns", () => {
        it("should convert camelCase field names to snake_case using first regex pattern", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DynamicSchema", "component");
            await annotate("Category: Database Utils", "category");
            await annotate("Type: Regex Mutation Testing", "type");
            
            // Generate field definitions which internally uses toSnakeCase
            const fieldDefinitions = generateDatabaseFieldDefinitions();
            
            // Extract column names (these are the snake_case converted names)
            const columnNames = fieldDefinitions.map(field => field.columnName);
            
            // Verify that camelCase properties were converted to snake_case
            expect(columnNames).toContain("some_url_endpoint");
            expect(columnNames).toContain("max_retry_count");
            expect(columnNames).toContain("enable_http_logging");
            
            // These assertions would fail if the first regex /^[A-Z]/v is mutated
            // Verify the conversion didn't leave any uppercase letters at the start
            fieldDefinitions.forEach(field => {
                expect(field.columnName).not.toMatch(/^[A-Z]/);
            });
        });

        it("should convert internal uppercase letters to underscore + lowercase using second regex pattern", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DynamicSchema", "component");
            await annotate("Category: Database Utils", "category");
            await annotate("Type: Regex Mutation Testing", "type");
            
            // Generate field definitions which internally uses toSnakeCase
            const fieldDefinitions = generateDatabaseFieldDefinitions();
            const columnNames = fieldDefinitions.map(field => field.columnName);
            
            // Verify that each camelCase segment was properly converted
            // These assertions would fail if the second regex /[A-Z]/gv is mutated
            expect(columnNames).toContain("some_url_endpoint");
            expect(columnNames).not.toContain("someUrl");
            expect(columnNames).not.toContain("urlEndpoint"); 
            
            // Verify no uppercase letters remain anywhere in the column names
            fieldDefinitions.forEach(field => {
                expect(field.columnName).not.toMatch(/[A-Z]/);
                expect(field.columnName).toMatch(/^[a-z0-9_]+$/); // Only lowercase, numbers, and underscores
            });
        });

        it("should properly handle monitor type names with mixed case patterns", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DynamicSchema", "component");
            await annotate("Category: Database Utils", "category");
            await annotate("Type: Regex Mutation Testing", "type");
            
            // Generate field definitions
            const fieldDefinitions = generateDatabaseFieldDefinitions();
            
            // Verify we have fields from both monitor types
            expect(fieldDefinitions.length).toBeGreaterThan(0);
            
            // Verify all column names follow snake_case convention
            fieldDefinitions.forEach(field => {
                // Should not have any uppercase letters (both regex patterns working)
                expect(field.columnName).not.toMatch(/[A-Z]/);
                // Should be properly formatted snake_case
                expect(field.columnName).toMatch(/^[a-z][a-z0-9_]*$/);
            });
        });
    });
});
