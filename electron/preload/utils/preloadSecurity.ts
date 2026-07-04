import { getOwnDataProperty } from "@shared/utils/errorPropertyAccess";
import { isDefined, objectKeys } from "ts-extras";

interface AutomationProcess {
    readonly env?: Record<string, string | undefined>;
}

const isObjectLike = (value: unknown): value is object =>
    (typeof value === "object" && value !== null) ||
    typeof value === "function";

const toAutomationProcess = (value: unknown): AutomationProcess | undefined => {
    if (!isObjectLike(value)) {
        return undefined;
    }

    const envCandidate = getOwnDataProperty(value, "env");
    if (!envCandidate.found || !isObjectLike(envCandidate.value)) {
        return {};
    }

    const env: Record<string, string | undefined> = {};
    for (const key of objectKeys(envCandidate.value)) {
        const entry = getOwnDataProperty(envCandidate.value, key);
        if (!entry.found) {
            continue;
        }

        if (typeof entry.value === "string") {
            env[key] = entry.value;
        } else if (!isDefined(entry.value)) {
            env[key] = undefined;
        }
    }

    return { env };
};

const isPlaywrightAutomationFlagSet = (
    processContext?: AutomationProcess
): boolean => {
    if (!processContext?.env) {
        return false;
    }

    const automationFlagValue = processContext.env["PLAYWRIGHT_TEST"];
    return (
        typeof automationFlagValue === "string" &&
        automationFlagValue.toLowerCase() === "true"
    );
};

/**
 * Deep-freeze an API object graph before exposing it to the renderer.
 */
export function deepFreezeInPlace(root: unknown): void {
    if (!isObjectLike(root)) {
        return;
    }

    const seen = new WeakSet<object>();
    const stack: object[] = [root];

    while (stack.length > 0) {
        const current = stack.pop();

        if (current && !seen.has(current)) {
            seen.add(current);

            for (const key of Reflect.ownKeys(current)) {
                const descriptor = Object.getOwnPropertyDescriptor(
                    current,
                    key
                );
                const value: unknown = descriptor?.value;

                if (isObjectLike(value)) {
                    stack.push(value);
                }
            }

            Object.freeze(current);
        }
    }
}

/**
 * Determines whether the preload bridge is running under Playwright automation.
 */
export function detectPlaywrightAutomation(processCandidate: unknown): boolean {
    return isPlaywrightAutomationFlagSet(toAutomationProcess(processCandidate));
}
