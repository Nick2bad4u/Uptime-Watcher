import type { CloudProviderKind } from "@shared/types/cloud";

/**
 * Supported provider operation identifiers.
 */
export type CloudProviderOperation =
    | "connect"
    | "deleteObject"
    | "downloadBackup"
    | "downloadObject"
    | "getAccountLabel"
    | "getConnectionStatus"
    | "isConnected"
    | "listBackups"
    | "listObjects"
    | "uploadBackup"
    | "uploadObject";

/**
 * Options for {@link CloudProviderOperationError}.
 */
export interface CloudProviderOperationErrorOptions extends ErrorOptions {
    /**
     * Optional Node-style error code to preserve errno semantics.
     *
     * @example "ENOENT", "EEXIST"
     */
    readonly code?: NodeJS.ErrnoException["code"] | undefined;

    /** Logical operation that failed. */
    readonly operation: CloudProviderOperation;

    /** Provider implementation that produced this failure. */
    readonly providerKind: CloudProviderKind;

    /**
     * Optional identifier involved in the operation.
     *
     * @remarks
     * Typically an object key, backup fileName, or a prefix.
     */
    readonly target?: string | undefined;
}

/**
 * Typed cloud provider error wrapper.
 *
 * @remarks
 * This error standardizes attribution for cloud-provider failures (provider
 * kind and operation), while preserving a cause chain.
 */
export class CloudProviderOperationError
    extends Error
    implements NodeJS.ErrnoException
{
    public readonly code?: NodeJS.ErrnoException["code"] | undefined;

    public readonly operation: CloudProviderOperation;

    public readonly providerKind: CloudProviderKind;

    public readonly target?: string | undefined;

    public constructor(
        message: string,
        options: CloudProviderOperationErrorOptions
    ) {
        super(message, options);
        this.name = "CloudProviderOperationError";
        this.code = options.code;
        this.operation = options.operation;
        this.providerKind = options.providerKind;
        this.target = options.target;
    }
}

/**
 * Type guard for {@link CloudProviderOperationError}.
 */
export function isCloudProviderOperationError(
    value: unknown
): value is CloudProviderOperationError {
    return value instanceof CloudProviderOperationError;
}
