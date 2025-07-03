/**
 * @vitest-environment jsdom
 */

import { describe, it, expect } from "vitest";

describe("SiteCard Components Index", () => {
    it("should export SiteCard components", async () => {
        const siteCardModule = await import("../components/Dashboard/SiteCard/components/index");

        expect(siteCardModule).toHaveProperty("ActionButtonGroup");
        expect(siteCardModule).toHaveProperty("MetricCard");
        expect(siteCardModule).toHaveProperty("MonitorSelector");

        expect(siteCardModule.ActionButtonGroup).toBeDefined();
        expect(siteCardModule.MetricCard).toBeDefined();
        expect(siteCardModule.MonitorSelector).toBeDefined();
    }, 10000); // Increase timeout to 10 seconds
});
