import { describe, expect, it } from "vitest";

import { buildStatusSubscriptionFailureSummary } from "../../../../stores/sites/utils/statusUpdateSubscriptionSummary";

describe(buildStatusSubscriptionFailureSummary, () => {
    it("sanitizes renderer-facing subscription errors", () => {
        const summary = buildStatusSubscriptionFailureSummary({
            errors: [
                `refresh_token=SUPER_SECRET_TOKEN&status=failed\n\t${"x".repeat(1200)}`,
            ],
            expectedListeners: 4,
            message: "Failed to subscribe to status updates",
        });

        expect(summary.errors).toHaveLength(1);
        const message = summary.errors[0] ?? "";
        expect(message).not.toContain("SUPER_SECRET_TOKEN");
        expect(message).not.toContain("\n");
        expect(message).not.toContain("\t");
        expect(message).toContain("refresh_token=[redacted]&status=failed");
        expect(message.endsWith("...")).toBeTruthy();
        expect(message.length).toBeLessThanOrEqual(1003);
    });
});
