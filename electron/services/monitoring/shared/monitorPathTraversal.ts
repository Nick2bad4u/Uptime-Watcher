import type { MonitorPathTraversalOptions } from "./monitorPathTraversalOptions";

import {
    DEFAULT_MONITOR_PATH_TRAVERSAL_OPTIONS,
    normalizeMonitorPathTraversalOptions,
} from "./monitorPathTraversalOptions";

const BLOCKED_PATH_SEGMENTS = new Set([
    "__defineGetter__",
    "__defineSetter__",
    "__lookupGetter__",
    "__lookupSetter__",
    "__proto__",
    "constructor",
    "prototype",
]);

function decodePathSegment(segment: string): string | undefined {
    try {
        return decodeURIComponent(segment);
    } catch {
        return undefined;
    }
}

function expandArrayIndexTokens(segment: string): string[] | undefined {
    if (!segment.includes("[")) {
        return [segment];
    }

    const tokenPattern = /(?<objectKey>[^[\]]+)|\[(?<arrayIndex>\d+)\]/gu;
    const expandedTokens: string[] = [];
    let consumedLength = 0;

    for (const tokenMatch of segment.matchAll(tokenPattern)) {
        const [matchedToken] = tokenMatch;
        const objectKey = tokenMatch.groups?.["objectKey"];
        const arrayIndex = tokenMatch.groups?.["arrayIndex"];

        consumedLength += matchedToken.length;

        if (objectKey) {
            expandedTokens.push(objectKey);
        } else if (arrayIndex) {
            expandedTokens.push(arrayIndex);
        }
    }

    if (consumedLength !== segment.length || expandedTokens.length === 0) {
        return undefined;
    }

    return expandedTokens;
}

function normalizePathSegments(
    path: string,
    options: MonitorPathTraversalOptions
): string[] | undefined {
    const rawSegments = path
        .split(".")
        .map((segment) => segment.trim())
        .filter((segment) => segment.length > 0);

    const expandedSegments: string[] = [];

    if (options.allowArrayIndexTokens) {
        for (const segment of rawSegments) {
            const expanded = expandArrayIndexTokens(segment);

            if (!expanded) {
                return undefined;
            }

            expandedSegments.push(...expanded);
        }
    } else {
        expandedSegments.push(...rawSegments);
    }

    const decodedSegments = expandedSegments.map((segment) =>
        decodePathSegment(segment)
    );

    if (decodedSegments.includes(undefined)) {
        return undefined;
    }

    const normalizedSegments = decodedSegments.filter(
        (segment): segment is string => typeof segment === "string"
    );

    if (
        options.blockPrototypeAccess &&
        normalizedSegments.some((segment) => BLOCKED_PATH_SEGMENTS.has(segment))
    ) {
        return undefined;
    }

    return normalizedSegments;
}

/**
 * Safely resolves a dot-separated path against unknown monitor response
 * payloads.
 *
 * @param payload - Parsed response payload (object / array / primitive).
 * @param path - Dot-separated path expression.
 * @param options - Traversal options.
 *
 * @returns The resolved value, or undefined if path cannot be resolved safely.
 */
export function extractMonitorValueAtPath(
    payload: unknown,
    path: string,
    options: MonitorPathTraversalOptions = DEFAULT_MONITOR_PATH_TRAVERSAL_OPTIONS
): unknown {
    const normalizedOptions = normalizeMonitorPathTraversalOptions(options);
    const segments = normalizePathSegments(path, normalizedOptions);

    if (!segments || segments.length === 0) {
        return undefined;
    }

    let current: unknown = payload;

    for (const segment of segments) {
        if (Array.isArray(current)) {
            const parsedIndex = Number.parseInt(segment, 10);
            if (
                Number.isNaN(parsedIndex) ||
                parsedIndex < 0 ||
                parsedIndex >= current.length
            ) {
                return undefined;
            }
            current = current[parsedIndex];
        } else {
            if (!current || typeof current !== "object") {
                return undefined;
            }

            if (!Object.prototype.propertyIsEnumerable.call(current, segment)) {
                return undefined;
            }

            current = Reflect.get(current, segment);
        }
    }

    return current;
}
