import type { SecretStore } from "../secrets/SecretStore";

import {
    decodeStrictBase64,
    ENCRYPTION_KEY_BYTES,
} from "./cloudServicePrimitives";
import { SECRET_KEY_ENCRYPTION_DERIVED_KEY } from "./cloudServiceSettings";

/**
 * Represents the local derived-key state persisted for passphrase encryption.
 */
export type DerivedEncryptionKeyState =
    | { key: Buffer; kind: "available" }
    | { kind: "invalid" }
    | { kind: "missing" };

/**
 * Reads the locally persisted derived encryption key.
 *
 * @remarks
 * Corrupted secrets are treated as `invalid` and removed best-effort so
 * subsequent reads see a clean `missing` state.
 */
export async function resolveStoredDerivedEncryptionKey(args: {
    readonly secretStore: SecretStore;
}): Promise<DerivedEncryptionKeyState> {
    const rawKeyBase64 = await args.secretStore.getSecret(
        SECRET_KEY_ENCRYPTION_DERIVED_KEY
    );

    if (!rawKeyBase64) {
        return { kind: "missing" };
    }

    try {
        return {
            key: decodeStrictBase64({
                expectedBytes: ENCRYPTION_KEY_BYTES,
                label: "encryption key",
                value: rawKeyBase64,
            }),
            kind: "available",
        };
    } catch {
        await args.secretStore
            .deleteSecret(SECRET_KEY_ENCRYPTION_DERIVED_KEY)
            .catch(() => {});
        return { kind: "invalid" };
    }
}
