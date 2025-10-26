import { describe, expect, it } from "vitest";

import { deriveStatusSubscriptionHealth } from "../../hooks/useStatusSubscriptionHealth";
import type { StatusUpdateSubscriptionSummary } from "../../stores/sites/baseTypes";

describe(deriveStatusSubscriptionHealth, () => {
    it("flags unknown health when summary is absent", () => {
        const health = deriveStatusSubscriptionHealth(undefined);

        expect(health.status).toBe("unknown");
        expect(health.isHealthy).toBeFalsy();
        expect(health.needsAttention).toBeFalsy();
        expect(health.listenersProgress).toBe("No listeners connected");
    });

    it("returns healthy state when subscription succeeded", () => {
        const summary: StatusUpdateSubscriptionSummary = {
            errors: [],
            expectedListeners: 4,
            listenersAttached: 4,
            message: "success",
            subscribed: true,
            success: true,
            listenerStates: [
                { attached: true, name: "monitor-status-changed" },
                { attached: true, name: "monitor-check-completed" },
                { attached: true, name: "monitoring-started" },
                { attached: true, name: "monitoring-stopped" },
            ],
        };

        const health = deriveStatusSubscriptionHealth(summary);

        expect(health.status).toBe("healthy");
        expect(health.isHealthy).toBeTruthy();
        expect(health.needsAttention).toBeFalsy();
        expect(health.listenersProgress).toBe("4/4 listeners");
    });

    it("marks degraded when only some listeners attach", () => {
        const summary: StatusUpdateSubscriptionSummary = {
            errors: ["monitoring-started: ipc failure"],
            expectedListeners: 4,
            listenersAttached: 1,
            message: "partial",
            subscribed: false,
            success: false,
            listenerStates: [
                { attached: true, name: "monitor-status-changed" },
                { attached: false, name: "monitor-check-completed" },
                { attached: false, name: "monitoring-started" },
                { attached: false, name: "monitoring-stopped" },
            ],
        };

        const health = deriveStatusSubscriptionHealth(summary);

        expect(health.status).toBe("degraded");
        expect(health.isHealthy).toBeFalsy();
        expect(health.needsAttention).toBeTruthy();
        expect(health.errors).toContain("monitoring-started: ipc failure");
    });

    it("marks failed when no listeners attach and errors exist", () => {
        const summary: StatusUpdateSubscriptionSummary = {
            errors: ["subscribe crash"],
            expectedListeners: 4,
            listenersAttached: 0,
            message: "failure",
            subscribed: false,
            success: false,
            listenerStates: [
                { attached: false, name: "monitor-status-changed" },
                { attached: false, name: "monitor-check-completed" },
                { attached: false, name: "monitoring-started" },
                { attached: false, name: "monitoring-stopped" },
            ],
        };

        const health = deriveStatusSubscriptionHealth(summary);

        expect(health.status).toBe("failed");
        expect(health.needsAttention).toBeTruthy();
        expect(health.errors).toHaveLength(1);
    });
});
