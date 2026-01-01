/**
 * Small canonical coverage test for monitor/site validators.
 */

import { describe, expect, it } from "vitest";

import { getMonitorValidationErrors } from "@shared/validation/monitorSchemas";

describe("Canonical validation - missing coverage", () => {
    it("reports unknown monitor types", () => {
        const errors = getMonitorValidationErrors({
            type: "definitely-not-a-monitor-type",
        });

        expect(errors).toEqual(
            expect.arrayContaining([
                expect.stringContaining("Unknown monitor type"),
            ])
        );
    });
});
