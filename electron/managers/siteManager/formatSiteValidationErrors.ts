/**
 * Formats site validation errors for better readability.
 *
 * @remarks
 * This helper is extracted from `SiteManager` so the manager stays focused on
 * orchestration. Keep this behavior stable because tests assert the exact
 * output formatting.
 */
import { isEmpty } from "ts-extras";
import { arrayFirst } from "ts-extras";
import { arrayJoin } from "ts-extras";

export function formatSiteValidationErrors(
    errors: readonly string[] | undefined
): string {
    if (!errors || isEmpty(errors)) {
        return "";
    }

    if (errors.length === 1) {
        // Ensure fallback to empty string if errors[0] is undefined
        return arrayFirst(errors) ?? "";
    }

    return `\n  - ${arrayJoin(errors, "\n  - ")}`;
}
