/**
 * Tests for monitorTypes utility - Monitor type definitions and validation
 * Tests monitor type utilities, type guards, and base type functionality.
 */

import { describe, it, expect } from "vitest";
import {
    getBaseMonitorTypes,
    isBaseMonitorType,
} from "../../../services/monitoring/monitorTypes";
import type { MonitorType } from "../../../../shared/types.js";

describe("Monitor Types Utility", () => {
    describe("getBaseMonitorTypes", () => {
        it("should return array of base monitor types", () => {
            const types = getBaseMonitorTypes();

            expect(Array.isArray(types)).toBe(true);
            expect(types.length).toBeGreaterThan(0);
        });

        it("should include http and port types", () => {
            const types = getBaseMonitorTypes();

            expect(types).toContain("http");
            expect(types).toContain("port");
        });

        it("should return a new array each time (not mutate original)", () => {
            const types1 = getBaseMonitorTypes();
            const types2 = getBaseMonitorTypes();

            expect(types1).not.toBe(types2); // Different array instances
            expect(types1).toEqual(types2); // Same content

            // Mutate one array
            types1.push("fake" as MonitorType);

            // Other array should not be affected
            expect(types2).not.toContain("fake");
        });

    it("should return only base types (including dns)", () => {
            const types = getBaseMonitorTypes();

            // Should only contain known base types
            for (const type of types) {
        expect(["http", "port", "ping", "dns"]).toContain(type);
            }
        });

        it("should maintain consistent ordering", () => {
            const types1 = getBaseMonitorTypes();
            const types2 = getBaseMonitorTypes();

            expect(types1).toEqual(types2);
        });

        it("should return non-empty array", () => {
            const types = getBaseMonitorTypes();

            expect(types.length).toBeGreaterThan(0);
        });
    });

    describe("isBaseMonitorType", () => {
        it("should return true for valid base monitor types", () => {
            expect(isBaseMonitorType("http")).toBe(true);
            expect(isBaseMonitorType("port")).toBe(true);
        });

    it("should return false for invalid monitor types", () => {
            expect(isBaseMonitorType("invalid")).toBe(false);
            expect(isBaseMonitorType("tcp")).toBe(false);
        });

        it("should return false for empty string", () => {
            expect(isBaseMonitorType("")).toBe(false);
        });

        it("should return false for null and undefined", () => {
            expect(isBaseMonitorType(null as any)).toBe(false);
            expect(isBaseMonitorType(undefined as any)).toBe(false);
        });

        it("should return false for non-string types", () => {
            expect(isBaseMonitorType(123 as any)).toBe(false);
            expect(isBaseMonitorType(true as any)).toBe(false);
            expect(isBaseMonitorType({} as any)).toBe(false);
            expect(isBaseMonitorType([] as any)).toBe(false);
        });

        it("should be case sensitive", () => {
            expect(isBaseMonitorType("HTTP")).toBe(false);
            expect(isBaseMonitorType("Http")).toBe(false);
            expect(isBaseMonitorType("PORT")).toBe(false);
            expect(isBaseMonitorType("Port")).toBe(false);
        });

        it("should handle whitespace correctly", () => {
            expect(isBaseMonitorType(" http")).toBe(false);
            expect(isBaseMonitorType("http ")).toBe(false);
            expect(isBaseMonitorType(" http ")).toBe(false);
            expect(isBaseMonitorType("\thttp\n")).toBe(false);
        });

        it("should work with all base monitor types", () => {
            const baseTypes = getBaseMonitorTypes();

            for (const type of baseTypes) {
                expect(isBaseMonitorType(type)).toBe(true);
            }
        });

        it("should provide proper type narrowing", () => {
            const unknownType: string = "http";

            if (isBaseMonitorType(unknownType)) {
                // TypeScript should narrow the type here
                const monitorType: MonitorType = unknownType as MonitorType;
                expect(monitorType).toBe("http");
            }
        });
    });

    describe("MonitorType Type Definition", () => {
        it("should allow assignment of valid monitor types", () => {
            const httpType: MonitorType = "http";
            const portType: MonitorType = "port";

            expect(httpType).toBe("http");
            expect(portType).toBe("port");
        });

        it("should work in arrays and objects", () => {
            const types: MonitorType[] = ["http", "port"];
            const config: { type: MonitorType; enabled: boolean } = {
                type: "http",
                enabled: true,
            };

            expect(types).toContain("http");
            expect(config.type).toBe("http");
        });

        it("should work with conditional logic", () => {
            function testMonitorType(type: MonitorType) {
                switch (type) {
                    case "http": {
                        return "http monitor";
                    }
                    case "port": {
                        return "port monitor";
                    }
                    default: {
                        return "unknown monitor";
                    }
                }
            }

            expect(testMonitorType("http")).toBe("http monitor");
            expect(testMonitorType("port")).toBe("port monitor");
        });
    });

    describe("Integration with Base Types", () => {
        it("should maintain consistency with getBaseMonitorTypes", () => {
            const baseTypes = getBaseMonitorTypes();

            // All returned types should be valid according to isBaseMonitorType
            for (const type of baseTypes) {
                expect(isBaseMonitorType(type)).toBe(true);
            }
        });

        it("should handle all base types consistently", () => {
            const baseTypes = getBaseMonitorTypes();

            // Test that isBaseMonitorType works for all base types
            for (const type of baseTypes) {
                expect(isBaseMonitorType(type)).toBe(true);

                // Test case sensitivity for each type
                expect(isBaseMonitorType(type.toUpperCase())).toBe(false);
                expect(
                    isBaseMonitorType(
                        type.charAt(0).toUpperCase() + type.slice(1)
                    )
                ).toBe(false);
            }
        });

    it("should not include extended or dynamic types (excluding custom)", () => {
            const baseTypes = getBaseMonitorTypes();

            // Should only include the core built-in types
            expect(baseTypes).not.toContain("tcp");
            expect(baseTypes).not.toContain("custom");
        });
    });

    describe("Error Handling and Edge Cases", () => {
        it("should handle malformed input gracefully", () => {
            const malformedInputs = [
                "http\0",
                "http\t",
                "http\n",
                "ht\ttp",
                "h ttp",
                "port\r",
                "po rt",
            ];

            for (const input of malformedInputs) {
                expect(isBaseMonitorType(input)).toBe(false);
            }
        });

        it("should handle unicode and special characters", () => {
            const specialInputs = [
                "http🚀",
                "pört",
                "httр", // Cyrillic p
                "роrt", // Cyrillic p
            ];

            for (const input of specialInputs) {
                expect(isBaseMonitorType(input)).toBe(false);
            }
        });

        it("should handle very long strings", () => {
            const longString = "http" + "x".repeat(1000);
            expect(isBaseMonitorType(longString)).toBe(false);
        });

        it("should handle numeric strings that might look like types", () => {
            expect(isBaseMonitorType("80")).toBe(false);
            expect(isBaseMonitorType("443")).toBe(false);
            expect(isBaseMonitorType("8080")).toBe(false);
        });
    });

    describe("Performance Considerations", () => {
        it("should handle repeated calls efficiently", () => {
            // Test that repeated calls don't cause issues
            for (let i = 0; i < 100; i++) {
                expect(isBaseMonitorType("http")).toBe(true);
                expect(isBaseMonitorType("invalid")).toBe(false);
            }
        });

        it("should handle large arrays of types efficiently", () => {
            const testTypes = [
                ...Array.from({ length: 50 }).fill("http"),
                ...Array.from({ length: 50 }).fill("port"),
                ...Array.from({ length: 50 }).fill("invalid"),
            ];

            for (const type of testTypes) {
                const result = isBaseMonitorType(type as string);
                expect(typeof result).toBe("boolean");
            }
        });
    });

    describe("Documentation Examples", () => {
        it("should support documented usage patterns", () => {
            // Example from JSDoc
            const baseTypes = getBaseMonitorTypes(); // ["http", "port"]
            expect(baseTypes).toEqual(expect.arrayContaining(["http", "port"]));

            // Type guard example
            if (isBaseMonitorType("http")) {
                // TypeScript knows this is a valid MonitorType
                expect(true).toBe(true);
            }
        });

        it("should work in conditional type checking scenarios", () => {
            function processMonitorType(type: string) {
                if (isBaseMonitorType(type)) {
                    // Type is now narrowed to MonitorType
                    return `Processing ${type} monitor`;
                }
                return `Unknown monitor type: ${type}`;
            }

            expect(processMonitorType("http")).toBe("Processing http monitor");
            expect(processMonitorType("invalid")).toBe(
                "Unknown monitor type: invalid"
            );
        });
    });
});
