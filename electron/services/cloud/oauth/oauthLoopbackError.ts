import { ensureError } from "@shared/utils/errorHandling";

const OAUTH_CALLBACK_ERROR_PREFIX = "OAuth callback error: ";
const OAUTH_LOOPBACK_TIMEOUT_MESSAGE = "OAuth loopback timeout";
const OAUTH_STATE_MISMATCH_MESSAGE = "OAuth state mismatch";

/**
 * Converts generic loopback OAuth callback errors into provider-specific,
 * user-facing errors.
 *
 * @remarks
 * The loopback server emits provider-agnostic sentinel messages (for example
 * "OAuth state mismatch"). Provider flows should present contextual errors so
 * users know which connect flow failed.
 */
export function normalizeProviderOAuthLoopbackError(args: {
    readonly error: unknown;
    readonly providerName: string;
}): Error {
    const resolved = ensureError(args.error);

    if (resolved.message === OAUTH_STATE_MISMATCH_MESSAGE) {
        return new Error(`${args.providerName} OAuth state mismatch`, {
            cause: args.error,
        });
    }

    if (resolved.message === OAUTH_LOOPBACK_TIMEOUT_MESSAGE) {
        return new Error(`${args.providerName} OAuth timed out`, {
            cause: args.error,
        });
    }

    if (resolved.message.startsWith(OAUTH_CALLBACK_ERROR_PREFIX)) {
        const details = resolved.message.slice(
            OAUTH_CALLBACK_ERROR_PREFIX.length
        );
        return new Error(`${args.providerName} OAuth error: ${details}`, {
            cause: args.error,
        });
    }

    return resolved;
}
