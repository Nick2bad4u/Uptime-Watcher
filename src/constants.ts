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
    MIN: 1000,  // 1 second minimum
    MAX: 60000, // 60 seconds maximum
    STEP: 1000, // 1 second increments
} as const;

// UI delays and timing
export const UI_DELAYS = {
    LOADING_BUTTON: 100,  // Delay before showing loading spinners (ms)
    LOADING_OVERLAY: 100, // Delay before showing loading overlay (ms)
} as const;

// Uptime quality thresholds
export const UPTIME_THRESHOLDS = {
    EXCELLENT: 95,  // >= 95% is excellent (green)
    GOOD: 90,       // >= 90% is good (yellow/warning)
    // < 90% is poor (red/error)
} as const;
