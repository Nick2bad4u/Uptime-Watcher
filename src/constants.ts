// Centralized constants for the application

export interface IntervalOption {
    value: number;
    label: string;
}

export const CHECK_INTERVALS: IntervalOption[] = [
    // Seconds
    { value: 5000, label: "5 seconds" },
    { value: 10000, label: "10 seconds" },
    { value: 15000, label: "15 seconds" },
    { value: 20000, label: "20 seconds" },
    { value: 30000, label: "30 seconds" },
    { value: 45000, label: "45 seconds" },

    // Minutes
    { value: 60000, label: "1 minute" },
    { value: 120000, label: "2 minutes" },
    { value: 180000, label: "3 minutes" },
    { value: 240000, label: "4 minutes" },
    { value: 300000, label: "5 minutes" },
    { value: 600000, label: "10 minutes" },
    { value: 900000, label: "15 minutes" },
    { value: 1200000, label: "20 minutes" },
    { value: 1500000, label: "25 minutes" },
    { value: 1800000, label: "30 minutes" },
    { value: 2700000, label: "45 minutes" },

    // Hours
    { value: 3600000, label: "1 hour" },
    { value: 7200000, label: "2 hours" },
    { value: 10800000, label: "3 hours" },
    { value: 14400000, label: "4 hours" },
    { value: 21600000, label: "6 hours" },
    { value: 28800000, label: "8 hours" },
    { value: 43200000, label: "12 hours" },
    { value: 86400000, label: "24 hours" },
    { value: 172800000, label: "2 days" },
    { value: 259200000, label: "3 days" },
    { value: 604800000, label: "7 days" },
    { value: 1209600000, label: "14 days" },
    { value: 1814400000, label: "21 days" },
    { value: 2592000000, label: "30 days" },
];

// Default check interval (1 minute)
export const DEFAULT_CHECK_INTERVAL = 60000;

// History limit options
export const HISTORY_LIMIT_OPTIONS: IntervalOption[] = [
    { value: 25, label: "25 records" },
    { value: 50, label: "50 records" },
    { value: 100, label: "100 records" },
    { value: 200, label: "200 records" },
    { value: 500, label: "500 records" },
    { value: 1000, label: "1,000 records" },
    { value: 5000, label: "5,000 records" },
    { value: 10000, label: "10,000 records" },
    { value: 50000, label: "50,000 records" },
    { value: 100000, label: "100,000 records" },
    { value: 250000, label: "250,000 records" },
    { value: 500000, label: "500,000 records" },
    { value: 1000000, label: "1,000,000 records" },
    { value: Infinity, label: "Unlimited" }, // Add this for unlimited
];

// Default history limit
export const DEFAULT_HISTORY_LIMIT = 1000;

// Auto-refresh interval for site details (30 seconds)
export const AUTO_REFRESH_INTERVAL = 30000;

// Request timeout constraints
export const TIMEOUT_CONSTRAINTS = {
    MIN: 1000, // 1 second minimum
    MAX: 60000, // 60 seconds maximum
    STEP: 1000, // 1 second increments
} as const;

// UI delays and timing
export const UI_DELAYS = {
    LOADING_BUTTON: 100, // Delay before showing loading spinners (ms)
    LOADING_OVERLAY: 100, // Delay before showing loading overlay (ms)
} as const;

// Uptime quality thresholds
export const UPTIME_THRESHOLDS = {
    EXCELLENT: 95, // >= 95% is excellent (green)
    GOOD: 90, // >= 90% is good (yellow/warning)
    // < 90% is poor (red/error)
} as const;

// Performance thresholds for response times (in milliseconds)
export const RESPONSE_TIME_THRESHOLDS = {
    FAST: 200, // <= 200ms is fast (green)
    MODERATE: 1000, // <= 1000ms is moderate (yellow)
    // > 1000ms is slow (red)
} as const;

// Time periods for analytics and reporting
export const TIME_PERIODS = {
    LAST_HOUR: 60 * 60 * 1000, // 1 hour
    LAST_6_HOURS: 6 * 60 * 60 * 1000, // 6 hours
    LAST_24_HOURS: 24 * 60 * 60 * 1000, // 24 hours
    LAST_7_DAYS: 7 * 24 * 60 * 60 * 1000, // 7 days
    LAST_30_DAYS: 30 * 24 * 60 * 60 * 1000, // 30 days
    LAST_90_DAYS: 90 * 24 * 60 * 60 * 1000, // 90 days
} as const;

// Chart time periods (for analytics components)
export const CHART_TIME_PERIODS = {
    "1h": 60 * 60 * 1000,
    "24h": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
    "30d": 30 * 24 * 60 * 60 * 1000,
} as const;

// Chart display configuration
export const CHART_CONFIG = {
    MAX_DATA_POINTS: 100, // Maximum data points to show in charts
    MIN_DATA_POINTS: 10, // Minimum data points before showing chart
    ANIMATION_DURATION: 300, // Chart animation duration (ms)
    UPDATE_THROTTLE: 1000, // Throttle chart updates (ms)
    HEIGHT: {
        MINI: 40, // Mini chart height (px)
        SMALL: 100, // Small chart height (px)
        MEDIUM: 200, // Medium chart height (px)
        LARGE: 400, // Large chart height (px)
    },
} as const;

// Site management constraints
export const SITE_CONSTRAINTS = {
    MAX_SITES: 1000, // Maximum number of sites
    URL_MAX_LENGTH: 2048, // Maximum URL length
    NAME_MAX_LENGTH: 100, // Maximum site name length
    DESCRIPTION_MAX_LENGTH: 500, // Maximum description length
    MIN_CHECK_INTERVAL: 5000, // Minimum check interval (5 seconds)
    MAX_CHECK_INTERVAL: 2592000000, // Maximum check interval (30 days)
} as const;

// Notification and alert configuration
export const NOTIFICATION_CONFIG = {
    MAX_RETRIES: 3, // Maximum notification retries
    RETRY_DELAY: 5000, // Delay between retries (ms)
    SOUND_VOLUME: 0.5, // Default sound volume (0-1)
    TOAST_DURATION: 5000, // Toast notification duration (ms)
    BATCH_DELAY: 2000, // Delay before batching multiple notifications (ms)
} as const;

// Data validation patterns
export const VALIDATION_PATTERNS = {
    URL: /^https?:\/\/.+/, // Basic URL validation
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Basic email validation
    IP_ADDRESS: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/, // IPv4
} as const;

// Feature flags for experimental or optional features
export const FEATURE_FLAGS = {
    DARK_MODE_AUTO: true, // Auto dark mode based on system preference
    SOUND_ALERTS: true, // Sound alert functionality
    EXPORT_DATA: true, // Data export functionality
    IMPORT_DATA: true, // Data import functionality
    ADVANCED_CHARTS: true, // Advanced chart features
    BULK_OPERATIONS: true, // Bulk site operations
    CUSTOM_THEMES: false, // Custom theme creation (future feature)
    API_INTEGRATION: false, // Third-party API integration (future feature)
    TEAM_COLLABORATION: false, // Team features (future feature)
} as const;

// Storage and persistence configuration
export const STORAGE_CONFIG = {
    KEY_PREFIX: "uptime-watcher-", // Prefix for all storage keys
    VERSION: "1.0", // Storage schema version
    BACKUP_FREQUENCY: 24 * 60 * 60 * 1000, // Auto-backup frequency (24 hours)
    MAX_BACKUP_FILES: 5, // Maximum backup files to keep
    COMPRESSION_ENABLED: true, // Enable data compression for large datasets
} as const;

// Application metadata
export const APP_CONFIG = {
    NAME: "Uptime Watcher",
    VERSION: "1.0.0",
    AUTHOR: "Your Name",
    WEBSITE: "https://github.com/yourusername/uptime-watcher",
    SUPPORT_EMAIL: "support@example.com",
    UPDATE_CHECK_INTERVAL: 24 * 60 * 60 * 1000, // Check for updates daily
} as const;

// Error handling configuration
export const ERROR_CONFIG = {
    MAX_ERROR_HISTORY: 100, // Maximum error entries to keep
    AUTO_CLEAR_ERRORS: 30000, // Auto-clear errors after 30 seconds
    RETRY_ATTEMPTS: 3, // Default retry attempts for failed operations
    RETRY_DELAY: 1000, // Base delay between retries (ms)
    RETRY_BACKOFF_MULTIPLIER: 2, // Exponential backoff multiplier
} as const;

// Accessibility and UX configuration
export const ACCESSIBILITY_CONFIG = {
    FOCUS_VISIBLE_OUTLINE: "2px solid currentColor", // Focus outline style
    REDUCED_MOTION_DURATION: 0, // Animation duration when prefers-reduced-motion
    HIGH_CONTRAST_MULTIPLIER: 1.5, // Color contrast multiplier for high-contrast theme
    MINIMUM_TOUCH_TARGET: 44, // Minimum touch target size (px)
} as const;

// Development and debugging configuration
export const DEBUG_CONFIG = {
    ENABLE_CONSOLE_LOGS: process.env.NODE_ENV === "development",
    ENABLE_PERFORMANCE_MONITORING: process.env.NODE_ENV === "development",
    MOCK_SLOW_NETWORK: false, // Simulate slow network for testing
    MOCK_ERRORS: false, // Simulate errors for testing
} as const;
