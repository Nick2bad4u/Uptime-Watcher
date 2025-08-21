# src/utils/monitoring/dataValidation

Utility functions for parsing and validating monitoring data with safe error
handling.

## Remarks

Provides safe parsing functions with comprehensive validation and error
handling for monitoring-related data. These utilities ensure that invalid
input data doesn't crash the application and provides meaningful fallback
values.

Key features:

- Safe uptime string parsing with validation
- URL hostname extraction with error handling
- Input sanitization and range validation
- Comprehensive error logging for debugging
- Fallback values for invalid inputs

## Example

```typescript
import { parseUptimeValue, safeGetHostname } from "./dataValidation";

// Parse uptime strings safely
const uptime1 = parseUptimeValue("99.5%"); // Returns: 99.5
const uptime2 = parseUptimeValue("invalid"); // Returns: 0 (fallback)

// Extract hostname safely
const hostname1 = safeGetHostname("https://example.com/path"); // Returns: "example.com"
const hostname2 = safeGetHostname("invalid-url"); // Returns: "" (fallback)
```

## Functions

- [parseUptimeValue](functions/parseUptimeValue.md)
- [safeGetHostname](functions/safeGetHostname.md)
