/**
 * Helpers for deriving realtime subscription health diagnostics.
 *
 * @remarks
 * Aggregates {@link StatusUpdateSubscriptionSummary} data into a normalized
 * health representation that UI components can render.
 *
 * @packageDocumentation
 */

import type { StatusUpdateSubscriptionSummary } from "../stores/sites/baseTypes";

/**
 * Discrete health states for the realtime status subscription.
 */
export type StatusSubscriptionHealthState =
    | "degraded"
    | "failed"
    | "healthy"
    | "unknown";

/**
 * Derived subscription health information consumed by UI components.
 */
export interface StatusSubscriptionHealth {
    /** Additional description for tooltips or secondary text. */
    readonly description: string;
    /** Distilled list of diagnostic errors for display. */
    readonly errors: readonly string[];
    /** Whether the subscription is considered healthy. */
    readonly isHealthy: boolean;
    /** Localized label summarizing the current health. */
    readonly label: string;
    /** Compact representation of listener attachment progress. */
    readonly listenersProgress: string;
    /** Whether the subscription requires user attention. */
    readonly needsAttention: boolean;
    /** Presentational status token for styling. */
    readonly status: StatusSubscriptionHealthState;
    /** Latest subscription diagnostics, if any. */
    readonly summary: StatusUpdateSubscriptionSummary | undefined;
}

/**
 * Creates a normalized health snapshot from the latest subscription summary.
 *
 * @param summary - Latest {@link StatusUpdateSubscriptionSummary} diagnostics.
 *
 * @returns Derived {@link StatusSubscriptionHealth} data for presentation.
 */
export const deriveStatusSubscriptionHealth = (
    summary: StatusUpdateSubscriptionSummary | undefined
): StatusSubscriptionHealth => {
    if (!summary) {
        return {
            description: "Realtime updates have not been initialized yet.",
            errors: [],
            isHealthy: false,
            label: "Not Connected",
            listenersProgress: "No listeners connected",
            needsAttention: false,
            status: "unknown",
            summary,
        } satisfies StatusSubscriptionHealth;
    }

    const { errors, expectedListeners, listenersAttached, success } = summary;
    const listenersProgress = `${listenersAttached}/${expectedListeners} listeners`;

    if (success) {
        return {
            description:
                "All realtime listeners are attached and delivering updates.",
            errors,
            isHealthy: true,
            label: "Realtime Healthy",
            listenersProgress,
            needsAttention: false,
            status: "healthy",
            summary,
        } satisfies StatusSubscriptionHealth;
    }

    const hasPartialAttachment =
        listenersAttached > 0 && listenersAttached < expectedListeners;

    if (hasPartialAttachment || errors.length > 0) {
        return {
            description:
                "Some realtime listeners failed to attach. Retry to restore incremental updates.",
            errors,
            isHealthy: false,
            label: "Realtime Degraded",
            listenersProgress,
            needsAttention: true,
            status: hasPartialAttachment ? "degraded" : "failed",
            summary,
        } satisfies StatusSubscriptionHealth;
    }

    return {
        description:
            "Realtime updates are unavailable. Manual actions will require full resyncs.",
        errors,
        isHealthy: false,
        label: "Realtime Unavailable",
        listenersProgress,
        needsAttention: true,
        status: "failed",
        summary,
    } satisfies StatusSubscriptionHealth;
};
