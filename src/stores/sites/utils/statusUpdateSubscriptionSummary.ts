import type { StatusUpdateSubscriptionSummary } from "../baseTypes";
import type { StatusUpdateManager } from "./statusUpdateHandler";

/**
 * Default listener count used for diagnostics when the underlying
 * {@link StatusUpdateManager} implementation is mocked or unavailable.
 */
export const FALLBACK_EXPECTED_LISTENERS = 4;

/**
 * Resolve the expected listener count for status update subscriptions.
 *
 * @remarks
 * Tests frequently mock {@link StatusUpdateManager}, which can strip static
 * fields (e.g. `EXPECTED_LISTENER_COUNT`). This helper keeps diagnostics stable
 * by falling back to a hard-coded default.
 */
export function resolveExpectedListenerCount(
    StatusUpdateManagerCtor: unknown
): number {
    if (
        (typeof StatusUpdateManagerCtor === "object" &&
            StatusUpdateManagerCtor !== null) ||
        typeof StatusUpdateManagerCtor === "function"
    ) {
        const candidate: unknown = Reflect.get(
            StatusUpdateManagerCtor,
            "EXPECTED_LISTENER_COUNT"
        );

        if (typeof candidate === "number") {
            return candidate;
        }
    }

    return FALLBACK_EXPECTED_LISTENERS;
}

/**
 * Build a normalized failure summary for status update subscriptions.
 */
export function buildStatusSubscriptionFailureSummary(args: {
    errors: string[];
    expectedListeners: number;
    message: string;
}): StatusUpdateSubscriptionSummary {
    return {
        errors: args.errors,
        expectedListeners: args.expectedListeners,
        listenersAttached: 0,
        listenerStates: [],
        message: args.message,
        subscribed: false,
        success: false,
    };
}

/**
 * Resolve expected listener count from a manager instance, with a fallback.
 */
export function resolveManagerExpectedListenerCount(
    manager: StatusUpdateManager | undefined,
    fallback: number
): number {
    return manager?.getExpectedListenerCount() ?? fallback;
}
