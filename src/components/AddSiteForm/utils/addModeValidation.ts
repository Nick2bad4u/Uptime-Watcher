/**
 * Shared validation helpers for the AddSiteForm "add mode" selection.
 */

/**
 * Add-site operation mode.
 */
export type AddMode = "existing" | "new";

/**
 * Validates the add mode selection and site information.
 *
 * @remarks
 * This helper is intentionally shared between:
 * - the UI state hook (`useAddSiteForm`)
 * - the submission utility (`Submit.tsx`)
 *
 * Keeping the rules and error messages centralized prevents drift.
 */
export function validateAddModeSelection(args: {
    readonly addMode: AddMode;
    readonly name: unknown;
    readonly selectedExistingSite: unknown;
}): string[] {
    const errors: string[] = [];

    const trimmedName = typeof args.name === "string" ? args.name.trim() : "";
    const existingSite =
        typeof args.selectedExistingSite === "string"
            ? args.selectedExistingSite
            : "";

    if (args.addMode === "new" && trimmedName.length === 0) {
        errors.push("Site name is required");
    }

    if (args.addMode === "existing" && existingSite.length === 0) {
        errors.push("Please select a site to add the monitor to");
    }

    return errors;
}
