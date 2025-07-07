/**
 * Test file for src/utils/index.ts barrel exports
 * Tests ensure all utility exports are properly exposed and functional
 */

import { describe, it, expect } from "vitest";

describe("Utils Index Barrel Exports", () => {
    it("should export all duration utilities", async () => {
        const module = await import("../../utils/index");

        expect(module.formatDuration).toBeDefined();
        expect(module.calculateMaxDuration).toBeDefined();
        expect(typeof module.formatDuration).toBe("function");
        expect(typeof module.calculateMaxDuration).toBe("function");
    });

    it("should export all status utilities", async () => {
        const module = await import("../../utils/index");

        expect(module.getStatusIcon).toBeDefined();
        expect(module.formatStatusWithIcon).toBeDefined();
        expect(typeof module.getStatusIcon).toBe("function");
        expect(typeof module.formatStatusWithIcon).toBe("function");
    });

    it("should export all time utilities", async () => {
        const module = await import("../../utils/index");

        expect(module.formatResponseTime).toBeDefined();
        expect(module.formatFullTimestamp).toBeDefined();
        expect(module.formatDuration).toBeDefined();
        expect(typeof module.formatResponseTime).toBe("function");
        expect(typeof module.formatFullTimestamp).toBe("function");
        expect(typeof module.formatDuration).toBe("function");
    });

    it("should export data utilities", async () => {
        const module = await import("../../utils/index");

        expect(module.generateUuid).toBeDefined();
        expect(typeof module.generateUuid).toBe("function");
    });

    it("should have all expected exports available", async () => {
        const module = await import("../../utils/index");

        // Verify total number of exports matches expectations
        const exportKeys = Object.keys(module);
        console.log("Actual exports:", exportKeys);
        expect(exportKeys.length).toBe(9); // Should have exactly 9 utility exports (updated to match actual)

        // Verify no undefined exports
        const undefinedExports = exportKeys.filter((key) => module[key as keyof typeof module] === undefined);
        expect(undefinedExports).toHaveLength(0);
    });

    it("should export utilities that can be imported individually", async () => {
        // Test that we can destructure the exports
        const {
            calculateMaxDuration,
            formatDuration,
            formatFullTimestamp,
            formatResponseTime,
            formatStatusWithIcon,
            generateUuid,
            getStatusIcon,
        } = await import("../../utils/index");

        expect(formatDuration).toBeDefined();
        expect(calculateMaxDuration).toBeDefined();
        expect(getStatusIcon).toBeDefined();
        expect(formatStatusWithIcon).toBeDefined();
        expect(formatResponseTime).toBeDefined();
        expect(formatFullTimestamp).toBeDefined();
        expect(generateUuid).toBeDefined();
    });

    it("should export functional utilities that work correctly", async () => {
        const { formatDuration, generateUuid, getStatusIcon } = await import("../../utils/index");

        // Test generateUuid
        const uuid = generateUuid();
        expect(typeof uuid).toBe("string");
        expect(uuid.length).toBeGreaterThan(0);

        // Test formatDuration
        const duration = formatDuration(5000);
        expect(typeof duration).toBe("string");

        // Test getStatusIcon
        const icon = getStatusIcon("up");
        expect(typeof icon).toBe("string");
    });
});
