import type { SerializedDatabaseRestorePayload } from "@shared/types/ipc";

/**
 * Result for building a restore payload from a user-selected SQLite file.
 */
export type SqliteRestorePayloadBuildResult =
    | {
          readonly message: string;
          readonly ok: false;
      }
    | {
          readonly ok: true;
          readonly payload: SerializedDatabaseRestorePayload;
      };

/**
 * Validates a user-selected SQLite backup file and builds the IPC payload.
 *
 * @remarks
 * Settings restores send the file contents through IPC. This helper enforces a
 * byte budget prior to reading the file into memory, and produces stable error
 * messages used by the Settings controller.
 */
export async function tryBuildSerializedDatabaseRestorePayloadFromFile(args: {
    readonly file: File;
    readonly maxBytes: number;
}): Promise<SqliteRestorePayloadBuildResult> {
    const { file, maxBytes } = args;

    if (file.size === 0) {
        return {
            message: "Selected SQLite backup file is empty",
            ok: false,
        };
    }

    if (file.size > maxBytes) {
        return {
            message: `Selected SQLite backup is too large to restore (${file.size} > ${maxBytes} bytes).`,
            ok: false,
        };
    }

    return {
        ok: true,
        payload: {
            buffer: await file.arrayBuffer(),
            fileName: file.name,
        },
    };
}
