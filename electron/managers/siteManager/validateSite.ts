/**
 * Site validation helpers.
 */

import type { Site } from "@shared/types";

import type { ConfigurationManager } from "../ConfigurationManager";

import { formatSiteValidationErrors } from "./formatSiteValidationErrors";

/**
 * Validates site data according to business rules.
 *
 * @throws If validation fails.
 */
export async function validateSite(
    configurationManager: ConfigurationManager,
    site: Site
): Promise<void> {
    const validationResult =
        await configurationManager.validateSiteConfiguration(site);

    if (!validationResult.success) {
        throw new Error(
            `Site validation failed for '${site.identifier}': ${formatSiteValidationErrors(validationResult.errors)}`
        );
    }
}
