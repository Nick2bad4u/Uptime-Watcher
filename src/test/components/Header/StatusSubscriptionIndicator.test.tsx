import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { StatusUpdateSubscriptionSummary } from "../../../stores/sites/baseTypes";

import { StatusSubscriptionIndicator } from "../../../components/Header/StatusSubscriptionIndicator";

const healthySummary: StatusUpdateSubscriptionSummary = {
    errors: [],
    expectedListeners: 3,
    listenersAttached: 3,
    message: "ok",
    subscribed: true,
    success: true,
};

const fallbackSummary: StatusUpdateSubscriptionSummary = {
    errors: ["retry failed"],
    expectedListeners: 3,
    listenersAttached: 0,
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

describe("StatusSubscriptionIndicator", function describeIndicatorSuite() {
    beforeEach(() => {
        mockStore.retryStatusSubscription.mockReset();
        mockStore.statusSubscriptionSummary = healthySummary;
    });

    it("displays healthy metadata", () => {
        render(<StatusSubscriptionIndicator />);

        expect(screen.getByText("Realtime Updates")).toBeInTheDocument();
        expect(screen.getByText("Realtime Healthy")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /retry/i })).toBeEnabled();
    });

    it("displays unknown state when summary is missing", () => {
        mockStore.statusSubscriptionSummary = undefined;

        render(<StatusSubscriptionIndicator />);

        expect(screen.getByText("Not Connected")).toBeInTheDocument();
        expect(screen.getByText("No listeners connected")).toBeInTheDocument();
    });

    it("invokes retry action when retry button is clicked", async () => {
        mockStore.retryStatusSubscription.mockResolvedValueOnce(
            fallbackSummary
        );

        render(<StatusSubscriptionIndicator />);

        fireEvent.click(screen.getByRole("button", { name: /retry/i }));

        await waitFor(() => {
            expect(mockStore.retryStatusSubscription).toHaveBeenCalledTimes(1);
        });
    });
});
