/**
 * Shared utilities supporting {@link StatusSubscriptionIndicator} formatting
 * logic.
 *
 * @packageDocumentation
 */

import type { StatusUpdateSubscriptionSummary } from "../../stores/sites/baseTypes";

/**
 * Derives the plural-aware channel noun for human-readable strings.
 *
 * @param count - Total number of realtime channels expected.
 *
 * @returns The singular "channel" noun when {@link count} equals 1, otherwise
 *   "channels".
 *
 * @internal
 */
export const formatChannelLabel = (count: number): string =>
    count === 1 ? "channel" : "channels";

/**
 * Builds a concise summary describing realtime channel attachment progress.
 *
 * @param summary - Latest realtime subscription summary from the sites store.
 *
 * @returns Human-readable sentence describing channel status, or "Connection
 *   pending" when the summary is missing.
 *
 * @internal
 */
export const formatListenerSummary = (
    summary: StatusUpdateSubscriptionSummary | undefined
): string => {
    if (!summary) {
        return "Connection pending";
    }

    const { expectedListeners, listenersAttached } = summary;
    if (expectedListeners === 0) {
        return "Realtime channels disabled";
    }

    if (listenersAttached >= expectedListeners) {
        const noun = expectedListeners === 1 ? "channel" : "channels";
        return `${expectedListeners} ${noun} active`;
    }

    const noun = expectedListeners === 1 ? "channel" : "channels";
    return `${listenersAttached}/${expectedListeners} ${noun} attached`;
};

/**
 * Creates a detailed progress message for tooltip descriptions.
 *
 * @param summary - Latest realtime subscription summary from the sites store.
 *
 * @returns Detailed explanation of current channel attachment progress, falling
 *   back to guidance text when the summary is missing.
 *
 * @internal
 */
export const formatListenerDetail = (
    summary: StatusUpdateSubscriptionSummary | undefined
): string => {
    if (!summary) {
        return "Awaiting the initial realtime channel attachment.";
    }

    const { expectedListeners, listenersAttached } = summary;
    if (expectedListeners === 0) {
        return "No realtime channels are required in this environment.";
    }

    if (listenersAttached >= expectedListeners) {
        const noun = expectedListeners === 1 ? "channel" : "channels";
        return `All ${expectedListeners} ${noun} are currently attached.`;
    }

    const noun = expectedListeners === 1 ? "channel" : "channels";
    const attachedNoun = listenersAttached === 1 ? "channel" : "channels";
    return `${listenersAttached} ${attachedNoun} attached out of ${expectedListeners} ${noun}.`;
};

/**
 * Formats tooltip copy describing the latest retry attempt outcome.
 *
 * @param attempt - Most recent retry attempt summary.
 *
 * @returns Description of the retry attempt when available, otherwise
 *   `undefined` to omit tooltip details.
 *
 * @internal
 */
export const formatRetryAttemptSummary = (
    attempt: null | StatusUpdateSubscriptionSummary
): string | undefined =>
    attempt
        ? `Last retry attached ${attempt.listenersAttached}/${attempt.expectedListeners} ${formatChannelLabel(attempt.expectedListeners)}.`
        : undefined;
