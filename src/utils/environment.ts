/**
 * Environment detection utilities shared across renderer modules.
 *
 * @public
 */

import { getEnvVar } from "@shared/utils/environment";

const PLAYWRIGHT_FLAG = "PLAYWRIGHT_TEST" as const;

const PLAYWRIGHT_UA_PATTERN = /playwright|pw-test|pwtest/iu;

/**
 * Minimal navigator shape used for user-agent probing.
 *
 * @internal
 */
interface MaybeNavigator {
    readonly navigator?: Navigator;
}

/**
 * Reads an environment variable from the ambient Node.js process if available.
 *
 * @param key - Environment variable name.
 *
 * @returns Environment variable value or `undefined` when unavailable.
 *
 * @public
 */
export function readProcessEnv(key: string): string | undefined {
    return getEnvVar(key);
}

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
    if (automationFlag && automationFlag.toLowerCase() === "true") {
        return true;
    }

    const automationNavigator = (globalThis as MaybeNavigator).navigator;
    if (
        automationNavigator &&
        PLAYWRIGHT_UA_PATTERN.test(automationNavigator.userAgent)
    ) {
        return true;
    }

    const automationTarget = globalThis as typeof globalThis & {
        playwrightAutomation?: boolean;
    };

    return automationTarget.playwrightAutomation === true;
}

/**
 * Marks the current runtime as Playwright automation.
 *
 * @remarks
 * Useful for tests that execute before environment flags are applied.
 *
 * @public
 */
export function setPlaywrightAutomationMarker(): void {
    const automationTarget = globalThis as typeof globalThis & {
        playwrightAutomation?: boolean;
    };

    automationTarget.playwrightAutomation = true;
}
