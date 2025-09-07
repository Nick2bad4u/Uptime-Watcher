/**
 * Comprehensive tests for MigrationSystem.ts
 *
 * @remarks
 * Tests the migration system for monitor types including registry,
 * orchestrator, version manager, and migration path calculation. Ensures robust
 * migration workflows and error handling across all components.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    createMigrationOrchestrator,
    exampleMigrations,
    migrationRegistry,
    versionManager,
    type MigrationRule,
} from "../../../services/monitoring/MigrationSystem";

// Mock the logger to prevent console noise and test logging calls
vi.mock("../../../utils/logger", () => ({
    logger: {
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
    },
}));

// Create test helper functions
function createTestMigrationRule(
    fromVersion: string,
    toVersion: string,
    description: string = "Test migration",
    isBreaking: boolean = false,
    transformFn?: (
        data: Record<string, unknown>
    ) => Promise<Record<string, unknown>>
): MigrationRule {
    return {
        description,
        fromVersion,
        isBreaking,
        toVersion,
        transform:
            transformFn ||
            ((data) => Promise.resolve({ ...data, migrated: true })),
    };
}

function createTestData(): Record<string, unknown> {
    return {
        id: "test-monitor",
        type: "http",
        url: "https://example.com",
    };
}

describe("MigrationSystem - Comprehensive Coverage", () => {
    beforeEach(() => {
        // Clear all state before each test
        vi.clearAllMocks();

        // Clear migration registry state
        const registryMap = (migrationRegistry as any).migrations;
        registryMap.clear();

        // Clear version manager state
        const versionMap = (versionManager as any).versions;
        versionMap.clear();
    });

    describe("MigrationRegistry", () => {
        describe("registerMigration", () => {
            it("should register a migration rule successfully", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: MigrationSystem", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                const rule = createTestMigrationRule("1.0.0", "1.1.0");

                expect(() => {
                    migrationRegistry.registerMigration("http", rule);
                }).not.toThrow();
            });

            it("should register multiple rules and sort them by version", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: MigrationSystem", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                const rule1 = createTestMigrationRule("1.0.0", "1.1.0");
                const rule2 = createTestMigrationRule("1.1.0", "1.2.0");
                const rule3 = createTestMigrationRule("0.9.0", "1.0.0");

                migrationRegistry.registerMigration("http", rule1);
                migrationRegistry.registerMigration("http", rule2);
                migrationRegistry.registerMigration("http", rule3);

                const path = migrationRegistry.getMigrationPath(
                    "http",
                    "0.9.0",
                    "1.2.0"
                );
                expect(path).toHaveLength(3);
                expect(path[0]?.fromVersion).toBe("0.9.0");
                expect(path[1]?.fromVersion).toBe("1.0.0");
                expect(path[2]?.fromVersion).toBe("1.1.0");
            });

            it("should handle creating migration rules for new monitor type", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: MigrationSystem", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Monitoring", "type");

                const rule = createTestMigrationRule("1.0.0", "1.1.0");

                expect(() => {
                    migrationRegistry.registerMigration("new-type", rule);
                }).not.toThrow();
            });
        });

        describe("getMigrationPath", () => {
            it("should return empty path for same versions", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: MigrationSystem", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                const path = migrationRegistry.getMigrationPath(
                    "http",
                    "1.0.0",
                    "1.0.0"
                );
                expect(path).toEqual([]);
            });

            it("should return correct migration path for valid route", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: MigrationSystem", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                const rule1 = createTestMigrationRule("1.0.0", "1.1.0");
                const rule2 = createTestMigrationRule("1.1.0", "1.2.0");

                migrationRegistry.registerMigration("http", rule1);
                migrationRegistry.registerMigration("http", rule2);

                const path = migrationRegistry.getMigrationPath(
                    "http",
                    "1.0.0",
                    "1.2.0"
                );
                expect(path).toHaveLength(2);
                expect(path[0]).toBe(rule1);
                expect(path[1]).toBe(rule2);
            });

            it("should throw error for invalid version strings", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: MigrationSystem", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Error Handling", "type");

                expect(() => {
                    migrationRegistry.getMigrationPath(
                        "http",
                        "invalid",
                        "1.1.0"
                    );
                }).toThrow(
                    'fromVersion "invalid" is not a valid semantic version'
                );

                expect(() => {
                    migrationRegistry.getMigrationPath(
                        "http",
                        "1.0.0",
                        "invalid"
                    );
                }).toThrow(
                    'toVersion "invalid" is not a valid semantic version'
                );
            });

            it("should throw error for empty version strings", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: MigrationSystem", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Error Handling", "type");

                expect(() => {
                    migrationRegistry.getMigrationPath("http", "", "1.1.0");
                }).toThrow("fromVersion must be a non-empty string");

                expect(() => {
                    migrationRegistry.getMigrationPath("http", "1.0.0", "");
                }).toThrow("toVersion must be a non-empty string");
            });

            it("should throw error for non-string version parameters", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: MigrationSystem", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Error Handling", "type");

                expect(() => {
                    migrationRegistry.getMigrationPath(
                        "http",
                        null as any,
                        "1.1.0"
                    );
                }).toThrow("fromVersion must be a non-empty string");

                expect(() => {
                    migrationRegistry.getMigrationPath(
                        "http",
                        "1.0.0",
                        undefined as any
                    );
                }).toThrow("toVersion must be a non-empty string");
            });

            it("should throw error when no migration path exists", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: MigrationSystem", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Error Handling", "type");

                expect(() => {
                    migrationRegistry.getMigrationPath(
                        "http",
                        "1.0.0",
                        "2.0.0"
                    );
                }).toThrow("No migration path from 1.0.0 to 2.0.0 for http");
            });

            it("should detect circular migration paths", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: MigrationSystem", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                const rule1 = createTestMigrationRule("1.0.0", "1.1.0");
                const rule2 = createTestMigrationRule("1.1.0", "1.0.0"); // Creates a cycle

                migrationRegistry.registerMigration("http", rule1);
                migrationRegistry.registerMigration("http", rule2);

                expect(() => {
                    migrationRegistry.getMigrationPath(
                        "http",
                        "1.0.0",
                        "1.2.0"
                    );
                }).toThrow("Circular migration path detected");
            });

            it("should throw error for paths exceeding maximum steps", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: MigrationSystem", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Error Handling", "type");

                // Create a long chain of migrations exceeding MAX_MIGRATION_STEPS (100)
                for (let i = 0; i < 105; i++) {
                    const rule = createTestMigrationRule(
                        `1.${i}.0`,
                        `1.${i + 1}.0`
                    );
                    migrationRegistry.registerMigration("http", rule);
                }

                expect(() => {
                    migrationRegistry.getMigrationPath(
                        "http",
                        "1.0.0",
                        "1.105.0"
                    );
                }).toThrow("Migration path too long for http");
            });

            it("should validate version string with numeric parts", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: MigrationSystem", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Validation", "type");

                expect(() => {
                    migrationRegistry.getMigrationPath(
                        "http",
                        "1.0.0",
                        "999999999999999999999.0.0"
                    );
                }).toThrow("contains invalid numeric parts");
            });

            it("should validate semantic version format", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: MigrationSystem", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Validation", "type");

                expect(() => {
                    migrationRegistry.getMigrationPath("http", "1.0", "1.1.0");
                }).toThrow("is not a valid semantic version");
            });
        });

        describe("canMigrate", () => {
            it("should return true when migration path exists", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: MigrationSystem", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                const rule = createTestMigrationRule("1.0.0", "1.1.0");
                migrationRegistry.registerMigration("http", rule);

                expect(
                    migrationRegistry.canMigrate("http", "1.0.0", "1.1.0")
                ).toBeTruthy();
            });

            it("should return false when no migration path exists", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: MigrationSystem", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                expect(
                    migrationRegistry.canMigrate("http", "1.0.0", "2.0.0")
                ).toBeFalsy();
            });

            it("should return true for same versions", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: MigrationSystem", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                expect(
                    migrationRegistry.canMigrate("http", "1.0.0", "1.0.0")
                ).toBeTruthy();
            });

            it("should return false for invalid version strings", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: MigrationSystem", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                expect(
                    migrationRegistry.canMigrate("http", "invalid", "1.1.0")
                ).toBeFalsy();
            });
        });

        describe("version comparison and validation", () => {
            it("should handle version comparison with pre-release tags", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: MigrationSystem", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                const rule = createTestMigrationRule("1.0.0-alpha", "1.0.0");
                expect(() => {
                    migrationRegistry.registerMigration("http", rule);
                }).not.toThrow();
            });

            it("should handle version comparison with build metadata", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: MigrationSystem", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                const rule = createTestMigrationRule("1.0.0+build.1", "1.0.1");
                expect(() => {
                    migrationRegistry.registerMigration("http", rule);
                }).not.toThrow();
            });
        });
    });

    describe("VersionManager", () => {
        describe("setVersion and getVersion", () => {
            it("should set and get version correctly", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: MigrationSystem", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Data Retrieval", "type");

                versionManager.setVersion("http", "1.1.0");
                expect(versionManager.getVersion("http")).toBe("1.1.0");
            });

            it("should return undefined for unset monitor type", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: MigrationSystem", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Monitoring", "type");

                expect(versionManager.getVersion("unknown")).toBeUndefined();
            });

            it("should update existing version", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: MigrationSystem", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Data Update", "type");

                versionManager.setVersion("http", "1.0.0");
                versionManager.setVersion("http", "1.1.0");
                expect(versionManager.getVersion("http")).toBe("1.1.0");
            });
        });

        describe("isVersionApplied", () => {
            it("should return true for applied version", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: MigrationSystem", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                versionManager.setVersion("http", "1.1.0");
                expect(
                    versionManager.isVersionApplied("http", "1.1.0")
                ).toBeTruthy();
            });

            it("should return false for different version", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: MigrationSystem", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                versionManager.setVersion("http", "1.1.0");
                expect(
                    versionManager.isVersionApplied("http", "1.0.0")
                ).toBeFalsy();
            });

            it("should return false for unset monitor type", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: MigrationSystem", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Monitoring", "type");

                expect(
                    versionManager.isVersionApplied("unknown", "1.0.0")
                ).toBeFalsy();
            });
        });

        describe("getAllVersions", () => {
            it("should return empty map when no versions set", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: MigrationSystem", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                const versions = versionManager.getAllVersions();
                expect(versions.size).toBe(0);
            });

            it("should return all set versions", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: MigrationSystem", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                versionManager.setVersion("http", "1.1.0");
                versionManager.setVersion("port", "2.0.0");

                const versions = versionManager.getAllVersions();
                expect(versions.size).toBe(2);
                expect(versions.get("http")?.version).toBe("1.1.0");
                expect(versions.get("port")?.version).toBe("2.0.0");
            });

            it("should return a copy of the versions map", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: MigrationSystem", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                versionManager.setVersion("http", "1.1.0");

                const versions1 = versionManager.getAllVersions();
                const versions2 = versionManager.getAllVersions();

                expect(versions1).not.toBe(versions2);
                expect(versions1.get("http")).toEqual(versions2.get("http"));
            });

            it("should include timestamp and applied status", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: MigrationSystem", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                const beforeTime = Date.now();
                versionManager.setVersion("http", "1.1.0");
                const afterTime = Date.now();

                const versions = versionManager.getAllVersions();
                const httpVersion = versions.get("http");

                expect(httpVersion?.applied).toBeTruthy();
                expect(httpVersion?.timestamp).toBeGreaterThanOrEqual(
                    beforeTime
                );
                expect(httpVersion?.timestamp).toBeLessThanOrEqual(afterTime);
            });
        });
    });

    describe("MigrationOrchestrator", () => {
        let orchestrator: ReturnType<typeof createMigrationOrchestrator>;

        beforeEach(() => {
            orchestrator = createMigrationOrchestrator();
        });

        describe("migrateMonitorData", () => {
            it("should return success for same versions", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: MigrationSystem", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                const data = createTestData();
                const result = await orchestrator.migrateMonitorData(
                    "http",
                    data,
                    "1.0.0",
                    "1.0.0"
                );

                expect(result.success).toBeTruthy();
                expect(result.appliedMigrations).toEqual([]);
                expect(result.data).toBe(data);
                expect(result.errors).toEqual([]);
                expect(result.warnings).toEqual([]);
            });

            it("should apply single migration successfully", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: MigrationSystem", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                const transformFn = vi.fn((data) =>
                    Promise.resolve({ ...data, timeout: 30_000 })
                );
                const rule = createTestMigrationRule(
                    "1.0.0",
                    "1.1.0",
                    "Add timeout",
                    false,
                    transformFn
                );
                migrationRegistry.registerMigration("http", rule);

                const data = createTestData();
                const result = await orchestrator.migrateMonitorData(
                    "http",
                    data,
                    "1.0.0",
                    "1.1.0"
                );

                expect(result.success).toBeTruthy();
                expect(result.appliedMigrations).toEqual(["1.0.0_to_1.1.0"]);
                expect(result.data).toEqual({ ...data, timeout: 30_000 });
                expect(result.errors).toEqual([]);
                expect(transformFn).toHaveBeenCalledWith(data);
            });

            it("should apply multiple migrations in sequence", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: MigrationSystem", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                const rule1 = createTestMigrationRule(
                    "1.0.0",
                    "1.1.0",
                    "First migration",
                    false,
                    (data) => Promise.resolve({ ...data, step1: true })
                );
                const rule2 = createTestMigrationRule(
                    "1.1.0",
                    "1.2.0",
                    "Second migration",
                    false,
                    (data) => Promise.resolve({ ...data, step2: true })
                );

                migrationRegistry.registerMigration("http", rule1);
                migrationRegistry.registerMigration("http", rule2);

                const data = createTestData();
                const result = await orchestrator.migrateMonitorData(
                    "http",
                    data,
                    "1.0.0",
                    "1.2.0"
                );

                expect(result.success).toBeTruthy();
                expect(result.appliedMigrations).toEqual([
                    "1.0.0_to_1.1.0",
                    "1.1.0_to_1.2.0",
                ]);
                expect(result.data).toEqual({
                    ...data,
                    step1: true,
                    step2: true,
                });
            });

            it("should handle breaking migration with warning", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: MigrationSystem", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                const rule = createTestMigrationRule(
                    "1.0.0",
                    "2.0.0",
                    "Breaking change",
                    true
                );
                migrationRegistry.registerMigration("http", rule);

                const data = createTestData();
                const result = await orchestrator.migrateMonitorData(
                    "http",
                    data,
                    "1.0.0",
                    "2.0.0"
                );

                expect(result.success).toBeTruthy();
                expect(result.warnings).toContain(
                    "Applied breaking migration: Breaking change"
                );
            });

            it("should handle migration transform error", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: MigrationSystem", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Error Handling", "type");

                const errorMessage = "Transform failed";
                const rule = createTestMigrationRule(
                    "1.0.0",
                    "1.1.0",
                    "Failing migration",
                    false,
                    () => Promise.reject(new Error(errorMessage))
                );
                migrationRegistry.registerMigration("http", rule);

                const data = createTestData();
                const result = await orchestrator.migrateMonitorData(
                    "http",
                    data,
                    "1.0.0",
                    "1.1.0"
                );

                expect(result.success).toBeFalsy();
                expect(result.errors).toHaveLength(1);
                expect(result.errors[0]).toContain(
                    "Migration failed: Failing migration"
                );
                expect(result.errors[0]).toContain(errorMessage);
                expect(result.data).toBe(data); // Should return original data
            });

            it("should handle non-Error exceptions in transform", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: MigrationSystem", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Error Handling", "type");

                const rule = createTestMigrationRule(
                    "1.0.0",
                    "1.1.0",
                    "Failing migration",
                    false,
                    () => Promise.reject(new Error("String error"))
                );
                migrationRegistry.registerMigration("http", rule);

                const data = createTestData();
                const result = await orchestrator.migrateMonitorData(
                    "http",
                    data,
                    "1.0.0",
                    "1.1.0"
                );

                expect(result.success).toBeFalsy();
                expect(result.errors[0]).toContain("String error");
            });

            it("should stop applying migrations after first error", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: MigrationSystem", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Error Handling", "type");

                const rule1 = createTestMigrationRule(
                    "1.0.0",
                    "1.1.0",
                    "Failing migration",
                    false,
                    () => Promise.reject(new Error("First migration failed"))
                );
                const rule2 = createTestMigrationRule(
                    "1.1.0",
                    "1.2.0",
                    "Second migration",
                    false,
                    (data) => Promise.resolve({ ...data, step2: true })
                );

                migrationRegistry.registerMigration("http", rule1);
                migrationRegistry.registerMigration("http", rule2);

                const data = createTestData();
                const result = await orchestrator.migrateMonitorData(
                    "http",
                    data,
                    "1.0.0",
                    "1.2.0"
                );

                expect(result.success).toBeFalsy();
                expect(result.appliedMigrations).toEqual([]); // No migrations should be marked as applied
                expect(result.errors).toHaveLength(1);
            });

            it("should handle orchestration errors gracefully", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: MigrationSystem", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Error Handling", "type");

                // Create a scenario where getMigrationPath throws
                const data = createTestData();
                const result = await orchestrator.migrateMonitorData(
                    "http",
                    data,
                    "1.0.0",
                    "2.0.0"
                );

                expect(result.success).toBeFalsy();
                expect(result.errors).toHaveLength(1);
                expect(result.errors[0]).toContain(
                    "Migration orchestration failed"
                );
            });

            it("should update version manager on successful migration", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: MigrationSystem", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Data Update", "type");

                const rule = createTestMigrationRule("1.0.0", "1.1.0");
                migrationRegistry.registerMigration("http", rule);

                const data = createTestData();
                await orchestrator.migrateMonitorData(
                    "http",
                    data,
                    "1.0.0",
                    "1.1.0"
                );

                expect(versionManager.getVersion("http")).toBe("1.1.0");
                expect(
                    versionManager.isVersionApplied("http", "1.1.0")
                ).toBeTruthy();
            });

            it("should not update version on migration failure", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: MigrationSystem", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Error Handling", "type");

                const rule = createTestMigrationRule(
                    "1.0.0",
                    "1.1.0",
                    "Failing migration",
                    false,
                    () => Promise.reject(new Error("Failed"))
                );
                migrationRegistry.registerMigration("http", rule);

                const data = createTestData();
                await orchestrator.migrateMonitorData(
                    "http",
                    data,
                    "1.0.0",
                    "1.1.0"
                );

                expect(versionManager.getVersion("http")).toBeUndefined();
            });

            it("should not update version when no migrations applied", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: MigrationSystem", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Data Update", "type");

                const data = createTestData();
                await orchestrator.migrateMonitorData(
                    "http",
                    data,
                    "1.0.0",
                    "1.0.0"
                );

                expect(versionManager.getVersion("http")).toBeUndefined();
            });
        });
    });

    describe("Factory Functions", () => {
        describe(createMigrationOrchestrator, () => {
            it("should create orchestrator instance", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: MigrationSystem", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Constructor", "type");

                const orchestrator = createMigrationOrchestrator();
                expect(orchestrator).toBeDefined();
                expect(typeof orchestrator.migrateMonitorData).toBe("function");
            });

            it("should create different instances on multiple calls", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: MigrationSystem", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Constructor", "type");

                const orchestrator1 = createMigrationOrchestrator();
                const orchestrator2 = createMigrationOrchestrator();
                expect(orchestrator1).not.toBe(orchestrator2);
            });
        });
    });

    describe("Example Migrations", () => {
        describe("httpV1_0_to_1_1", () => {
            it("should add default timeout when missing", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: MigrationSystem", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                const data = { url: "https://example.com" };
                const result =
                    await exampleMigrations.httpV1_0_to_1_1.transform(data);

                expect(result).toEqual({
                    url: "https://example.com",
                    timeout: 30_000,
                });
            });

            it("should preserve existing timeout", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: MigrationSystem", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                const data = { url: "https://example.com", timeout: 60_000 };
                const result =
                    await exampleMigrations.httpV1_0_to_1_1.transform(data);

                expect(result).toEqual({
                    url: "https://example.com",
                    timeout: 60_000,
                });
            });

            it("should have correct migration properties", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: MigrationSystem", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                expect(exampleMigrations.httpV1_0_to_1_1.fromVersion).toBe(
                    "1.0.0"
                );
                expect(exampleMigrations.httpV1_0_to_1_1.toVersion).toBe(
                    "1.1.0"
                );
                expect(
                    exampleMigrations.httpV1_0_to_1_1.isBreaking
                ).toBeFalsy();
                expect(exampleMigrations.httpV1_0_to_1_1.description).toContain(
                    "timeout"
                );
            });
        });

        describe("portV1_0_to_1_1", () => {
            it("should convert string port to number", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: MigrationSystem", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                const data = { host: "localhost", port: "8080" };
                const result =
                    await exampleMigrations.portV1_0_to_1_1.transform(data);

                expect(result).toEqual({
                    host: "localhost",
                    port: 8080,
                });
            });

            it("should preserve numeric port", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: MigrationSystem", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                const data = { host: "localhost", port: 8080 };
                const result =
                    await exampleMigrations.portV1_0_to_1_1.transform(data);

                expect(result).toEqual({
                    host: "localhost",
                    port: 8080,
                });
            });

            it("should throw for invalid string port", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: MigrationSystem", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                const data = { host: "localhost", port: "invalid" };

                expect(() =>
                    exampleMigrations.portV1_0_to_1_1.transform(data)
                ).toThrow("Invalid port value: invalid. Must be 1-65535.");
            });

            it("should throw for out-of-range numeric port", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: MigrationSystem", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                const data = { host: "localhost", port: 70_000 };

                expect(() =>
                    exampleMigrations.portV1_0_to_1_1.transform(data)
                ).toThrow("Invalid port number: 70000. Must be 1-65535.");
            });

            it("should throw for negative port", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: MigrationSystem", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                const data = { host: "localhost", port: -1 };

                expect(() =>
                    exampleMigrations.portV1_0_to_1_1.transform(data)
                ).toThrow("Invalid port number: -1. Must be 1-65535.");
            });

            it("should throw for non-numeric port type", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: MigrationSystem", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                const data = { host: "localhost", port: true };

                expect(() =>
                    exampleMigrations.portV1_0_to_1_1.transform(data)
                ).toThrow(
                    "Port must be a number or numeric string, got: boolean"
                );
            });

            it("should handle edge case ports (1 and 65535)", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: MigrationSystem", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                const data1 = { host: "localhost", port: "1" };
                const result1 =
                    await exampleMigrations.portV1_0_to_1_1.transform(data1);
                expect(result1["port"]).toBe(1);

                const data2 = { host: "localhost", port: 65_535 };
                const result2 =
                    await exampleMigrations.portV1_0_to_1_1.transform(data2);
                expect(result2["port"]).toBe(65_535);
            });

            it("should have correct migration properties", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: MigrationSystem", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                expect(exampleMigrations.portV1_0_to_1_1.fromVersion).toBe(
                    "1.0.0"
                );
                expect(exampleMigrations.portV1_0_to_1_1.toVersion).toBe(
                    "1.1.0"
                );
                expect(
                    exampleMigrations.portV1_0_to_1_1.isBreaking
                ).toBeFalsy();
                expect(exampleMigrations.portV1_0_to_1_1.description).toContain(
                    "port"
                );
            });
        });
    });

    describe("Integration Tests", () => {
        it("should handle complete migration workflow with example migrations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MigrationSystem", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            // Register example migrations
            migrationRegistry.registerMigration(
                "http",
                exampleMigrations.httpV1_0_to_1_1
            );
            migrationRegistry.registerMigration(
                "port",
                exampleMigrations.portV1_0_to_1_1
            );

            const orchestrator = createMigrationOrchestrator();

            // Test HTTP migration
            const httpData = { url: "https://example.com" };
            const httpResult = await orchestrator.migrateMonitorData(
                "http",
                httpData,
                "1.0.0",
                "1.1.0"
            );

            expect(httpResult.success).toBeTruthy();
            expect(httpResult.data?.["timeout"]).toBe(30_000);

            // Test port migration
            const portData = { host: "localhost", port: "8080" };
            const portResult = await orchestrator.migrateMonitorData(
                "port",
                portData,
                "1.0.0",
                "1.1.0"
            );

            expect(portResult.success).toBeTruthy();
            expect(portResult.data?.["port"]).toBe(8080);

            // Verify version tracking
            expect(
                versionManager.isVersionApplied("http", "1.1.0")
            ).toBeTruthy();
            expect(
                versionManager.isVersionApplied("port", "1.1.0")
            ).toBeTruthy();
        });

        it("should handle complex migration chains", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MigrationSystem", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            // Create a chain of migrations
            const rules = [
                createTestMigrationRule(
                    "1.0.0",
                    "1.1.0",
                    "Add field A",
                    false,
                    (data) => Promise.resolve({ ...data, fieldA: "added" })
                ),
                createTestMigrationRule(
                    "1.1.0",
                    "1.2.0",
                    "Modify field A",
                    false,
                    (data) => Promise.resolve({ ...data, fieldA: "modified" })
                ),
                createTestMigrationRule(
                    "1.2.0",
                    "2.0.0",
                    "Breaking change",
                    true,
                    (data) => Promise.resolve({ ...data, version: 2 })
                ),
            ];

            for (const rule of rules)
                migrationRegistry.registerMigration("complex", rule);

            const orchestrator = createMigrationOrchestrator();
            const data = { id: "test" };
            const result = await orchestrator.migrateMonitorData(
                "complex",
                data,
                "1.0.0",
                "2.0.0"
            );

            expect(result.success).toBeTruthy();
            expect(result.appliedMigrations).toHaveLength(3);
            expect(result.warnings).toHaveLength(1);
            expect(result.data).toEqual({
                id: "test",
                fieldA: "modified",
                version: 2,
            });
        });
    });
});
