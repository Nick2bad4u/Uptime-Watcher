/**
 * Test for src/utils/siteStatus.ts re-exports.
 * This tests the import/export functionality of the frontend wrapper.
 */

import { describe, expect, it } from "vitest";

import {
    calculateSiteMonitoringStatus,
    calculateSiteStatus,
    getSiteDisplayStatus,
    getSiteStatusDescription,
    getSiteStatusVariant,
} from "../../utils/siteStatus";

import type { SiteStatus } from "../../utils/siteStatus";

describe("siteStatus re-exports", () => {
    it("should re-export calculateSiteMonitoringStatus function", () => {
        expect(typeof calculateSiteMonitoringStatus).toBe("function");
    });

    it("should re-export calculateSiteStatus function", () => {
        expect(typeof calculateSiteStatus).toBe("function");
    });

    it("should re-export getSiteDisplayStatus function", () => {
        expect(typeof getSiteDisplayStatus).toBe("function");
    });

    it("should re-export getSiteStatusDescription function", () => {
        expect(typeof getSiteStatusDescription).toBe("function");
    });

    it("should re-export getSiteStatusVariant function", () => {
        expect(typeof getSiteStatusVariant).toBe("function");
    });

    it("should re-export SiteStatus type", () => {
        // Test that the type can be used
        const testStatus: SiteStatus = "up";
        expect(testStatus).toBe("up");
    });

    it("should provide functional re-exported utilities", () => {
        // Test basic functionality to ensure re-exports work
        const testSite = { monitors: [] };
        const result = calculateSiteStatus(testSite);
        expect(result).toBe("unknown");
    });
});
