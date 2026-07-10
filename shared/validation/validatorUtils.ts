/**
 * Shared validation utilities using the validator package.
 *
 * @remarks
 * This module provides validation functions that can be used by both frontend
 * and backend to ensure consistent validation behavior. Uses the well-tested
 * validator.js package for reliable validation.
 *
 * The functions in this module replace manual validation patterns throughout
 * the codebase, providing consistent validation behavior and better security.
 *
 * @example
 *
 * ```typescript
 * // Replace manual string validation
 * // Old: typeof value === "string" && value.trim().length > 0
 * // New: isNonEmptyString(value)
 *
 * // Replace manual URL validation
 * // Old: /^https?:\/\//.test(url)
 * // New: isValidUrl(url)
 *
 * // Replace manual array validation
 * // Old: Array.isArray(arr) && arr.every(item => typeof item === "string")
 * // New: isValidIdentifierArray(arr)
 * ```
 *
 * @packageDocumentation
 *
 * @see {@link https://github.com/validatorjs/validator.js} - Validator.js documentation
 */

import type { Except } from "type-fest";

import { isDefined, isFinite as isFiniteNumber } from "ts-extras";
import type { IsURLOptions } from "validator/lib/isURL";
import isAlphanumeric from "validator/lib/isAlphanumeric";
import isEmpty from "validator/lib/isEmpty";
import isFloat from "validator/lib/isFloat";
import isFQDN from "validator/lib/isFQDN";
import isHexadecimal from "validator/lib/isHexadecimal";
import isInt from "validator/lib/isInt";
import isIP from "validator/lib/isIP";
import isPort from "validator/lib/isPort";
import isSemVer from "validator/lib/isSemVer";
import isURL from "validator/lib/isURL";

import {
    isNonEmptyString as isNonEmptyStringGuard,
    isValidPort as isValidNumericPort,
} from "../utils/typeGuards";
import {
    hasHttpAuthorityDelimiterIssue,
    hasMissingProtocolDelimiter,
    hasNestedHttpSchemeAfterFirstDelimiter,
    isSchemeOnlyUrl,
} from "../utils/urlSchemeValidation";

/**
 * Options for {@link isValidUrl}.
 *
 * @remarks
 * `validator.js` uses snake_case options (e.g. `disallow_auth`). This codebase
 * enforces camelCase identifiers, so we also accept `disallowAuth` and map it
 * to the underlying validator option.
 */
export type UrlValidationOptions = Except<IsURLOptions, "disallow_auth"> & {
    /** Allow backticks in the URL string (disabled by default). */
    readonly allowBackticks?: boolean;
    /**
     * Allow single quotes in the URL string.
     *
     * @remarks
     * The default validation policy is intentionally strict for URLs that may
     * be embedded into logs or UI attributes. Some internal-only URLs (for
     * example monitor endpoints) may legitimately include quotes in the path
     * component.
     */
    readonly allowSingleQuotes?: boolean;
    /** Lint-friendly alias for validator's `disallow_auth`. */
    readonly disallowAuth?: boolean;
};

/**
 * Validates that a value is a non-empty string.
 *
 * @example
 *
 * ```typescript
 * isNonEmptyString("hello"); // true
 * isNonEmptyString(""); // false
 * isNonEmptyString(null); // false
 * ```
 *
 * @param value - Value to validate
 *
 * @returns True if value is a non-empty string
 *
 * @public
 */
export function isNonEmptyString(value: unknown): value is string {
    return isNonEmptyStringGuard(value);
}

/**
 * Validates that a value is a valid FQDN (Fully Qualified Domain Name).
 *
 * @example
 *
 * ```typescript
 * isValidFQDN("example.com"); // true
 * isValidFQDN("localhost"); // false (no TLD by default)
 * ```
 *
 * @param value - Value to validate
 * @param options - FQDN validation options
 *
 * @returns True if value is a valid FQDN
 *
 * @public
 */
export function isValidFQDN(
    value: unknown,
    options?: Parameters<typeof isFQDN>[1]
): value is string {
    return typeof value === "string" && isFQDN(value, options);
}

/**
 * Validates that a value is a SemVer 2.0.0 string.
 *
 * @remarks
 * Wrapper around validator.js `isSemVer`. Keeping this in a shared module
 * avoids scattering direct validation call sites across the codebase.
 *
 * @param value - Value to validate.
 *
 * @returns True if the value is a valid semantic version.
 *
 * @public
 */
export function isValidSemVer(value: unknown): value is string {
    return typeof value === "string" && isSemVer(value);
}

/**
 * Validates that a value is a valid identifier (alphanumeric with
 * hyphens/underscores).
 *
 * @example
 *
 * ```typescript
 * isValidIdentifier("abc123"); // true
 * isValidIdentifier("abc-123_def"); // true
 * isValidIdentifier("abc@123"); // false
 * ```
 *
 * @param value - Value to validate
 *
 * @returns True if value is a valid identifier
 *
 * @public
 */
export function isValidIdentifier(value: unknown): value is string {
    if (typeof value !== "string" || isEmpty(value.trim())) {
        return false;
    }

    // Allow alphanumeric characters, hyphens, and underscores

    const cleanedValue = value.replaceAll(/[-_]/gu, "");

    // Must have at least one alphanumeric character remaining

    return cleanedValue.length > 0 && isAlphanumeric(cleanedValue);
}

/**
 * Validates that an array contains only valid string identifiers.
 *
 * @example
 *
 * ```typescript
 * isValidIdentifierArray(["abc", "def-123"]); // true
 * isValidIdentifierArray(["abc", 123]); // false
 * isValidIdentifierArray(["abc", ""]); // false
 * ```
 *
 * @param value - Array to validate
 *
 * @returns True if array contains only valid identifiers
 *
 * @public
 */
export function isValidIdentifierArray(value: unknown): value is string[] {
    if (!Array.isArray(value)) {
        return false;
    }

    return value.every((item) => isValidIdentifier(item));
}

/**
 * Validates that a value is a valid integer within optional bounds.
 *
 * @example
 *
 * ```typescript
 * isValidInteger("123"); // true
 * isValidInteger("123.45"); // false
 * isValidInteger("123", { min: 100, max: 200 }); // true
 * ```
 *
 * @param value - Value to validate
 * @param options - Integer validation options
 *
 * @returns True if value is a valid integer
 *
 * @public
 */
export function isValidInteger(
    value: unknown,
    options?: Parameters<typeof isInt>[1]
): value is string {
    return typeof value === "string" && isInt(value, options);
}

/**
 * Validates that a value is a valid numeric string within optional bounds.
 *
 * @example
 *
 * ```typescript
 * isValidNumeric("123.45"); // true
 * isValidNumeric("abc"); // false
 * ```
 *
 * @param value - Value to validate
 * @param options - Numeric validation options
 *
 * @returns True if value is a valid number
 *
 * @public
 */
export function isValidNumeric(
    value: unknown,
    options?: Parameters<typeof isFloat>[1]
): value is string {
    if (typeof value !== "string") {
        return false;
    }

    if (!isStrictNumericLiteral(value)) {
        return false;
    }

    // Guard against inputs that would parse to Infinity.
    const parsed = Number(value);
    if (!isFiniteNumber(parsed)) {
        return false;
    }

    return isFloat(value, options);
}

function isAsciiDigit(character: string | undefined): boolean {
    return isDefined(character) && character >= "0" && character <= "9";
}

function consumeAsciiDigits(value: string, startIndex: number): number {
    let index = startIndex;

    while (isAsciiDigit(value[index])) {
        index += 1;
    }

    return index;
}

function consumeOptionalSign(value: string, startIndex: number): number {
    const character = value[startIndex];
    return character === "+" || character === "-" ? startIndex + 1 : startIndex;
}

function isStrictNumericLiteral(value: string): boolean {
    const valueLength = value.length;
    let index = consumeOptionalSign(value, 0);
    const integerStartIndex = index;

    index = consumeAsciiDigits(value, index);

    const hasIntegerDigits = index > integerStartIndex;
    let hasDecimalDigits = false;

    if (value[index] === ".") {
        index += 1;
        const decimalStartIndex = index;
        index = consumeAsciiDigits(value, index);
        hasDecimalDigits = index > decimalStartIndex;
    }

    if (!hasIntegerDigits && !hasDecimalDigits) {
        return false;
    }

    if (value[index] === "e" || value[index] === "E") {
        index = consumeOptionalSign(value, index + 1);
        const exponentStartIndex = index;
        index = consumeAsciiDigits(value, index);

        if (index === exponentStartIndex) {
            return false;
        }
    }

    return index === valueLength;
}

/**
 * Validates that a value is a valid host (IP address, FQDN, or localhost).
 *
 * @example
 *
 * ```typescript
 * isValidHost("192.168.1.1"); // true
 * isValidHost("example.com"); // true
 * isValidHost("localhost"); // true
 * isValidHost("invalid..host"); // false
 * ```
 *
 * @param value - Value to validate
 *
 * @returns True if value is a valid host
 *
 * @public
 */
export function isValidHost(value: unknown): value is string {
    if (typeof value !== "string") {
        return false;
    }

    // Check if it's a valid IP address
    if (isIP(value)) {
        return true;
    }

    // Check if it's a valid FQDN
    if (
        isFQDN(value, {
            allow_numeric_tld: false,
            allow_trailing_dot: false,
            allow_underscores: false,
            allow_wildcard: false,
            require_tld: true,
        })
    ) {
        return true;
    }

    // Allow localhost as a special case
    return value === "localhost";
}

/**
 * Validates that a value is a valid port number.
 *
 * @example
 *
 * ```typescript
 * isValidPort(80); // true
 * isValidPort("443"); // true
 * isValidPort(0); // false
 * isValidPort(70000); // false
 * ```
 *
 * @param value - Value to validate (number or string)
 *
 * @returns True if value is a valid port number (1-65535)
 *
 * @public
 */
export function isValidPort(value: unknown): boolean {
    if (typeof value === "number") {
        // Delegate numeric semantics to the shared type guard so the range
        // and integer rules stay consistent across the codebase.
        return isValidNumericPort(value);
    }
    if (typeof value === "string") {
        // Exclude port "0" as it's reserved and not suitable for user configuration
        if (value === "0") return false;
        return isPort(value);
    }
    return false;
}

type ValidatorIsUrlOptions = IsURLOptions;

const buildValidatorUrlOptions = (
    options: UrlValidationOptions
): {
    readonly allowBackticks: boolean;
    readonly allowSingleQuotes: boolean;
    readonly urlOptions: ValidatorIsUrlOptions;
} => {
    const {
        allowBackticks = false,
        allowSingleQuotes = false,
        disallowAuth,
        ...restOptions
    } = options;

    const urlOptions = {
        allow_protocol_relative_urls: false,
        allow_trailing_dot: false,
        allow_underscores: false,
        disallow_auth: disallowAuth ?? false,
        protocols: ["http", "https"],
        require_host: true,
        require_port: false,
        require_protocol: true,
        require_tld: false,
        require_valid_protocol: true,
        ...restOptions,
    } satisfies ValidatorIsUrlOptions;

    return {
        allowBackticks,
        allowSingleQuotes,
        urlOptions,
    };
};

const hasDisallowedUrlCharacters = (
    value: string,
    allowSingleQuotes: boolean,
    allowBackticks: boolean
): boolean => {
    if (!allowSingleQuotes && value.includes("'")) {
        return true;
    }

    return !allowBackticks && value.includes("`");
};

const DEFAULT_SAFE_INTEGER_FALLBACK = 0;

function normalizeSafeIntegerDefault(defaultValue: number): number {
    return isFiniteNumber(defaultValue) && Number.isInteger(defaultValue)
        ? defaultValue
        : DEFAULT_SAFE_INTEGER_FALLBACK;
}

/**
 * Validates that a value is a valid URL.
 *
 * @example
 *
 * ```typescript
 * isValidUrl("https://example.com"); // true
 * isValidUrl("not-a-url"); // false
 * ```
 *
 * @param value - Value to validate
 * @param options - URL validation options
 *
 * @returns True if value is a valid URL
 *
 * @public
 */
export function isValidUrl(
    value: unknown,
    options: UrlValidationOptions = {}
): value is string {
    if (typeof value !== "string") {
        return false;
    }

    const { allowBackticks, allowSingleQuotes, urlOptions } =
        buildValidatorUrlOptions(options);

    if (hasDisallowedUrlCharacters(value, allowSingleQuotes, allowBackticks)) {
        return false;
    }

    if (isSchemeOnlyUrl(value)) {
        return false;
    }

    if (
        hasMissingProtocolDelimiter(value, urlOptions.require_protocol ?? false)
    ) {
        return false;
    }

    const allowedProtocols = Array.isArray(urlOptions.protocols)
        ? urlOptions.protocols
        : [];

    if (hasHttpAuthorityDelimiterIssue(value, allowedProtocols)) {
        return false;
    }

    if (hasNestedHttpSchemeAfterFirstDelimiter(value)) {
        return false;
    }

    return isURL(value, urlOptions);
}

/**
 * Validates that a value is a lowercase hexadecimal string of an exact length.
 *
 * @remarks
 * `validator.isHexadecimal` accepts both uppercase and lowercase characters.
 * For IDs that must be canonicalized (like correlation IDs), we enforce a
 * lowercase-only policy.
 *
 * @param value - Value to validate.
 * @param length - Required string length.
 *
 * @returns True when the value is lowercase hex and matches the exact length.
 *
 * @public
 */
export function isValidLowercaseHexString(
    value: unknown,
    length: number
): value is string {
    if (typeof value !== "string") {
        return false;
    }

    if (value.length !== length) {
        return false;
    }

    if (value !== value.toLowerCase()) {
        return false;
    }

    return isHexadecimal(value);
}

/**
 * Safely converts a value to a positive integer with bounds checking.
 *
 * @example
 *
 * ```typescript
 * safeInteger("123", 0, 1, 1000); // 123
 * safeInteger("abc", 0, 1, 1000); // 0
 * safeInteger("2000", 0, 1, 1000); // 1000 (clamped)
 * ```
 *
 * @param value - Value to convert
 * @param defaultValue - Default value if conversion fails
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 *
 * @returns Converted integer or default value
 *
 * @public
 */
export function safeInteger(
    value: unknown,
    defaultValue: number,
    min?: number,
    max?: number
): number {
    const normalizedDefault = normalizeSafeIntegerDefault(defaultValue);
    const normalizedMin =
        isDefined(min) && isFiniteNumber(min) ? Math.ceil(min) : undefined;
    const normalizedMax =
        isDefined(max) && isFiniteNumber(max) ? Math.floor(max) : undefined;
    const str = ((): string | undefined => {
        try {
            return String(value);
        } catch {
            return undefined;
        }
    })();

    if (!isDefined(str)) {
        return normalizedDefault;
    }

    if (!isValidInteger(str)) {
        return normalizedDefault;
    }

    let num = Number.parseInt(str, 10);

    if (
        isDefined(normalizedMin) &&
        isDefined(normalizedMax) &&
        normalizedMin > normalizedMax
    ) {
        return num;
    }

    if (isDefined(normalizedMin) && num < normalizedMin) {
        num = normalizedMin;
    }

    if (isDefined(normalizedMax) && num > normalizedMax) {
        num = normalizedMax;
    }

    return num;
}
