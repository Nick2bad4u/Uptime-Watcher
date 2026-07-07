import { ensureError } from "@shared/utils/errorHandling";
import { randomUUID } from "node:crypto";
import { existsSync, lstatSync, mkdirSync, renameSync } from "node:fs";
import * as path from "node:path";

const DATABASE_LOCK_ARTIFACT_SUFFIXES = Object.freeze([
    "-journal",
    "-shm",
    "-wal",
    "-lock",
    "-tmp",
]);

const DATABASE_LOCK_ARTIFACT_EXTENSIONS = Object.freeze([".lock", ".tmp"]);

const RECOVERY_DIRECTORY_NAME = "stale-lock-artifacts" as const;

/**
 * Normalizes a candidate file path and ensures it resides within the provided
 * directory.
 *
 * @param directory - Absolute base directory that defines the allowed
 *   filesystem boundary.
 * @param candidate - Candidate path that should be validated.
 *
 * @returns A normalized absolute path guaranteed to remain inside the provided
 *   directory.
 *
 * @throws {@link Error} When the resolved candidate would escape the allowed
 *   directory.
 */
const resolveCandidatePath = (directory: string, candidate: string): string => {
    const resolvedDirectory = path.resolve(directory);
    const resolvedCandidate = path.resolve(candidate);
    const relativeCandidate = path.relative(
        resolvedDirectory,
        resolvedCandidate
    );

    if (
        relativeCandidate === ".." ||
        relativeCandidate.startsWith(`..${path.sep}`) ||
        path.isAbsolute(relativeCandidate)
    ) {
        throw new Error(
            `Candidate path '${resolvedCandidate}' is outside of '${resolvedDirectory}'`
        );
    }

    return resolvedCandidate;
};

/**
 * Calculates a filename without any SQLite-related extension.
 *
 * @param baseName - Original filename (potentially including an extension).
 *
 * @returns The filename stripped of known SQLite extensions when present.
 */
const deriveBaseNameWithoutExtension = (baseName: string): string => {
    const normalized = baseName.toLowerCase();
    for (const extension of [
        ".db",
        ".sqlite",
        ".sqlite3",
    ] as const) {
        if (normalized.endsWith(extension)) {
            return baseName.slice(0, -extension.length);
        }
    }

    return baseName;
};

const ensureRecoveryDirectory = (
    recoveryDirectory: string,
    recoveryState: { ensured: boolean }
): void => {
    if (recoveryState.ensured) {
        return;
    }

    // eslint-disable-next-line security/detect-non-literal-fs-filename -- Recovery directory path is validated by caller; synchronous creation keeps initialization deterministic.
    mkdirSync(recoveryDirectory, { recursive: true });

    // eslint-disable-next-line security/detect-non-literal-fs-filename -- Recovery directory path is validated by caller before this check.
    const stat = lstatSync(recoveryDirectory);
    if (stat.isSymbolicLink()) {
        throw new Error("Recovery directory must not be a symlink");
    }

    if (!stat.isDirectory()) {
        throw new Error("Recovery path must be a directory");
    }

    recoveryState.ensured = true;
};

/**
 * Moves a lock artifact into the recovery directory and returns relocation
 * metadata.
 *
 * @param resolvedCandidate - Absolute path to the artifact slated for
 *   relocation.
 * @param baseDirectory - Database directory used to constrain relocation
 *   targets.
 * @param recoveryDirectory - Destination directory for relocated artifacts.
 * @param recoveryState - Mutable state indicating whether the destination has
 *   been created.
 *
 * @returns Structured metadata describing the relocation outcome.
 *
 * @throws {@link Error} When relocation cannot be completed.
 */
const performRelocation = (
    resolvedCandidate: string,
    baseDirectory: string,
    recoveryDirectory: string,
    recoveryState: { ensured: boolean }
): DatabaseLockArtifact => {
    ensureRecoveryDirectory(recoveryDirectory, recoveryState);

    const uniqueSuffix: string = ((): string => {
        try {
            return randomUUID();
        } catch (error) {
            const normalized = ensureError(error);
            throw new Error(
                `Failed to generate identifier for stale lock relocation: ${normalized.message}`,
                { cause: error }
            );
        }
    })();

    const relocatedPath = resolveCandidatePath(
        baseDirectory,
        path.join(
            recoveryDirectory,
            `${path.basename(resolvedCandidate)}.stale-${Date.now()}-${uniqueSuffix}`
        )
    );

    // eslint-disable-next-line security/detect-non-literal-fs-filename -- Paths validated to stay inside the user data directory; synchronous move maintains deterministic initialization.
    renameSync(resolvedCandidate, relocatedPath);

    return {
        originalPath: resolvedCandidate,
        relocatedPath,
    };
};

/**
 * Describes a lock artifact that has been relocated during recovery.
 */
export interface DatabaseLockArtifact {
    readonly originalPath: string;
    readonly relocatedPath: string;
}

/**
 * Aggregated outcome of the lock artifact cleanup routine.
 */
export interface DatabaseLockCleanupResult {
    readonly failed: { path: string; reason: string }[];
    readonly missing: string[];
    readonly relocated: DatabaseLockArtifact[];
}

/**
 * Produces the Cartesian set of potential lock artifact paths for a database
 * file.
 *
 * @param dbPath - Absolute path to the SQLite database file.
 *
 * @returns A de-duplicated list of candidate artifact paths to evaluate.
 */
const generateLockArtifactCandidates = (dbPath: string): string[] => {
    const directory = path.dirname(dbPath);
    const baseName = path.basename(dbPath);
    const candidates = new Set<string>();

    for (const suffix of DATABASE_LOCK_ARTIFACT_SUFFIXES) {
        candidates.add(path.join(directory, `${baseName}${suffix}`));
    }

    for (const extension of DATABASE_LOCK_ARTIFACT_EXTENSIONS) {
        candidates.add(path.join(directory, `${baseName}${extension}`));
    }

    const baseWithoutExtension = deriveBaseNameWithoutExtension(baseName);
    if (baseWithoutExtension !== baseName && baseWithoutExtension.length > 0) {
        for (const suffix of DATABASE_LOCK_ARTIFACT_SUFFIXES) {
            candidates.add(
                path.join(directory, `${baseWithoutExtension}${suffix}`)
            );
        }
        for (const extension of DATABASE_LOCK_ARTIFACT_EXTENSIONS) {
            candidates.add(
                path.join(directory, `${baseWithoutExtension}${extension}`)
            );
        }
    }

    return [...candidates];
};

/**
 * Attempts to relocate stale SQLite lock artifacts to a quarantined recovery
 * directory so that initialization can proceed.
 *
 * @param dbPath - Absolute path to the SQLite database file.
 *
 * @returns Diagnostic information describing relocated, missing, and failed
 *   artifacts.
 */
export const cleanupDatabaseLockArtifacts = (
    dbPath: string
): DatabaseLockCleanupResult => {
    const directory = path.dirname(dbPath);
    const recoveryDirectory = resolveCandidatePath(
        directory,
        path.join(directory, RECOVERY_DIRECTORY_NAME)
    );
    const recoveryState = { ensured: false };

    const relocated: DatabaseLockArtifact[] = [];
    const missing: string[] = [];
    const failed: { path: string; reason: string }[] = [];

    for (const candidate of generateLockArtifactCandidates(dbPath)) {
        let resolvedCandidate: string | undefined;

        try {
            resolvedCandidate = resolveCandidatePath(directory, candidate);
        } catch (error) {
            failed.push({
                path: candidate,
                reason: ensureError(error).message,
            });
        }

        if (resolvedCandidate) {
            try {
                const isCandidateExists =
                    // eslint-disable-next-line security/detect-non-literal-fs-filename -- Path validated to remain within the user data directory; synchronous check keeps startup deterministic.
                    existsSync(resolvedCandidate);

                if (isCandidateExists) {
                    const artifact = performRelocation(
                        resolvedCandidate,
                        directory,
                        recoveryDirectory,
                        recoveryState
                    );
                    relocated.push(artifact);
                } else {
                    missing.push(resolvedCandidate);
                }
            } catch (error) {
                failed.push({
                    path: resolvedCandidate,
                    reason: ensureError(error).message,
                });
            }
        }
    }

    return { failed, missing, relocated };
};
