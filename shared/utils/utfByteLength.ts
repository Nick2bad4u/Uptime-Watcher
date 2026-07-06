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

const getManualUtfByteLength = (value: string): number => {
    let byteLength = 0;
    for (const char of value) {
        const codePoint = char.codePointAt(0);
        if (codePoint === undefined) {
            continue;
        }

        if (codePoint <= 0x7f) {
            byteLength += 1;
        } else if (codePoint <= 0x07_ff) {
            byteLength += 2;
        } else if (codePoint <= 0xff_ff) {
            byteLength += 3;
        } else {
            byteLength += 4;
        }
    }

    return byteLength;
};

/**
 * Returns the UTF-8 encoded byte length of a string.
 */
export function getUtfByteLength(value: string): number {
    if (textEncoder) {
        return textEncoder.encode(value).length;
    }

    // Prefer Buffer.byteLength in Node-like environments where TextEncoder may
    // be unavailable.
    if (
        typeof Buffer !== "undefined" &&
        typeof Buffer.byteLength === "function"
    ) {
        return Buffer.byteLength(value, "utf8");
    }

    return getManualUtfByteLength(value);
}
