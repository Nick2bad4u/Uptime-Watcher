import { describe, expect, it } from "vitest";

import {
    buildStatusSubscriptionFailureSummary,
    resolveExpectedListenerCount,
} from "../../../../stores/sites/utils/statusUpdateSubscriptionSummary";
import { STATUS_UPDATE_LISTENER_COUNT } from "../../../../stores/sites/utils/statusUpdateListeners";

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

    it("resolves an own data listener count without invoking accessors", () => {
        expect(
            resolveExpectedListenerCount({ EXPECTED_LISTENER_COUNT: 7 })
        ).toBe(7);

        let accessCount = 0;
        const accessorBackedConstructor = {};
        Object.defineProperty(
            accessorBackedConstructor,
            "EXPECTED_LISTENER_COUNT",
            {
                configurable: true,
                enumerable: true,
                get: () => {
                    accessCount += 1;
                    throw new Error(
                        "Unexpected EXPECTED_LISTENER_COUNT getter access"
                    );
                },
            }
        );

        expect(resolveExpectedListenerCount(accessorBackedConstructor)).toBe(
            STATUS_UPDATE_LISTENER_COUNT
        );
        expect(accessCount).toBe(0);
    });
});
