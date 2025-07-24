/**
 * Centralized constants for the Uptime Watcher application.
 * Contains configuration values, UI constants, and type definitions.
 */

/**
 * Font family constants for theme reuse.
 *
 * @remarks
 * Monospace fonts prioritize consistent character width for code display.
 */
export const FONT_FAMILY_MONO = ["SF Mono", "Monaco", "Inconsolata", "Roboto Mono", "monospace"];

/**
 * Sans-serif font family constants for general UI text.
 *
 * @remarks
 * Prioritizes system fonts for optimal performance and native appearance.
 */
export const FONT_FAMILY_SANS = ["Inter", "system-ui", "Avenir", "Helvetica", "Arial", "sans-serif"];

/**
 * Interface for interval options used in dropdowns.
 *
 * @remarks
 * Provides structured data for time interval selection components.
 */
export interface IntervalOption {
    /** Human-readable label for the interval */
    label: string;
    /** Interval value in milliseconds */
    value: number;
}

/**
 * Available check intervals for site monitoring.
 * Ranges from 5 seconds to 30 days with sensible progressions.
 */
export const CHECK_INTERVALS: IntervalOption[] = [
    // Seconds
    { label: "5 seconds", value: 5000 },
    { label: "10 seconds", value: 10_000 },
    { label: "15 seconds", value: 15_000 },
    { label: "20 seconds", value: 20_000 },
    { label: "30 seconds", value: 30_000 },
    { label: "45 seconds", value: 45_000 },

    // Minutes
    { label: "1 minute", value: 60_000 },
    { label: "2 minutes", value: 120_000 },
    { label: "3 minutes", value: 180_000 },
    { label: "4 minutes", value: 240_000 },
    { label: "5 minutes", value: 300_000 },
    { label: "10 minutes", value: 600_000 },
    { label: "15 minutes", value: 900_000 },
    { label: "20 minutes", value: 1_200_000 },
    { label: "25 minutes", value: 1_500_000 },
    { label: "30 minutes", value: 1_800_000 },
    { label: "45 minutes", value: 2_700_000 },

    // Hours
    { label: "1 hour", value: 3_600_000 },
    { label: "2 hours", value: 7_200_000 },
    { label: "3 hours", value: 10_800_000 },
    { label: "4 hours", value: 14_400_000 },
    { label: "6 hours", value: 21_600_000 },
    { label: "8 hours", value: 28_800_000 },
    { label: "12 hours", value: 43_200_000 },
    { label: "24 hours", value: 86_400_000 },
    { label: "2 days", value: 172_800_000 },
    { label: "3 days", value: 259_200_000 },
    { label: "7 days", value: 604_800_000 },
    { label: "14 days", value: 1_209_600_000 },
    { label: "21 days", value: 1_814_400_000 },
    { label: "30 days", value: 2_592_000_000 },
];

/**
 * Default check interval in milliseconds.
 *
 * @remarks
 * Set to 5 minutes (300,000ms) as a reasonable balance between
 * monitoring frequency and system resource usage.
 */
export const DEFAULT_CHECK_INTERVAL = 300_000;

/**
 * Default request timeout in milliseconds.
 *
 * @remarks
 * Set to 10 seconds to balance between allowing slow responses
 * and preventing indefinite hangs.
 */
export const DEFAULT_REQUEST_TIMEOUT = 10_000;

/**
 * Default request timeout in seconds for UI display.
 *
 * @remarks
 * UI-friendly representation of the timeout value for form fields
 * and user-facing settings.
 */
export const DEFAULT_REQUEST_TIMEOUT_SECONDS = 10;

/**
 * Default history limit for monitoring records.
 *
 * @remarks
 * Set to 500 records as a reasonable default for most use cases,
 * balancing data retention with storage efficiency.
 */
export const DEFAULT_HISTORY_LIMIT = 500;

/**
 * History limit options for controlling data retention.
 *
 * @remarks
 * Provides a range of options from 25 to 1,000,000 records
 * to accommodate different monitoring needs and storage constraints.
 */
export const HISTORY_LIMIT_OPTIONS: IntervalOption[] = [
    { label: "25 records", value: 25 },
    { label: "50 records", value: 50 },
    { label: "100 records", value: 100 },
    { label: "200 records", value: 200 },
    { label: "500 records", value: 500 },
    { label: "1,000 records", value: 1000 },
    { label: "5,000 records", value: 5000 },
    { label: "10,000 records", value: 10_000 },
    { label: "50,000 records", value: 50_000 },
    { label: "100,000 records", value: 100_000 },
    { label: "250,000 records", value: 250_000 },
    { label: "500,000 records", value: 500_000 },
    { label: "1,000,000 records", value: 1_000_000 },
    { label: "Unlimited", value: Number.MAX_SAFE_INTEGER },
];

/**
 * Request timeout constraints for HTTP monitoring.
 *
 * @remarks
 * Defines the user-facing timeout limits in seconds for form validation
 * and UI display. These values are converted to milliseconds for backend use.
 */
export const TIMEOUT_CONSTRAINTS = {
    /** Maximum timeout in seconds */
    MAX: 300, // 300 seconds maximum (displayed to user)
    /** Minimum timeout in seconds */
    MIN: 1, // 1 second minimum (displayed to user)
    /** Step increment in seconds */
    STEP: 1, // 1 second increments (displayed to user)
} as const;

/**
 * Internal timeout constraints in milliseconds for backend operations.
 *
 * @remarks
 * These values correspond to TIMEOUT_CONSTRAINTS but are converted
 * to milliseconds for actual timeout implementation.
 */
export const TIMEOUT_CONSTRAINTS_MS = {
    /** Maximum timeout in milliseconds */
    MAX: 300_000, // 300 seconds maximum
    /** Minimum timeout in milliseconds */
    MIN: 1000, // 1 second minimum
    /** Step increment in milliseconds */
    STEP: 1000, // 1 second increments
} as const;

/**
 * Retry attempt constraints for per-monitor retry configuration.
 *
 * @remarks
 * Defines the limits for retry attempts when monitors fail,
 * balancing between resilience and avoiding excessive load.
 */
export const RETRY_CONSTRAINTS = {
    /** Default number of retry attempts */
    DEFAULT: 3, // Default retry attempts
    /** Maximum retry attempts allowed */
    MAX: 10, // 10 retry attempts maximum
    /** Minimum retry attempts (immediate failure) */
    MIN: 0, // 0 retries minimum (immediate failure)
    /** Step increment for retry configuration */
    STEP: 1, // 1 retry increment
} as const;

/**
 * UI delays and timing to prevent flashing and improve UX.
 *
 * @remarks
 * These delays prevent UI flickering for operations that complete quickly
 * while still providing feedback for longer operations.
 */
export const UI_DELAYS = {
    /** Delay before showing loading spinners in milliseconds */
    LOADING_BUTTON: 100, // Delay before showing loading spinners (ms)
    /** Delay before showing loading overlay in milliseconds */
    LOADING_OVERLAY: 100, // Delay before showing loading overlay (ms)
} as const;

/**
 * Chart time periods for analytics components.
 *
 * @remarks
 * Defines standard time periods in milliseconds for data visualization
 * and historical analysis components.
 */
export const CHART_TIME_PERIODS = {
    /** 1 hour in milliseconds */
    "1h": 60 * 60 * 1000,
    /** 7 days in milliseconds */
    "7d": 7 * 24 * 60 * 60 * 1000,
    /** 12 hours in milliseconds */
    "12h": 12 * 60 * 60 * 1000,
    /** 24 hours in milliseconds */
    "24h": 24 * 60 * 60 * 1000,
    /** 30 days in milliseconds */
    "30d": 30 * 24 * 60 * 60 * 1000,
} as const;

/**
 * Common ARIA attribute constants for accessibility.
 *
 * @remarks
 * Provides standardized ARIA attribute strings to ensure consistent
 * accessibility implementation across components.
 */
export const ARIA_LABEL = "aria-label";

/**
 * Standard transition timing for smooth animations.
 *
 * @remarks
 * Provides consistent transition timing across the application
 * for smooth user interface animations.
 */
export const TRANSITION_ALL = "all 0.2s ease-in-out";
