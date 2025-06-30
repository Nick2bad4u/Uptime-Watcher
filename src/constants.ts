/**
 * Centralized constants for the Uptime Watcher application.
 * Contains configuration values, UI constants, and type definitions.
 */

/** Status types for site monitoring */
export type StatusType = "up" | "down" | "pending" | "unknown";

/** Font family constants for theme reuse */
export const FONT_FAMILY_MONO = ["SF Mono", "Monaco", "Inconsolata", "Roboto Mono", "monospace"];
export const FONT_FAMILY_SANS = ["Inter", "system-ui", "Avenir", "Helvetica", "Arial", "sans-serif"];

/** Interface for interval options used in dropdowns */
export interface IntervalOption {
    value: number;
    label: string;
}

/**
 * Available check intervals for site monitoring.
 * Ranges from 5 seconds to 30 days with sensible progressions.
 */
export const CHECK_INTERVALS: IntervalOption[] = [
    // Seconds
    { label: "5 seconds", value: 5000 },
    { label: "10 seconds", value: 10000 },
    { label: "15 seconds", value: 15000 },
    { label: "20 seconds", value: 20000 },
    { label: "30 seconds", value: 30000 },
    { label: "45 seconds", value: 45000 },

    // Minutes
    { label: "1 minute", value: 60000 },
    { label: "2 minutes", value: 120000 },
    { label: "3 minutes", value: 180000 },
    { label: "4 minutes", value: 240000 },
    { label: "5 minutes", value: 300000 },
    { label: "10 minutes", value: 600000 },
    { label: "15 minutes", value: 900000 },
    { label: "20 minutes", value: 1200000 },
    { label: "25 minutes", value: 1500000 },
    { label: "30 minutes", value: 1800000 },
    { label: "45 minutes", value: 2700000 },

    // Hours
    { label: "1 hour", value: 3600000 },
    { label: "2 hours", value: 7200000 },
    { label: "3 hours", value: 10800000 },
    { label: "4 hours", value: 14400000 },
    { label: "6 hours", value: 21600000 },
    { label: "8 hours", value: 28800000 },
    { label: "12 hours", value: 43200000 },
    { label: "24 hours", value: 86400000 },
    { label: "2 days", value: 172800000 },
    { label: "3 days", value: 259200000 },
    { label: "7 days", value: 604800000 },
    { label: "14 days", value: 1209600000 },
    { label: "21 days", value: 1814400000 },
    { label: "30 days", value: 2592000000 },
];

/** Default check interval (5 minutes) */
export const DEFAULT_CHECK_INTERVAL = 300000;

/** History limit options for controlling data retention */
export const HISTORY_LIMIT_OPTIONS: IntervalOption[] = [
    { label: "25 records", value: 25 },
    { label: "50 records", value: 50 },
    { label: "100 records", value: 100 },
    { label: "200 records", value: 200 },
    { label: "500 records", value: 500 },
    { label: "1,000 records", value: 1000 },
    { label: "5,000 records", value: 5000 },
    { label: "10,000 records", value: 10000 },
    { label: "50,000 records", value: 50000 },
    { label: "100,000 records", value: 100000 },
    { label: "250,000 records", value: 250000 },
    { label: "500,000 records", value: 500000 },
    { label: "1,000,000 records", value: 1000000 },
    { label: "Unlimited", value: Number.MAX_SAFE_INTEGER },
];

/** Request timeout constraints for HTTP monitoring */
export const TIMEOUT_CONSTRAINTS = {
    MAX: 300, // 300 seconds maximum (displayed to user)
    MIN: 1, // 1 second minimum (displayed to user)
    STEP: 1, // 1 second increments (displayed to user)
} as const;

/** Internal timeout constraints in milliseconds (for backend) */
export const TIMEOUT_CONSTRAINTS_MS = {
    MAX: 300000, // 300 seconds maximum
    MIN: 1000, // 1 second minimum
    STEP: 1000, // 1 second increments
} as const;

/** Retry attempt constraints for per-monitor retry configuration */
export const RETRY_CONSTRAINTS = {
    DEFAULT: 0, // Default retry attempts (disabled)
    MAX: 10, // 10 retry attempts maximum
    MIN: 0, // 0 retries minimum (immediate failure)
    STEP: 1, // 1 retry increment
} as const;

/** UI delays and timing to prevent flashing and improve UX */
export const UI_DELAYS = {
    LOADING_BUTTON: 100, // Delay before showing loading spinners (ms)
    LOADING_OVERLAY: 100, // Delay before showing loading overlay (ms)
} as const;

/** Chart time periods for analytics components (in milliseconds) */
export const CHART_TIME_PERIODS = {
    "1h": 60 * 60 * 1000,
    "12h": 12 * 60 * 60 * 1000,
    "24h": 24 * 60 * 60 * 1000,
    // eslint-disable-next-line perfectionist/sort-objects -- keep in ascending order
    "7d": 7 * 24 * 60 * 60 * 1000,
    "30d": 30 * 24 * 60 * 60 * 1000,
} as const;

/** Common ARIA attribute constants for accessibility */
export const ARIA_LABEL = "aria-label";

/** Standard transition timing for smooth animations */
export const TRANSITION_ALL = "all 0.2s ease-in-out";
