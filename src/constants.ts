// Centralized constants for the application

export interface IntervalOption {
  value: number;
  label: string;
}

export const CHECK_INTERVALS: IntervalOption[] = [
  { value: 15000, label: "15 seconds" },
  { value: 30000, label: "30 seconds" },
  { value: 60000, label: "1 minute" },
  { value: 300000, label: "5 minutes" },
  { value: 600000, label: "10 minutes" },
  { value: 1800000, label: "30 minutes" },
  { value: 3600000, label: "1 hour" },
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
  { value: 1000, label: "1000 records" },
];

// Default history limit
export const DEFAULT_HISTORY_LIMIT = 100;
