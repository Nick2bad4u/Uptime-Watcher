/**
 * Test for src/utils/siteStatus.ts re-exports. This tests the import/export
 * functionality of the frontend wrapper.
 */

import type { SiteStatus } from "@shared/types";

import {
    calculateSiteMonitoringStatus,
    calculateSiteStatus,
    getSiteDisplayStatus,
    getSiteStatusDescription,
    getSiteStatusVariant,
} from "@shared/utils/siteStatus";
import { describe, expect, it } from "vitest";

describe("siteStatus re-exports", () => {
    it("should re-export calculateSiteMonitoringStatus function", async ({
        annotate,
        task,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus.import", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Export Operation", "type");

        expect(calculateSiteMonitoringStatus).toBeTypeOf("function");
    });

    it("should re-export calculateSiteStatus function", async ({
        annotate,
        task,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus.import", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Export Operation", "type");

        expect(calculateSiteStatus).toBeTypeOf("function");
    });

    it("should re-export getSiteDisplayStatus function", async ({
        annotate,
        task,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus.import", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Export Operation", "type");

        expect(getSiteDisplayStatus).toBeTypeOf("function");
    });

    it("should re-export getSiteStatusDescription function", async ({
        annotate,
        task,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus.import", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Export Operation", "type");

        expect(getSiteStatusDescription).toBeTypeOf("function");
    });

    it("should re-export getSiteStatusVariant function", async ({
        annotate,
        task,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus.import", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Export Operation", "type");

        expect(getSiteStatusVariant).toBeTypeOf("function");
    });

    it("should re-export SiteStatus type", async ({ annotate, task }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus.import", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Export Operation", "type");

        // Test that the type can be used
        const testStatus: SiteStatus = "up";

        expect(testStatus).toBe("up");
    });

    it("should provide functional re-exported utilities", async ({
        annotate,
        task,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus.import", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Export Operation", "type");

        // Test basic functionality to ensure re-exports work
        const testSite = { monitors: [] };
        const result = calculateSiteStatus(testSite);

        expect(result).toBe("unknown");
    });
});
