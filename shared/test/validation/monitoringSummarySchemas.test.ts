import {
    validateMonitoringStartSummary,
    validateMonitoringStopSummary,
} from "@shared/validation/monitoringSummarySchemas";
import { describe, expect, it } from "vitest";

describe("monitoringSummarySchemas", () => {
    it("accepts a valid monitoring start summary", () => {
        const parsed = validateMonitoringStartSummary({
            alreadyActive: false,
            attempted: 3,
            failed: 1,
            isMonitoring: true,
            partialFailures: true,
            siteCount: 2,
            skipped: 1,
            succeeded: 2,
        });

        expect(parsed.success).toBeTruthy();
    });

    it("accepts a valid monitoring stop summary", () => {
        const parsed = validateMonitoringStopSummary({
            alreadyInactive: false,
            attempted: 2,
            failed: 0,
            isMonitoring: false,
            partialFailures: false,
            siteCount: 2,
            skipped: 3,
            succeeded: 2,
        });

        expect(parsed.success).toBeTruthy();
    });

    it("rejects summaries whose attempted count does not match outcomes", () => {
        const parsed = validateMonitoringStartSummary({
            alreadyActive: false,
            attempted: 3,
            failed: 1,
            isMonitoring: true,
            partialFailures: true,
            siteCount: 1,
            skipped: 0,
            succeeded: 1,
        });

        expect(parsed.success).toBeFalsy();
    });

    it("rejects summaries with stale partialFailures values", () => {
        const parsed = validateMonitoringStopSummary({
            alreadyInactive: false,
            attempted: 2,
            failed: 1,
            isMonitoring: true,
            partialFailures: false,
            siteCount: 1,
            skipped: 0,
            succeeded: 1,
        });

        expect(parsed.success).toBeFalsy();
    });
});
