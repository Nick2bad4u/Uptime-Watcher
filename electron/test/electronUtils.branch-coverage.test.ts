/**
 * Branch coverage tests for electronUtils.ts
 *
 * Current coverage: 50% branch coverage
 * Goal: Increase to 98%+ branch coverage
 *
 * The electronUtils module exports isDev() function which checks
 * both NODE_ENV=development and app.isPackaged status.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

// Hoist mocks to top level
const mockApp = {
    isPackaged: false,
};

vi.mock("electron", () => ({
    app: mockApp,
}));

vi.mock("../../shared/utils/environment.js", () => ({
    isDevelopment: vi.fn(),
}));

describe("electronUtils.ts - Branch Coverage", () => {
    let electronUtils: any;

    beforeEach(async () => {
        vi.clearAllMocks();
        electronUtils = await import("../electronUtils.js");
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe("isDev Function - All Branch Combinations", () => {
        it("should return true when NODE_ENV is development AND app is not packaged", async () => {
            // Mock isDevelopment to return true
            const { isDevelopment } = await import(
                "../../shared/utils/environment.js"
            );
            (isDevelopment as any).mockReturnValue(true);

            // Ensure app is not packaged
            mockApp.isPackaged = false;

            const result = electronUtils.isDev();
            expect(result).toBe(true);
        });

        it("should return false when NODE_ENV is development BUT app is packaged", async () => {
            // Mock isDevelopment to return true
            const { isDevelopment } = await import(
                "../../shared/utils/environment.js"
            );
            (isDevelopment as any).mockReturnValue(true);

            // Set app as packaged
            mockApp.isPackaged = true;

            const result = electronUtils.isDev();
            expect(result).toBe(false);
        });

        it("should return false when app is not packaged BUT NODE_ENV is not development", async () => {
            // Mock isDevelopment to return false (production/test/other)
            const { isDevelopment } = await import(
                "../../shared/utils/environment.js"
            );
            (isDevelopment as any).mockReturnValue(false);

            // Ensure app is not packaged
            mockApp.isPackaged = false;

            const result = electronUtils.isDev();
            expect(result).toBe(false);
        });

        it("should return false when NODE_ENV is production AND app is packaged", async () => {
            // Mock isDevelopment to return false
            const { isDevelopment } = await import(
                "../../shared/utils/environment.js"
            );
            (isDevelopment as any).mockReturnValue(false);

            // Set app as packaged
            mockApp.isPackaged = true;

            const result = electronUtils.isDev();
            expect(result).toBe(false);
        });
    });

    describe("Edge Cases and Boundary Conditions", () => {
        it("should handle undefined NODE_ENV (falsy) and not packaged", async () => {
            const { isDevelopment } = await import(
                "../../shared/utils/environment.js"
            );
            (isDevelopment as any).mockReturnValue(false); // undefined NODE_ENV means not development

            mockApp.isPackaged = false;

            const result = electronUtils.isDev();
            expect(result).toBe(false);
        });

        it("should handle NODE_ENV as test and packaged app", async () => {
            const { isDevelopment } = await import(
                "../../shared/utils/environment.js"
            );
            (isDevelopment as any).mockReturnValue(false); // NODE_ENV=test is not development

            mockApp.isPackaged = true;

            const result = electronUtils.isDev();
            expect(result).toBe(false);
        });

        it("should handle various NODE_ENV values consistently", async () => {
            const { isDevelopment } = await import(
                "../../shared/utils/environment.js"
            );
            mockApp.isPackaged = false;

            // Test with development
            (isDevelopment as any).mockReturnValue(true);
            expect(electronUtils.isDev()).toBe(true);

            // Test with production
            (isDevelopment as any).mockReturnValue(false);
            expect(electronUtils.isDev()).toBe(false);

            // Test with test environment
            (isDevelopment as any).mockReturnValue(false);
            expect(electronUtils.isDev()).toBe(false);
        });
    });

    describe("Integration with app.isPackaged", () => {
        it("should correctly evaluate app packaging status in all scenarios", async () => {
            const { isDevelopment } = await import(
                "../../shared/utils/environment.js"
            );

            // Test matrix of all combinations
            const testCases = [
                { isDev: true, isPackaged: false, expected: true },
                { isDev: true, isPackaged: true, expected: false },
                { isDev: false, isPackaged: false, expected: false },
                { isDev: false, isPackaged: true, expected: false },
            ];

            for (const testCase of testCases) {
                (isDevelopment as any).mockReturnValue(testCase.isDev);
                mockApp.isPackaged = testCase.isPackaged;

                const result = electronUtils.isDev();
                expect(result).toBe(testCase.expected);
            }
        });
    });

    describe("Real-world Usage Scenarios", () => {
        it("should behave correctly in typical development setup", async () => {
            // Typical development: NODE_ENV=development, unpackaged
            const { isDevelopment } = await import(
                "../../shared/utils/environment.js"
            );
            (isDevelopment as any).mockReturnValue(true);
            mockApp.isPackaged = false;

            expect(electronUtils.isDev()).toBe(true);
        });

        it("should behave correctly in production build", async () => {
            // Production: NODE_ENV=production, packaged
            const { isDevelopment } = await import(
                "../../shared/utils/environment.js"
            );
            (isDevelopment as any).mockReturnValue(false);
            mockApp.isPackaged = true;

            expect(electronUtils.isDev()).toBe(false);
        });

        it("should behave correctly in testing environment", async () => {
            // Testing: NODE_ENV=test, not packaged
            const { isDevelopment } = await import(
                "../../shared/utils/environment.js"
            );
            (isDevelopment as any).mockReturnValue(false);
            mockApp.isPackaged = false;

            expect(electronUtils.isDev()).toBe(false);
        });
    });

    describe("Function Behavior Validation", () => {
        it("should have the correct function signature", () => {
            expect(typeof electronUtils.isDev).toBe("function");
            expect(electronUtils.isDev.length).toBe(0); // No parameters
        });

        it("should return a boolean value consistently", async () => {
            const { isDevelopment } = await import(
                "../../shared/utils/environment.js"
            );

            // Test multiple calls with same conditions
            (isDevelopment as any).mockReturnValue(true);
            mockApp.isPackaged = false;

            const result1 = electronUtils.isDev();
            const result2 = electronUtils.isDev();
            const result3 = electronUtils.isDev();

            expect(typeof result1).toBe("boolean");
            expect(typeof result2).toBe("boolean");
            expect(typeof result3).toBe("boolean");
            expect(result1).toBe(result2);
            expect(result2).toBe(result3);
        });
    });
});
