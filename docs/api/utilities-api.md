# 🛠️ Utilities API Reference

> **Navigation:** [📖 Docs Home](../README.md) » [📚 API Reference](README.md) » **Utilities API**

The Utilities API provides helper functions for common operations including time formatting, status handling, and various utility operations throughout the application.

## Time Utilities

Located in `src/utils/time.ts` - provides time and date formatting functions.

### Functions

#### formatResponseTime(time?: number): string

Formats response time in a human-readable format with automatic unit selection.

**Parameters:**

- **time** (`number`, optional): Response time in milliseconds

**Returns:** Formatted time string

**Behavior:**

- Returns "N/A" for undefined/null values
- Shows milliseconds for values < 1000ms
- Shows seconds with 2 decimal places for values ≥ 1000ms

**Examples:**

```typescript
formatResponseTime(234); // "234ms"
formatResponseTime(1500); // "1.50s"
formatResponseTime(undefined); // "N/A"
formatResponseTime(0); // "0ms"
```

#### formatTimestamp(timestamp: number): string

Formats timestamp as relative time (e.g., "2 minutes ago").

**Parameters:**

- **timestamp** (`number`): Unix timestamp in milliseconds

**Returns:** Human-readable relative time string

**Examples:**

```typescript
const now = Date.now();
formatTimestamp(now - 30000); // "30 seconds ago"
formatTimestamp(now - 120000); // "2 minutes ago"
formatTimestamp(now - 7200000); // "2 hours ago"
formatTimestamp(now - 86400000); // "1 day ago"
formatTimestamp(now); // "Just now"
```

#### formatFullTimestamp(timestamp: number): string

Formats timestamp as a complete date/time string using locale formatting.

**Parameters:**

- **timestamp** (`number`): Unix timestamp in milliseconds

**Returns:** Formatted date/time string based on user's locale

**Example:**

```typescript
formatFullTimestamp(1640995200000); // "12/31/2021, 4:00:00 PM" (US locale)
```

#### formatLastChecked(lastChecked?: number | Date): string

Formats last checked time for site cards with compact notation.

**Parameters:**

- **lastChecked** (`number | Date`, optional): Timestamp or Date object

**Returns:** Compact relative time string

**Behavior:**

- Returns "Never" for undefined/null values
- Uses compact notation (m, h, d for minutes, hours, days)
- Shows "Just now" for very recent times

**Examples:**

```typescript
const now = Date.now();
formatLastChecked(now - 60000); // "1m ago"
formatLastChecked(now - 3600000); // "1h ago"
formatLastChecked(now - 86400000); // "1d ago"
formatLastChecked(undefined); // "Never"
formatLastChecked(new Date()); // "Just now"
```

#### formatDuration(ms: number): string

Formats duration in a human-readable format.

**Parameters:**

- **ms** (`number`): Duration in milliseconds

**Returns:** Formatted duration string

**Examples:**

```typescript
formatDuration(45000); // "45s"
formatDuration(150000); // "2m 30s"
formatDuration(7200000); // "2h 0m"
```

### Time Period Types and Constants

#### TimePeriod

Type definition for available time periods.

```typescript
export type TimePeriod = keyof typeof CHART_TIME_PERIODS;
// "1h" | "12h" | "24h" | "7d" | "30d"
```

#### TIME_PERIOD_LABELS

Human-readable labels for time periods.

```typescript
export const TIME_PERIOD_LABELS: Record<TimePeriod, string> = {
 "1h": "Last Hour",
 "12h": "Last 12 Hours",
 "24h": "Last 24 Hours",
 "7d": "Last 7 Days",
 "30d": "Last 30 Days",
};
```

**Usage:**

```typescript
import { TIME_PERIOD_LABELS, TimePeriod } from './utils/time';

function PeriodSelector({ period }: { period: TimePeriod }) {
    return <span>{TIME_PERIOD_LABELS[period]}</span>;
}
```

## Status Utilities

Located in `src/utils/status.ts` - provides status formatting and icon functions.

### Status Functions

#### getStatusIcon(status: string): string

Returns emoji icon for a given status.

**Parameters:**

- **status** (`string`): Status string (case-insensitive)

**Returns:** Emoji string representing the status

**Status Mappings:**

- `"up"` → "✅"
- `"down"` → "❌"
- `"pending"` → "⏳"
- `"unknown"` → "❓"
- other → "⚪"

**Examples:**

```typescript
getStatusIcon("up"); // "✅"
getStatusIcon("DOWN"); // "❌" (case-insensitive)
getStatusIcon("pending"); // "⏳"
getStatusIcon("custom"); // "⚪" (fallback)
```

#### formatStatusWithIcon(status: string): string

Formats status with emoji icon and properly capitalized text.

**Parameters:**

- **status** (`string`): Status string to format

**Returns:** Formatted string with emoji and capitalized text

**Examples:**

```typescript
formatStatusWithIcon("up"); // "✅ Up"
formatStatusWithIcon("DOWN"); // "❌ Down"
formatStatusWithIcon("pending"); // "⏳ Pending"
formatStatusWithIcon("unknown"); // "❓ Unknown"
```

## Usage Examples

### Site Card Display

```typescript
import { formatLastChecked, formatResponseTime } from './utils/time';
import { formatStatusWithIcon } from './utils/status';

function SiteCard({ site }: { site: Site }) {
    const lastCheck = formatLastChecked(site.lastChecked);
    const responseTime = formatResponseTime(site.responseTime);
    const status = formatStatusWithIcon(site.status);

    return (
        <div className="site-card">
            <h3>{site.name}</h3>
            <p>Status: {status}</p>
            <p>Response: {responseTime}</p>
            <p>Last checked: {lastCheck}</p>
        </div>
    );
}
```

### Chart Time Axis

```typescript
import { TIME_PERIOD_LABELS, TimePeriod } from './utils/time';

function ChartPeriodSelector({
    selectedPeriod,
    onPeriodChange
}: {
    selectedPeriod: TimePeriod;
    onPeriodChange: (period: TimePeriod) => void;
}) {
    const periods: TimePeriod[] = ["1h", "12h", "24h", "7d", "30d"];

    return (
        <div className="period-selector">
            {periods.map(period => (
                <button
                    key={period}
                    onClick={() => onPeriodChange(period)}
                    className={selectedPeriod === period ? 'active' : ''}
                >
                    {TIME_PERIOD_LABELS[period]}
                </button>
            ))}
        </div>
    );
}
```

### Monitoring Dashboard

```typescript
import { formatTimestamp, formatDuration } from './utils/time';

function MonitoringSummary({ checks }: { checks: Check[] }) {
    const totalDuration = checks.reduce((sum, check) => sum + check.responseTime, 0);
    const averageResponse = totalDuration / checks.length;

    return (
        <div className="monitoring-summary">
            <p>Total checks: {checks.length}</p>
            <p>Average response: {formatResponseTime(averageResponse)}</p>
            <p>Total monitoring time: {formatDuration(totalDuration)}</p>
            {checks.map(check => (
                <div key={check.id}>
                    <span>{formatStatusWithIcon(check.status)}</span>
                    <span>{formatTimestamp(check.timestamp)}</span>
                    <span>{formatResponseTime(check.responseTime)}</span>
                </div>
            ))}
        </div>
    );
}
```

### Notification Messages

```typescript
import { formatFullTimestamp } from "./utils/time";
import { getStatusIcon } from "./utils/status";

function createNotificationMessage(site: Site, status: string): string {
 const icon = getStatusIcon(status);
 const time = formatFullTimestamp(Date.now());

 return `${icon} ${site.name} is now ${status} as of ${time}`;
}
```

## Integration with Constants

The time utilities integrate with application constants defined in `src/constants.ts`:

```typescript
import { CHART_TIME_PERIODS } from "../constants";

// CHART_TIME_PERIODS provides the actual millisecond values
// TIME_PERIOD_LABELS provides human-readable names
// TimePeriod type ensures type safety across both
```

## Best Practices

### Consistent Time Display

Use the same utility functions across all components for consistent time formatting:

```typescript
// Good - consistent formatting
const lastCheck = formatLastChecked(site.lastChecked);
const responseTime = formatResponseTime(site.responseTime);

// Avoid - inconsistent manual formatting
const lastCheck = new Date(site.lastChecked).toLocaleString();
const responseTime = `${site.responseTime}ms`;
```

### Status Icons

Always use the status utilities for consistent visual representation:

```typescript
// Good - consistent icons
const icon = getStatusIcon(site.status);
const fullStatus = formatStatusWithIcon(site.status);

// Avoid - hardcoded icons or text
const icon = site.status === "up" ? "✅" : "❌";
```

### Type Safety

Use the provided types for better development experience:

```typescript
import { TimePeriod, TIME_PERIOD_LABELS } from "./utils/time";

function isValidPeriod(period: string): period is TimePeriod {
 return period in TIME_PERIOD_LABELS;
}
```

## Performance Considerations

- **Pure functions**: All utility functions are pure and can be safely memoized
- **No side effects**: Functions don't modify input parameters or global state
- **Lightweight**: Minimal computational overhead for formatting operations
- **Cacheable**: Results can be cached for repeated calls with same inputs

## Localization Considerations

- **Date formatting**: `formatFullTimestamp` uses `toLocaleString()` for automatic localization
- **Relative time**: English-only relative time strings (could be extended for i18n)
- **Number formatting**: Uses standard JavaScript number formatting
- **Icons**: Emoji icons are Unicode and display consistently across platforms

## See Also

- [📋 Types API](types-api.md) - Type definitions used by utilities
- [🎨 Theme API](theme-api.md) - Theme-aware utility functions
- [📊 Chart API](chart-api.md) - Data transformation for charts
- [🏪 Store API](store-api.md) - State utility functions
- [💾 Database API](database-api.md) - Database helper utilities
- [📝 Logger API](logger-api.md) - Logging utility functions

---

> **Related:** [📚 API Reference](README.md) | [📖 Documentation Home](../README.md)
