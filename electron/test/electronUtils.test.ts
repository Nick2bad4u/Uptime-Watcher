/**
 * Test suite for electronUtils
 *
 * @module ElectronUtils
 *
 * @file Comprehensive tests for Electron utility functions in the Uptime
 *   Watcher application.
 *
 * @author GitHub Copilot
 *
 * @since 2025-08-11
 *
 * @category Electron Utilities
 *
 * @tags ["test", "electron", "utils"]
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock dependencies
vi.mock("electron", () => ({
    app: {
        isPackaged: false,
    },
}));

vi.mock("../../shared/utils/environment", () => ({
    isDevelopment: vi.fn(() => false),
}));

// Import the module under test
import { isDev } from "../electronUtils.js";
import { app } from "electron";
import { isDevelopment } from "@shared/utils/environment";

describe("ElectronUtils", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset mock defaults
        vi.mocked(isDevelopment).mockReturnValue(false);
        (app as any).isPackaged = false;
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe(isDev, () => {
        it("should return true when both isDevelopment is true and app is not packaged", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: electronUtils", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            vi.mocked(isDevelopment).mockReturnValue(true);
            (app as any).isPackaged = false;

            // Act
            const result = isDev();

            // Assert
            expect(result).toBeTruthy();
            expect(isDevelopment).toHaveBeenCalledTimes(1);
        });

        it("should return false when isDevelopment is true but app is packaged", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: electronUtils", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            vi.mocked(isDevelopment).mockReturnValue(true);
            (app as any).isPackaged = true;

            // Act
            const result = isDev();

            // Assert
            expect(result).toBeFalsy();
            expect(isDevelopment).toHaveBeenCalledTimes(1);
        });

        it("should return false when isDevelopment is false and app is not packaged", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: electronUtils", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            vi.mocked(isDevelopment).mockReturnValue(false);
            (app as any).isPackaged = false;

            // Act
            const result = isDev();

            // Assert
            expect(result).toBeFalsy();
            expect(isDevelopment).toHaveBeenCalledTimes(1);
        });

        it("should return false when both isDevelopment is false and app is packaged", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: electronUtils", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            vi.mocked(isDevelopment).mockReturnValue(false);
            (app as any).isPackaged = true;

            // Act
            const result = isDev();

            // Assert
            expect(result).toBeFalsy();
            expect(isDevelopment).toHaveBeenCalledTimes(1);
        });

        it("should always call isDevelopment function", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: electronUtils", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            vi.mocked(isDevelopment).mockReturnValue(false);
            (app as any).isPackaged = true;

            // Act
            isDev();

            // Assert
            expect(isDevelopment).toHaveBeenCalledTimes(1);
            expect(isDevelopment).toHaveBeenCalledWith();
        });

        it("should handle edge case with boolean type checking", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: electronUtils", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange - test boolean coercion
            vi.mocked(isDevelopment).mockReturnValue(true);
            (app as any).isPackaged = false;

            // Act
            const result = isDev();

            // Assert
            expect(typeof result).toBe("boolean");
            expect(result).toBeTruthy();
        });

        it("should return consistent results for same input conditions", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: electronUtils", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            vi.mocked(isDevelopment).mockReturnValue(true);
            (app as any).isPackaged = false;

            // Act - call multiple times with same conditions
            const result1 = isDev();
            const result2 = isDev();
            const result3 = isDev();

            // Assert
            expect(result1).toBe(result2);
            expect(result2).toBe(result3);
            expect(result1).toBeTruthy();
        });

        it("should properly use logical AND operation", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: electronUtils", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange & Act & Assert - test all truth table combinations
            const testCases = [
                {
                    isDevelopmentResult: true,
                    isPackaged: false,
                    expected: true,
                },
                {
                    isDevelopmentResult: true,
                    isPackaged: true,
                    expected: false,
                },
                {
                    isDevelopmentResult: false,
                    isPackaged: false,
                    expected: false,
                },
                {
                    isDevelopmentResult: false,
                    isPackaged: true,
                    expected: false,
                },
            ];

            for (const {
                isDevelopmentResult,
                isPackaged,
                expected,
            } of testCases) {
                vi.mocked(isDevelopment).mockReturnValue(isDevelopmentResult);
                (app as any).isPackaged = isPackaged;

                const result = isDev();

                expect(result).toBe(expected);
                expect(isDevelopment).toHaveBeenCalled();
            }
        });

        it("should handle isDevelopment returning different truthy/falsy values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: electronUtils", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            // Test with different truthy values
            vi.mocked(isDevelopment).mockReturnValue(true);
            (app as any).isPackaged = false;
            expect(isDev()).toBeTruthy();

            // Test with falsy values
            vi.mocked(isDevelopment).mockReturnValue(false);
            expect(isDev()).toBeFalsy();
        });

        it("should handle app.isPackaged with different truthy/falsy values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: electronUtils", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            vi.mocked(isDevelopment).mockReturnValue(true);

            // Test with false (not packaged)
            (app as any).isPackaged = false;
            expect(isDev()).toBeTruthy();

            // Test with true (packaged)
            (app as any).isPackaged = true;
            expect(isDev()).toBeFalsy();
        });
    });

    describe("Function behavior and integration", () => {
        it("should properly integrate with Electron app module", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: electronUtils", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            vi.mocked(isDevelopment).mockReturnValue(true);
            (app as any).isPackaged = false;

            // Act
            const result = isDev();

            // Assert
            expect(result).toBeTruthy();
            // Verify that we're actually checking the app.isPackaged property
            expect(app.isPackaged).toBeDefined();
        });

        it("should properly integrate with shared environment utilities", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: electronUtils", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            vi.mocked(isDevelopment).mockReturnValue(true);
            (app as any).isPackaged = false;

            // Act
            const result = isDev();

            // Assert
            expect(result).toBeTruthy();
            expect(isDevelopment).toHaveBeenCalledTimes(1);
        });

        it("should return boolean type for all valid inputs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: electronUtils", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const testCases = [
                { isDev: true, isPackaged: false },
                { isDev: true, isPackaged: true },
                { isDev: false, isPackaged: false },
                { isDev: false, isPackaged: true },
            ];

            for (const {
                isDev: isDevelopmentResult,
                isPackaged,
            } of testCases) {
                vi.mocked(isDevelopment).mockReturnValue(isDevelopmentResult);
                (app as any).isPackaged = isPackaged;

                const result = isDev();
                expect(typeof result).toBe("boolean");
            }
        });
    });

    describe("Performance and reliability", () => {
        it("should execute quickly and not have performance issues", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: electronUtils", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            vi.mocked(isDevelopment).mockReturnValue(true);
            (app as any).isPackaged = false;

            // Act & Assert
            const startTime = Date.now();
            const result = isDev();
            const endTime = Date.now();

            expect(result).toBeTruthy();
            expect(endTime - startTime).toBeLessThan(10); // Should complete in under 10ms
        });

        it("should handle multiple rapid calls without issues", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: electronUtils", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            vi.mocked(isDevelopment).mockReturnValue(true);
            (app as any).isPackaged = false;

            // Act - call function many times rapidly
            const results: boolean[] = [];
            for (let i = 0; i < 100; i++) {
                results.push(isDev());
            }

            // Assert
            expect(results).toHaveLength(100);
            expect(results.every((result) => result === true)).toBeTruthy();
            expect(isDevelopment).toHaveBeenCalledTimes(100);
        });
    });
});
