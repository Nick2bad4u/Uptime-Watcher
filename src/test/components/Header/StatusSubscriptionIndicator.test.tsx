import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { StatusUpdateSubscriptionSummary } from "../../../stores/sites/baseTypes";

import { StatusSubscriptionIndicator } from "../../../components/Header/StatusSubscriptionIndicator";

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
});
