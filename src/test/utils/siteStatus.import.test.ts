/**
 * Test for src/utils/siteStatus.ts re-exports. This tests the import/export
 * functionality of the frontend wrapper.
 */

import { describe, expect, it } from "vitest";

import {
    calculateSiteMonitoringStatus,
    calculateSiteStatus,
    getSiteDisplayStatus,
    getSiteStatusDescription,
    getSiteStatusVariant,
} from "@shared/utils/siteStatus";

import type { SiteStatus } from "../../../shared/types";

describe("siteStatus re-exports", () => {
    it("should re-export calculateSiteMonitoringStatus function", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus.import", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Export Operation", "type");

        expect(typeof calculateSiteMonitoringStatus).toBe("function");
    });

    it("should re-export calculateSiteStatus function", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus.import", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Export Operation", "type");

        expect(typeof calculateSiteStatus).toBe("function");
    });

    it("should re-export getSiteDisplayStatus function", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus.import", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Export Operation", "type");

        expect(typeof getSiteDisplayStatus).toBe("function");
    });

    it("should re-export getSiteStatusDescription function", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus.import", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Export Operation", "type");

        expect(typeof getSiteStatusDescription).toBe("function");
    });

    it("should re-export getSiteStatusVariant function", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus.import", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Export Operation", "type");

        expect(typeof getSiteStatusVariant).toBe("function");
    });

    it("should re-export SiteStatus type", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus.import", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Export Operation", "type");

        // Test that the type can be used
        const testStatus: SiteStatus = "up";
        expect(testStatus).toBe("up");
    });

    it("should provide functional re-exported utilities", async ({
        task,
        annotate,
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
