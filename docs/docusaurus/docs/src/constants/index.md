# src/constants

Centralized constants for the Uptime Watcher application.

## Remarks

Contains configuration values, UI constants, fallback data, and type
definitions used throughout the frontend application. This module serves as
the single source of truth for application-wide constants to ensure
consistency and maintainability.

## Example

```typescript
import {
    TRANSITION_ALL,
    FALLBACK_MONITOR_TYPE_OPTIONS,
} from "./constants";

// Use transition timing for animations
const buttonStyle = { transition: TRANSITION_ALL };

// Use fallback monitor types when backend is unavailable
const monitorOptions = FALLBACK_MONITOR_TYPE_OPTIONS;
```

## Interfaces

- [IntervalOption](interfaces/IntervalOption.md)
- [ChartTimePeriods](interfaces/ChartTimePeriods.md)

## Type Aliases

- [ChartTimeRange](type-aliases/ChartTimeRange.md)

## Variables

- [TRANSITION\_ALL](variables/TRANSITION_ALL.md)
- [FALLBACK\_MONITOR\_TYPE\_OPTIONS](variables/FALLBACK_MONITOR_TYPE_OPTIONS.md)
- [FONT\_FAMILY\_MONO](variables/FONT_FAMILY_MONO.md)
- [FONT\_FAMILY\_SANS](variables/FONT_FAMILY_SANS.md)
- [CHECK\_INTERVALS](variables/CHECK_INTERVALS.md)
- [DEFAULT\_CHECK\_INTERVAL](variables/DEFAULT_CHECK_INTERVAL.md)
- [DEFAULT\_REQUEST\_TIMEOUT](variables/DEFAULT_REQUEST_TIMEOUT.md)
- [DEFAULT\_REQUEST\_TIMEOUT\_SECONDS](variables/DEFAULT_REQUEST_TIMEOUT_SECONDS.md)
- [DEFAULT\_HISTORY\_LIMIT](variables/DEFAULT_HISTORY_LIMIT.md)
- [HISTORY\_LIMIT\_OPTIONS](variables/HISTORY_LIMIT_OPTIONS.md)
- [TIMEOUT\_CONSTRAINTS](variables/TIMEOUT_CONSTRAINTS.md)
- [TIMEOUT\_CONSTRAINTS\_MS](variables/TIMEOUT_CONSTRAINTS_MS.md)
- [RETRY\_CONSTRAINTS](variables/RETRY_CONSTRAINTS.md)
- [UI\_DELAYS](variables/UI_DELAYS.md)
- [CHART\_TIME\_PERIODS](variables/CHART_TIME_PERIODS.md)
- [CHART\_TIME\_RANGES](variables/CHART_TIME_RANGES.md)
- [ARIA\_LABEL](variables/ARIA_LABEL.md)
