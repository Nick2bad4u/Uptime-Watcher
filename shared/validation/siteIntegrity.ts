/**
 * Site integrity validation utilities shared across frontend and backend
 * layers.
 *
 * @remarks
 * Provides helpers for identifying duplicate site identifiers and enforcing
 * uniqueness guarantees. These helpers are intentionally lightweight so they
 * can be consumed by both renderer and Electron contexts without introducing
 * additional dependencies.
 */

import type { Site } from "@shared/types";

/**
 * Summary of a duplicate site identifier occurrence.
 */
export interface DuplicateSiteIdentifier {
    /** Identifier that appears more than once in the provided site collection. */
    readonly identifier: string;
    /** Number of times the identifier appears. */
    readonly occurrences: number;
}

/**
 * Result of sanitizing a site collection by identifier.
 */
export interface SanitizedSitesByIdentifierResult {
    /** Duplicate identifiers detected during sanitization. */
    readonly duplicates: readonly DuplicateSiteIdentifier[];
    /** Sanitized site collection with duplicates removed. */
    readonly sanitizedSites: Site[];
}

/** Readonly tuple representing identifier/count pairs from the map scan. */
type IdentifierCountEntry = readonly [identifier: string, occurrences: number];

/**
 * Error thrown when duplicate site identifiers are detected.
 */
export class DuplicateSiteIdentifierError extends Error {
    /** Duplicate identifier occurrences that triggered the error. */
    public readonly duplicates: readonly DuplicateSiteIdentifier[];

    /**
     * Creates a new {@link DuplicateSiteIdentifierError}.
     *
     * @param duplicates - Collection of duplicate identifier summaries.
     * @param context - Optional context string describing where the error was
     *   detected.
     */
    public constructor(
        duplicates: readonly DuplicateSiteIdentifier[],
        context?: string
    ) {
        const formattedDuplicates = duplicates
            .map((entry) => `${entry.identifier}x${entry.occurrences}`)
            .join(", ");
        const contextualPrefix = context ? `${context}: ` : "";
        super(
            `${contextualPrefix}Duplicate site identifiers detected: ${formattedDuplicates}`
        );
        this.name = "DuplicateSiteIdentifierError";
        this.duplicates = duplicates;
    }
}

/**
 * Collects duplicate site identifiers from the provided site collection.
 *
 * @param sites - Sites to analyse for duplicate identifiers.
 *
 * @returns Ordered list of duplicate identifier summaries.
 */
export function collectDuplicateSiteIdentifiers(
    sites: readonly Site[]
): readonly DuplicateSiteIdentifier[] {
    const counts = new Map<string, number>();

    for (const site of sites) {
        const { identifier } = site;
        counts.set(identifier, (counts.get(identifier) ?? 0) + 1);
    }

    const entries: IdentifierCountEntry[] = Array.from(counts.entries());

    return entries
        .filter((entry): entry is IdentifierCountEntry => entry[1] > 1)
        .map(([identifier, occurrences]) => ({ identifier, occurrences }))
        .toSorted((left, right) =>
            left.identifier.localeCompare(right.identifier)
        );
}

/**
 * Ensures the provided site collection does not contain duplicate identifiers.
 *
 * @param sites - Sites to validate.
 * @param context - Optional context string for error messaging.
 *
 * @throws {@link DuplicateSiteIdentifierError} When duplicates are detected.
 */
export function ensureUniqueSiteIdentifiers(
    sites: readonly Site[],
    context?: string
): void {
    const duplicates = collectDuplicateSiteIdentifiers(sites);
    if (duplicates.length > 0) {
        throw new DuplicateSiteIdentifierError(duplicates, context);
    }
}

/**
 * Returns sanitized site data alongside duplicate diagnostics.
 *
 * @param sites - Site collection to evaluate.
 *
 * @returns Sanitized sites alongside duplicate identifier diagnostics.
 */
// eslint-disable-next-line function-name/starts-with-verb -- "sanitize" is a valid verb for data cleansing operations.
export function sanitizeSitesByIdentifier(
    sites: readonly Site[]
): SanitizedSitesByIdentifierResult {
    const duplicates = collectDuplicateSiteIdentifiers(sites);

    if (duplicates.length === 0) {
        return {
            duplicates,
            sanitizedSites: Array.from(sites),
        };
    }

    const seen = new Set<string>();
    const sanitizedSites: Site[] = [];

    for (const site of sites) {
        if (!seen.has(site.identifier)) {
            seen.add(site.identifier);
            sanitizedSites.push(site);
        }
    }

    return {
        duplicates,
        sanitizedSites,
    };
}
