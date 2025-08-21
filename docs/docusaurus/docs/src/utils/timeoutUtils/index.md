# src/utils/timeoutUtils

Utilities for timeout conversion and validation.

## Remarks

Centralizes the logic for converting between seconds (UI) and milliseconds
(backend). Provides validation and clamping functions to ensure timeouts are
within acceptable ranges. The UI displays timeouts in seconds for better user
experience, while the backend uses milliseconds for precision in network
operations.

## Functions

- [clampTimeoutMs](functions/clampTimeoutMs.md)
- [clampTimeoutSeconds](functions/clampTimeoutSeconds.md)
- [timeoutMsToSeconds](functions/timeoutMsToSeconds.md)
- [getTimeoutSeconds](functions/getTimeoutSeconds.md)
- [isValidTimeoutMs](functions/isValidTimeoutMs.md)
- [isValidTimeoutSeconds](functions/isValidTimeoutSeconds.md)
- [timeoutSecondsToMs](functions/timeoutSecondsToMs.md)
