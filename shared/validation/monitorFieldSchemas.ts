import type * as z from "zod";

import {
    MONITOR_ID_MAX_LENGTH,
    MONITOR_ID_REQUIRED_MESSAGE,
    MONITOR_ID_TOO_LONG_MESSAGE,
} from "./monitorFieldConstants";
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
    maxLength: MONITOR_ID_MAX_LENGTH,
    maxLengthMessage: MONITOR_ID_TOO_LONG_MESSAGE,
    requiredMessage: MONITOR_ID_REQUIRED_MESSAGE,
});
