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
} from "@shared/utils/siteStatus";
import type { SiteStatus } from "../../../shared/types";
/**
 * Site Status Utility Tests
 *
 * Tests for site status utility functions
 */
import type { SiteForStatus } from "../../../shared/types";

describe("siteStatus exports", () => {
    it("should export calculateSiteMonitoringStatus function", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Export Operation", "type");

        expect(typeof calculateSiteMonitoringStatus).toBe("function");
    });

    it("should export calculateSiteStatus function", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Export Operation", "type");

        expect(typeof calculateSiteStatus).toBe("function");
    });

    it("should export getSiteDisplayStatus function", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Export Operation", "type");

        expect(typeof getSiteDisplayStatus).toBe("function");
    });

    it("should export getSiteStatusDescription function", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Export Operation", "type");

        expect(typeof getSiteStatusDescription).toBe("function");
    });

    it("should export getSiteStatusVariant function", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Export Operation", "type");

        expect(typeof getSiteStatusVariant).toBe("function");
    });

    it("should export SiteStatus type", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Export Operation", "type");

        // Type test - if this compiles, the type is exported correctly
        const status: SiteStatus = "up";
        expect(status).toBe("up");
    });

    it("should have working calculateSiteStatus function", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Business Logic", "type");

        // Basic functional test with empty monitors array
        const testSite: SiteForStatus = { monitors: [] };
        const result = calculateSiteStatus(testSite);
        expect(result).toBe("unknown");
    });

    it("should have working getSiteDisplayStatus function", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Data Retrieval", "type");

        // Basic functional test
        const testSite: SiteForStatus = {
            monitors: [{ monitoring: true, status: "up" }],
        };
        const result = getSiteDisplayStatus(testSite);
        expect(result).toBe("up");
    });

    it("should have working getSiteStatusDescription function", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Data Retrieval", "type");

        // Basic functional test
        const testSite: SiteForStatus = {
            monitors: [{ monitoring: true, status: "up" }],
        };
        const result = getSiteStatusDescription(testSite);
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
    });

    it("should have working getSiteStatusVariant function", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Data Retrieval", "type");

        // Basic functional test
        const result = getSiteStatusVariant("up");
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
    });
});
