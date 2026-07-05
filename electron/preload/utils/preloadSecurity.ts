import {
    getOwnDataProperty,
    getOwnPropertyValue,
} from "@shared/utils/errorPropertyAccess";
import { createNullPrototypeObject } from "@shared/utils/objectSafety";
import { isDefined, objectKeys } from "ts-extras";

interface AutomationProcess {
    readonly env?: Record<string, string | undefined>;
}

const isObjectLike = (value: unknown): value is object =>
    (typeof value === "object" && value !== null) ||
    typeof value === "function";

export function getPreloadProcessCandidate(): unknown {
    // Node/Electron expose `process` through a platform accessor in this
    // runtime, so the global read is centralized here. Callers must inspect
    // nested properties with descriptor-safe helpers.
    const property = getOwnPropertyValue(globalThis, "process");
    return property.found ? property.value : undefined;
}

const toAutomationProcess = (value: unknown): AutomationProcess | undefined => {
    if (!isObjectLike(value)) {
        return undefined;
    }

    const envCandidate = getOwnDataProperty(value, "env");
    if (!envCandidate.found || !isObjectLike(envCandidate.value)) {
        return {};
    }

    const env = createNullPrototypeObject<Record<string, string | undefined>>();
    for (const key of objectKeys(envCandidate.value)) {
        const entry = getOwnDataProperty(envCandidate.value, key);
        if (!entry.found) {
            continue;
        }

        if (typeof entry.value === "string") {
            Object.defineProperty(env, key, {
                configurable: true,
                enumerable: true,
                value: entry.value,
                writable: true,
            });
        } else if (!isDefined(entry.value)) {
            Object.defineProperty(env, key, {
                configurable: true,
                enumerable: true,
                value: undefined,
                writable: true,
            });
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
