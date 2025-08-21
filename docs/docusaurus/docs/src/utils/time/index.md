# src/utils/time

Centralized utility functions for time and formatting.

## Remarks

Provides consistent time formatting throughout the application with support
for various time scales: milliseconds for precise measurements,
seconds/minutes/hours for human-readable durations, and relative timestamps
for recent events.

All functions handle edge cases gracefully and provide fallback values for
invalid inputs. Time formatting is optimized for readability in monitoring
contexts.

## Type Aliases

- [TimePeriod](type-aliases/TimePeriod.md)

## Variables

- [TIME\_PERIOD\_LABELS](variables/TIME_PERIOD_LABELS.md)

## Functions

- [formatDuration](functions/formatDuration.md)
- [formatFullTimestamp](functions/formatFullTimestamp.md)
- [formatIntervalDuration](functions/formatIntervalDuration.md)
- [formatRelativeTimestamp](functions/formatRelativeTimestamp.md)
- [formatResponseDuration](functions/formatResponseDuration.md)
- [formatResponseTime](functions/formatResponseTime.md)
- [getIntervalLabel](functions/getIntervalLabel.md)
- [formatRetryAttemptsText](functions/formatRetryAttemptsText.md)
