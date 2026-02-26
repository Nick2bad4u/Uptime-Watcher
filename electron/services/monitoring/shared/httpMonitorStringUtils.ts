import type { MonitorCheckResult } from "../types";

import { createMonitorErrorResult } from "./monitorServiceHelpers";

/**
 * Normalizes a header value by trimming whitespace and collapsing internal
 * whitespace to single spaces.
 */
export function normalizeHeaderValue(value: string): string {
    return value.replaceAll(/\s+/gu, " ").trim();
}

/**
 * Resolves a header value from a response header map case-insensitively.
 *
 * @param headers - Response headers.
 * @param headerName - Header name to resolve.
 *
 * @returns Header string value if found, otherwise null.
 */
export function resolveHeaderValue(
    headers: Record<string, unknown>,
    headerName: string
): null | string {
    const direct = headers[headerName];

    if (typeof direct === "string") {
        return direct;
    }

    if (Array.isArray(direct)) {
        return direct.join(", ");
    }

    const lowerName = headerName.toLowerCase();

    for (const [key, value] of Object.entries(headers)) {
        if (key.toLowerCase() === lowerName) {
            if (typeof value === "string") {
                return value;
            }

            if (Array.isArray(value)) {
                return value.join(", ");
            }
        }
    }

    return null;
}

/**
 * Returns a trimmed non-empty string or null.
 */
export function getTrimmedNonEmptyString(value: unknown): null | string {
    if (typeof value !== "string") {
        return null;
    }

    const trimmed = value.trim();

    return trimmed.length > 0 ? trimmed : null;
}

type RequiredMonitorStringContextResult<TContext> =
    | Readonly<{ context: TContext; kind: "context" }>
    | Readonly<{ kind: "error"; result: MonitorCheckResult }>;

/**
 * Resolves a required monitor string field and maps it into monitor-specific
 * validation context.
 *
 * @param args - Validation arguments.
 *
 * @returns Context for valid values or an error monitor result when the value
 *   is missing/invalid.
 */
export function resolveRequiredMonitorStringContext<TContext>(args: {
    readonly errorMessage: string;
    readonly onValue: (value: string) => TContext;
    readonly value: unknown;
}): RequiredMonitorStringContextResult<TContext> {
    const resolvedValue = getTrimmedNonEmptyString(args.value);

    if (!resolvedValue) {
        return {
            kind: "error",
            result: createMonitorErrorResult(args.errorMessage, 0),
        };
    }

    return {
        context: args.onValue(resolvedValue),
        kind: "context",
    };
}
