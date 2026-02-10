/**
 * Error types for provider-backed cloud sync transport.
 */

/**
 * Indicates that a remote sync object (manifest/snapshot/etc) exists but is not
 * parseable or does not validate against the shared schemas.
 *
 * @remarks
 * This is considered a data corruption / incompatibility signal.
 *
 * Callers (e.g. {@link electron/services/sync/SyncEngine#SyncEngine}) may choose to treat it as recoverable
 * by rebuilding remote state from operation logs.
 */
export class CloudSyncCorruptRemoteObjectError extends Error {
    /** Provider key of the corrupt object. */
    public readonly key: string;

    /** High-level artifact type for diagnostics. */
    public readonly kind: "manifest" | "operations" | "snapshot";

    public constructor(
        message: string,
        options: ErrorOptions & {
            key: string;
            kind: CloudSyncCorruptRemoteObjectError["kind"];
        }
    ) {
        super(message, options);

        this.name = "CloudSyncCorruptRemoteObjectError";
        this.key = options.key;
        this.kind = options.kind;
    }
}
