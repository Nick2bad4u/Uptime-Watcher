/**
 * Environment detection utilities shared across renderer modules.
 *
 * @public
 */

import { readProcessEnv as readSharedProcessEnv } from "@shared/utils/environment";
import { getOwnPropertyValue } from "@shared/utils/errorPropertyAccess";

const PLAYWRIGHT_FLAG = "PLAYWRIGHT_TEST" as const;

const PLAYWRIGHT_UA_PATTERN = /playwright|pw-test|pwtest/iu;

const hasUserAgent = (
    value: unknown
): value is { readonly userAgent: string } => {
    if (typeof value !== "object" || value === null) {
        return false;
    }

    try {
        return (
            typeof (value as { readonly userAgent?: unknown }).userAgent ===
            "string"
        );
    } catch {
        return false;
    }
};

/**
 * Detects Playwright automation environment via env flags, UA hints, or global
 * markers.
 *
 * @returns `true` when Playwright instrumentation is detected; otherwise
 *   `false`.
 *
 * @public
 */
export function isPlaywrightAutomation(): boolean {
    const automationFlag = readProcessEnv(PLAYWRIGHT_FLAG);
    if (automationFlag?.toLowerCase() === "true") {
        return true;
    }

    const navigatorProperty = getOwnPropertyValue(globalThis, "navigator");
    const automationNavigator = navigatorProperty.found
        ? navigatorProperty.value
        : undefined;
    if (
        hasUserAgent(automationNavigator) &&
        PLAYWRIGHT_UA_PATTERN.test(automationNavigator.userAgent)
    ) {
        return true;
    }

    const automationMarker = getOwnPropertyValue(
        globalThis,
        "playwrightAutomation"
    );
    return automationMarker.found && automationMarker.value === true;
}

function readProcessEnv(key: string): string | undefined {
    return readSharedProcessEnv(key);
}
