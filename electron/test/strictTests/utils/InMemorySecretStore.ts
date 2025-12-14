import type { SecretStore } from "@electron/services/cloud/secrets/SecretStore";

/**
 * In-memory {@link SecretStore} for strict tests.
 */
export class InMemorySecretStore implements SecretStore {
    private readonly data = new Map<string, string>();

    public async deleteSecret(key: string): Promise<void> {
        this.data.delete(key);
    }

    public async getSecret(key: string): Promise<string | undefined> {
        return this.data.get(key);
    }

    public async setSecret(key: string, value: string): Promise<void> {
        this.data.set(key, value);
    }
}
