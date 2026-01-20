/**
 * Minimal Zod-issue formatting helpers.
 *
 * @remarks
 * We intentionally avoid importing Zod here to keep the dependency surface
 * small. Callers can pass `ZodError.issues` directly.
 */

/**
 * A single segment in a Zod issue path.
 *
 * @remarks
 * Zod paths can contain strings, numbers, and (rarely) symbols.
 */
export type ZodIssuePathPart = number | string | symbol;

/**
 * Minimal shape of a Zod issue used for formatting.
 */
export interface ZodIssueLike {
    message: string;
    /**
     * Path segments pointing to the offending value.
     *
     * @remarks
     * This is optional to allow callers to reuse the formatter with "Zod-like"
     * issue objects that only provide a message.
     */
    path?: readonly ZodIssuePathPart[];
}

/**
 * Options for {@link formatZodIssues}.
 */
export interface FormatZodIssuesOptions {
    /**
    * When true, prefix each message with a rendered path (e.g. `foo.bar: ...`).
     *
     * @defaultValue true
     */
    includePath?: boolean;

    /**
     * Separator used when rendering the path.
     *
     * @defaultValue "."
     */
    pathSeparator?: string;
}

/**
 * Formats Zod issues into user-facing strings.
 *
 * @param issues - A `ZodError.issues`-like array.
 * @param options - Formatting options.
 */
export function formatZodIssues(
    issues: readonly ZodIssueLike[],
    options: FormatZodIssuesOptions = {}
): string[] {
    const includePath = options.includePath ?? true;
    const pathSeparator = options.pathSeparator ?? ".";

    if (!includePath) {
        return issues.map((issue) => issue.message);
    }

    return issues.map((issue) => {
        const renderedPath = (issue.path ?? []).map(String).join(pathSeparator);

        return renderedPath.length > 0
            ? `${renderedPath}: ${issue.message}`
            : issue.message;
    });
}
