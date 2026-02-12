import { hasAsciiControlCharacters } from "@shared/utils/stringSafety";
import { getUtfByteLength } from "@shared/utils/utfByteLength";

/**
 * Primitive validation result for untrusted URL string candidates.
 *
 * @remarks
 * This models only _string-level_ guarantees (type, trimming, size budget,
 * newline/control-character rejection). Scheme/protocol/domain rules should be
 * applied by higher-level URL validators.
 */
export type UrlStringCandidateValidationResult =
    | Readonly<{
          normalizedUrl: string;
          ok: true;
          safeUrlForLogging: string;
      }>
    | Readonly<{
          ok: false;
          reason: string;
          safeUrlForLogging: string;
      }>;

/**
 * Options for {@link validateUrlStringCandidate}.
 */
export type ValidateUrlStringCandidateOptions = Readonly<{
    /** Fallback log-safe value used before input is considered safe to render. */
    fallbackSafeUrlForLogging: string;
    /** Maximum UTF-8 byte budget accepted for the candidate URL. */
    maxBytes: number;
    /**
     * Formatter used to derive a redacted log-safe representation once the
     * candidate passes basic safety checks.
     */
    toSafeUrlForLogging: (normalizedUrl: string) => string;
}>;

/**
 * Validates primitive URL-string constraints shared across URL safety helpers.
 *
 * @remarks
 * This helper deliberately does _not_ enforce protocol or domain policies. It
 * only standardizes common trust-boundary checks used by multiple higher-level
 * validators:
 *
 * - Candidate must be a string
 * - Trim surrounding whitespace
 * - Enforce non-empty value
 * - Enforce UTF-8 byte budget
 * - Reject CR/LF and ASCII control characters
 *
 * Returning a `safeUrlForLogging` for both success and failure keeps caller
 * error handling consistent and avoids accidental raw URL logging.
 */
export function validateUrlStringCandidate(
    rawUrl: unknown,
    options: ValidateUrlStringCandidateOptions
): UrlStringCandidateValidationResult {
    const { fallbackSafeUrlForLogging, maxBytes, toSafeUrlForLogging } =
        options;

    let safeUrlForLogging = fallbackSafeUrlForLogging;

    if (typeof rawUrl !== "string") {
        return {
            ok: false,
            reason: "must be a string",
            safeUrlForLogging,
        };
    }

    const normalizedUrl = rawUrl.trim();

    if (
        normalizedUrl.length > 0 &&
        getUtfByteLength(normalizedUrl) <= maxBytes &&
        !/[\n\r]/u.test(normalizedUrl) &&
        !hasAsciiControlCharacters(normalizedUrl)
    ) {
        safeUrlForLogging = toSafeUrlForLogging(normalizedUrl);
    }

    if (normalizedUrl.length === 0) {
        return {
            ok: false,
            reason: "must be a non-empty string",
            safeUrlForLogging,
        };
    }

    if (getUtfByteLength(normalizedUrl) > maxBytes) {
        return {
            ok: false,
            reason: `must not exceed ${maxBytes} bytes`,
            safeUrlForLogging,
        };
    }

    if (/[\n\r]/u.test(normalizedUrl)) {
        return {
            ok: false,
            reason: "must not contain newlines",
            safeUrlForLogging,
        };
    }

    if (hasAsciiControlCharacters(normalizedUrl)) {
        return {
            ok: false,
            reason: "must not contain control characters",
            safeUrlForLogging,
        };
    }

    return {
        normalizedUrl,
        ok: true,
        safeUrlForLogging: toSafeUrlForLogging(normalizedUrl),
    };
}
