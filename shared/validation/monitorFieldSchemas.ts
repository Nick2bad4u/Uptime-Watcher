import type * as z from "zod";

import { MONITOR_ID_REQUIRED_MESSAGE } from "./monitorFieldConstants";
import { createNonWhitespaceStringSchema } from "./stringSchemas";

/**
 * Canonical validation schema for monitor identifiers.
 *
 * @remarks
 * This schema is kept in a lightweight module so it can be imported by IPC
 * boundary validators without pulling in the entire monitor schema graph
 * (useful when tests mock monitorSchemas).
 */
export const monitorIdSchema: z.ZodString = createNonWhitespaceStringSchema({
    requiredMessage: MONITOR_ID_REQUIRED_MESSAGE,
});
