import type { UpdateStatusEventData } from "@shared/types/events";

import { UPDATE_STATUS } from "@shared/types/events";
import { DEFAULT_MAX_USER_FACING_ERROR_DETAIL_CHARS } from "@shared/utils/userFacingErrors";
import * as z from "zod";

const updateStatusEventDataSchema = z.object({
    error: z
        .string()
        .max(DEFAULT_MAX_USER_FACING_ERROR_DETAIL_CHARS)
        .optional(),
    revision: z.number().int().nonnegative().optional(),
    status: z.enum([
        UPDATE_STATUS.IDLE,
        UPDATE_STATUS.CHECKING,
        UPDATE_STATUS.AVAILABLE,
        UPDATE_STATUS.DOWNLOADING,
        UPDATE_STATUS.DOWNLOADED,
        UPDATE_STATUS.ERROR,
    ]),
});

/** Result shape returned by {@link safeParseUpdateStatusEventData}. */
export type UpdateStatusEventDataParseResult =
    | {
          readonly data: UpdateStatusEventData;
          readonly success: true;
      }
    | {
          readonly error: unknown;
          readonly success: false;
      };

/** Validates and normalizes an updater status event or IPC snapshot. */
export function safeParseUpdateStatusEventData(
    value: unknown
): UpdateStatusEventDataParseResult {
    const parsed = updateStatusEventDataSchema.safeParse(value);
    if (!parsed.success) {
        return { error: parsed.error, success: false };
    }

    const { error, revision, status } = parsed.data;
    return {
        data: {
            ...(error !== undefined && { error }),
            ...(revision !== undefined && { revision }),
            status,
        },
        success: true,
    };
}
