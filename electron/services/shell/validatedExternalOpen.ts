import { tryGetErrorCode } from "@shared/utils/errorCodes";
import { ensureError } from "@shared/utils/errorHandling";
import {
    type ExternalOpenUrlAcceptedResult,
    type ExternalOpenUrlRejectedResult,
    type ExternalOpenUrlValidationResult,
    validateExternalOpenUrlCandidate,
} from "@shared/utils/urlSafety";

import { openExternalOrThrow } from "./openExternalUtils";

/**
 * Canonical reason string used when HTTPS is required.
 *
 * @remarks
 * Exported to avoid magic-string comparisons at call sites that need to
 * preserve legacy error messaging.
 */
export const EXTERNAL_OPEN_HTTPS_REQUIRED_REASON = "must use https" as const;

/**
 * Additional policy constraints applied on top of shared
 * {@link validateExternalOpenUrlCandidate} validation.
 */
export type ExternalOpenPolicy = Readonly<{
    /**
     * When true, only `https:` URLs are accepted.
     *
     * @remarks
     * This is intended for OAuth authorization URLs and other flows where
     * opening an insecure `http:` URL would be unexpected.
     */
    readonly requireHttps?: boolean;
}>;

/**
 * Validates a candidate external-open URL against shared policy plus optional
 * Electron-specific constraints.
 */
export function validateExternalOpenUrlCandidateWithPolicy(
    rawUrl: unknown,
    policy?: ExternalOpenPolicy
): ExternalOpenUrlValidationResult {
    const validation = validateExternalOpenUrlCandidate(rawUrl);

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare -- Literal comparison ensures stable narrowing under strict TS.
    if (validation.ok === false) {
        return validation;
    }

    if (policy?.requireHttps) {
        try {
            const parsed = new URL(validation.normalizedUrl);
            if (parsed.protocol !== "https:") {
                return {
                    ok: false,
                    reason: EXTERNAL_OPEN_HTTPS_REQUIRED_REASON,
                    safeUrlForLogging: validation.safeUrlForLogging,
                } satisfies ExternalOpenUrlRejectedResult;
            }
        } catch {
            // `validateExternalOpenUrlCandidate` already guarantees URL
            // parseability for accepted values; this is defense-in-depth.
            return {
                ok: false,
                reason: "must be a valid URL",
                safeUrlForLogging: validation.safeUrlForLogging,
            } satisfies ExternalOpenUrlRejectedResult;
        }
    }

    return validation;
}

/**
 * Result from {@link tryOpenExternalValidated}.
 */
export type TryOpenExternalValidatedResult =
    | Readonly<{
          errorCode?: string;
          errorName: string;
          ok: false;
          outcome: "open-failed";
          safeUrlForLogging: string;
      }>
    | Readonly<{
          normalizedUrl: string;
          ok: true;
          outcome: "opened";
          safeUrlForLogging: string;
      }>
    | Readonly<{
          ok: false;
          outcome: "blocked";
          reason: string;
          safeUrlForLogging: string;
      }>;

/**
 * Best-effort external URL open that never throws.
 *
 * @remarks
 * Intended for navigation interception flows (WindowService) where failures
 * should be logged but not crash the app.
 */
export async function tryOpenExternalValidated(args: {
    readonly failureMessagePrefix: string;
    readonly policy?: ExternalOpenPolicy;
    readonly url: unknown;
}): Promise<TryOpenExternalValidatedResult> {
    const validation = validateExternalOpenUrlCandidateWithPolicy(
        args.url,
        args.policy
    );

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare -- Literal comparison ensures stable narrowing under strict TS.
    if (validation.ok === false) {
        return {
            ok: false,
            outcome: "blocked",
            reason: validation.reason,
            safeUrlForLogging: validation.safeUrlForLogging,
        };
    }

    try {
        await openExternalOrThrow({
            failureMessagePrefix: args.failureMessagePrefix,
            normalizedUrl: validation.normalizedUrl,
            safeUrlForLogging: validation.safeUrlForLogging,
        });

        return {
            normalizedUrl: validation.normalizedUrl,
            ok: true,
            outcome: "opened",
            safeUrlForLogging: validation.safeUrlForLogging,
        };
    } catch (error: unknown) {
        const resolved = ensureError(error);
        const code = tryGetErrorCode(
            (resolved as { cause?: unknown }).cause ?? resolved
        );

        return {
            errorName: resolved.name,
            ok: false,
            outcome: "open-failed",
            ...(typeof code === "string" && code.length > 0
                ? { errorCode: code }
                : {}),
            safeUrlForLogging: validation.safeUrlForLogging,
        };
    }
}

function createExternalOpenRejectionError(args: {
    readonly reason: string;
    readonly safeUrlForLogging: string;
    readonly verbPhrase: string;
}): TypeError {
    return new TypeError(
        `${args.verbPhrase} URL: ${args.safeUrlForLogging} (reason ${args.reason})`
    );
}

/**
 * Validates a candidate external-open URL and opens it via
 * `shell.openExternal`.
 *
 * @throws TypeError - When URL validation fails.
 */
export async function openExternalValidatedOrThrow(args: {
    /** Prefix used if the underlying Electron open fails. */
    readonly failureMessagePrefix: string;
    /** Optional additional policy constraints (e.g. HTTPS-only). */
    readonly policy?: ExternalOpenPolicy;
    /** Verb phrase for rejection errors (e.g. "Rejected unsafe openExternal"). */
    readonly rejectionVerbPhrase: string;
    /** URL candidate (often from IPC payloads). */
    readonly url: unknown;
}): Promise<ExternalOpenUrlAcceptedResult> {
    const validation = validateExternalOpenUrlCandidateWithPolicy(
        args.url,
        args.policy
    );

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare -- Literal comparison ensures stable narrowing under strict TS.
    if (validation.ok === false) {
        throw createExternalOpenRejectionError({
            reason: validation.reason,
            safeUrlForLogging: validation.safeUrlForLogging,
            verbPhrase: args.rejectionVerbPhrase,
        });
    }

    await openExternalOrThrow({
        failureMessagePrefix: args.failureMessagePrefix,
        normalizedUrl: validation.normalizedUrl,
        safeUrlForLogging: validation.safeUrlForLogging,
    });

    return validation;
}
