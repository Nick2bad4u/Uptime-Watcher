/**
 * Formats site validation errors for better readability.
 *
 * @remarks
 * This helper is extracted from `SiteManager` so the manager stays focused on
 * orchestration. Keep this behavior stable because tests assert the exact
 * output formatting.
 */
export function formatSiteValidationErrors(
    errors: readonly string[] | undefined
): string {
    if (!errors || errors.length === 0) {
        return "";
    }

    if (errors.length === 1) {
        // Ensure fallback to empty string if errors[0] is undefined
        return errors[0] ?? "";
    }

    return `\n  - ${errors.join("\n  - ")}`;
}
