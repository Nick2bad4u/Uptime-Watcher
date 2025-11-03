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

import validator from "validator";

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
    return typeof value === "string" && !validator.isEmpty(value.trim());
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
    options?: Parameters<typeof validator.isFQDN>[1]
): value is string {
    return typeof value === "string" && validator.isFQDN(value, options);
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
    if (typeof value !== "string" || validator.isEmpty(value.trim())) {
        return false;
    }

    // Allow alphanumeric characters, hyphens, and underscores
    const cleanedValue = value.replaceAll(/[_\-]/gv, "");

    // Must have at least one alphanumeric character remaining

    return cleanedValue.length > 0 && validator.isAlphanumeric(cleanedValue);
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
    options?: Parameters<typeof validator.isInt>[1]
): value is string {
    return typeof value === "string" && validator.isInt(value, options);
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
    options?: Parameters<typeof validator.isFloat>[1]
): value is string {
    return typeof value === "string" && validator.isFloat(value, options);
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
    if (validator.isIP(value)) {
        return true;
    }

    // Check if it's a valid FQDN
    if (
        validator.isFQDN(value, {
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
        // Exclude port 0 as it's reserved and not suitable for user configuration
        if (value === 0) return false;
        return validator.isPort(value.toString());
    }
    if (typeof value === "string") {
        // Exclude port "0" as it's reserved and not suitable for user configuration
        if (value === "0") return false;
        return validator.isPort(value);
    }
    return false;
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
    options?: Parameters<typeof validator.isURL>[1]
): value is string {
    if (typeof value !== "string") {
        return false;
    }

    const urlOptions = {
        allow_protocol_relative_urls: false,
        allow_trailing_dot: false,
        allow_underscores: false,
        disallow_auth: false,
        protocols: ["http", "https"],
        require_host: true,
        require_port: false,
        require_protocol: true,
        require_tld: false,
        require_valid_protocol: true,
        ...options,
    } satisfies Parameters<typeof validator.isURL>[1];

    if (value.includes("'") || value.includes("`")) {
        return false;
    }

    if (/^[a-z][a-z\d+\-.]*:\/\/$/iv.test(value)) {
        return false;
    }

    if (urlOptions.require_protocol && !value.includes("://")) {
        return false;
    }

    const allowedProtocols = urlOptions.protocols ?? [];

    const requiresAuthorityDelimiter = allowedProtocols.some((protocol) => {
        const normalizedProtocol = protocol.toLowerCase();
        return normalizedProtocol === "http" || normalizedProtocol === "https";
    });

    if (requiresAuthorityDelimiter) {
        const normalizedValue = value.toLowerCase();

        const hasMissingAuthoritySlashes = (scheme: string): boolean => {
            if (!normalizedValue.startsWith(scheme)) {
                return false;
            }

            const firstCharacter = normalizedValue.charAt(scheme.length);
            const secondCharacter = normalizedValue.charAt(scheme.length + 1);
            return firstCharacter !== "/" || secondCharacter !== "/";
        };

        if (hasMissingAuthoritySlashes("http:")) {
            return false;
        }

        if (hasMissingAuthoritySlashes("https:")) {
            return false;
        }
    }

    const firstSchemeSeparator = value.indexOf("://");
    if (firstSchemeSeparator !== -1) {
        const remainder = value.slice(firstSchemeSeparator + 3).toLowerCase();
        if (
            (remainder.startsWith("http:") && remainder.slice(5, 7) === "//") ||
            (remainder.startsWith("https:") && remainder.slice(6, 8) === "//")
        ) {
            return false;
        }
        if (value.endsWith("://")) {
            return false;
        }
    }

    return validator.isURL(value, urlOptions);
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
    // eslint-disable-next-line @typescript-eslint/init-declarations -- assigned in try/catch
    let str: string;
    try {
        str = String(value);
    } catch {
        return defaultValue;
    }

    if (!isValidInteger(str)) {
        return defaultValue;
    }

    let num = Number.parseInt(str, 10);

    if (min !== undefined && num < min) {
        num = min;
    }

    if (max !== undefined && num > max) {
        num = max;
    }

    return num;
}
