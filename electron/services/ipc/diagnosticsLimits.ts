import { getUtfByteLength as getSharedUtfByteLength } from "@shared/utils/utfByteLength";

export const MAX_DIAGNOSTICS_METADATA_BYTES = 2048;
export const MAX_DIAGNOSTICS_REPORT_CHANNEL_BYTES = 256;
export const MAX_DIAGNOSTICS_REPORT_GUARD_BYTES = 128;
export const MAX_DIAGNOSTICS_REPORT_REASON_BYTES = 512;
export const MAX_DIAGNOSTICS_PAYLOAD_PREVIEW_BYTES = 4096;

/**
 * Calculates the UTF-8 encoded byte length of a string.
 *
 * @remarks
 * Delegates to the shared implementation to avoid policy drift.
 */
export const getUtfByteLength = (value: string): number =>
    getSharedUtfByteLength(value);

export const truncateUtfString = (
    value: string,
    limit: number
): { truncated: boolean; value: string } => {
    if (limit <= 0) {
        return { truncated: value.length > 0, value: "" };
    }

    if (getUtfByteLength(value) <= limit) {
        return { truncated: false, value };
    }

    let accumulated = 0;
    let result = "";
    for (const char of value) {
        const charLength = getUtfByteLength(char);
        if (accumulated + charLength > limit) {
            return { truncated: true, value: result };
        }
        accumulated += charLength;
        result += char;
    }

    return { truncated: false, value: result };
};
