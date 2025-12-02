/**
 * Unique symbol used to brand PortNumber values.
 */
declare const portNumberBrand: unique symbol;

/**
 * Unique symbol used to brand TimeoutMilliseconds values.
 */
declare const timeoutMillisecondsBrand: unique symbol;

/**
 * Numeric port identifier constrained to the inclusive TCP/UDP port range.
 */
export type PortNumber = number & { readonly [portNumberBrand]: true };

/** Millisecond duration used for timeout intervals. */
export type TimeoutMilliseconds = number & {
    readonly [timeoutMillisecondsBrand]: true;
};

/** Inclusive TCP/UDP port range supported by the application. */
export const PORT_NUMBER_RANGE: Readonly<{
    readonly MAX: number;
    readonly MIN: number;
}> = Object.freeze({
    MAX: 65_535,
    MIN: 1,
});

/** Minimum permissible timeout duration for shared utilities. */
export const MIN_TIMEOUT_MILLISECONDS: number = 0;

/** Upper bound used when branding timeout durations. */
export const MAX_TIMEOUT_MILLISECONDS: number = Number.MAX_SAFE_INTEGER;

function assertValidPortNumber(value: number): asserts value is PortNumber {
    if (!Number.isInteger(value)) {
        throw new RangeError("Port number must be an integer");
    }

    if (value < PORT_NUMBER_RANGE.MIN || value > PORT_NUMBER_RANGE.MAX) {
        throw new RangeError(
            `Port number must be between ${PORT_NUMBER_RANGE.MIN} and ${PORT_NUMBER_RANGE.MAX}`
        );
    }
}

function assertValidTimeout(
    value: number
): asserts value is TimeoutMilliseconds {
    if (!Number.isFinite(value)) {
        throw new RangeError("Timeout must be a finite number");
    }

    if (value < MIN_TIMEOUT_MILLISECONDS || value > MAX_TIMEOUT_MILLISECONDS) {
        throw new RangeError(
            `Timeout must be between ${MIN_TIMEOUT_MILLISECONDS} and ${MAX_TIMEOUT_MILLISECONDS}`
        );
    }
}

/**
 * Brands a validated number as a PortNumber.
 *
 * @param value - Integer value to brand.
 *
 * @returns The branded port number.
 *
 * @throws RangeError When the value is non-integer or outside the allowed
 *   range.
 */
export function toPortNumber(value: number): PortNumber {
    assertValidPortNumber(value);
    return value;
}

/**
 * Brands a validated number as a TimeoutMilliseconds value.
 *
 * @param value - Millisecond duration to brand. Must be finite and
 *   non-negative.
 *
 * @returns The branded timeout duration.
 *
 * @throws RangeError When the value is negative or not finite.
 */
export function toTimeoutMilliseconds(value: number): TimeoutMilliseconds {
    assertValidTimeout(value);
    return value;
}
