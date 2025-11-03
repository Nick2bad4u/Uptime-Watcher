import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { StatusUpdateSubscriptionSummary } from "../../../stores/sites/baseTypes";

import { StatusSubscriptionIndicator } from "../../../components/Header/StatusSubscriptionIndicator";
import {
    formatChannelLabel,
    formatListenerDetail,
    formatListenerSummary,
    formatRetryAttemptSummary,
} from "../../../components/Header/StatusSubscriptionIndicator.utils";

const healthySummary: StatusUpdateSubscriptionSummary = {
    errors: [],
    expectedListeners: 4,
    listenersAttached: 4,
    listenerStates: [
        { attached: true, name: "monitor-status-changed" },
        { attached: true, name: "monitor-check-completed" },
        { attached: true, name: "monitoring-started" },
        { attached: true, name: "monitoring-stopped" },
    ],
    message: "ok",
    subscribed: true,
    success: true,
};

const fallbackSummary: StatusUpdateSubscriptionSummary = {
    errors: ["retry failed"],
    expectedListeners: 4,
    listenersAttached: 0,
    listenerStates: [
        { attached: false, name: "monitor-status-changed" },
        { attached: false, name: "monitor-check-completed" },
        { attached: false, name: "monitoring-started" },
        { attached: false, name: "monitoring-stopped" },
    ],
    message: "retry failed",
    subscribed: false,
    success: false,
};

const zeroChannelSummary: StatusUpdateSubscriptionSummary = {
    ...healthySummary,
    errors: [],
    expectedListeners: 0,
    listenersAttached: 0,
    listenerStates: [],
    message: "disabled",
    subscribed: false,
    success: true,
};

const singleChannelSummary: StatusUpdateSubscriptionSummary = {
    ...healthySummary,
    expectedListeners: 1,
    listenersAttached: 1,
    listenerStates: [{ attached: true, name: "monitor-status-changed" }],
};

const mockStore = {
    retryStatusSubscription:
        vi.fn<() => Promise<StatusUpdateSubscriptionSummary>>(),
    statusSubscriptionSummary: healthySummary as
        | StatusUpdateSubscriptionSummary
        | undefined,
};

type Selector<State, Result> = (state: State) => Result;

vi.mock("../../../stores/sites/useSitesStore", () => ({
    useSitesStore: <Result,>(selector?: Selector<typeof mockStore, Result>) =>
        typeof selector === "function" ? selector(mockStore) : mockStore,
}));

describe(StatusSubscriptionIndicator, function describeIndicatorSuite() {
    beforeEach(() => {
        mockStore.retryStatusSubscription.mockReset();
        mockStore.statusSubscriptionSummary = healthySummary;
    });

    it("displays healthy metadata", () => {
        render(<StatusSubscriptionIndicator />);

        const trigger = screen.getByRole("button", {
            name: /realtime updates/i,
        });

        expect(trigger).toHaveAttribute(
            "aria-label",
            expect.stringContaining("Realtime Healthy")
        );
        expect(trigger).toHaveAttribute(
            "aria-label",
            expect.stringContaining("4 channels active")
        );
        expect(
            screen.queryByRole("button", {
                name: /retry realtime listeners/i,
            })
        ).not.toBeInTheDocument();
    });

    it("displays unknown state when summary is missing", () => {
        mockStore.statusSubscriptionSummary = undefined;

        render(<StatusSubscriptionIndicator />);

        const trigger = screen.getByRole("button", {
            name: /realtime updates/i,
        });

        expect(trigger).toHaveAttribute(
            "aria-label",
            expect.stringContaining("Not Connected")
        );
        expect(trigger).toHaveAttribute(
            "aria-label",
            expect.stringContaining("Connection pending")
        );
    });

    it("invokes retry action when retry button is clicked", async () => {
        mockStore.statusSubscriptionSummary = fallbackSummary;
        mockStore.retryStatusSubscription.mockResolvedValueOnce(
            fallbackSummary
        );

        render(<StatusSubscriptionIndicator />);

        fireEvent.click(
            screen.getByRole("button", {
                name: /retry realtime listeners/i,
            })
        );

        await waitFor(() => {
            expect(mockStore.retryStatusSubscription).toHaveBeenCalledTimes(1);
        });
    });

    it("uses singular channel language when a single listener is attached", () => {
        mockStore.statusSubscriptionSummary = singleChannelSummary;

        render(<StatusSubscriptionIndicator />);

        const trigger = screen.getByRole("button", {
            name: /realtime updates/i,
        });

        expect(trigger).toHaveAttribute(
            "aria-label",
            expect.stringContaining("1 channel active")
        );
    });

    it("describes disabled realtime subscriptions when no listeners are expected", () => {
        mockStore.statusSubscriptionSummary = zeroChannelSummary;

        render(<StatusSubscriptionIndicator />);

        const trigger = screen.getByRole("button", {
            name: /realtime updates/i,
        });

        expect(trigger).toHaveAttribute(
            "aria-label",
            expect.stringContaining("Realtime channels disabled")
        );
    });
});

describe("status subscription formatting helpers", () => {
    it("pluralizes channel labels based on count", () => {
        expect(formatChannelLabel(1)).toBe("channel");
        expect(formatChannelLabel(2)).toBe("channels");
    });

    it("summarizes listener attachment progress across all states", () => {
        expect(formatListenerSummary(undefined)).toBe("Connection pending");
        expect(formatListenerSummary(zeroChannelSummary)).toBe(
            "Realtime channels disabled"
        );
        expect(formatListenerSummary(singleChannelSummary)).toBe(
            "1 channel active"
        );
        expect(formatListenerSummary(fallbackSummary)).toBe(
            "0/4 channels attached"
        );
    });

    it("produces detailed listener descriptions for tooltips", () => {
        expect(formatListenerDetail(undefined)).toBe(
            "Awaiting the initial realtime channel attachment."
        );
        expect(formatListenerDetail(zeroChannelSummary)).toBe(
            "No realtime channels are required in this environment."
        );
        expect(formatListenerDetail(singleChannelSummary)).toBe(
            "All 1 channel are currently attached."
        );
        expect(formatListenerDetail(fallbackSummary)).toBe(
            "0 channels attached out of 4 channels."
        );
    });

    it("summarizes retry attempts when available", () => {
        expect(formatRetryAttemptSummary(null)).toBeUndefined();
        expect(formatRetryAttemptSummary(fallbackSummary)).toBe(
            "Last retry attached 0/4 channels."
        );
        expect(
            formatRetryAttemptSummary({
                ...singleChannelSummary,
                expectedListeners: 3,
                listenersAttached: 2,
            })
        ).toBe("Last retry attached 2/3 channels.");
    });
});
