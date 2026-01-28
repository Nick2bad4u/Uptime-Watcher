/**
 * Utility function for generating unique identifiers.
 *
 * @remarks
 * Uses `crypto.randomUUID` when available and falls back to a timestamp-based
 * identifier otherwise.
 *
 * @public
 */

const fallbackSequence: { value: number } = {
    value: 0,
};

function nextFallbackSequence(): number {
    fallbackSequence.value = (fallbackSequence.value + 1) % 1_000_000;
    return fallbackSequence.value;
}

function toBaseThirtySixSixChars(value: number): string {
    return value.toString(36).padStart(6, "0").slice(-6);
}

function toUint32(value: number): number {
    const modulus = 2 ** 32;
    const remainder = value % modulus;
    return remainder < 0 ? remainder + modulus : remainder;
}

function tryGenerateCryptoFallbackId(): string | undefined {
    try {
        const values = new Uint32Array(2);
        globalThis.crypto.getRandomValues(values);
        return (
            toBaseThirtySixSixChars(values[0] ?? 0) +
            toBaseThirtySixSixChars(values[1] ?? 0)
        );
    } catch {
        return undefined;
    }
}

function generateDeterministicFallbackId(
    nowMs: number,
    sequence: number
): string {
    const low = toUint32(nowMs + sequence);
    // 2654435761 is the 32-bit golden ratio constant (0x9E3779B1).
    const high = toUint32(Math.floor(nowMs / 1000) + sequence * 2_654_435_761);
    return `${toBaseThirtySixSixChars(low)}${toBaseThirtySixSixChars(high)}`;
}

/**
 * Generate a unique identifier string using crypto.randomUUID.
 *
 * @remarks
 * When crypto.randomUUID is available, returns a standard UUID. When
 * unavailable, falls back to a custom ID format: `site-{random}-{timestamp}`.
 *
 * @example
 *
 * ```typescript
 * const id = generateUuid();
 * // Returns: "123e4567-e89b-12d3-a456-426614174000" (when crypto is available)
 * // or: "site-abc123-1234567890123" (fallback)
 * ```
 *
 * @returns A UUID string in standard format or fallback format.
 *
 * @public
 */
export function generateUuid(): string {
    // Check if crypto and randomUUID are available
    // Use try-catch for runtime environment detection
    try {
        if (typeof globalThis.crypto.randomUUID === "function") {
            return globalThis.crypto.randomUUID();
        }
    } catch {
        // Crypto is not available, fall through to fallback
    }

    // Fallback: preserve the historical ID shape (`site-{random}-{timestamp}`)
    // without relying on Math.random.
    const now = Date.now();
    const sequence = nextFallbackSequence();
    const timestampSuffix = (sequence % 1000).toString(10).padStart(3, "0");
    const timestampPart = `${now}${timestampSuffix}`;

    const randomPart =
        tryGenerateCryptoFallbackId() ??
        generateDeterministicFallbackId(now, sequence);

    return `site-${randomPart}-${timestampPart}`;
}
