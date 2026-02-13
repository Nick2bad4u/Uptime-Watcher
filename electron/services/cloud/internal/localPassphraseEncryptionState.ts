import type { CloudSettingsAdapter } from "../CloudService.types";
import type { SecretStore } from "../secrets/SecretStore";

import { encodeBase64 } from "./cloudServicePrimitives";
import {
    SECRET_KEY_ENCRYPTION_DERIVED_KEY,
    SETTINGS_KEY_ENCRYPTION_MODE,
    SETTINGS_KEY_ENCRYPTION_SALT,
} from "./cloudServiceSettings";

/**
 * Persists local passphrase-encryption state after key derivation succeeds.
 *
 * @remarks
 * Settings writes are intentionally sequential because production settings are
 * transaction-backed.
 */
export async function persistLocalPassphraseEncryptionState(args: {
    readonly derivedKey: Buffer;
    readonly saltBase64: string;
    readonly secretStore: SecretStore;
    readonly settings: CloudSettingsAdapter;
}): Promise<void> {
    await args.settings.set(SETTINGS_KEY_ENCRYPTION_MODE, "passphrase");
    await args.settings.set(SETTINGS_KEY_ENCRYPTION_SALT, args.saltBase64);
    await args.secretStore.setSecret(
        SECRET_KEY_ENCRYPTION_DERIVED_KEY,
        encodeBase64(args.derivedKey)
    );
}
