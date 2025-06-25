"use strict";
// Centralized constants for the application
Object.defineProperty(exports, "__esModule", { value: true });
exports.TRANSITION_ALL = exports.ARIA_LABEL = exports.CHART_TIME_PERIODS = exports.UI_DELAYS = exports.TIMEOUT_CONSTRAINTS = exports.AUTO_REFRESH_INTERVAL = exports.HISTORY_LIMIT_OPTIONS = exports.DEFAULT_CHECK_INTERVAL = exports.CHECK_INTERVALS = void 0;
exports.CHECK_INTERVALS = [
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
// Default check interval (1 minute)
exports.DEFAULT_CHECK_INTERVAL = 60000;
// History limit options
exports.HISTORY_LIMIT_OPTIONS = [
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
// Auto-refresh interval for site details (30 seconds)
exports.AUTO_REFRESH_INTERVAL = 30000;
// Request timeout constraints
exports.TIMEOUT_CONSTRAINTS = {
    MAX: 60000, // 60 seconds maximum
    MIN: 1000, // 1 second minimum
    STEP: 1000, // 1 second increments
};
// UI delays and timing
exports.UI_DELAYS = {
    LOADING_BUTTON: 100, // Delay before showing loading spinners (ms)
    LOADING_OVERLAY: 100, // Delay before showing loading overlay (ms)
};
// Chart time periods (for analytics components)
exports.CHART_TIME_PERIODS = {
    "1h": 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
    "24h": 24 * 60 * 60 * 1000,
    "30d": 30 * 24 * 60 * 60 * 1000,
};
// Common ARIA attribute constants
exports.ARIA_LABEL = "aria-label";
exports.TRANSITION_ALL = "all 0.2s ease-in-out";
