import * as z from "zod";

import {
    SITE_IDENTIFIER_MAX_LENGTH,
    SITE_IDENTIFIER_REQUIRED_MESSAGE,
    SITE_IDENTIFIER_TOO_LONG_MESSAGE,
    SITE_NAME_MAX_LENGTH,
    SITE_NAME_REQUIRED_MESSAGE,
    SITE_NAME_TOO_LONG_MESSAGE,
} from "./siteFieldConstants";

/**
 * Canonical validation schema for a site identifier.
 *
 * @remarks
 * This schema is intentionally kept free of dependencies on the full site schema
 * (and therefore monitor schemas) so it can be imported in low-level contexts
 * such as IPC parameter validators and runtime guards without pulling in heavy
 * schema graphs.
 */
export const siteIdentifierSchema: z.ZodString = z
    .string()
    .max(SITE_IDENTIFIER_MAX_LENGTH, SITE_IDENTIFIER_TOO_LONG_MESSAGE)
    // Reject whitespace-only identifiers without transforming user input.
    .regex(/\S/u, SITE_IDENTIFIER_REQUIRED_MESSAGE);

/**
 * Canonical validation schema for a user-visible site name.
 *
 * @remarks
 * Like {@link siteIdentifierSchema}, this is a lightweight standalone schema.
 */
export const siteNameSchema: z.ZodString = z
    .string()
    .max(SITE_NAME_MAX_LENGTH, SITE_NAME_TOO_LONG_MESSAGE)
    // Reject whitespace-only names without transforming user input.
    .regex(/\S/u, SITE_NAME_REQUIRED_MESSAGE);
