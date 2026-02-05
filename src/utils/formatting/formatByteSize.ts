/**
 * Formats a byte count into a compact human-readable IEC string.
 *
 * @remarks
 * This is used by multiple UI surfaces (local backup summary and remote backup
 * lists). Keeping it in a shared utility prevents drift in rounding and unit
 * selection.
 */
export function formatByteSize(bytes: number): string {
    if (!Number.isFinite(bytes) || bytes < 0) {
        // Preserve the historical Settings behavior: surface the raw value when
        // the input is invalid rather than silently clamping.
        return `${bytes}`;
    }

    if (bytes === 0) {
        return "0 B";
    }

    const units = [
        "B",
        "KB",
        "MB",
        "GB",
        "TB",
    ] as const;

    let value = bytes;
    let unitIndex = 0;

    while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024;
        unitIndex += 1;
    }

    // Keep UI stable and compact:
    // - no decimals for bytes
    // - no decimals for values >= 10
    // - one decimal for values < 10 in higher units
    const precision = value >= 10 || unitIndex === 0 ? 0 : 1;
    return `${value.toFixed(precision)} ${units[unitIndex]}`;
}
