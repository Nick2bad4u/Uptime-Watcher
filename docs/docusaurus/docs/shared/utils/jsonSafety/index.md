# shared/utils/jsonSafety

Type-safe JSON parsing utilities.

## Remarks

Provides safe alternatives to JSON.parse with proper error handling and
validation. All parsing operations return a result object with success status
and optional error information.

## Interfaces

- [SafeJsonResult](interfaces/SafeJsonResult.md)

## Functions

- [safeJsonParse](functions/safeJsonParse.md)
- [safeJsonParseArray](functions/safeJsonParseArray.md)
- [safeJsonParseWithFallback](functions/safeJsonParseWithFallback.md)
- [safeJsonStringify](functions/safeJsonStringify.md)
- [safeJsonStringifyWithFallback](functions/safeJsonStringifyWithFallback.md)
