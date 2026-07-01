/**
 * @file Coverage tests for the `StatusSubscriptionIndicator` component.
 */

import type { ReactNode } from "react";
import type { UnknownRecord } from "type-fest";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { arrayFirst, safeCastTo } from "ts-extras";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { StatusUpdateSubscriptionSummary } from "../../stores/sites/baseTypes";

import { StatusSubscriptionIndicator } from "../../components/Header/StatusSubscriptionIndicator";

const tooltipMock = vi.hoisted(() => ({
    Tooltip: ({
        children,
        content,
    }: {
        children: (props: UnknownRecord) => ReactNode;
        content: ReactNode;
    }) => (
        <div data-testid="subscription-tooltip">
            <div data-testid="subscription-tooltip-content">{content}</div>
            {children({})}
        </div>
    ),
}));

vi.mock("../../components/common/Tooltip/Tooltip", () => tooltipMock);

const themedTextMock = vi.hoisted(() => ({
    ThemedText: ({ children, ...props }: { children?: ReactNode }) => (
        <span {...props}>{children}</span>
    ),
}));

vi.mock("../../theme/components/ThemedText", () => themedTextMock);

interface ThemedButtonMockProps {
    "aria-label"?: string;
    children?: ReactNode;
    className?: string;
    disabled?: boolean;
    loading?: boolean;
    onClick?: () => void;
    size?: string;
    type?: string;
    variant?: string;
}

const themedButtonInvocations = vi.hoisted(() =>
    safeCastTo<ThemedButtonMockProps[]>([])
);

vi.mock("../../theme/components/ThemedButton", () => ({
    ThemedButton: (props: ThemedButtonMockProps) => {
        themedButtonInvocations.push(props);
        const {
            children,
            loading,
            onClick,
            className,
            disabled,
            type,
            ...rest
        } = props;
        const resolvedType: "button" | "reset" | "submit" | undefined =
            type === "submit" || type === "reset" || type === "button"
                ? type
                : "button";
        return (
            <button
                className={className}
                data-loading={loading ? "true" : "false"}
                disabled={disabled}
                onClick={onClick}
                type={resolvedType}
                {...rest}
            >
                {children}
            </button>
        );
    },
}));

vi.mock("../../utils/icons", () => ({
    AppIcons: {
        actions: {
            refresh: ({ size }: { size: number }) => (
                <span data-size={size} data-testid="refresh-icon" />
            ),
        },
    },
}));

const healthState = vi.hoisted(() => ({
    value: {
        description: "All systems operational",
        errors: safeCastTo<string[]>([]),
        label: "Healthy",
        needsAttention: false,
        status: "healthy",
    },
}));

const deriveStatusSubscriptionHealthMock = vi.hoisted(() =>
    vi.fn<
        (
            summary: StatusUpdateSubscriptionSummary | undefined
        ) => typeof healthState.value
    >(() => healthState.value)
);

vi.mock("../../hooks/useStatusSubscriptionHealth", () => ({
    deriveStatusSubscriptionHealth: (
        summary?: StatusUpdateSubscriptionSummary
    ) => deriveStatusSubscriptionHealthMock(summary),
}));

const createSummary = (
    overrides: Partial<StatusUpdateSubscriptionSummary> = {}
): StatusUpdateSubscriptionSummary => ({
    errors: [],
    expectedListeners: 0,
    listenersAttached: 0,
    listenerStates: [],
    message: "",
    subscribed: false,
    success: false,
    ...overrides,
});

const siteStoreState = vi.hoisted(() => ({
    retryStatusSubscription: vi.fn(async () =>
        createSummary({ expectedListeners: 3, listenersAttached: 2 })
    ),
    summary: safeCastTo<StatusUpdateSubscriptionSummary | undefined>(undefined),
}));

const createSiteStoreSnapshot = vi.hoisted(() => () => ({
    retryStatusSubscription: siteStoreState.retryStatusSubscription,
    statusSubscriptionSummary: siteStoreState.summary,
}));

vi.mock("../../stores/sites/useSitesStore", () => {
    const useSitesStoreMock = Object.assign(
        <Selection,>(
            selector?: (
                state: ReturnType<typeof createSiteStoreSnapshot>
            ) => Selection,
            _equality?: (a: Selection, b: Selection) => boolean
        ): ReturnType<typeof createSiteStoreSnapshot> | Selection => {
            const snapshot = createSiteStoreSnapshot();
            return typeof selector === "function"
                ? selector(snapshot)
                : snapshot;
        },
        {
            getState: createSiteStoreSnapshot,
        }
    );

    return { useSitesStore: useSitesStoreMock };
});

describe("StatusSubscriptionIndicator coverage", () => {
    beforeEach(() => {
        themedButtonInvocations.length = 0;
        siteStoreState.summary = undefined;
        siteStoreState.retryStatusSubscription.mockClear();
        healthState.value = {
            description: "All systems operational",
            errors: [],
            label: "Healthy",
            needsAttention: false,
            status: "healthy",
        };
        deriveStatusSubscriptionHealthMock.mockClear();
    });

    it("renders pending state when no summary is available", () => {
        render(<StatusSubscriptionIndicator />);

        expect(
            screen.getByRole("button", {
                name: /realtime updates: healthy. connection pending./i,
            })
        ).toBeInTheDocument();
        expect(screen.queryByText("Retry")).not.toBeInTheDocument();
        expect(
            screen.getByTestId("subscription-tooltip-content")
        ).toHaveTextContent(
            "Awaiting the initial realtime channel attachment."
        );
        expect(deriveStatusSubscriptionHealthMock).toHaveBeenCalledWith(
            undefined
        );
    });

    it("describes environments without realtime channels", () => {
        siteStoreState.summary = createSummary({ expectedListeners: 0 });

        render(<StatusSubscriptionIndicator />);

        expect(
            screen.getByText("Realtime channels disabled")
        ).toBeInTheDocument();
        expect(
            screen.getByTestId("subscription-tooltip-content")
        ).toHaveTextContent(
            "No realtime channels are required in this environment."
        );
    });

    it("displays attached channel counts and errors when all listeners are active", () => {
        siteStoreState.summary = createSummary({
            expectedListeners: 2,
            listenerStates: [
                { attached: true, name: "site" },
                { attached: true, name: "monitor" },
            ],
            listenersAttached: 2,
            message: "All listeners attached",
            subscribed: true,
            success: true,
        });
        healthState.value = {
            description: "Two channels attached",
            errors: ["Last reconnect attempt failed"],
            label: "Subscribed",
            needsAttention: false,
            status: "subscribed",
        };

        render(<StatusSubscriptionIndicator />);

        expect(screen.getByText("2 channels active")).toBeInTheDocument();
        expect(screen.getByText("Listener Channels")).toBeInTheDocument();
        expect(
            screen.getByText("Last reconnect attempt failed")
        ).toBeInTheDocument();
    });

    it("shows retry controls when attention is required and captures retry attempts", async () => {
        siteStoreState.summary = createSummary({
            expectedListeners: 3,
            listenerStates: [
                { attached: false, name: "site" },
                { attached: true, name: "monitor" },
                { attached: false, name: "history" },
            ],
            listenersAttached: 1,
            message: "Retry required",
            subscribed: false,
            success: false,
            errors: ["Previous timeout"],
        });
        healthState.value = {
            description: "Some channels detached",
            errors: ["Monitor channel detached"],
            label: "Attention required",
            needsAttention: true,
            status: "degraded",
        };
        siteStoreState.retryStatusSubscription.mockResolvedValueOnce(
            createSummary({
                expectedListeners: 3,
                listenersAttached: 3,
                message: "Retry succeeded",
                subscribed: true,
                success: true,
            })
        );

        render(<StatusSubscriptionIndicator />);

        const retryButtonsCollection = screen.getAllByRole("button", {
            name: "Retry realtime listeners",
        });
        expect(retryButtonsCollection.length).toBeGreaterThan(0);
        fireEvent.click(arrayFirst(retryButtonsCollection)!);

        await waitFor(() => {
            expect(
                siteStoreState.retryStatusSubscription
            ).toHaveBeenCalledWith();
        });

        expect(
            screen.getByText("Last retry attached 3/3 channels.")
        ).toBeInTheDocument();
        const retryButtons = screen.getAllByRole("button", {
            name: "Retry realtime listeners",
        });
        for (const button of retryButtons) {
            expect(button.dataset["loading"]).toBe("false");
        }
    });
});
