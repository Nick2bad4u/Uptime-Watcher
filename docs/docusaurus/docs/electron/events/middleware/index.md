# electron/events/middleware

Pre-built middleware functions and types for the TypedEventBus event system.

## Remarks

Provides common middleware for logging, metrics, filtering, validation, error
handling, and more. All middleware is type-safe and composable for robust
event-driven architectures.

## Variables

- [MIDDLEWARE\_STACKS](variables/MIDDLEWARE_STACKS.md)

## Functions

- [composeMiddleware](functions/composeMiddleware.md)
- [createDebugMiddleware](functions/createDebugMiddleware.md)
- [createErrorHandlingMiddleware](functions/createErrorHandlingMiddleware.md)
- [createFilterMiddleware](functions/createFilterMiddleware.md)
- [createLoggingMiddleware](functions/createLoggingMiddleware.md)
- [createMetricsMiddleware](functions/createMetricsMiddleware.md)
- [createRateLimitMiddleware](functions/createRateLimitMiddleware.md)
- [createValidationMiddleware](functions/createValidationMiddleware.md)
