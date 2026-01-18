import type * as z from "zod";

import {
    SITE_IDENTIFIER_MAX_LENGTH,
    SITE_IDENTIFIER_REQUIRED_MESSAGE,
    SITE_IDENTIFIER_TOO_LONG_MESSAGE,
    SITE_NAME_MAX_LENGTH,
    SITE_NAME_REQUIRED_MESSAGE,
    SITE_NAME_TOO_LONG_MESSAGE,
} from "./siteFieldConstants";
import { createNonWhitespaceStringSchema } from "./stringSchemas";

/**
 * Canonical validation schema for a site identifier.
 *
 * @remarks
 * This schema is intentionally kept free of dependencies on the full site
 * schema (and therefore monitor schemas) so it can be imported in low-level
 * contexts such as IPC parameter validators and runtime guards without pulling
 * in heavy schema graphs.
 */
export const siteIdentifierSchema: z.ZodString =
    createNonWhitespaceStringSchema({
        maxLength: SITE_IDENTIFIER_MAX_LENGTH,
        maxLengthMessage: SITE_IDENTIFIER_TOO_LONG_MESSAGE,
        requiredMessage: SITE_IDENTIFIER_REQUIRED_MESSAGE,
    });

/**
 * Canonical validation schema for a user-visible site name.
 *
 * @remarks
 * Like {@link siteIdentifierSchema}, this is a lightweight standalone schema.
 */
export const siteNameSchema: z.ZodString = createNonWhitespaceStringSchema({
    maxLength: SITE_NAME_MAX_LENGTH,
    maxLengthMessage: SITE_NAME_TOO_LONG_MESSAGE,
    requiredMessage: SITE_NAME_REQUIRED_MESSAGE,
});
