import { DEFAULT_HISTORY_LIMIT_RULES } from "@shared/constants/history";
import { DEFAULT_SITE_NAME as SHARED_DEFAULT_SITE_NAME } from "@shared/constants/sites";

/**
 * @example Const delay = RETRY_BACKOFF.INITIAL_DELAY; const nextDelay =
 * Math.min( delay * RETRY_BACKOFF.MULTIPLIER, RETRY_BACKOFF.MAX_DELAY );
 *
 * @packageDocumentation
 */

/**
 * Shared default history limit for backend operations.
 */
export const DEFAULT_HISTORY_LIMIT: number =
    DEFAULT_HISTORY_LIMIT_RULES.defaultLimit;

/**
 * Interface for retry backoff configuration.
 */
interface RetryBackoffConfig {
    readonly INITIAL_DELAY: number;
    readonly MAX_DELAY: number;
}

/**
 * Default timeout for HTTP requests in milliseconds.
 *
 * @remarks
 * Used by monitor checks and HTTP-based integrations to determine how long to
 * wait before aborting a request.
 *
 * @defaultValue 10000
 */
export const DEFAULT_REQUEST_TIMEOUT = 10_000;

/**
 * Default check interval for new monitors in milliseconds.
 *
 * @remarks
 * Determines how frequently a monitor will check its target by default.
 *
 * @defaultValue 300000
 */
export const DEFAULT_CHECK_INTERVAL = 300_000;

/**
 * Maximum number of monitor start/setup operations to run at once.
 *
 * @remarks
 * Startup, import, and persistent-resume flows can operate on user-sized site
 * collections. Bounding fanout prevents local scheduler/database work from
 * spiking during app initialization while still allowing useful parallelism.
 */
export const MONITOR_START_CONCURRENCY = 8;

/**
 * Maximum number of site/monitor graph read operations to run at once.
 *
 * @remarks
 * Database hydration and JSON export can traverse all stored sites, monitors,
 * and histories. Bounding independent reads prevents large datasets from
 * creating a burst of repository calls while still keeping the UI-facing
 * operations responsive.
 */
export const DATABASE_GRAPH_READ_CONCURRENCY = 8;

/**
 * Maximum number of imported site configurations to validate at once.
 *
 * @remarks
 * Import validation may inspect every monitor on every imported site through
 * the configuration manager. Bounding this prevents large JSON imports from
 * launching all validation work at once before the atomic persist step.
 */
export const IMPORT_SITE_VALIDATION_CONCURRENCY = 8;

/**
 * Maximum number of imported-site notification events to emit at once.
 *
 * @remarks
 * A large import may add many sites. Emitting all follow-up site-added events
 * at once can burst IPC/event listeners immediately after persistence, so the
 * import completion path uses the same bounded worker-pool pattern as other
 * user-sized import work.
 */
export const IMPORT_SITE_EVENT_EMIT_CONCURRENCY = 8;

/**
 * Maximum number of CDN edge endpoint requests to run at once for a single
 * monitor check.
 *
 * @remarks
 * CDN edge monitors can be configured with several user-provided endpoints.
 * Bounding per-check network fanout avoids creating a burst of outbound HTTP
 * requests while still allowing independent edge checks to proceed in
 * parallel.
 */
export const CDN_EDGE_CONSISTENCY_CONCURRENCY = 4;

/**
 * User agent string for HTTP requests.
 *
 * @remarks
 * Sent as the `User-Agent` header in all outbound HTTP requests performed by
 * the backend.
 *
 * @defaultValue "Uptime-Watcher/23.8.0"
 */
export const USER_AGENT = "Uptime-Watcher/23.8.0";

/**
 * Retry backoff configuration for failed operations.
 *
 * @remarks
 * Used for exponential backoff when retrying failed network or database
 * operations, to avoid overwhelming external services or the local system.
 *
 * @example
 *
 * ```ts
 * let delay = RETRY_BACKOFF.INITIAL_DELAY;
 * while (shouldRetry) {
 *     await wait(delay);
 *     delay = Math.min(delay * 2, RETRY_BACKOFF.MAX_DELAY);
 * }
 * ```
 */
export const RETRY_BACKOFF: RetryBackoffConfig = Object.freeze({
    /** Initial delay in milliseconds before first retry. */
    INITIAL_DELAY: 500,
    /** Maximum delay in milliseconds between retries. */
    MAX_DELAY: 5000,
});

/**
 * Main database file name.
 *
 * @remarks
 * The default SQLite database file used for persistent storage.
 *
 * @defaultValue "uptime-watcher.sqlite"
 */
export const DB_FILE_NAME = "uptime-watcher.sqlite";

/**
 * Default site name when no name is provided.
 *
 * @remarks
 * Re-exported from the shared constants module to keep frontend and backend
 * defaults in lockstep.
 */
export const DEFAULT_SITE_NAME: string = SHARED_DEFAULT_SITE_NAME;

/**
 * Backup database file name for data export/import operations.
 *
 * @remarks
 * Used when exporting or importing a backup of the main database.
 *
 * @defaultValue "uptime-watcher-backup.sqlite"
 */
export const BACKUP_DB_FILE_NAME = "uptime-watcher-backup.sqlite";
