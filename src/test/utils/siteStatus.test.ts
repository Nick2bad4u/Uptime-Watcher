/**
 * Tests for site status utility exports
 */

import { describe, it, expect } from "vitest";
import {
    calculateSiteMonitoringStatus,
    calculateSiteStatus,
    getSiteDisplayStatus,
    getSiteStatusDescription,
    getSiteStatusVariant,
    type SiteStatus,
} from "../../utils/siteStatus";
/**
 * Site Status Utility Tests
 * @description Tests for site status utility functions
 */
import type { SiteForStatus } from "../../../shared/types";

describe("siteStatus exports", () => {
    it("should export calculateSiteMonitoringStatus function", () => {
        expect(typeof calculateSiteMonitoringStatus).toBe("function");
    });

    it("should export calculateSiteStatus function", () => {
        expect(typeof calculateSiteStatus).toBe("function");
    });

    it("should export getSiteDisplayStatus function", () => {
        expect(typeof getSiteDisplayStatus).toBe("function");
    });

    it("should export getSiteStatusDescription function", () => {
        expect(typeof getSiteStatusDescription).toBe("function");
    });

    it("should export getSiteStatusVariant function", () => {
        expect(typeof getSiteStatusVariant).toBe("function");
    });

    it("should export SiteStatus type", () => {
        // Type test - if this compiles, the type is exported correctly
        const status: SiteStatus = "up";
        expect(status).toBe("up");
    });

    it("should have working calculateSiteStatus function", () => {
        // Basic functional test with empty monitors array
        const testSite: SiteForStatus = { monitors: [] };
        const result = calculateSiteStatus(testSite);
        expect(result).toBe("unknown");
    });

    it("should have working getSiteDisplayStatus function", () => {
        // Basic functional test
        const testSite: SiteForStatus = {
            monitors: [{ monitoring: true, status: "up" }],
        };
        const result = getSiteDisplayStatus(testSite);
        expect(result).toBe("up");
    });

    it("should have working getSiteStatusDescription function", () => {
        // Basic functional test
        const testSite: SiteForStatus = {
            monitors: [{ monitoring: true, status: "up" }],
        };
        const result = getSiteStatusDescription(testSite);
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
    });

    it("should have working getSiteStatusVariant function", () => {
        // Basic functional test
        const result = getSiteStatusVariant("up");
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
    });
});
