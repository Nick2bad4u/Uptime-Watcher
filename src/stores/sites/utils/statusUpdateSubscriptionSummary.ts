import type { StatusUpdateSubscriptionSummary } from "../baseTypes";
import type { StatusUpdateManager } from "./statusUpdateHandler";

import { getOwnDataProperty } from "@shared/utils/errorPropertyAccess";
import { getUserFacingErrorDetail } from "@shared/utils/userFacingErrors";

/**
 * Default listener count used for diagnostics when the underlying
 * {@link src/stores/sites/utils/statusUpdateHandler#StatusUpdateManager}
 * implementation is mocked or unavailable.
 */
export const FALLBACK_EXPECTED_LISTENERS = 4;

/**
 * Build a normalized failure summary for status update subscriptions.
 */
export function buildStatusSubscriptionFailureSummary(args: {
    errors: string[];
    expectedListeners: number;
    message: string;
}): StatusUpdateSubscriptionSummary {
    return {
        errors: args.errors.map((error) => getUserFacingErrorDetail(error)),
        expectedListeners: args.expectedListeners,
        listenersAttached: 0,
        listenerStates: [],
        message: args.message,
        subscribed: false,
        success: false,
    };
}

/**
 * Resolve the expected listener count for status update subscriptions.
 *
 * @remarks
 * Tests frequently mock
 * {@link src/stores/sites/utils/statusUpdateHandler#StatusUpdateManager}, which
 * can strip static fields (e.g. `EXPECTED_LISTENER_COUNT`). This helper keeps
 * diagnostics stable by falling back to a hard-coded default.
 */
export function resolveExpectedListenerCount(
    StatusUpdateManagerCtor: unknown
): number {
    if (
        (typeof StatusUpdateManagerCtor === "object" &&
            StatusUpdateManagerCtor !== null) ||
        typeof StatusUpdateManagerCtor === "function"
    ) {
        const candidate = getOwnDataProperty(
            StatusUpdateManagerCtor,
            "EXPECTED_LISTENER_COUNT"
        );

        if (candidate.found && typeof candidate.value === "number") {
            return candidate.value;
        }
    }

    return FALLBACK_EXPECTED_LISTENERS;
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
