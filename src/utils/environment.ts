/**
 * Environment detection utilities shared across renderer modules.
 */

const PLAYWRIGHT_FLAG = "PLAYWRIGHT_TEST" as const;
const PLAYWRIGHT_UA_PATTERN = /playwright|pw-test|pwtest/iv;

interface MaybeProcess {
    readonly process?: {
        env?: Record<string, string | undefined>;
    };
}

interface MaybeNavigator {
    readonly navigator?: Navigator;
}

/**
 * Reads an environment variable from the ambient Node.js process if available.
 *
 * @param key - Environment variable name.
 */
export function readProcessEnv(key: string): string | undefined {
    const automationProcess = (globalThis as MaybeProcess).process;
    if (automationProcess === undefined) {
        return undefined;
    }

    const { env } = automationProcess;
    if (env === undefined) {
        return undefined;
    }

    return env[key];
}

/**
 * Detects Playwright automation environment via env flags, UA hints, or global
 * markers.
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
 * Marks the current runtime as Playwright automation. Useful for tests that
 * execute before env flags are applied.
 */
export function setPlaywrightAutomationMarker(): void {
    const automationTarget = globalThis as typeof globalThis & {
        playwrightAutomation?: boolean;
    };

    automationTarget.playwrightAutomation = true;
}
