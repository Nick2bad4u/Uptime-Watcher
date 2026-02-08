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

    const envCandidate: unknown = Reflect.get(value, "env");
    if (!isObjectLike(envCandidate)) {
        return {};
    }

    const env: Record<string, string | undefined> = {};
    for (const key of Object.keys(envCandidate)) {
        const entry: unknown = Reflect.get(envCandidate, key);
        if (typeof entry === "string") {
            env[key] = entry;
        } else if (entry === undefined) {
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
 * Determines whether the preload bridge is running under Playwright automation.
 */
export function detectPlaywrightAutomation(processCandidate: unknown): boolean {
    return isPlaywrightAutomationFlagSet(toAutomationProcess(processCandidate));
}

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
