import { ensureError } from "@shared/utils/errorHandling";

import type { SecretStore } from "../secrets/SecretStore";

import { logger } from "../../../utils/logger";

/**
 * Deletes provider-related secrets without failing the caller when cleanup
 * cannot be completed.
 *
 * @remarks
 * Secret cleanup is often a post-success hygiene step (for example after a
 * provider switch). Failing the entire operation because stale credentials
 * could not be removed leads to inconsistent UX and partial-state errors.
 */
export async function deleteProviderSecretsBestEffort(args: {
    readonly operationLabel: string;
    readonly secretKeys: readonly string[];
    readonly secretStore: SecretStore;
}): Promise<void> {
    await Promise.allSettled(
        args.secretKeys.map(async (secretKey) => {
            try {
                await args.secretStore.deleteSecret(secretKey);
            } catch (error: unknown) {
                const resolved = ensureError(error);

                logger.warn(
                    "[CloudService] Failed to clean up provider secret (continuing)",
                    {
                        message: resolved.message,
                        operation: args.operationLabel,
                        secretKey,
                    }
                );
            }
        })
    );
}
