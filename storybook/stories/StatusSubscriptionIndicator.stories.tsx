/**
 * Storybook stories for realtime status subscription diagnostics.
 */

import type { StatusUpdateSubscriptionSummary } from "@app/stores/sites/baseTypes";
import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";
import type { JSX } from "react";

import { StatusSubscriptionIndicator } from "@app/components/Header/StatusSubscriptionIndicator";
import { useSitesStore } from "@app/stores/sites/useSitesStore";
import { useEffect, useMemo } from "react";
import { action } from "storybook/actions";

type IndicatorVariant =
    | "connecting"
    | "healthy"
    | "degraded"
    | "failed"
    | "disabled";

interface StatusSubscriptionIndicatorStoryArgs {
    variant: IndicatorVariant;
}

type Story = StoryObj<typeof meta>;

const logRetry = action("sites/retryStatusSubscription");

const healthySummary: StatusUpdateSubscriptionSummary = {
    errors: [],
    expectedListeners: 3,
    listenersAttached: 3,
    listenerStates: [
        { attached: true, name: "Site Directory" },
        { attached: true, name: "Monitor Events" },
        { attached: true, name: "History Timeline" },
    ],
    message: "All realtime listeners attached successfully.",
    subscribed: true,
    success: true,
};

const degradedSummary: StatusUpdateSubscriptionSummary = {
    errors: ["History timeline listener timed out."],
    expectedListeners: 3,
    listenersAttached: 2,
    listenerStates: [
        { attached: true, name: "Site Directory" },
        { attached: true, name: "Monitor Events" },
        { attached: false, name: "History Timeline" },
    ],
    message: "History timeline listener timed out during attachment.",
    subscribed: false,
    success: false,
};

const failedSummary: StatusUpdateSubscriptionSummary = {
    errors: [
        "Realtime gateway unreachable.",
        "Automatic retries paused until manual intervention.",
    ],
    expectedListeners: 3,
    listenersAttached: 0,
    listenerStates: [
        { attached: false, name: "Site Directory" },
        { attached: false, name: "Monitor Events" },
        { attached: false, name: "History Timeline" },
    ],
    message: "Realtime listeners failed to attach.",
    subscribed: false,
    success: false,
};

const disabledSummary: StatusUpdateSubscriptionSummary = {
    errors: [],
    expectedListeners: 0,
    listenersAttached: 0,
    listenerStates: [],
    message: "Realtime channels disabled via configuration.",
    subscribed: false,
    success: true,
};

const cloneSummary = (
    summary: StatusUpdateSubscriptionSummary | undefined
): StatusUpdateSubscriptionSummary | undefined =>
    summary
        ? {
              ...summary,
              errors: Array.from(summary.errors),
              listenerStates: summary.listenerStates.map((listener) => ({
                  ...listener,
              })),
          }
        : undefined;

const variantConfig: Record<
    IndicatorVariant,
    {
        readonly retry: StatusUpdateSubscriptionSummary;
        readonly summary: StatusUpdateSubscriptionSummary | undefined;
    }
> = {
    connecting: {
        retry: healthySummary,
        summary: undefined,
    },
    healthy: {
        retry: healthySummary,
        summary: healthySummary,
    },
    degraded: {
        retry: healthySummary,
        summary: degradedSummary,
    },
    failed: {
        retry: degradedSummary,
        summary: failedSummary,
    },
    disabled: {
        retry: disabledSummary,
        summary: disabledSummary,
    },
};

const withSubscriptionState: Decorator = (StoryComponent, context) => {
    const { variant } =
        context.args as unknown as StatusSubscriptionIndicatorStoryArgs;

    const config = useMemo(() => variantConfig[variant], [variant]);
    const summaryTemplate = useMemo(
        () => cloneSummary(config.summary),
        [config.summary]
    );
    const retryTemplate = useMemo(
        () => cloneSummary(config.retry),
        [config.retry]
    );

    useEffect(
        function configureSubscriptionIndicatorStore(): () => void {
            const snapshot = useSitesStore.getState();

            function applySummaryToStore(
                nextSummary: StatusUpdateSubscriptionSummary | undefined
            ): void {
                useSitesStore.setState({
                    statusSubscriptionSummary: nextSummary,
                });
            }

            async function handleRetry(): Promise<StatusUpdateSubscriptionSummary> {
                const fallbackRetry = cloneSummary(healthySummary);
                if (!fallbackRetry) {
                    throw new Error("Failed to construct retry summary");
                }

                const result = cloneSummary(retryTemplate) ?? fallbackRetry;
                logRetry(result);
                await Promise.resolve();
                applySummaryToStore(result);
                return result;
            }

            applySummaryToStore(cloneSummary(summaryTemplate));
            useSitesStore.setState({
                retryStatusSubscription: handleRetry,
            });

            return function restoreSubscriptionIndicatorStore(): void {
                useSitesStore.setState(() => snapshot, true);
            };
        },
        [retryTemplate, summaryTemplate]
    );

    return <StoryComponent />;
};

const meta: Meta<typeof StatusSubscriptionIndicator> = {
    args: {
        variant: "connecting",
    },
    argTypes: {
        variant: {
            control: {
                labels: {
                    connecting: "Connecting",
                    degraded: "Degraded",
                    disabled: "Disabled",
                    failed: "Failed",
                    healthy: "Healthy",
                },
                type: "radio",
            },
            description: "Select the realtime subscription health scenario.",
            options: [
                "connecting",
                "healthy",
                "degraded",
                "failed",
                "disabled",
            ],
        },
    },
    component: StatusSubscriptionIndicator,
    decorators: [withSubscriptionState],
    parameters: {
        layout: "centered",
    },
    render: (): JSX.Element => (
        <div className="bg-slate-900/40 p-8">
            <StatusSubscriptionIndicator />
        </div>
    ),
    tags: ["autodocs"],
} satisfies Meta<typeof StatusSubscriptionIndicator>;

export default meta;

export const Connecting: Story = {};

export const Healthy: Story = {
    args: {
        variant: "healthy",
    },
};

export const Degraded: Story = {
    args: {
        variant: "degraded",
    },
};

export const Failed: Story = {
    args: {
        variant: "failed",
    },
};

export const Disabled: Story = {
    args: {
        variant: "disabled",
    },
};
