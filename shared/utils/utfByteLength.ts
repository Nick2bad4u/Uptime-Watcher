/**
 * UTF byte-length helper.
 *
 * @remarks
 * Used across multiple trust boundaries to enforce payload size budgets.
 * Keeping this in one place prevents subtle inconsistencies.
 */

/**
 * Returns the UTF-8 encoded byte length of a string.
 */
const textEncoder =
    typeof TextEncoder === "undefined" ? null : new TextEncoder();

/**
 * Returns the UTF-8 encoded byte length of a string.
 */
export function getUtfByteLength(value: string): number {
    if (textEncoder) {
        return textEncoder.encode(value).length;
    }

    // Prefer Buffer.byteLength in Node-like environments where TextEncoder may
    // be unavailable.
    if (typeof Buffer !== "undefined" && typeof Buffer.byteLength === "function") {
        return Buffer.byteLength(value, "utf8");
    }

    // Last-resort approximation for rare environments without TextEncoder or
    // Buffer. Keeps behavior deterministic but may be imprecise for astral
    // code points.
    return value.length * 2;
}
