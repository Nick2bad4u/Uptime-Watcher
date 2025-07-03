/**
 * Tests for the managers index barrel file.
 * Validates that all manager classes are properly exported.
 */

import { describe, it, expect } from "vitest";
import { DatabaseManager, MonitorManager, SiteManager } from "../../managers";

describe("Managers index barrel file", () => {
    it("should export DatabaseManager", () => {
        expect(DatabaseManager).toBeDefined();
        expect(typeof DatabaseManager).toBe("function");
    });

    it("should export MonitorManager", () => {
        expect(MonitorManager).toBeDefined();
        expect(typeof MonitorManager).toBe("function");
    });

    it("should export SiteManager", () => {
        expect(SiteManager).toBeDefined();
        expect(typeof SiteManager).toBe("function");
    });

    it("should export all manager classes", () => {
        // Test that all exports are available
        const managerExports = { DatabaseManager, MonitorManager, SiteManager };
        expect(managerExports).toHaveProperty("DatabaseManager");
        expect(managerExports).toHaveProperty("MonitorManager");
        expect(managerExports).toHaveProperty("SiteManager");
    });
});
